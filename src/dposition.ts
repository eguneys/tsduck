import { assert } from './util'
import { Bitboard, EMPTYBB, aligned, attacks_bb, between_bb, lsb, more_than_one, pawn_attacks_bb, pop_lsb, pseudo_attacks_bb, sq_pawn_attacks_bb, square_bb } from "./bitboard"
import { PIECE_TO_CHAR } from "./position"
import { Bishop, Black, CASTLE_Any, CASTLE_BOo, CASTLE_BOoo, CASTLE_King, CASTLE_None, CASTLE_Queen, CASTLE_WOo, CASTLE_WOoo, CASTLING_RIGHTS_NB, COLOR_NB, CastlingRights, Color, D_East, D_South, D_West, FILES_LH, FileA, FileB, FileC, FileD, FileE, FileF, FileG, FileH, King, Knight, Move, MoveType, NoPiece, PIECE_NB, PIECE_TYPE_NB, Pawn, Piece, PieceType, Queen, RANKS_HL, Rank1, Rank6, Rank8, Rook, SQ_A1, SQ_A8, SQ_C1, SQ_D1, SQ_F1, SQ_G1, SQ_None, Square, White, color_castling_rights, color_flip, color_pawn_push, debug_file, debug_piece, debug_square, from_str_square, is_square, new_piece_ct, new_square, piece_color, piece_type, relative_rank, sq_file, sq_rank, sq_relative_square } from "./types"



export type DStateInfo = {
  ep_square: Square,
  castling_rights: CastlingRights,
  rule50: number,

  checkers_bb: Bitboard,
  blockers_for_king: Bitboard[],
  pinners: Bitboard[],
  check_squares: Bitboard[],
  captured_piece: Piece,
}

function si_copy_from(si: DStateInfo, st: DStateInfo) {
  si.castling_rights = st.castling_rights
  si.rule50 = st.rule50
  si.ep_square = st.ep_square
}

function st_clone(st: DStateInfo): DStateInfo {
  let res: DStateInfo = {
    ep_square: st.ep_square,
    castling_rights: st.castling_rights,
    rule50: st.rule50,
    checkers_bb: st.checkers_bb,
    blockers_for_king: st.blockers_for_king.slice(0),
    pinners: st.pinners.slice(0),
    check_squares: st.check_squares.slice(0),
    captured_piece: st.captured_piece
  }
  return res
}

function si_default(): DStateInfo {
  let res: DStateInfo = {
    ep_square: SQ_None,
    castling_rights: CASTLE_None,
    rule50: 0,
    checkers_bb: 0n,
    blockers_for_king: [],
    pinners: [],
    check_squares: [],
    captured_piece: NoPiece
  }
  return res
}

export class DPosition {
  
  public board!: Piece[]
  public by_type_bb!: Bitboard[]
  public all_type_bb!: Bitboard
  public by_color_bb!: Bitboard[]
  public piece_count!: number[]
  public all_piece_count!: number
  public castling_rights_mask!: bigint[]
  public castling_rook_square!: Square[]
  public castling_path!: Bitboard[]
  public game_ply!: number
  public side_to_move!: Color
  public st!: DStateInfo


  piece_on(s: Square): Piece {
    return this.board[s]
  }

  is_empty(s: Square): boolean {
    return this.piece_on(s) === NoPiece
  }

  moved_piece(m: Move): Piece {
    return this.piece_on(m.orig)
  }

  all_pieces(): Bitboard {
    return this.all_type_bb
  }

  pieces(pt: PieceType): Bitboard {
    return this.by_type_bb[pt]
  }


  pieces_v(pt: PieceType[]): Bitboard {
    return pt.reduce((acc, pt) => acc | this.pieces(pt), EMPTYBB)
  }

  pieces_by_c(c: Color): Bitboard {
    return this.by_color_bb[c]
  }

  pieces_ct(c: Color, pt: PieceType): Bitboard {
    return this.pieces_by_c(c) & this.pieces(pt)
  }

  count(pt: PieceType, c: Color): number {
    return this.piece_count[new_piece_ct(c, pt)]
  }

  count_pt(pt: PieceType): number {
    return this.count(pt, White) + this.count(pt, Black)
  }

  square(pt: PieceType, c: Color): Square {
    assert(this.count(pt,   c) === 1)
    return lsb(this.pieces_by_c(c) & this.pieces(pt))
  }

  ep_square(): Square {
    return this.st.ep_square
  }

  can_castle(cr: CastlingRights): boolean {
    return (this.st.castling_rights & cr) !== 0
  }

  castling_rights(): CastlingRights {
    return this.st.castling_rights
  }

  castling_impedded(cr: CastlingRights): boolean {
    assert(cr === CASTLE_WOo || cr === CASTLE_WOoo || cr === CASTLE_BOo || cr === CASTLE_BOoo)
    return (this.all_pieces() & this.castling_path[cr]) !== EMPTYBB
  }

  get_castling_rook_square(cr: CastlingRights): Square {
    assert(cr === CASTLE_WOo || cr === CASTLE_WOoo || cr === CASTLE_BOo || cr === CASTLE_BOoo)
    return this.castling_rook_square[cr]
  }

  all_attackers_to(s: Square): Bitboard {
    return this.attackers_to(s, this.all_pieces())
  }

  attacks_by(pt: PieceType, c: Color): Bitboard {
    switch (pt) {
      case Pawn: {
        return pawn_attacks_bb(c, this.pieces_by_c(c) & this.pieces(Pawn))
      }
      break;
      default: {
        let threats = EMPTYBB
        let attackers = this.pieces_ct(c, pt)

        while (attackers != EMPTYBB) {
          let pop
          [attackers, pop] = pop_lsb(attackers)
          threats |= attacks_bb(pt, pop, this.all_pieces())
        }
        return threats
      }
    }
  }

  checkers(): Bitboard {
    return this.st.checkers_bb
  }

  blockers_for_king(c: Color): Bitboard {
    return this.st.blockers_for_king[c]
  }

  pinners(c: Color): Bitboard {
    return this.st.pinners[c]
  }


  check_squares(pt: PieceType): Bitboard {
    return this.st.check_squares[pt]
  }

  is_capture(m: Move): boolean {
    return (!this.is_empty(m.dest) && m.special !== MoveType.Castling) ||
    m.special == MoveType.EnPassant
  }

  captured_piece(): Piece {
    return this.st.captured_piece
  }

  do_move(m: Move) {
    this.do_move_c(m, this.gives_check(m))
  }


  do_move_c(m: Move, gives_check: boolean) {
    let new_st = si_default()
    si_copy_from(new_st, this.st)
    this.st = new_st

    this.game_ply += 1
    this.st.rule50 += 1

    let us = this.side_to_move
    let them = color_flip(us)
    let from = m.orig
    let to = m.dest
    let pc = this.piece_on(from)
    let captured = m.special === MoveType.EnPassant ? new_piece_ct(them, Pawn) : this.piece_on(to)

    assert(piece_color(pc) === us)
    assert(captured === NoPiece || piece_color(captured) === (m.special !== MoveType.Castling ? them : us))
    assert(captured === NoPiece || piece_type(captured) !== King)


    if (m.special === MoveType.Castling) {

      assert(pc === new_piece_ct(us, King))
      assert(captured === new_piece_ct(us, Rook))

      let rfrom, rto

      [to, rfrom, rto] = this.do_castling(us, from, to)

      captured = NoPiece

    }

    if (captured !== NoPiece) {
      let capsq = to

      if (piece_type(captured) === Pawn) {
        if (m.special === MoveType.EnPassant) {
          capsq = (capsq - color_pawn_push(us))

          assert(pc === new_piece_ct(us, Pawn))
          assert(to === this.st.ep_square)
          assert(relative_rank(sq_rank(to), us) === Rank6)
          assert(this.piece_on(to) === NoPiece)
          assert(this.piece_on(capsq) === new_piece_ct(them, Pawn))
        }
      }

      this.remove_piece(capsq)
      
      this.st.rule50 = 0
    }

    if (this.st.ep_square !== SQ_None) {
      this.st.ep_square = SQ_None
    }

    if (this.st.castling_rights !== CASTLE_None &&
      (this.castling_rights_mask[from] | this.castling_rights_mask[to]) !== BigInt(0)) {

        this.st.castling_rights &= Number(~(this.castling_rights_mask[from] | this.castling_rights_mask[to]))
      }


      if (m.special !== MoveType.Castling) {
        this.move_piece(from, to)
      }

      if (piece_type(pc) === Pawn) {

        if ((to ^ from) === 16 && 
          (pawn_attacks_bb(us, square_bb(to - color_pawn_push(us))) &
           this.pieces_ct(them, Pawn)) !== EMPTYBB) {
            this.st.ep_square = (to - color_pawn_push(us))
           } else if (m.special === MoveType.Promotion) {

            let promotion = new_piece_ct(us, m.promotion)

            assert(relative_rank(sq_rank(to), us) === Rank8)
            assert(piece_type(promotion) >= Knight && piece_type(promotion) <= Queen)

            this.remove_piece(to)
            this.put_piece(promotion, to)
           }

           this.st.rule50 = 0
      }

      this.st.captured_piece = captured

      this.st.checkers_bb = gives_check ? this.all_attackers_to(this.square(King, them)) & this.pieces_by_c(us) : EMPTYBB
      this.side_to_move = color_flip(this.side_to_move)
    
      this.set_check_info()

  }

  do_castling(us: Color, from: Square, to: Square): [Square, Square, Square] {

    let king_side = to > from
    let rfrom = to
    let rto = sq_relative_square(us, king_side ? SQ_F1 : SQ_D1)
    to = sq_relative_square(us, king_side ? SQ_G1 : SQ_C1)

    this.remove_piece(from)
    this.remove_piece(rfrom)
    this.board[from] = NoPiece
    this.board[rfrom] = NoPiece
    this.put_piece(new_piece_ct(us, King), to)
    this.put_piece(new_piece_ct(us, Rook), rto)

    return [to, rfrom, rto]
  }

  put_piece(pc: Piece, s: Square) {
    this.board[s] = pc
    this.all_type_bb |= square_bb(s)
    this.by_type_bb[piece_type(pc)] |= square_bb(s)
    this.by_color_bb[piece_color(pc)] |= square_bb(s)
    this.piece_count[pc] += 1
    this.all_piece_count += 1
  }

  remove_piece(s: Square) {
    let pc = this.board[s]
    this.all_type_bb ^= square_bb(s)
    this.by_type_bb[piece_type(pc)] ^= square_bb(s)
    this.by_color_bb[piece_color(pc)] ^= square_bb(s)
    this.board[s] = NoPiece
    this.piece_count[pc] -= 1
    this.all_piece_count -= 1
  }

  move_piece(from: Square, to: Square) {
    let pc = this.board[from]
    let from_to = square_bb(from) | square_bb(to)

    this.all_type_bb ^= from_to
    this.by_type_bb[piece_type(pc)] ^= from_to
    this.by_color_bb[piece_color(pc)] ^= from_to
    this.board[from] = NoPiece
    this.board[to] = pc
  }

  attackers_to(s: Square, occupied: Bitboard): Bitboard {
    return pawn_attacks_bb(Black, square_bb(s)) & this.pieces_by_c(White) & this.pieces(Pawn) |
    pawn_attacks_bb(White, square_bb(s)) & this.pieces_by_c(Black) & this.pieces(Pawn) |
    attacks_bb(Knight, s, EMPTYBB) & this.pieces(Knight) |
    attacks_bb(Rook, s, occupied) & (this.pieces(Rook) | this.pieces(Queen)) |
    attacks_bb(Bishop, s, occupied) & (this.pieces(Bishop) | this.pieces(Queen)) |
    attacks_bb(King, s, EMPTYBB) & this.pieces(King)
  }

  clone(): DPosition {

    let res = new DPosition()

    res.board = this.board.slice(0)
    res.by_type_bb = this.by_type_bb.slice(0)
    res.all_type_bb = this.all_type_bb
    res.by_color_bb = this.by_color_bb.slice(0)
    res.piece_count = this.piece_count.slice(0)
    res.all_piece_count = this.all_piece_count
    res.castling_rights_mask = this.castling_rights_mask.slice(0)
    res.castling_rook_square = this.castling_rook_square.slice(0)
    res.castling_path = this.castling_path.slice(0)
    res.game_ply = this.game_ply
    res.side_to_move = this.side_to_move
    res.st = st_clone(this.st)

    return res
  }

  static set(fen: string): DPosition {

    let res = new DPosition()

    res.board = new Array(64).fill(NoPiece)
    res.by_type_bb = new Array(PIECE_TYPE_NB).fill(EMPTYBB)
    res.all_type_bb = EMPTYBB
    res.by_color_bb = new Array(COLOR_NB).fill(EMPTYBB)
    res.piece_count = new Array(PIECE_NB).fill(0)
    res.all_piece_count = 0
    res.castling_rights_mask = new Array(64).fill(BigInt(0))
    res.castling_rook_square = new Array(16).fill(SQ_A1)
    res.castling_path = new Array(64).fill(EMPTYBB)
    res.game_ply = 0
    res.side_to_move = White
    res.st = si_default()

    let [board, active, castlings, ep, r50, gp] = fen.split(' ')

    if (board !== undefined) {
      let sq = SQ_A8

      let idx
      for (let c of board.split('')) {
        if ("12345678".includes(c)) {
          sq = sq + parseInt(c) * D_East
        } else if (c === '/') {
          sq = sq + 2 * D_South
        } else if ((idx = PIECE_TO_CHAR.indexOf(c)) !== -1) {
          res.put_piece(idx, sq)
          sq += 1
        }
      }
    }


    if (active !== undefined) {
      res.side_to_move = active === 'w' ? White : Black
    }

    if (castlings !== undefined) {
      for (let token of castlings) {
        let c = token === token.toLowerCase() ? Black : White
        let rook = new_piece_ct(c, Rook)

        let rsq

        switch (token.toUpperCase()) {
          case 'K': {
            rsq = new_square(FileH, relative_rank(Rank1, c))
          } break;
          case 'Q': {
            rsq = new_square(FileA, relative_rank(Rank1, c))
          } break;
          case 'A': {
            rsq = new_square(FileA, relative_rank(Rank1, c))
          } break;
          case 'B': {
            rsq = new_square(FileB, relative_rank(Rank1, c))
          } break;
          case 'C': {
            rsq = new_square(FileC, relative_rank(Rank1, c))
          } break;
          case 'D': {
            rsq = new_square(FileD, relative_rank(Rank1, c))
          } break;
          case 'E': {
            rsq = new_square(FileE, relative_rank(Rank1, c))
          } break;
          case 'F': {
            rsq = new_square(FileF, relative_rank(Rank1, c))
          } break;
          case 'G': {
            rsq = new_square(FileG, relative_rank(Rank1, c))
          } break;
          case 'H': {
            rsq = new_square(FileH, relative_rank(Rank1, c))
          } break;
        }


        if (rsq !== undefined) {
          res.set_castling_right(c, rsq)
        }
      }

      if (ep !== undefined) {
        let sq = from_str_square(ep)

        if (sq !== undefined) {
          res.st.ep_square = sq
        }
      }

      if (r50 !== undefined) {
        res.st.rule50 = parseInt(r50)
      }

      if (gp !== undefined) {
        res.game_ply = parseInt(gp)
      }
    }

    res.set_state()

    return res
  }

  set_castling_right(c: Color, rfrom: Square) {

    let kfrom = this.square(King, c)
    let cr = color_castling_rights(c) & (kfrom < rfrom ? CASTLE_King : CASTLE_Queen)

    this.st.castling_rights |= cr
    this.castling_rights_mask[kfrom] |= BigInt(cr)
    this.castling_rights_mask[rfrom] |= BigInt(cr)
    this.castling_rook_square[cr] = rfrom

    let kto = sq_relative_square(c, (cr & CASTLE_King) !== 0 ? SQ_G1 : SQ_C1)
    let rto = sq_relative_square(c, (cr & CASTLE_King) !== 0 ? SQ_F1 : SQ_D1)

    this.castling_path[cr] = (between_bb(rfrom, rto) | between_bb(kfrom, kto)) &
    ~(square_bb(kfrom) | square_bb(rfrom))


  }

  set_check_info() {
    this.update_slider_blockers(White)
    this.update_slider_blockers(Black)

    let ksq = this.square(King, color_flip(this.side_to_move))

    this.st.check_squares[Pawn] = sq_pawn_attacks_bb(color_flip(this.side_to_move), ksq)
    this.st.check_squares[Knight] = pseudo_attacks_bb(Knight, ksq)
    this.st.check_squares[Bishop] = attacks_bb(Bishop, ksq, this.all_pieces())
    this.st.check_squares[Rook] = attacks_bb(Rook, ksq, this.all_pieces())
    this.st.check_squares[Queen] = this.st.check_squares[Bishop] | this.st.check_squares[Rook]
    this.st.check_squares[King] = EMPTYBB
  }

  set_state() {

    this.st.checkers_bb =
    this.all_attackers_to(this.square(King, this.side_to_move)) &
    this.pieces_by_c(color_flip(this.side_to_move))

    this.set_check_info()
  }


  get fen(): string {
    let res = ''

    RANKS_HL.map(r => {
      let ee = 0
      FILES_LH.map(f => {

        let s = new_square(f, r)

        if (this.is_empty(s)) {
          ee += 1;
          return
        }

        if (ee !== 0) {
          res += ee
          ee = 0
        }

        res += debug_piece(this.piece_on(s))
      })

      if (ee !== 0) {
        res += ee
      }

      if (r > Rank1) {
        res += '/'
      }
    })

    res += this.side_to_move === White ? ' w ' : ' b '

    if (this.can_castle(CASTLE_WOo)) {
      res += debug_file(sq_file(this.castling_rook_square[CASTLE_WOo])).toUpperCase()
    }
    if (this.can_castle(CASTLE_WOoo)) {
      res += debug_file(sq_file(this.castling_rook_square[CASTLE_WOoo])).toUpperCase()
    }
    if (this.can_castle(CASTLE_BOo)) {
      res += debug_file(sq_file(this.castling_rook_square[CASTLE_BOo])).toLowerCase()
    }
    if (this.can_castle(CASTLE_BOoo)) {
      res += debug_file(sq_file(this.castling_rook_square[CASTLE_BOoo])).toLowerCase()
    }

    if (!this.can_castle(CASTLE_Any)) {
      res += ' - '
    }

    if (this.ep_square() === SQ_None) {
      res += ' - '
    } else {
      res += ` ${debug_square(this.ep_square())} `
    }

    res += this.st.rule50
    res += ' '
    res += 1 + Math.floor((this.game_ply - this.side_to_move === Black ? 1 : 0) / 2)

    return res
  }


  gives_check(m: Move): boolean {
    assert(piece_color(this.moved_piece(m)) === this.side_to_move)

    let from = m.orig
    let to = m.dest

    if ((this.check_squares(piece_type(this.piece_on(from))) & square_bb(to)) !== EMPTYBB) {
      return true
    }

    if ((this.blockers_for_king(color_flip(this.side_to_move)) & square_bb(from)) !== EMPTYBB) {

      return !aligned(from, to, this.square(King, color_flip(this.side_to_move))) ||
      m.special === MoveType.Castling
    }

    switch (m.special) {
      case MoveType.Normal: {
        return false
      }
      case MoveType.Promotion: {
        return (attacks_bb(m.promotion, to, this.all_pieces() ^ square_bb(from)) &
        square_bb(this.square(King, color_flip(this.side_to_move)))) !== EMPTYBB
      }
      case MoveType.EnPassant: {
        let capsq = new_square(sq_file(to), sq_rank(from))
        let b = (this.all_pieces() ^ square_bb(from) ^ square_bb(capsq)) | square_bb(to)

        return (attacks_bb(Rook,
          this.square(King, color_flip(this.side_to_move)), b) &
          this.pieces_ct(this.side_to_move, Queen) |
          this.pieces_ct(this.side_to_move, Rook) |
        attacks_bb(Bishop,
          this.square(King, color_flip(this.side_to_move)), b) &
          this.pieces_ct(this.side_to_move, Queen) |
          this.pieces_ct(this.side_to_move, Bishop)) !== EMPTYBB
      }
      case MoveType.Castling: {
        let rto = sq_relative_square(this.side_to_move, to > from ? SQ_F1 : SQ_D1)

        return (this.check_squares(Rook) & square_bb(rto)) !== EMPTYBB
      }
    }
  }

  update_slider_blockers(c: Color) {
    let ksq = this.square(King, c)

    this.st.blockers_for_king[c] = EMPTYBB
    this.st.pinners[color_flip(c)] = EMPTYBB

    let snipers = ((pseudo_attacks_bb(Rook, ksq) &
    this.pieces_v([Queen, Rook])) | (
      pseudo_attacks_bb(Bishop, ksq) &
      this.pieces_v([Queen, Bishop]))) & 
      this.pieces_by_c(color_flip(c))

    let occupancy = this.all_pieces() ^ snipers

    while (snipers !== EMPTYBB) {
      let sniper_sq
      [snipers, sniper_sq] = pop_lsb(snipers)

      let b = between_bb(ksq, sniper_sq) & occupancy

      if (b !== EMPTYBB && !more_than_one(b)) {
        this.st.blockers_for_king[c] |= b
        if ((b & this.pieces_by_c(c)) !== EMPTYBB) {
          this.st.pinners[color_flip(c)] |= square_bb(sniper_sq)
        }
      }
    }
  }

  legal(m: Move): boolean {

    let us = this.side_to_move
    let from = m.orig
    let to = m.dest

    assert(piece_color(this.moved_piece(m)) === us)
    assert(this.piece_on(this.square(King, us)) === new_piece_ct(us, King))


    if (m.special === MoveType.EnPassant) {
      let ksq = this.square(King, us)
      let capsq = to - color_pawn_push(us)
      let occupied = (this.all_pieces() ^ square_bb(from) ^ square_bb(capsq)) | square_bb(to)

      assert(to === this.ep_square())
      assert(this.moved_piece(m) === new_piece_ct(us, Pawn))
      assert(this.piece_on(capsq) === new_piece_ct(color_flip(us), Pawn))
      assert(this.piece_on(to) === NoPiece)


      return (attacks_bb(Rook, ksq, occupied) & (
        this.pieces_ct(color_flip(us), Queen) | 
        this.pieces_ct(color_flip(us), Rook))) === EMPTYBB &&
      (attacks_bb(Bishop, ksq, occupied) & (
        this.pieces_ct(color_flip(us), Queen) | 
        this.pieces_ct(color_flip(us), Bishop))) === EMPTYBB
    }

    if (m.special === MoveType.Castling) {

      to = sq_relative_square(us, to > from ? SQ_G1 : SQ_C1)
      let step = to > from ? D_West : D_East

      let s = to

      while (true) {
        if (is_square(s)) {
          if (s !== from) {
            if ((this.all_attackers_to(s) & this.pieces_by_c(color_flip(us))) !== EMPTYBB) {
              return false
            }

            s = s + step
            continue
          } }
        break
      }

      return (this.blockers_for_king(us) & square_bb(m.dest)) === EMPTYBB
    }

    if (piece_type(this.piece_on(from)) === King) {
      return (this.attackers_to(to, this.all_pieces() ^ square_bb(from))
      & this.pieces_by_c(color_flip(us))) === EMPTYBB
    }

    return (this.blockers_for_king(us) & square_bb(from)) === EMPTYBB ||
    aligned(from, to, this.square(King, us))

  }


}

export function debug_dposition(pos: DPosition): string {
  let res = ''

  for (let r of RANKS_HL) {
    let ss = ''
    for (let file of FILES_LH) {
      if (file === FileA) {

      }
      let p = pos.piece_on(new_square(file, r))
      if (p === NoPiece) {
        ss += ' '
      } else {
        res += ss + debug_piece(p)
        ss = ''
      }
    }
    res += '\n'
  }

  let color = pos.side_to_move === White ? 'White' : 'Black'
  res += `${color} to move`

  return res
}


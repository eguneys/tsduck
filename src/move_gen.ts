import { assert } from "vitest";
import { Bitboard, EMPTYBB, Rank2BB, Rank3BB, Rank6BB, Rank7BB, attacks_bb, between_bb, file_bb, lsb, more_than_one, pawn_attacks_bb, pop_lsb, pretty_bb, pseudo_attacks_bb, shift, sq_pawn_attacks_bb, square_bb } from "./bitboard";
import { Position } from "./position";
import { Bishop, CASTLE_Any, CASTLE_King, CASTLE_Queen, Color, D_NorthEast, D_NorthWest, D_SouthEast, D_SouthWest, Direction, King, Knight, Move, MoveType, Pawn, PieceType, Queen, Rank6, Rook, SQ_None, Square, White, color_castling_rights, color_flip, color_pawn_push, new_move_castling, new_move_enpassant, new_move_normal, new_move_promotion, relative_rank, sq_file, sq_rank } from "./types";

export enum GenType {
  Captures,
  Quiets,
  QuietChecks,
  Evasions,
  NonEvasions,
  Legal
}


type MoveList = [GenType, Move[]]

export function ml_moves(ml: MoveList): Move[] {
  return ml[1]
}

export function new_move_list(g: GenType, pos: Position): MoveList {

  switch (g) {
    case GenType.Legal: {

      let us = pos.side_to_move
      let pinned = pos.blockers_for_king(us) & pos.pieces_by_c(us)
      let ksq = pos.square(King, us)

      let ms = pos.checkers() !== EMPTYBB ? new_move_list(GenType.Evasions, pos)
      : new_move_list(GenType.NonEvasions, pos)


      let res = ms[1].filter(cur => 
        !((pinned & square_bb(cur.orig)) !== EMPTYBB || 
        cur.orig === ksq ||
        cur.special === MoveType.EnPassant)
        || pos.legal(cur))

        return [GenType.Legal, res]
    } break;
    default: return new_move_list_by_color(pos.side_to_move, g, pos)
  }
}

export function new_move_list_by_color(us: Color, g: GenType, pos: Position): MoveList {
  assert(g !== GenType.Legal)

  let checks = g === GenType.QuietChecks
  let ksq = pos.square(King, us)
  let target = EMPTYBB

  let res = []

  if (g !== GenType.Evasions || !more_than_one(pos.checkers())) {
    switch (g) {
      case GenType.Evasions: {
        target = between_bb(ksq, lsb(pos.checkers()))
      } break;
      case GenType.NonEvasions: {
        target = ~pos.pieces_by_c(us)
      } break;
      case GenType.Captures: {
        target = pos.pieces_by_c(color_flip(us))
      } break;
      default: {
        ~pos.all_pieces()
      }
    }

    res.push(...ml_generate_pawn_moves(us, g, pos, target))
    res.push(...ml_generate_moves(us, Knight, checks, g, pos, target))
    res.push(...ml_generate_moves(us, Bishop, checks, g, pos, target))
    res.push(...ml_generate_moves(us, Rook, checks, g, pos, target))
    res.push(...ml_generate_moves(us, Queen, checks, g, pos, target))
  }

  if (!checks || (pos.blockers_for_king(color_flip(us) & ksq) !== EMPTYBB)) {

    let b = pseudo_attacks_bb(King, ksq) & 
    (g === GenType.Evasions ? ~pos.pieces_by_c(us) : target)

    if (checks) {
      b &= ~pseudo_attacks_bb(Queen, pos.square(King, color_flip(us)))
    }

    while (b !== EMPTYBB) {
      let pop
      [b, pop] = pop_lsb(b)
      res.push(new_move_normal(ksq, pop))
    }


    if ((g === GenType.Quiets || g === GenType.NonEvasions) && pos.can_castle(color_castling_rights(us) & CASTLE_Any)) {
      for (let cr of [color_castling_rights(us) & CASTLE_King, color_castling_rights(us) & CASTLE_Queen]) {
        if (!pos.castling_impedded(cr) && pos.can_castle(cr)) {
          res.push(new_move_castling(ksq, pos.castling_rook_square[cr]))
        }
      }
    }
  }

  return [g, res]
}

function ml_generate_pawn_moves(us: Color, g: GenType, pos: Position, target: Bitboard): Move[] {
  let res: Move[] = []

  let them = color_flip(us)
  let t_rank7_bb = us === White ? Rank7BB : Rank2BB
  let t_rank3_bb = us === White ? Rank3BB : Rank6BB
  let up = color_pawn_push(us)
  let up_right = us === White ? D_NorthEast : D_SouthWest
  let up_left = us === White ? D_NorthWest : D_SouthEast

  let empty_squares = ~pos.all_pieces()
  let enemies = g === GenType.Evasions ? pos.checkers() : pos.pieces_by_c(them)
  let pawns_on7 = pos.pieces_ct(us, Pawn) & t_rank7_bb
  let pawns_not_on7 = pos.pieces_ct(us, Pawn) & ~t_rank7_bb


  if (g !== GenType.Captures) {

    let b1 = shift(up, pawns_not_on7) & empty_squares
    let b2 = shift(up, (b1 & t_rank3_bb)) & empty_squares

    if (g === GenType.Evasions) {
      b1 &= target
      b2 &= target
    }

    if (g === GenType.QuietChecks) {
      let ksq = pos.square(King, them)
      let dc_candidate_pawns = pos.blockers_for_king(them) & ~file_bb(sq_file(ksq))
      b1 &= sq_pawn_attacks_bb(them, ksq) | shift(up, dc_candidate_pawns)
      b2 &= sq_pawn_attacks_bb(them, ksq) | shift(up + up, dc_candidate_pawns)
    }

    while (b1 !== EMPTYBB) {
      let to
      [b1, to] = pop_lsb(b1)
      let from = to - up
      res.push(new_move_normal(from, to))
    }

    while (b2 !== EMPTYBB) {
      let to
      [b2, to] = pop_lsb(b2)
      let from = to - up - up
      res.push(new_move_normal(from, to))
    }
  }


  if (pawns_on7 !== EMPTYBB) {

    let b1 = shift(up_right, pawns_on7) & enemies
    let b2 = shift(up_left, pawns_on7) & enemies
    let b3 = shift(up, pawns_on7) & empty_squares


    if (g === GenType.Evasions) {
      b3 &= target
    }

    while (b1 !== EMPTYBB) {
      let pop
      [b1, pop] = pop_lsb(b1)
      res.push(...ml_make_promotions(g, up_right, true, pop))
    }

    while (b2 !== EMPTYBB) {
      let pop
      [b2, pop] = pop_lsb(b2)
      res.push(...ml_make_promotions(g, up_left, true, pop))
    }

    while (b3 !== EMPTYBB) {
      let pop
      [b3, pop] = pop_lsb(b3)
      res.push(...ml_make_promotions(g, up, false, pop))
    }
  }

  if (g === GenType.Captures || g === GenType.Evasions || g === GenType.NonEvasions) {

    console.log(pretty_bb(pawns_not_on7))
    console.log('shifted')
    console.log(pretty_bb(shift(up_left, pawns_not_on7)))
    let b1 = shift(up_right, pawns_not_on7) & enemies
    let b2 = shift(up_left, pawns_not_on7) & enemies

    while (b1 !== EMPTYBB) {
      let to
      [b1, to] = pop_lsb(b1)
      let from = to - up_right
      res.push(new_move_normal(from, to))
    }

    while (b2 !== EMPTYBB) {
      let to
      [b2, to] = pop_lsb(b2)
      let from = to - up_left
      res.push(new_move_normal(from, to))
    }

    if (pos.ep_square() !== SQ_None) {
      assert(sq_rank(pos.ep_square()) === relative_rank(Rank6, us))

      let ep_capture = pos.ep_square() + up

      if (g === GenType.Evasions && ((target & square_bb(ep_capture)) !== EMPTYBB)) {
        return res
      }

      let b1 = pawns_not_on7 & sq_pawn_attacks_bb(them, pos.ep_square())

      assert(b1 !== EMPTYBB)


      while (b1 !== EMPTYBB) {
        let pop
        [b1, pop] = pop_lsb(b1)
        res.push(new_move_enpassant(pop, pos.ep_square()))
      }
    }


  }

  return res

}

function ml_generate_moves(us: Color, pt: PieceType, checks: boolean, g: GenType, pos: Position, target: Bitboard):  Move[] {
  let res: Move[] = []

  assert(pt !== King && pt !== Pawn)

  let bb = pos.pieces_ct(us, pt)

  while (bb !== EMPTYBB) {
    let from 
    [bb, from] = pop_lsb(bb)

    let b = attacks_bb(pt, from, pos.all_pieces()) & target

    if (checks && (pt === Queen || (pos.blockers_for_king(color_flip(us)) & square_bb(from)) !== EMPTYBB)) {
      b &= pos.check_squares(pt)
    }

    while (b !== EMPTYBB) {
      let pop
      [b, pop] = pop_lsb(b)
      res.push(new_move_normal(from, pop))
    }
  }

  return res
}

function ml_make_promotions(g: GenType, d: Direction, enemy: boolean, to: Square): Move[] {
  let res: Move[] = []

  let from = to - d

  if (g === GenType.Captures || g === GenType.Evasions || g ===  GenType.NonEvasions) {
    res.push(new_move_promotion(from, to, Queen))

    if (enemy && g === GenType.Captures) {
      res.push(new_move_promotion(from, to, Rook))
      res.push(new_move_promotion(from, to, Bishop))
      res.push(new_move_promotion(from, to, Knight))
    }
  }

  if ((g === GenType.Quiets && !enemy) || g === GenType.Evasions || g === GenType.NonEvasions) {
      res.push(new_move_promotion(from, to, Rook))
      res.push(new_move_promotion(from, to, Bishop))
      res.push(new_move_promotion(from, to, Knight))
  }

  return res
}


export type CastlingRights = number;

export const CASTLE_None: CastlingRights = 0
export const CASTLE_WOo: CastlingRights = 1
export const CASTLE_WOoo: CastlingRights = CASTLE_WOo << 1
export const CASTLE_BOo: CastlingRights = CASTLE_WOo << 2
export const CASTLE_BOoo: CastlingRights = CASTLE_WOo << 3
export const CASTLE_King: CastlingRights = CASTLE_WOo | CASTLE_BOo
export const CASTLE_Queen: CastlingRights = CASTLE_WOoo | CASTLE_BOoo
export const CASTLE_White: CastlingRights = CASTLE_WOo | CASTLE_WOoo
export const CASTLE_Black: CastlingRights = CASTLE_BOo | CASTLE_BOoo



export enum MoveType {
  Normal,
  Promotion,
  EnPassant,
  Castling
}

export type Move = {
  orig: Square,
  dest: Square,
  promotion: PieceType,
  special: MoveType
}

export type Color = number;

export const White: Color = 0;
export const Black: Color = 1;


export type Direction = number;

export const D_North: Direction = 8
export const D_East: Direction = 1
export const D_South: Direction = -8
export const D_West: Direction = -1
export const D_NorthEast: Direction = D_North + D_East
export const D_SouthEast: Direction = D_South + D_East
export const D_SouthWest: Direction = D_South + D_West
export const D_NorthWest: Direction = D_North + D_West

export type File = number

export const FileA = 0
export const FileB = 1
export const FileC = 2
export const FileD = 3
export const FileE = 4
export const FileF = 5
export const FileG = 6
export const FileH = 7

export const FilesLH_Fen = 'abcdefgh'.split('')
export const FilesHL_Fen = FilesLH_Fen.reverse()


export type Rank = number

export const Rank1 = 0
export const Rank2 = 1
export const Rank3 = 2
export const Rank4 = 3
export const Rank5 = 4
export const Rank6 = 5
export const Rank7 = 6
export const Rank8 = 7

export const RanksLH_Fen = '12345678'.split('')
export const RanksHL_Fen = RanksLH_Fen.reverse()


export const relative_rank = (rank: Rank, c: Color) => {
  rank ^ (c * 7)
}







export type PieceType = number

export const Pawn: PieceType = 1
export const Knight: PieceType = 2
export const Bishop: PieceType = 3
export const Rook: PieceType = 4
export const Queen: PieceType = 5
export const King: PieceType = 6
export const Duck: PieceType = 7

export type Piece = number

export const NoPiece: Piece = 0
export const WPawn: Piece = 1
export const WKnight: Piece = 2
export const WBishop: Piece = 3
export const WRook: Piece = 4
export const WQueen: Piece = 5
export const WKing: Piece = 6
export const BPawn: Piece = WPawn + 8
export const BKnight: Piece = BPawn + 1
export const BBishop: Piece = BPawn + 2
export const BRook: Piece = BPawn + 3
export const BQueen: Piece = BPawn + 4
export const BKing: Piece = BPawn + 5
export const PDuck: Piece = BPawn + 6

export type Square = number;

export const COLOR_NB = 2
export const SQUARE_NB = 64
export const PIECE_TYPE_NB = 8
export const PIECE_NB = 16
export const CASTLING_RIGHTS_NB = 16

export const ROLES = [Pawn, Knight, Bishop, Rook, Queen, King]

export const COLORS = [White, Black]

export const RANKS_HL = [Rank8, Rank7, Rank6, Rank5, Rank4, Rank3, Rank2, Rank1]
export const FILES_LH = [FileA, FileB, FileC, FileD, FileE, FileF, FileG, FileH]


export const SQ_A1: Square = 0;
export const SQ_B1: Square = 1;
export const SQ_C1: Square = 2;
export const SQ_D1: Square = 3;
export const SQ_E1: Square = 4;
export const SQ_F1: Square = 5;
export const SQ_G1: Square = 6;
export const SQ_H1: Square = 7;
export const SQ_A2: Square = 8;
export const SQ_B2: Square = 9;
export const SQ_C2: Square = 10;
export const SQ_D2: Square = 11;
export const SQ_E2: Square = 12;
export const SQ_F2: Square = 13;
export const SQ_G2: Square = 14;
export const SQ_H2: Square = 15;
export const SQ_A3: Square = 16;
export const SQ_B3: Square = 17;
export const SQ_C3: Square = 18;
export const SQ_D3: Square = 19;
export const SQ_E3: Square = 20;
export const SQ_F3: Square = 21;
export const SQ_G3: Square = 22;
export const SQ_H3: Square = 23;
export const SQ_A4: Square = 24;
export const SQ_B4: Square = 25;
export const SQ_C4: Square = 26;
export const SQ_D4: Square = 27;
export const SQ_E4: Square = 28;
export const SQ_F4: Square = 29;
export const SQ_G4: Square = 30;
export const SQ_H4: Square = 31;
export const SQ_A5: Square = 32;
export const SQ_B5: Square = 33;
export const SQ_C5: Square = 34;
export const SQ_D5: Square = 35;
export const SQ_E5: Square = 36;
export const SQ_F5: Square = 37;
export const SQ_G5: Square = 38;
export const SQ_H5: Square = 39;
export const SQ_A6: Square = 40;
export const SQ_B6: Square = 41;
export const SQ_C6: Square = 42;
export const SQ_D6: Square = 43;
export const SQ_E6: Square = 44;
export const SQ_F6: Square = 45;
export const SQ_G6: Square = 46;
export const SQ_H6: Square = 47;
export const SQ_A7: Square = 48;
export const SQ_B7: Square = 49;
export const SQ_C7: Square = 50;
export const SQ_D7: Square = 51;
export const SQ_E7: Square = 52;
export const SQ_F7: Square = 53;
export const SQ_G7: Square = 54;
export const SQ_H7: Square = 55;
export const SQ_A8: Square = 56;
export const SQ_B8: Square = 57;
export const SQ_C8: Square = 58;
export const SQ_D8: Square = 59;
export const SQ_E8: Square = 60;
export const SQ_F8: Square = 61;
export const SQ_G8: Square = 62;
export const SQ_H8: Square = 63;
export const SQ_None: Square = 64;


export const SS_A1_H8 = [
  SQ_A1, SQ_B1, SQ_C1, SQ_D1, SQ_E1, SQ_F1, SQ_G1, SQ_H1,
  SQ_A2, SQ_B2, SQ_C2, SQ_D2, SQ_E2, SQ_F2, SQ_G2, SQ_H2,
  SQ_A3, SQ_B3, SQ_C3, SQ_D3, SQ_E3, SQ_F3, SQ_G3, SQ_H3,
  SQ_A4, SQ_B4, SQ_C4, SQ_D4, SQ_E4, SQ_F4, SQ_G4, SQ_H4,
  SQ_A5, SQ_B5, SQ_C5, SQ_D5, SQ_E5, SQ_F5, SQ_G5, SQ_H5,
  SQ_A6, SQ_B6, SQ_C6, SQ_D6, SQ_E6, SQ_F6, SQ_G6, SQ_H6,
  SQ_A7, SQ_B7, SQ_C7, SQ_D7, SQ_E7, SQ_F7, SQ_G7, SQ_H7,
  SQ_A8, SQ_B8, SQ_C8, SQ_D8, SQ_E8, SQ_F8, SQ_G8, SQ_H8,
]


export const SQUARE_DISTANCE: Square[][] = 
SS_A1_H8.map(s1 => SS_A1_H8.map(s2 => 
  Math.max(sq_distance_file(s1, s2), sq_distance_rank(s1, s2))
))


export const color_flip = (c: Color) => c === White ? Black : White

export const piece_flip = (p: Piece): Piece => {
  switch (p) {
    case NoPiece: return NoPiece
    case Duck: return Duck
    case WPawn: return BPawn
    case WKnight: return BKnight
    case WBishop: return BBishop
    case WRook: return BRook
    case WQueen: return BQueen
    case WKing: return BKing
    case BPawn: return WPawn
    case BKnight: return WKnight
    case BBishop: return WBishop
    case BRook: return WRook
    case BQueen: return WQueen
    case BKing: return WKing
    default: return NoPiece
  }
}

export function color_pawn_push(c: Color): Direction {
  switch (c) {
    case White: return D_North
    default: return D_South
  }
}


export function new_piece_ct(c: Color, tpe: PieceType): Piece {
  switch (c) {
    case White: {
      switch (tpe) {
        case Pawn: return WPawn
        case Knight: return WKnight
        case Bishop: return WBishop
        case Rook: return WRook
        case Queen: return WQueen
        case King: return WKing
        case Duck: return Duck
        default: return NoPiece
      }
    }
    default: {
      switch (tpe) {
        case Pawn: return BPawn
        case Knight: return BKnight
        case Bishop: return BBishop
        case Rook: return BRook
        case Queen: return BQueen
        case King: return BKing
        case Duck: return Duck
        default: return NoPiece
      }
    }
  }
}

export function piece_color(p: Piece): Color {
  switch (p) {
    case WPawn: return White
    case WKnight: return White
    case WBishop: return White
    case WRook: return White
    case WQueen: return White
    case WKing: return White
    case BPawn: return Black
    case BKnight: return Black
    case BBishop: return Black
    case BRook: return Black
    case BQueen: return Black
    case BKing: return Black
    default: throw 'No Piece Color'
  }
}


export function piece_type(p: Piece): PieceType {
  switch (p) {
    case BPawn : case WPawn: return Pawn
    case BKnight : case WKnight: return Knight
    case BBishop : case WBishop: return Bishop
    case BRook : case WRook: return Rook
    case BQueen : case WQueen: return Queen
    case BKing : case WKing: return King
    case Duck: return Duck
    default: throw 'No Piece Color'
  }
}

export const Piece_Fen = 'XPNBRQK  pnbrqkD'


export function new_move_normal(orig: Square, dest: Square): Move {
  return {
    orig,
    dest,
    promotion: Bishop,
    special: MoveType.Normal
  }
}


export function new_move_promotion(orig: Square, dest: Square, promotion: PieceType): Move {
  return {
    orig,
    dest,
    promotion,
    special: MoveType.Promotion
  }
}


export function new_move_castling(ksq: Square, cr: Square): Move {
  return {
    orig: ksq,
    dest: cr,
    promotion: Knight,
    special: MoveType.Castling
  }
}

export function new_move_enpassant(orig: Square, dest: Square): Move {
  return {
    orig,
    dest,
    promotion: Knight,
    special: MoveType.EnPassant
  }
}

export function new_square(f: File, r: Rank): Square {
  return r << 3 + f
}

export function sq_flip_rank(sq: Square): Square {
  return sq ^ SQ_A8
}


export function sq_flip_file(sq: Square): Square {
  return sq ^ SQ_H1
}

export function sq_file(sq: Square): File {
  return sq & 7
}


export function sq_rank(sq: Square): Rank {
  return sq >> 3
}

export function sq_distance_file(sq: Square, y: Square): number {
  return Math.abs(sq_file(sq) - sq_file(y))
}

export function sq_distance_rank(sq: Square, y: Square): number {
  return Math.abs(sq_rank(sq) - sq_rank(y))
}

export function sq_distance(sq: Square, y: Square): number {
  return SQUARE_DISTANCE[sq][y]
}

export function is_square(i: number): i is Square {
  return i >= 0 && i <= 64
}

export function sq_safe_destination(sq: Square, step: number): Square | undefined {
  let to = sq + step
  if (is_square(to) && sq_distance(sq, to) <= 2) {
    return sq
  }
}

export function sq_uci(sq: Square): string {
  return FilesLH_Fen[sq_file(sq)] + RanksLH_Fen[sq_rank(sq)]
}


export function sq_relative_square(s: Square, c: Color): Square {
  return s ^ (c * 56)
}

export function from_str_rank(str: string): Rank | undefined {
  switch (str) {
    case "1": return Rank1
    case "2": return Rank2
    case "3": return Rank3
    case "4": return Rank4
    case "5": return Rank5
    case "6": return Rank6
    case "7": return Rank7
    case "8": return Rank8
  }
}

export function from_str_file(str: string): Rank | undefined {
  switch (str) {
    case "a": return FileA
    case "b": return FileB
    case "c": return FileC
    case "d": return FileD
    case "e": return FileE
    case "f": return FileF
    case "g": return FileG
    case "h": return FileH
  }
}

export function from_str_square(str: string): Square | undefined {
  let [f, r] = str.split('')

  let file = from_str_file(f)
  let rank = from_str_rank(r)

  if (file !== undefined && rank !== undefined) {
    return new_square(file, rank)
  }
}


export function debug_piece(p: Piece): string {
  switch (p) {
    case NoPiece: return " "
    case WPawn: return "P"
    case WKnight: return "N"
    case WBishop: return "B"
    case WRook: return "R"
    case WQueen: return "Q"
    case WKing: return "K"
    case BPawn: return "p"
    case BKnight: return "n"
    case BBishop: return "b"
    case BRook: return "r"
    case BQueen: return "q"
    case BKing: return "k"
    case Duck: return "d"
    default: throw "no piece"
  }
}

export function debug_move(m: Move): string {
  switch (m.special) {
    case MoveType.Normal: return debug_square(m.orig) + debug_square(m.dest)
    case MoveType.Promotion: 
    return debug_square(m.orig) + debug_square(m.dest) + debug_piece_type(m.promotion)
    case MoveType.EnPassant: return debug_square(m.orig) + debug_square(m.dest)
    case MoveType.Castling: return debug_square(m.orig) + debug_square(m.dest)
  }
}

export function debug_piece_type(p: PieceType): string {
  switch (p) {
    case Pawn: return 'p'
    case Knight: return 'n'
    case Bishop: return 'b'
    case Rook: return 'r'
    case Queen: return 'q'
    case King: return 'k'
    case Duck: return 'd'
    default: throw 'No Piece type'
  }
}

export function debug_square(sq: Square): string {
  switch (sq) {
    case SQ_A1: return "a1"
    case SQ_A2: return "a2"
    case SQ_A3: return "a3"
    case SQ_A4: return "a4"
    case SQ_A5: return "a5"
    case SQ_A6: return "a6"
    case SQ_A7: return "a7"
    case SQ_A8: return "a8"
    case SQ_B1: return "b1"
    case SQ_B2: return "b2"
    case SQ_B3: return "b3"
    case SQ_B4: return "b4"
    case SQ_B5: return "b5"
    case SQ_B6: return "b6"
    case SQ_B7: return "b7"
    case SQ_B8: return "b8"
    case SQ_C1: return "c1"
    case SQ_C2: return "c2"
    case SQ_C3: return "c3"
    case SQ_C4: return "c4"
    case SQ_C5: return "c5"
    case SQ_C6: return "c6"
    case SQ_C7: return "c7"
    case SQ_C8: return "c8"
    case SQ_D1: return "d1"
    case SQ_D2: return "d2"
    case SQ_D3: return "d3"
    case SQ_D4: return "d4"
    case SQ_D5: return "d5"
    case SQ_D6: return "d6"
    case SQ_D7: return "d7"
    case SQ_D8: return "d8"
    case SQ_E1: return "e1"
    case SQ_E2: return "e2"
    case SQ_E3: return "e3"
    case SQ_E4: return "e4"
    case SQ_E5: return "e5"
    case SQ_E6: return "e6"
    case SQ_E7: return "e7"
    case SQ_E8: return "e8"
    case SQ_F1: return "f1"
    case SQ_F2: return "f2"
    case SQ_F3: return "f3"
    case SQ_F4: return "f4"
    case SQ_F5: return "f5"
    case SQ_F6: return "f6"
    case SQ_F7: return "f7"
    case SQ_F8: return "f8"
    case SQ_G1: return "g1"
    case SQ_G2: return "g2"
    case SQ_G3: return "g3"
    case SQ_G4: return "g4"
    case SQ_G5: return "g5"
    case SQ_G6: return "g6"
    case SQ_G7: return "g7"
    case SQ_G8: return "g8"
    case SQ_H1: return "h1"
    case SQ_H2: return "h2"
    case SQ_H3: return "h3"
    case SQ_H4: return "h4"
    case SQ_H5: return "h5"
    case SQ_H6: return "h6"
    case SQ_H7: return "h7"
    case SQ_H8: return "h8"
    default: throw 'None square'
  }
}
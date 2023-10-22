import { Knight, King, Bishop, Rook, Queen, SQ_H8, SQ_A1, SQUARE_DISTANCE, sq_safe_destination, Rank1, Rank8, FileA, FileH, new_square } from './types'
import { Color, White, Black, PieceType } from './types'
import { D_North, D_East, D_NorthEast, D_NorthWest, D_South, D_SouthEast, D_SouthWest, D_West } from './types'
import { Direction, sq_file, sq_rank, Square, Rank, File } from './types'

export type Bitboard = bigint

export const EMPTYBB: Bitboard = BigInt(0)

export const FileABB: Bitboard = BigInt('0x0101010101010101')
export const FileBBB: Bitboard = FileABB << BigInt(1)
export const FileCBB: Bitboard = FileABB << BigInt(2)
export const FileDBB: Bitboard = FileABB << BigInt(3)
export const FileEBB: Bitboard = FileABB << BigInt(4)
export const FileFBB: Bitboard = FileABB << BigInt(5)
export const FileGBB: Bitboard = FileABB << BigInt(6)
export const FileHBB: Bitboard = FileABB << BigInt(7)


export const Rank1BB: Bitboard = BigInt('0xff')
export const Rank2BB: Bitboard = Rank1BB << (BigInt('8') * BigInt('1'))
export const Rank3BB: Bitboard = Rank1BB << (BigInt('8') * BigInt('2'))
export const Rank4BB: Bitboard = Rank1BB << (BigInt('8') * BigInt('3'))
export const Rank5BB: Bitboard = Rank1BB << (BigInt('8') * BigInt('4'))
export const Rank6BB: Bitboard = Rank1BB << (BigInt('8') * BigInt('5'))
export const Rank7BB: Bitboard = Rank1BB << (BigInt('8') * BigInt('6'))
export const Rank8BB: Bitboard = Rank1BB << (BigInt('8') * BigInt('7'))


export const PopCnt16: number[] = []

export const BetweenBB: Bitboard[][] = []
export const LineBB: Bitboard[][] = []
export const PseudoAttacks: Bitboard[][] = []
export const PawnAttacks: Bitboard[][] = []


export function pretty_bb(b: Bitboard): string {

  let s = ''

  for (let r = Rank8; r >= Rank1; r--) {

    for (let f = FileA; f <= FileH; f++) {
      s+= (b & square_bb(new_square(f, r))) === EMPTYBB ? '.' : 'o'
    }
    s += '\n'
  }
  s += 'abcdefgh'

  return s
}


type Magic = {
  mask: Bitboard,
  magic: Bitboard,
  attacks: BigIntArray<Bitboard>,
  shift: number
}

function magic_index(m: Magic, occupied: Bitboard): BigInt {
  return ((occupied & m.mask) * m.magic) >> BigInt(m.shift)
}

function magic_attacks(m: Magic, occupied: Bitboard): Bitboard {
  return m.attacks.get(magic_index(m, occupied))
}

export const RookMagics: Magic[] = []
export const BishopMagics: Magic[] = []

export function square_bb(s: Square): Bitboard {
  return BigInt(1) << BigInt(s)
}


export function more_than_one(b: Bitboard): boolean {
  return (b & (b - BigInt(1))) !== EMPTYBB
}

export function rank_bb(r: Rank): Bitboard {
  return Rank1BB << BigInt(8 * r)
}

export function sq_rank_bb(sq: Square): Bitboard {
  return rank_bb(sq_rank(sq))
}

export function file_bb(f: File): Bitboard {
  return FileABB << BigInt(f)
}

export function sq_file_bb(sq: Square): Bitboard {
  return file_bb(sq_file(sq))
}

export function shift(d: Direction, b: Bitboard): Bitboard {
  return d === D_North ? b << BigInt(8) : d === D_South  ? b >> BigInt(8)
  : d === D_North + D_North ? b << BigInt(16) : d === D_South + D_South ? b >> BigInt(16)
  : d === D_East      ? (b & ~FileHBB) << BigInt(1) : d === D_West      ? (b & ~FileABB) >> BigInt(1)
  : d === D_NorthEast ? (b & ~FileHBB) << BigInt(9) : d === D_NorthWest ? (b & ~FileABB) >> BigInt(7)
  : d === D_SouthEast ? (b & ~FileHBB) << BigInt(7) : d === D_SouthWest ? (b & ~FileABB) >> BigInt(9)
  : BigInt(0)
}

export function pawn_attacks_bb(c: Color, b: Bitboard): Bitboard {
  return c === White ? shift(D_NorthWest, b) | shift(D_NorthEast, b)
  : shift(D_SouthWest, b) | shift(D_SouthEast, b)
}

export function sq_pawn_attacks_bb(c: Color, sq: Square): Bitboard {
  return PawnAttacks[c][sq]
}

export function line_bb(s1: Square, s2: Square): Bitboard {
  return LineBB[s1][s2]
}

export function between_bb(s1: Square, s2: Square): Bitboard {
  return BetweenBB[s1][s2]
}

export function aligned(s1: Square, s2: Square, s3: Square): boolean {
  return (line_bb(s1, s2) & square_bb(s3)) !== EMPTYBB
}

export function pseudo_attacks_bb(Pt: PieceType, s: Square): Bitboard {
  return PseudoAttacks[Pt][s]
}

export function attacks_bb(Pt: PieceType, s: Square, occupied: Bitboard): Bitboard {
  switch (Pt) {
    case Bishop: return magic_attacks(BishopMagics[s], occupied)
    case Rook: return magic_attacks(RookMagics[s], occupied)
    case Bishop: return attacks_bb(Bishop, s, occupied) | attacks_bb(Rook, s, occupied)
    default: return PseudoAttacks[Pt][s]
  }
}


export function popcount(b: Bitboard): number {
  let v = splitBigInt16(b)
  return PopCnt16[v[0]] + PopCnt16[v[1]] + PopCnt16[v[2]] + PopCnt16[v[3]]
}


export function lsb(b: Bitboard): Square {
  return findLeastSignificantSetBitPosition(b)
}

export function pop_lsb(b: Bitboard): [Bitboard, Square] {
  let s = lsb(b)
  b &= b - BigInt(1)
  return [b, s]
}



function bb_init() {
  for (let i = 0; i < (1 << 16); i++) {
    PopCnt16[i] = countSetBits(i)
  }
  
  init_magics(Rook, RookMagics)
  init_magics(Bishop, BishopMagics)


  for (let s1 = SQ_A1; s1 <= SQ_H8; s1++) {
    PawnAttacks[White][s1] = pawn_attacks_bb(White, square_bb(s1))
    PawnAttacks[Black][s1] = pawn_attacks_bb(Black, square_bb(s1))


    for (let step of [-9, -8, -7, -1, 1, 7, 8, 9]) {
      let d = sq_safe_destination(s1, step)
      if (d) {
        PseudoAttacks[King][s1] |= square_bb(d)
      }
    }

    for (let step of [-17, -15, -10, -6, 6, 10, 15, 17]) {
      let d = sq_safe_destination(s1, step)
      if (d) {
        PseudoAttacks[Knight][s1] |= square_bb(d)
      }
    }
    PseudoAttacks[Bishop][s1] = attacks_bb(Bishop, s1, BigInt(0))
    PseudoAttacks[Rook][s1] = attacks_bb(Rook, s1, BigInt(0))
    PseudoAttacks[Queen][s1] = PseudoAttacks[Bishop][s1] | PseudoAttacks[Rook][s1]

    for (let pt of [Bishop, Rook]) {
      for (let s2 = SQ_A1; s2 <= SQ_H8; s2++) {
        if ((PseudoAttacks[pt][s1] & square_bb(s2)) !== EMPTYBB) {

          LineBB[s1][s2] = (attacks_bb(pt, s1, BigInt(0)) & attacks_bb(pt, s2, BigInt(0))) | square_bb(s1) | square_bb(s2)
          BetweenBB[s1][s2] = (attacks_bb(pt, s1, square_bb(s2) & attacks_bb(pt, s2, square_bb(s1))))
        }

        BetweenBB[s1][s2] |= square_bb(s2)
      }
    }

  }

}

function sliding_attack(pt: PieceType, sq: Square, occupied: Bitboard): Bitboard {
  let attacks = BigInt(0)
  let RookDirections = [D_North, D_South, D_East, D_West]
  let BishopDirections = [D_NorthEast, D_SouthEast, D_SouthWest, D_NorthWest]


  for (let d of pt === Rook ? RookDirections : BishopDirections) {

    let s = sq
    while (sq_safe_destination(s, d) !== undefined && (occupied & square_bb(s)) === EMPTYBB) {
      attacks |= square_bb(s += d)
    }
  }

  return attacks
}

function init_magics(pt: PieceType, magics: Magic[]) {

    let seeds = [ 
      [ 8977, 44560, 54343, 38998,  5731, 95205, 104912, 17020 ],
      [728, 10316, 55013, 32803, 12281, 15100, 16645, 255]
    ];

    let occupancy = [], reference = [], edges, b
    let epoch = new BigIntArray<number>(), cnt = 0, size = 0

    for (let s = SQ_A1; s <= SQ_H8; s++) {

      edges = ((Rank1BB | Rank8BB) & ~rank_bb(sq_rank(s)) | ((FileABB | FileHBB) & ~file_bb(sq_file(s))))



      let mask = sliding_attack(pt, s, BigInt(0)) & ~edges
      let shift = 64 - popcount(mask)

      let attacks = new BigIntArray<Bitboard>()

      b = BigInt(0), size = 0

      do {
        occupancy[size] = b
        reference[size] = sliding_attack(pt, s, b)

        size++;

        b = (b - mask) & mask
      } while (b !== EMPTYBB)

      let rng = new PRNG(seeds[1][sq_rank(s)])

      let magic
      for (let i = 0; i < size;) {
        for (magic = BigInt(0); popcount((magic * mask) >> BigInt(56)) < 6;) {
          magic = rng.sparse_rand()
        }



        let m = {
          mask,
          magic,
          attacks,
          shift
        }



        cnt++;
        for (let i = 0; i < size; i++) {
          let idx = magic_index(m, occupancy[i])

          if (epoch.get(idx) < cnt) {
            epoch.set(idx, cnt)
            attacks.set(idx, reference[i])
          } else if (attacks.get(idx) != reference[i]) {
            break
          }
        }
      }
    }

}
  
function countSetBits(n: number) {
  let count = 0;
  while (n > 0) {
    count += n & 1; // Check the least significant bit
    n >>= 1; // Shift right to check the next bit
  }
  return count;
}

function findLeastSignificantSetBitPosition(n: bigint) {
  let position = 0;
  
  while ((n & BigInt(1)) === BigInt(0)) {
    n >>= BigInt(1);
    position++;
  }
  
  return position;
}

function splitBigInt(bigIntValue: bigint): [number, number] {
  const low32Mask = BigInt(0xFFFFFFFF);
  const low32Bits = bigIntValue & low32Mask;
  const high32Bits = (bigIntValue >> 32n) & low32Mask;

  return [Number(high32Bits), Number(low32Bits)];
}

function splitBigInt16(bigIntValue: bigint): [number, number, number, number] {
  const a16 = BigInt(0xFFFF);
  const d = bigIntValue & a16;
  const c = (bigIntValue >> 16n) & a16;
  const b = (bigIntValue >> 32n) & a16;
  const a = (bigIntValue >> 48n) & a16;

  return [Number(a), Number(b), Number(c), Number(d)];
}



class BigIntArray<T> {

  array: T[][]

  constructor() {
    this.array = []
  }

  set(index: BigInt, value: T) {
    const [high32, low32] = splitBigInt(index as bigint);
    this.array[low32][high32] = value;
  }

  get(index: BigInt) {
    const [high32, low32] = splitBigInt(index as bigint);
    return this.array[low32][high32]
  }
}


class PRNG {

  s: bigint

  constructor(_s: number) {
    this.s = BigInt(_s)
  }


  rand64() {
     this.s ^= this.s >> BigInt(12);
     this.s ^= this.s << BigInt(25);
     this.s ^= this.s >> BigInt(27);
     return this.s * BigInt('2685821657736338717')
  }


  rand() {
    return this.rand64()
  }

  sparse_rand() {
    return this.rand64() & this.rand64() & this.rand64()
  }
}
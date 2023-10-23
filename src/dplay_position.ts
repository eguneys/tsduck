import { GenType } from './move_gen'
import { INITIAL_FEN } from './position';
import { DMove, dml_moves, new_dmove_list, debug_dmove } from "./dmove_gen";
import { DPosition, debug_dposition } from "./dposition";
import { Square, debug_square } from "./types";

export function dpos_play_tuples(pos: DPosition, ms: [Square, Square, Square][]) {

  ms.forEach(m => {
    let xx =`${debug_square(m[0])}${debug_square(m[1])}`
    let move = to_dmove(pos, `${debug_square(m[0])}${debug_square(m[1])}`)
    if (move !== undefined) {
      pos.do_move(move)
    } else {
      throw `No Ms ${debug_square(m[0])} ${debug_square(m[1])}`
    }
  })
}

export function ddests_from(pos: DPosition, from: Square): Square[] {
  return dlegal_iter(pos).filter(x => x.orig === from).map(x => x.dest)
}


export function dlegal_iter(pos: DPosition): DMove[] {
  return new_dmove_list(GenType.Legal, pos)[1]
}


export function dpush_move(pos: DPosition, uci: DMove) {
  pos.do_move(uci)
}

export function dvis(pos: DPosition): string {
  return debug_dposition(pos)
}

export function dpos_initial() {
  return DPosition.set(INITIAL_FEN)
}

export function dpos_ffen(fen: string) {
  return DPosition.set(fen)
}


export function to_dmove(pos: DPosition, uci: string): DMove | undefined {
  return new_dmove_list(GenType.Legal, pos)[1].find(x => debug_dmove(x) === uci)
}

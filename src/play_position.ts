import { GenType, ml_moves, new_move_list } from "./move_gen";
import { INITIAL_FEN, Position, debug_position } from "./position";
import { Move, Square, debug_move, debug_square } from "./types";

export function pos_play_tuples(pos: Position, ms: [Square, Square][]) {

  ms.forEach(m => {
    if (`${debug_square(m[0])}${debug_square(m[1])}` === 'e1d2') {

      debugger
    }
    let move = to_move(pos, `${debug_square(m[0])}${debug_square(m[1])}`)
    if (move !== undefined) {
      pos.do_move(move)
    } else {
      throw `No Ms ${debug_square(m[0])} ${debug_square(m[1])}`
    }
  })
}

export function dests_from(pos: Position, from: Square): Square[] {
  return legal_iter(pos).filter(x => x.orig === from).map(x => x.dest)
}


export function legal_iter(pos: Position): Move[] {
  return new_move_list(GenType.Legal, pos)[1]
}


export function push_move(pos: Position, uci: Move) {
  pos.do_move(uci)
}

export function vis(pos: Position): string {
  return debug_position(pos)
}

export function pos_initial() {
  return Position.set(INITIAL_FEN)
}

export function pos_ffen(fen: string) {
  return Position.set(fen)
}


export function to_move(pos: Position, uci: string): Move | undefined {
  return new_move_list(GenType.Legal, pos)[1].find(x => debug_move(x) === uci)
}

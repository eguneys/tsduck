import { GenType, new_move_list } from "./move_gen";
import { Position } from "./position";
import { Move } from "./types";

export function divide_perft(pos: Position, depth: number): [Move, number][] {
  return new_move_list(GenType.Legal, pos)[1].map(mv => {
    let cnt
    if (depth <= 1) {
       cnt = 1
     } else {
      let p = pos.clone()
      p.do_move(mv)
      cnt = perft(p, depth - 1)
     }
    return [mv, cnt]
  })
}

export function perft(pos: Position, depth: number): number {
  return divide_perft(pos, depth).map(x => x[1]).reduce((acc, n) => acc + n, 0)
}
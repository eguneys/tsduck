import { GenType } from './move_gen'
import { new_dmove_list, DMove } from "./dmove_gen";
import { DPosition } from "./dposition";

export function divide_perft(pos: DPosition, depth: number): [DMove, number][] {
  return new_dmove_list(GenType.Legal, pos)[1].map(mv => {
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

export function perft(pos: DPosition, depth: number): number {
  return divide_perft(pos, depth).map(x => x[1]).reduce((acc, n) => acc + n, 0)
}
import { it, expect } from 'vitest'
import { Position, INITIAL_FEN, bb_init } from '../src'

bb_init()
it('initial fen', () => {


  let p = Position.set(INITIAL_FEN)

  expect(p.fen).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w HAha - 0 1")

})

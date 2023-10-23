import { it, expect } from 'vitest'
import { divide_perft, perft } from '../src/search'
import { pos_initial } from '../src/play_position'
import { bb_init } from '../src'

bb_init()

it('perft 1', () => {

  expect(perft(pos_initial(), 1)).toBe(20)
  console.log(divide_perft(pos_initial(), 1))
  expect(perft(pos_initial(), 2)).toBe(400)
})
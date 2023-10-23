import { it, expect } from 'vitest'
import { dlegal_iter, dpos_initial } from '../src/dplay_position'
import { bb_init } from '../src'

bb_init()
it('duck initial', () => {
  let g = dpos_initial()

  expect(dlegal_iter(g).length).toBe(640)
})
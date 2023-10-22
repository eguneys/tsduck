import { it, expect } from 'vitest'

import { EMPTYBB, FileABB, Rank1BB, FileBBB, pretty_bb, SQ_A1, square_bb, Rank5BB, FileGBB, attacks_bb, SQ_B2, Queen, bb_init, King, SQ_H8, SQ_A3, SQ_C1, between_bb, line_bb, SQ_A2 } from '../src'


it('pretty prints', () => {
  expect(pretty_bb(EMPTYBB)).toBe(`
........
........
........
........
........
........
........
........
abcdefgh
`.trim())

  expect(pretty_bb(square_bb(SQ_A1))).toBe(`
........
........
........
........
........
........
........
o.......
abcdefgh
`.trim())

  expect(pretty_bb(FileABB)).toBe(`
o.......
o.......
o.......
o.......
o.......
o.......
o.......
o.......
abcdefgh
`.trim())

  expect(pretty_bb(FileGBB | Rank5BB)).toBe(`
......o.
......o.
......o.
oooooooo
......o.
......o.
......o.
......o.
abcdefgh
`.trim())

})

bb_init()

it('attacks', () => {

  expect(pretty_bb(attacks_bb(Queen, SQ_B2, BigInt(0))))
  .toBe(`
.o.....o
.o....o.
.o...o..
.o..o...
.o.o....
ooo.....
o.oooooo
ooo.....
abcdefgh
`.trim())


  expect(pretty_bb(attacks_bb(King, SQ_H8, BigInt(0))))
  .toBe(`
......o.
......oo
........
........
........
........
........
........
abcdefgh
`.trim())


expect(pretty_bb(between_bb(SQ_A3, SQ_C1))).toBe(`
........
........
........
........
........
........
.o......
..o.....
abcdefgh
`.trim())

expect(pretty_bb(line_bb(SQ_A3, SQ_A2))).toBe(`
o.......
o.......
o.......
o.......
o.......
o.......
o.......
o.......
abcdefgh
`.trim())
})


it('occupancy magic', () => {

  expect(pretty_bb(attacks_bb(Queen, SQ_A1, square_bb(SQ_A2))))
  .toBe(`
.......o
......o.
.....o..
....o...
...o....
..o.....
oo......
.ooooooo
abcdefgh
`.trim())

})
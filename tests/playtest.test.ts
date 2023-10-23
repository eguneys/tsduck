import { it, expect } from 'vitest'
import { Position, SQ_E2, SQ_E4, SQ_D7, SQ_D5, SQ_D8, SQ_B1, SQ_C3, SQ_A5, SQ_D2, SQ_D4, SQ_C7, SQ_C6, SQ_G1, SQ_F3, SQ_C8, SQ_G4, SQ_C1, SQ_F4, SQ_A1, SQ_E1, SQ_H1, SQ_A6, SQ_B7, SQ_E7, SQ_E6, SQ_H2, SQ_H3, SQ_D1, SQ_F8, SQ_B4, SQ_F1, SQ_B8, SQ_A2, SQ_A3, SQ_E8, SQ_A8, bb_init, Square, SQ_C5, SQ_C2, SQ_G8, SQ_F6, SQ_H5, SQ_E3, SQ_B5 } from '../src'
import { legal_iter, pos_ffen, pos_initial, pos_play_tuples, vis } from '../src/play_position'

bb_init()


it('eighteen vs 1', () => {

  let p = pos_ffen('r4br1/8/2Q2npp/Pkn1p3/8/2PPP1qP/4bP2/RNB1KB2 b Q -')

  pos_play_tuples(p, [[SQ_B5, SQ_C6]])

  expect(legal_iter(p).length).toBe(18)

})


it('deep blue vs kasparov', () => {

  let ms: [Square, Square][] = [[SQ_E2, SQ_E4], [SQ_C7, SQ_C5], [SQ_C2, SQ_C3], [SQ_D7, SQ_D5], [SQ_E4, SQ_D5], [SQ_D8, SQ_D5], [SQ_D2, SQ_D4], [SQ_G8, SQ_F6], [SQ_G1, SQ_F3], [SQ_C8, SQ_G4], [SQ_F1, SQ_E2], [SQ_E7, SQ_E6], [SQ_H2, SQ_H3], [SQ_G4, SQ_H5], [SQ_E1, SQ_H1], [SQ_B8, SQ_C6], [SQ_C1, SQ_E3], [SQ_C5, SQ_D4], [SQ_C3, SQ_D4], [SQ_F8, SQ_B4]];

  let g = pos_initial()

  pos_play_tuples(g, ms)

  expect(vis(g)).toBe(`
r   k  r
pp   ppp
  n pn
   q   b
 b P
    BN P
PP  BPP
RN Q RK
White to move
`.replace(/^\n|\n$/g, ''))


 
})




it('preuvian_immortal', () => {

  let ms: [Square, Square][] = [[SQ_E2, SQ_E4], [SQ_D7, SQ_D5], [SQ_E4, SQ_D5], [SQ_D8, SQ_D5], [SQ_B1, SQ_C3], [SQ_D5, SQ_A5], [SQ_D2, SQ_D4], [SQ_C7, SQ_C6], [SQ_G1, SQ_F3], [SQ_C8, SQ_G4], [SQ_C1, SQ_F4], [SQ_E7, SQ_E6], [SQ_H2, SQ_H3], [SQ_G4, SQ_F3], [SQ_D1, SQ_F3], [SQ_F8, SQ_B4], [SQ_F1, SQ_E2], [SQ_B8, SQ_D7], [SQ_A2, SQ_A3], [SQ_E8, SQ_A8], [SQ_A3, SQ_B4], [SQ_A5, SQ_A1], [SQ_E1, SQ_D2], [SQ_A1, SQ_H1], [SQ_F3, SQ_C6], [SQ_B7, SQ_C6], [SQ_E2, SQ_A6]];

  let g = pos_initial()

  pos_play_tuples(g, ms)

  expect(vis(g)).toBe(`
  kr  nr
p  n ppp
B p p

 P P B
  N    P
 PPK PP
       q
Black to move
`.replace(/^\n|\n$/g, ''))


 
})

it('initial', () => {

  let p = pos_initial()

  expect(legal_iter(p).length).toBe(20)

})
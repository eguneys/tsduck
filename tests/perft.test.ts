import { it, expect } from 'vitest'
import { divide_perft, perft } from '../src/search'
import { pos_ffen, pos_initial, pos_play_tuples } from '../src/play_position'
import { Position, SQ_E1, SQ_F2, bb_init, debug_move } from '../src'

import { ParseResult, alt, is_success, many0, many1, newline, tag, take_until, take_while, take_while1, tuple, unumber } from 'duckparser24'

import fs from 'fs'

function read_perft_data(path: string) {
  return fs.readFileSync(__dirname + `/perft/${path}`, { encoding: 'utf8'})
}


type Perft = {
  id: string,
  epd: string,
  cases: [number, number][]
}

function parse_id(input: string): ParseResult<string> {
  let res = tuple([
    tag('id '),
    take_while(c => c != '\n')
  ])(input)

  if (is_success(res)) {
    let { value: [_, epd], rest } = res
    return { success: true, value: epd, rest }
  } else {
    return res
  }
}

function parse_epd(input: string): ParseResult<string> {
  let res = tuple([
    tag("epd "),
    take_while1(c => c != '\n')
  ])(input)

  if (is_success(res)) {
    return { success: true, value: res.value[1], rest: res.rest }
  } else {
    return res
  }
}

function parse_case(input: string): ParseResult<[number, number]> {
  let res = tuple([
    tag('perft '),
    unumber,
    tag(' '),
    unumber,
    newline
  ])(input)

  if (is_success(res)) {
    let { value: [_x, a, _y, b, _z], rest } = res

    return { success: true, value: [a, b], rest }
  } else {
    return res
  }
}

function parse_perft(input: string): ParseResult<Perft> {

  let res = tuple([
    parse_id,
    newline,
    parse_epd,
    newline,
    many1(parse_case),
    many0(ignored)
  ])(input)

  if (is_success(res)) {
     let { value: [id, _z, epd, _y, cases, _x], rest } = res

     return { success: true, value: { id, epd, cases }, rest }
  } else {
    return res
  }

}


function parse_comment(input: string): ParseResult<string> {
  let res = tuple([
    tag('#'),
    take_until('\n'),
    newline
  ])(input)

  if (is_success(res)) {
    return { success: true, value: res.value[1], rest: res.rest }
  } else {
    return res
  }
}

function ignored(input: string): ParseResult<string> {
  return alt(parse_comment, newline)(input)
}

function parse_perfts(input: string): ParseResult<Perft[]> {
  let _ = many0(ignored)(input)

  if (is_success(_)) {
    return many1(parse_perft)(_.rest)
  } else {
    return _
  }

}

function perft_read(file: string): Perft[] {

  let str = read_perft_data(file)
  let res = parse_perfts(str)
  if (is_success(res)) {
    return res.value
  } else {
    throw "Cant parse perfts " + file
  }
}

function calculate_perfts(perfts: Perft[], limit: number) {

  for (let p of perfts) {
    let pos = Position.set(p.epd)
    console.log(p.epd)
    for (let cs of p.cases) {

      if (cs[1] > limit) {
        continue
      }
      expect(perft(pos, cs[0])).toBe(cs[1])
    }
  }
}


bb_init()


function pretty_divide(p: Position, d: number) {
  let res = divide_perft(p, d).map(v => [debug_move(v[0]), v[1]] as [string, number])

  let total = res.reduce((acc: number, v: [string, number]) => acc + v[1], 0)

  console.log(res.map(_ => `${_[0]}: ${_[1]}`).join('\n'))
  console.log(`Nodes searched: ${total}`)
}

it('ten thousand', () => {

  let p = pos_ffen('r3kb1r/p1p2ppp/2n4n/1p3bq1/P2pp1PP/1PN2P2/2PPP3/R1BQKBNR w KQkq - 0 1')

  pos_play_tuples(p, [[SQ_E1, SQ_F2]])

  pretty_divide(p, 1)

})


it.skip('chess960.perft', () => {

  let random = perft_read("chess960.perft")
  calculate_perfts(random, 100000)

})


it.skip('random.perft', () => {

  let random = perft_read("random.perft")
  calculate_perfts(random, 10000)

})

it('perft 1', () => {

  expect(perft(pos_initial(), 1)).toBe(20)
  //console.log(divide_perft(pos_initial(), 1))
  expect(perft(pos_initial(), 2)).toBe(400)
})
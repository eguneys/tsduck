export function assert(x: boolean) {
  if (!x) {
    throw new Error("Assertion Error")
  }
}
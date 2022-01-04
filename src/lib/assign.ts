import { Node } from 'unist'
import { Parent, Root, Text } from 'mdast'

export type AssignCounterTrigger = { type: string; depth: number }
export class AssignCounter {
  private counter: number = 0
  private resetTrigger: AssignCounterTrigger[] = []
  constructor() {}
  addResetTrigger(t: AssignCounterTrigger) {
    this.resetTrigger.push({ type: t.type, depth: t.depth })
  }
  reset(node: Node, parents: Parent[]): boolean {
    if (
      parents.length === 1 &&
      this.resetTrigger.findIndex(
        ({ type, depth }) => type === node.type && depth === (node as any).depth
      ) >= 0
    ) {
      this.counter = 0
      return true
    }
    return false
  }
  up(): number {
    this.counter++
    return this.counter
  }
  look(): number {
    return this.counter
  }
}

export class Assign {
  // counters のフィールド名は series のみで指定される.
  // counters[''].up()  // global
  // counters['fig'].up() // fig
  private counters: Record<string, AssignCounter> = {}
  private resetTrigger: AssignCounterTrigger[] = []
  // numbers のフィールド名は series 込みで指定される.
  // numbers['foo'] // global series
  // numbers['fig.foo'] // fig series
  private numbers: Record<string, number> = {}
  constructor() {}
  static getSeries(id: string): string {
    const t: string[] = id.split('-', 2)
    if (t.length >= 2) {
      return t[0]
    }
    return ''
  }
  define(id: string) {
    // seiries のカウンターを取得.
    const s = Assign.getSeries(id)
    if (this.counters[s] === undefined) {
      this.counters[s] = new AssignCounter()
      this.resetTrigger.forEach((t) => this.counters[s].addResetTrigger(t))
    }
    // series のカウンターで変数を定義.
    // 存在している場合は上書き.
    this.numbers[id] = this.counters[s].up()
  }
  look(id: string): number | undefined {
    return this.numbers[id]
  }
  addResetTrigger(t: AssignCounterTrigger) {
    // ここでは定義を保存しておくだけ(add するときに設定する).
    this.resetTrigger.push({ type: t.type, depth: t.depth })
  }
  reset(node: Node, parents: Parent[]) {
    Object.values(this.counters).forEach((v) => v.reset(node, parents))
  }
}

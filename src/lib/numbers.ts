import { Plugin, Transformer } from 'unified'
import { Node } from 'unist'
import { Parent, Root, Text } from 'mdast'
import { TextDirective, ContainerDirective } from 'mdast-util-directive'
import { visitParents } from 'unist-util-visit-parents'

const directiveName = 'num'

export type RemarkNumbersOptions = {}

export type DefineCounterTrigger = { type: string; depth: number }
export class DefineCounter {
  private counter: number = 0
  private resetTrigger: DefineCounterTrigger[] = []
  constructor() {}
  addResetTrigger(t: DefineCounterTrigger) {
    this.resetTrigger.push({ type: t.type, depth: t.depth })
  }
  reset(node: Node): boolean {
    if (
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

export class Numbers {
  // counters のフィールド名は series のみで指定される.
  // counters[''].up()  // global
  // counters['fig'].up() // fig
  private counters: Record<string, DefineCounter> = {}
  private resetTrigger: DefineCounterTrigger[] = []
  // numbers のフィールド名は series 込みで指定される.
  // numbers['foo'] // global series
  // numbers['fig.foo'] // fig series
  private numbers: Record<string, number> = {}
  constructor() {}
  static getSeries(name: string): string {
    const t: string[] = name.split('.', 2)
    if (t.length >= 2) {
      return t[0]
    }
    return ''
  }
  define(name: string) {
    // seiries のカウンターを取得.
    const s = Numbers.getSeries(name)
    if (this.counters[s] === undefined) {
      this.counters[s] = new DefineCounter()
      this.resetTrigger.forEach((t) => this.counters[s].addResetTrigger(t))
    }
    // series のカウンターで変数を定義.
    // 存在している場合は上書き.
    this.numbers[name] = this.counters[s].up()
  }
  look(name: string): number | undefined {
    return this.numbers[name]
  }
  addResetTrigger(t: DefineCounterTrigger) {
    // ここでは定義を保存しておくだけ(add するときに設定する).
    this.resetTrigger.push({ type: t.type, depth: t.depth })
  }
  reset(node: Node) {
    Object.values(this.counters).forEach((v) => v.reset(node))
  }
}

export function errMessageNotDefined(name: string): Text {
  return {
    type: 'text',
    value: `(ReferenceError: "${name}" is not defined)`
  }
}

export const remarkNumbers: Plugin<
  [RemarkNumbersOptions] | [RemarkNumbersOptions[]] | [],
  string,
  Root
> = function remarkNumbers(): Transformer {
  // 事前処理(reset などの定義)用.
  const visitTestPre = (node: Node) => {
    if (
      node.type === 'containerDirective' &&
      (node as ContainerDirective).name === directiveName
    ) {
      return true
    }
    return false
  }
  const visitTest = (node: Node) => {
    if (
      node.type === 'textDirective' &&
      (node as ContainerDirective).name === directiveName
    ) {
      return true
    }
    return false
  }
  return function transformer(tree: Node): void {
    const numbers = new Numbers()

    const visitorPre = (node: Node, parents: Parent[]) => {
      const d = node as ContainerDirective
      if (d.attributes?.reset !== undefined) {
        // reset 用定義.
        const parentsLen = parents.length
        const parent: Parent = parents[parentsLen - 1]
        const nodeIdx = parent.children.findIndex((n) => n === node)
        // とりあえず heading のみ対応.
        d.children.forEach((n) => {
          if (
            n.type == 'heading' &&
            n.children.length === 1 &&
            n.children[0].type === 'textDirective' &&
            n.children[0].name === directiveName
          ) {
            numbers.addResetTrigger({ type: n.type, depth: n.depth })
          }
        })
        parent.children.splice(nodeIdx, 1)
      }
    }

    const visitor = (node: Node, parents: Parent[]) => {
      numbers.reset(node) // リセットさせる.

      // visitTest でフィルターしていないのでここで判定する.
      if (
        node.type === 'textDirective' &&
        (node as TextDirective).name === directiveName
      ) {
        const d = node as TextDirective
        const name: string | undefined = d.attributes?.name

        const def: string | undefined = d.attributes?.define

        if (name && def !== undefined) {
          // 属性に name と define が指定されているときだけ.
          const parentsLen = parents.length
          const parent: Parent = parents[parentsLen - 1]
          const nodeIdx = parent.children.findIndex((n) => n === node)

          // def は def された回数を値として設定、そのまま値をテキストとして扱う.
          numbers.define(name)
          parent.children[nodeIdx] = {
            type: 'text',
            value: `${numbers.look(name)}`
          }
          return nodeIdx
        }
      }
    }

    const visitorPost = (node: Node, parents: Parent[]) => {
      const d = node as TextDirective
      const name: string | undefined = d.attributes?.name

      if (name) {
        // name 属性が指定されているときだけ.
        const parentsLen = parents.length
        const parent: Parent = parents[parentsLen - 1]
        const nodeIdx = parent.children.findIndex((n) => n === node)

        // pre で確定した値を参照しテキストとして扱う.
        // 定義されていない場合はエラーメッセージ.
        const v = numbers.look(name)
        if (v !== undefined) {
          parent.children[nodeIdx] = { type: 'text', value: `${v}` }
        } else {
          parent.children[nodeIdx] = errMessageNotDefined(name)
        }

        return nodeIdx
      }
    }

    // 常処理、reset の設定などが実行される
    visitParents(tree, visitTestPre, visitorPre)
    // 通常処理、define などが実行される
    visitParents(tree, visitor)
    // 後処理、確定されている変数を参照する.
    visitParents(tree, visitTest, visitorPost)
  }
}

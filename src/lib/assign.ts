import { Node } from 'unist'
import { Parent } from 'mdast'
import { toMarkdown } from 'mdast-util-to-markdown'
import { directiveToMarkdown } from 'mdast-util-directive'
import { visitParents, SKIP } from 'unist-util-visit-parents'
import { TextDirective } from 'mdast-util-directive'
import { decodeParents, getRefernceFromLabel } from './util.js'
import { directiveName, errMessageNotDefined } from './numbers.js'
import { Counter } from './counter.js'
import { ConditionalFormat } from './format.js'

export type AssignCounterTrigger = { type: string; depth: number }
export class AssignCounter {
  private counter: number = 0
  private resetTrigger: AssignCounterTrigger[] = []
  constructor() {}
  addResetTrigger(t: AssignCounterTrigger) {
    this.resetTrigger.push({ type: t.type, depth: t.depth })
  }
  deleteResetTrigger(t: AssignCounterTrigger) {
    // 保存されているトリガーから指定のものをすべて削除(一致しないものを残す).
    this.resetTrigger = this.resetTrigger.filter(
      ({ type, depth }) => type !== t.type || depth !== t.depth
    )
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

export class Series extends AssignCounter {
  private name: string = ''
  private format: ConditionalFormat = new ConditionalFormat()
  constructor(inName: string, formatLbale?: Node) {
    super()
    this.name = inName
  }
  addFormat(formatLabel: Node[]) {
    this.format.add(formatLabel)
  }
  formattedUp(counter: Counter): Node | string {
    const c = this.up()
    const formattedNode = this.format.get(c, counter)
    if (formattedNode) {
      return formattedNode
    }
    return `${c}`
  }
}

const visitTest = (node: Node) => {
  if (
    node.type === 'textDirective' &&
    (node as TextDirective).name === directiveName
  ) {
    return true
  }
  return false
}

function getFormatVisitor(counter: Counter) {
  // counter を look するだけの visitor.
  return (node: Node, parents: Parent[]) => {
    // counter.trigger(node, parents) トリガーは実行しない

    const d = node as TextDirective
    const ref =
      getRefernceFromLabel(node as TextDirective, '%') || // 明示的に counter を指定する(まだテストしていない)
      getRefernceFromLabel(node as TextDirective)
    if (ref) {
      // ref が指定されているときは参照処理.
      // ここでは参照処理のみ.
      const [, parent, nodeIdx] = decodeParents(parents, node)

      // ConditionalFormat でカウンターが定義されていない状況はなくなった.
      // // 定義されていない場合はエラーメッセージ.
      // const v = counter.look(ref)
      // if (v !== undefined) {
      //   parent.children[nodeIdx] = { type: 'text', value: `${v}` }
      // } else {
      //   parent.children[nodeIdx] = errMessageNotDefined(ref)
      // }
      parent.children[nodeIdx] = { type: 'text', value: `${counter.look(ref)}` }

      return SKIP
    }
  }
}

// 末尾の改行を除去する.
// ここが変更されることはなさそうだが念のため.
// https://github.com/syntax-tree/mdast-util-to-markdown/issues/29
const formatLookTrimTrailinLineFeedRegExp = /\n$/
const formatLook = (v: Node | string, counter: Counter): string => {
  if (typeof v === 'string') {
    return v
  }
  visitParents(v, visitTest, getFormatVisitor(counter))
  return toMarkdown(v as any, {
    extensions: [directiveToMarkdown]
  }).replace(formatLookTrimTrailinLineFeedRegExp, '')
}

export class Assign {
  // counters のフィールド名は series のみで指定される.
  // counters[''].up()  // global
  // counters['fig'].up() // fig
  private _series: Record<string, Series> = {}
  private resetTrigger: AssignCounterTrigger[] = []
  // numbers のフィールド名は series 込みで指定される.
  // numbers['foo'] // global series
  // numbers['fig.foo'] // fig series
  private numbers: Record<string, string> = {}
  constructor() {}
  static getSeriesName(id: string): string {
    const t: string[] = id.split('-', 2)
    if (t.length >= 2) {
      return t[0]
    }
    return ''
  }
  private getSeries(seriesName: string): Series {
    if (this._series[seriesName] === undefined) {
      this._series[seriesName] = new Series(seriesName)
      this.resetTrigger.forEach((t) =>
        this._series[seriesName].addResetTrigger(t)
      )
    }
    return this._series[seriesName]
  }
  define(id: string, counter: Counter): string {
    const s = this.getSeries(Assign.getSeriesName(id))
    // 存在している場合は上書き.
    // format は Counter class に含める方がよいか?
    this.numbers[id] = formatLook(s.formattedUp(counter), counter)
    return this.numbers[id]
  }
  look(id: string): string | undefined {
    return this.numbers[id]
  }
  addResetTrigger(t: AssignCounterTrigger) {
    // ここでは定義を保存しておくだけ(getSeries のときに設定する).
    this.resetTrigger.push({ type: t.type, depth: t.depth })
  }
  deleteResetTrigger(t: AssignCounterTrigger) {
    // 保存されているトリガーから指定のものをすべて削除(一致しないものを残す).
    this.resetTrigger = this.resetTrigger.filter(
      ({ type, depth }) => type !== t.type || depth !== t.depth
    )
    // series からも削除する.
    Object.values(this._series).forEach((s) => s.deleteResetTrigger(t))
  }
  reset(node: Node, parents: Parent[]) {
    Object.values(this._series).forEach((v) => v.reset(node, parents))
  }
  setFormat(seriesName: string, formatLabel: Node[]) {
    // seiries を取得.
    const s = this.getSeries(seriesName)
    s.addFormat(formatLabel)
  }
}

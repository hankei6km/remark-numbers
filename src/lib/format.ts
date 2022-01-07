import { Node } from 'unist'
import { Parent, Text } from 'mdast'
import { TextDirective } from 'mdast-util-directive'
import { visitParents } from 'unist-util-visit-parents'
import toSafeInteger from 'lodash.tosafeinteger'
import { Counter } from './counter.js'
import { directiveName } from './numbers.js'
import { decodeParents } from './util.js'

const visitTestRequiredCounter = (node: Node) => {
  // 参照している :num を探す.
  if (node.type === 'textDirective') {
    const n = node as TextDirective
    if (
      n.name === directiveName &&
      n.children.length === 1 &&
      n.children[0].type === 'text'
    ) {
      return true
    }
  }
  return false
}

const visitTestPlaceHolder = (node: Node) => {
  // :num のみの node (プレースホルダー的に動作)を探す
  if (node.type === 'textDirective') {
    const n = node as TextDirective
    if (
      n.name === directiveName &&
      n.children.length === 0 &&
      Object.keys(n.attributes || {}).length === 0
    ) {
      return true
    }
  }
  return false
}

export class ConditionalFormat {
  private format: string[] = [] // ie. ['fig. :num[sec]-:num[subsec]:-num' の Node をシリアライズしたもの]
  private requiredCounter: string[][] = [] //ie. [['sec']['subsec']]
  constructor() {}
  add(formatLabel: Node[]) {
    const r = {
      type: 'paragraph',
      children: formatLabel
    }
    const requiredCounter: string[] = []
    visitParents(r, visitTestRequiredCounter, (node: Node) => {
      requiredCounter.push(((node as TextDirective).children[0] as Text).value)
    })
    this.format.unshift(JSON.stringify(r)) // マッチする中で最後に記述されたものにするため unshift.
    this.requiredCounter.unshift(requiredCounter)
  }
  get(value: number, counter: Counter): Node | undefined {
    let format: string = ''
    // シリアライズされた format を取得する
    const i = this.requiredCounter.findIndex((r) => {
      if (r.length === 0) {
        // 必須な counter はない.
        return true
      }
      return r.every((c) => {
        const v = counter.look(c)
        if (v !== undefined && toSafeInteger(v) > 0) {
          // カウンターはいまのところ数字を返す前提
          return true
        }
      })
    })
    if (i >= 0) {
      format = this.format[i]
    }
    if (format) {
      // format の tree を組み立てなおし、
      // :num のみの node に今回の値をセットする
      const formattedNode = JSON.parse(format)
      visitParents(
        formattedNode,
        visitTestPlaceHolder,
        (node: Node, parents: Parent[]) => {
          const [, parent, nodeIdx] = decodeParents(parents, node)
          parent.children[nodeIdx] = { type: 'text', value: `${value}` }
        }
      )
      return formattedNode
    }
    return undefined
  }
}

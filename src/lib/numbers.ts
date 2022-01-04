import { Plugin, Transformer } from 'unified'
import { Node } from 'unist'
import { Parent, Root, Text } from 'mdast'
import { TextDirective, ContainerDirective } from 'mdast-util-directive'
import { visitParents, SKIP } from 'unist-util-visit-parents'
import toSafeInteger from 'lodash.tosafeinteger'
import { Assign } from './assign.js'
import { Counter } from './counter.js'
import { decodeParents, getRefernceFromLabel } from './util.js'

const directiveName = 'num'

export type RemarkNumbersOptions = {}
export function errMessageNotDefined(id: string): Text {
  return {
    type: 'text',
    value: `(ReferenceError: "${id}" is not defined)`
  }
}

export const remarkNumbers: Plugin<
  [RemarkNumbersOptions] | [RemarkNumbersOptions[]] | [],
  string,
  Root
> = function remarkNumbers(): Transformer {
  // 事前処理(reset などの定義)用.
  const visitTestCounterPre = (node: Node) => {
    if (
      node.type === 'containerDirective' &&
      (node as ContainerDirective).name === directiveName &&
      (node as ContainerDirective).attributes?.counter !== undefined
    ) {
      return true
    }
    return false
  }
  const visitTestAssignPre = (node: Node) => {
    if (
      node.type === 'containerDirective' &&
      (node as ContainerDirective).name === directiveName &&
      (node as ContainerDirective).attributes?.assign !== undefined
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
    const assign = new Assign()
    const counter = new Counter()

    const visitorCounterPre = (node: Node, parents: Parent[]) => {
      const d = node as ContainerDirective
      if (d.attributes?.reset !== undefined) {
        // reset 用定義.
        const [, parent, nodeIdx] = decodeParents(parents, node)
        // とりあえず paragraph と heading のみ対応.
        d.children.forEach((n) => {
          if (
            n.type == 'paragraph' &&
            n.children.length === 1 &&
            n.children[0].type === 'textDirective' &&
            n.children[0].name === directiveName &&
            n.children[0].attributes?.id
          ) {
            counter.define(n.children[0].attributes?.id)
          } else if (
            n.type == 'heading' &&
            n.children.length === 1 &&
            n.children[0].type === 'textDirective' &&
            n.children[0].name === directiveName &&
            n.children[0].attributes?.id
          ) {
            counter.define(n.children[0].attributes.id, {
              type: n.type,
              depth: n.depth
            })
          }
        })
        parent.children.splice(nodeIdx, 1)
        return nodeIdx
      } else if (d.attributes?.increment !== undefined) {
        // increment 用定義.
        const [, parent, nodeIdx] = decodeParents(parents, node)
        // とりあえず heading のみ対応.
        let replace: Text | undefined = undefined
        d.children.forEach((n) => {
          if (
            n.type == 'heading' &&
            n.children.length === 1 &&
            n.children[0].type === 'textDirective' &&
            n.children[0].name === directiveName &&
            n.children[0].attributes?.id
          ) {
            const name = n.children[0].attributes.id
            if (
              counter.addIncrementTrigger(name, {
                type: n.type,
                depth: n.depth
              }) === false
            ) {
              replace = errMessageNotDefined(name)
            }
          }
        })
        if (replace) {
          parent.children[nodeIdx] = replace
          return SKIP
        }
        parent.children.splice(nodeIdx, 1)
        return nodeIdx
      }
    }

    const visitorAssignPre = (node: Node, parents: Parent[]) => {
      const d = node as ContainerDirective
      if (d.attributes?.reset !== undefined) {
        // reset 用定義.
        const [, parent, nodeIdx] = decodeParents(parents, node)
        // とりあえず heading のみ対応.
        d.children.forEach((n) => {
          if (
            n.type == 'heading' &&
            n.children.length === 1 &&
            n.children[0].type === 'textDirective' &&
            n.children[0].name === directiveName
          ) {
            assign.addResetTrigger({ type: n.type, depth: n.depth })
          }
        })
        parent.children.splice(nodeIdx, 1)
        return nodeIdx
      }
    }

    const visitor = (node: Node, parents: Parent[]) => {
      // リセットとインクリメント.
      counter.trigger(node, parents)
      assign.reset(node, parents)

      // visitTest でフィルターしていないのでここで判定する.
      if (
        node.type === 'textDirective' &&
        (node as TextDirective).name === directiveName
      ) {
        const d = node as TextDirective
        const id: string | undefined = d.attributes?.id

        if (id) {
          // 属性に id が指定されているとき(空白は除外)は定義系の処理.
          const [, parent, nodeIdx] = decodeParents(parents, node)

          const reset: string | undefined = d.attributes?.reset
          if (reset !== undefined) {
            // counter の reset.
            counter.define(id)
            counter.set(id, toSafeInteger(reset))
            parent.children.splice(nodeIdx, 1)
            return nodeIdx
          } else {
            // assign の define.
            // define は define された回数を値として設定、そのまま値をテキストとして扱う.
            assign.define(id)
            parent.children[nodeIdx] = {
              type: 'text',
              value: `${assign.look(id)}`
            }
            return SKIP
          }
        }

        const ref =
          getRefernceFromLabel(node as TextDirective, '%') || // 明示的に counter を指定する(まだテストしていない)
          getRefernceFromLabel(node as TextDirective)
        if (ref) {
          // ref が指定されているときは look など.
          const [, parent, nodeIdx] = decodeParents(parents, node)

          const up: string | undefined = d.attributes?.up
          const look: string | undefined = d.attributes?.look

          let replace: Text | undefined = undefined
          if (up !== undefined) {
            // up はカウントアップし、値をテキストとして扱う.
            // 定義されていない場合はエラーメッセージ.
            const v = counter.up(ref)
            if (v !== undefined) {
              replace = { type: 'text', value: `${v}` }
            } else {
              replace = errMessageNotDefined(ref)
            }
          } else if (look !== undefined) {
            // look はカウント中の値を参照しテキストとして扱う
            // look は counter のみ対象とする.
            // 定義されていない場合はエラーメッセージ.
            const v = counter.look(ref)
            if (v !== undefined) {
              replace = { type: 'text', value: `${v}` }
            } else {
              replace = errMessageNotDefined(ref)
            }
          } else {
            // 有効な属性がない場合は look と同じ.
            // 正し定義されていない場合はなにもしない(assign の方で処理する).
            const v = counter.look(ref)
            if (v !== undefined) {
              replace = { type: 'text', value: `${v}` }
            }
          }

          if (replace) {
            parent.children[nodeIdx] = replace
            return SKIP
          }
        }
      }
    }

    const visitorPost = (node: Node, parents: Parent[]) => {
      const ref =
        getRefernceFromLabel(node as TextDirective, '$') || // 明示的に assing を指定する(まだテストしていない)
        getRefernceFromLabel(node as TextDirective)
      if (ref) {
        // ref が指定されているときだけ.
        const [, parent, nodeIdx] = decodeParents(parents, node)

        // pre で確定した値を参照しテキストとして扱う.
        // 定義されていない場合はエラーメッセージ.
        const v = assign.look(ref)
        if (v !== undefined) {
          parent.children[nodeIdx] = { type: 'text', value: `${v}` }
        } else {
          parent.children[nodeIdx] = errMessageNotDefined(ref)
        }

        return nodeIdx
      }
    }

    // 前処理、reset の設定などが実行される
    visitParents(tree, visitTestCounterPre, visitorCounterPre)
    visitParents(tree, visitTestAssignPre, visitorAssignPre)
    // 通常処理、define などが実行される
    visitParents(tree, visitor)
    // 後処理、確定されている変数を参照する.
    visitParents(tree, visitTest, visitorPost)
  }
}

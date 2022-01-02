import { Plugin, Transformer } from 'unified'
import { Node } from 'unist'
import { Parent, Root, Text } from 'mdast'
import { TextDirective } from 'mdast-util-directive'
import { visitParents, CONTINUE, SKIP } from 'unist-util-visit-parents'
import toSafeInteger from 'lodash.tosafeinteger'

export type RemarkNumbersOptions = {}

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
  const visitTest = (node: Node) => {
    if (node.type === 'textDirective') {
      return true
    }
    return false
  }
  return function transformer(tree: Node): void {
    const numners: Record<string, number> = {}
    let defCnt: number = 1

    const visitorPre = (node: Node, parents: Parent[]) => {
      const d = node as TextDirective
      const name: string | undefined = d.attributes?.name

      const reset: string | undefined = d.attributes?.reset
      const def: string | undefined = d.attributes?.define
      const up: string | undefined = d.attributes?.up
      const look: string | undefined = d.attributes?.look

      if (
        name &&
        (reset !== undefined ||
          def !== undefined ||
          up !== undefined ||
          look !== undefined)
      ) {
        // 属性に name と何かが指定されているときだけ.
        const parentsLen = parents.length
        const parent: Parent = parents[parentsLen - 1]
        const nodeIdx = parent.children.findIndex((n) => n === node)

        let replace: Text | undefined = undefined
        if (reset !== undefined) {
          // reset は値を設定するだけ(node は削除される)
          numners[name] = toSafeInteger(reset)
        } else if (def !== undefined) {
          // def は def された回数を値として設定、そのまま値をテキストとして扱う.
          numners[name] = defCnt
          replace = { type: 'text', value: `${defCnt}` }
          defCnt++
        } else if (up !== undefined) {
          // up はカウントアップし、値をテキストとして扱う.
          // 定義されていない場合はエラーメッセージ.
          let v = numners[name]
          if (v !== undefined) {
            v++
            replace = { type: 'text', value: `${v}` }
            numners[name] = v
          } else {
            replace = errMessageNotDefined(name)
          }
        } else if (look !== undefined) {
          // look はカウント中の値を参照しテキストとして扱う
          // 定義されていない場合はエラーメッセージ.
          if (numners[name] !== undefined) {
            replace = { type: 'text', value: `${numners[name]}` }
          } else {
            replace = errMessageNotDefined(name)
          }
        }

        if (replace) {
          parent.children[nodeIdx] = replace
          return SKIP
        }
        parent.children.splice(nodeIdx, 1)
        return CONTINUE
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

        let replace: Text | undefined = undefined

        // pre で確定した値を参照しテキストとして扱う.
        // 定義されていない場合はエラーメッセージ.
        if (numners[name] !== undefined) {
          replace = { type: 'text', value: `${numners[name]}` }
        } else {
          replace = errMessageNotDefined(name)
        }

        if (replace) {
          parent.children[nodeIdx] = replace
          return SKIP
        }
        parent.children.splice(nodeIdx, 1)
        return CONTINUE
      }
    }

    // 通常処理、define などが実行される
    visitParents(tree, visitTest, visitorPre)
    // 後処理、確定されている変数を参照する.
    visitParents(tree, visitTest, visitorPost)
  }
}

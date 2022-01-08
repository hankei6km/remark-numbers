import { Node } from 'unist'
import { Parent } from 'mdast'
import { TextDirective } from 'mdast-util-directive'
import { remarkNumbersOptionsDefault, RemarkNumbersOptions } from './numbers.js'

function _normalizeOpts(
  opts: RemarkNumbersOptions
): Required<RemarkNumbersOptions> {
  return {
    template:
      opts.template !== undefined
        ? opts.template
        : remarkNumbersOptionsDefault.template,
    keepDefaultTemplate:
      opts.keepDefaultTemplate !== undefined
        ? opts.keepDefaultTemplate
        : remarkNumbersOptionsDefault.keepDefaultTemplate,
    fldNameInFromtMatterToSwitchGrp:
      opts.fldNameInFromtMatterToSwitchGrp !== undefined
        ? opts.fldNameInFromtMatterToSwitchGrp
        : remarkNumbersOptionsDefault.fldNameInFromtMatterToSwitchGrp
  }
}

export function normalizeOpts(
  opts?: RemarkNumbersOptions | RemarkNumbersOptions[]
): Required<RemarkNumbersOptions>[] {
  if (Array.isArray(opts)) {
    return opts.map((v) => _normalizeOpts(v))
  } else {
    return [_normalizeOpts(opts || {})]
  }
}

export function decodeParents(
  parents: Parent[],
  node: Node
): [parentsLen: number, parent: Parent, nodeIdx: number] {
  const parentsLen = parents.length
  const parent = parents[parentsLen - 1]
  return [parentsLen, parent, parent.children.findIndex((n) => n === node)]
}

export function getRefernceFromLabel(d: TextDirective, prefix?: string) {
  let ret = ''
  if (d.children.length === 1 && d.children[0].type === 'text') {
    ret = d.children[0].value
    if (prefix) {
      if (ret.startsWith(prefix)) {
        // prefix を除去
        ret = ret.slice(prefix.length)
      } else {
        // prefix が指定されている場合は一致しない場合は空白.
        ret = ''
      }
    }
  }
  return ret
}

import { TextDirective } from 'mdast-util-directive'

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

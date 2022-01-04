import { TextDirective } from 'mdast-util-directive'
import { getRefernceFromLabel } from '../../src/lib/util'

describe('getRefernceFromLabel()', () => {
  it('should get reference name from text directive', () => {
    const d: TextDirective = {
      type: 'textDirective',
      name: 'num',
      children: [{ type: 'text', value: 'foo' }]
    }
    expect(getRefernceFromLabel(d)).toEqual('foo')
  })
  it('should get reference name from text directive with prefix', () => {
    const d: TextDirective = {
      type: 'textDirective',
      name: 'num',
      children: [{ type: 'text', value: '$foo' }]
    }
    expect(getRefernceFromLabel(d, '$')).toEqual('foo')
  })
  it('should return blank when structure not match', () => {
    const d: TextDirective = {
      type: 'textDirective',
      name: 'num',
      children: []
    }
    expect(getRefernceFromLabel(d)).toEqual('')
  })
  it('should return blank when prefix not match', () => {
    const d: TextDirective = {
      type: 'textDirective',
      name: 'num',
      children: [{ type: 'text', value: 'bar' }]
    }
    expect(getRefernceFromLabel(d, '$')).toEqual('')
  })
})

import { TextDirective } from 'mdast-util-directive'
import { remarkNumbersOptionsDefault } from '../../src/lib/numbers.js'
import { getRefernceFromLabel, normalizeOpts } from '../../src/lib/util.js'

describe('normalizeOpts()', () => {
  it('should set default', () => {
    expect(normalizeOpts()).toEqual([remarkNumbersOptionsDefault])
    expect(normalizeOpts({})).toEqual([remarkNumbersOptionsDefault])
  })
  it('should use passed fields', () => {
    expect(normalizeOpts({ template: [''] })).toEqual([{ template: [''] }])
    expect(normalizeOpts({ template: ['test'] })).toEqual([
      {
        template: ['test']
      }
    ])
  })
  it('should use passed fields(array)', () => {
    expect(
      normalizeOpts([{ template: ['test1'] }, { template: ['test2'] }])
    ).toEqual([
      {
        template: ['test1']
      },
      {
        template: ['test2']
      }
    ])
  })
})

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

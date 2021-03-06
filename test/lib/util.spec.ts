import { TextDirective } from 'mdast-util-directive'
import { remarkNumbersOptionsDefault } from '../../src/lib/numbers.js'
import { getRefernceFromLabel, normalizeOpts } from '../../src/lib/util.js'

describe('normalizeOpts()', () => {
  it('should set default', () => {
    expect(normalizeOpts()).toEqual([remarkNumbersOptionsDefault])
    expect(normalizeOpts({})).toEqual([remarkNumbersOptionsDefault])
    expect(normalizeOpts([{}])).toEqual([remarkNumbersOptionsDefault])
  })
  it('should use passed fields', () => {
    expect(normalizeOpts({ template: [''] })).toEqual([
      {
        ...remarkNumbersOptionsDefault,
        template: ['']
      }
    ])
    expect(normalizeOpts({ template: ['test'] })).toEqual([
      {
        ...remarkNumbersOptionsDefault,
        template: ['test']
      }
    ])
    expect(
      normalizeOpts({ template: ['test'], keepDefaultTemplate: true })
    ).toEqual([
      {
        ...remarkNumbersOptionsDefault,
        template: ['test'],
        keepDefaultTemplate: true
      }
    ])
    expect(
      normalizeOpts({ fldNameInFromtMatterToSwitchGrp: 'numGrpNameTest' })
    ).toEqual([
      {
        ...remarkNumbersOptionsDefault,
        fldNameInFromtMatterToSwitchGrp: 'numGrpNameTest'
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

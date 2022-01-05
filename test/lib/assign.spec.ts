import { Node } from 'unist'
import { AssignCounter, Assign } from '../../src/lib/assign.js'
import { Counter } from '../../src/lib/counter.js'

describe('AssingCounter', () => {
  it('should count up counter', async () => {
    const counter = new AssignCounter()
    expect(counter.up()).toEqual(1)
    expect(counter.up()).toEqual(2)
    expect(counter.look()).toEqual(2)
  })
  it('should reset counter', async () => {
    const counter = new AssignCounter()
    counter.addResetTrigger({ type: 'heading', depth: 2 })
    expect(counter.up()).toEqual(1)
    expect(
      counter.reset({ type: 'heading', depth: 2 } as Node, [
        { type: 'root', children: [] }
      ])
    ).toBeTruthy()
    expect(counter.up()).toEqual(1)
    expect(
      counter.reset({ type: 'heading', depth: 2 } as Node, [
        { type: 'root', children: [] },
        { type: 'containerDirective', children: [] } // 階層が深いのでリセットしない.
      ])
    ).toBeFalsy()
    expect(counter.up()).toEqual(2)
    expect(
      counter.reset({ type: 'heading', depth: 3 } as Node, [
        { type: 'root', children: [] }
      ])
    ).toBeFalsy()
    expect(counter.up()).toEqual(3)
  })
})

describe('Assign', () => {
  it('should define variables', async () => {
    const counter = new Counter()
    const numbers = new Assign()
    expect(numbers.define('foo', counter)).toEqual('1')
    expect(numbers.define('bar', counter)).toEqual('2')
    expect(numbers.look('foo')).toEqual('1')
    expect(numbers.look('bar')).toEqual('2')
  })
  it('should define variables with series', async () => {
    const counter = new Counter()
    const numbers = new Assign()
    expect(numbers.define('foo', counter)).toEqual('1')
    expect(numbers.define('bar', counter)).toEqual('2')
    expect(numbers.define('fig-foo', counter)).toEqual('1')
    expect(numbers.define('fig-bar', counter)).toEqual('2')
    expect(numbers.define('car', counter)).toEqual('3')
    expect(numbers.define('tbl-foo', counter)).toEqual('1')
    expect(numbers.define('tbl-bar', counter)).toEqual('2')
    expect(numbers.look('foo')).toEqual('1')
    expect(numbers.look('bar')).toEqual('2')
    expect(numbers.look('car')).toEqual('3')
    expect(numbers.look('fig-foo')).toEqual('1')
    expect(numbers.look('fig-bar')).toEqual('2')
    expect(numbers.look('tbl-foo')).toEqual('1')
    expect(numbers.look('tbl-bar')).toEqual('2')
  })
  it('should reset counter', async () => {
    const counter = new Counter()
    const numbers = new Assign()
    numbers.addResetTrigger({ type: 'heading', depth: 2 })
    numbers.define('foo', counter)
    numbers.define('bar', counter)
    numbers.define('fig-foo', counter)
    numbers.reset({ type: 'heading', depth: 2 } as Node, [
      { type: 'root', children: [] }
    ])
    numbers.define('fig-bar', counter)
    numbers.reset({ type: 'heading', depth: 3 } as Node, [
      { type: 'root', children: [] }
    ])
    numbers.define('car', counter)
    numbers.define('fig-car', counter)
    expect(numbers.look('foo')).toEqual('1')
    expect(numbers.look('bar')).toEqual('2')
    expect(numbers.look('car')).toEqual('1')
    expect(numbers.look('fig-foo')).toEqual('1')
    expect(numbers.look('fig-bar')).toEqual('1')
    expect(numbers.look('fig-car')).toEqual('2')
  })
  it('should get formatted value', async () => {
    const counter = new Counter()
    const numbers = new Assign()
    numbers.setFormat('fig', [
      { type: 'text', value: 'test-' },
      {
        type: 'textDirective',
        name: 'num',
        children: [],
        attributes: {}
      }
    ] as unknown as Node[])
    expect(numbers.define('fig-foo', counter)).toEqual('test-1')
  })
  it('should get formatted value(coverage)', async () => {
    const counter = new Counter()
    const numbers = new Assign()
    numbers.setFormat('fig', [
      { type: 'text', value: 'test-' },
      {
        type: 'textDirective',
        name: 'num',
        children: []
        // attributes: {} カバレッジ用(children が undefined なことはほぼない)
      }
    ] as unknown as Node[])
    expect(numbers.define('fig-foo', counter)).toEqual('test-1')
  })
  it('should get formatted value with counter', async () => {
    const counter = new Counter()
    counter.define('sec')
    counter.up('sec')
    counter.up('sec')
    const numbers = new Assign()
    numbers.setFormat('fig', [
      { type: 'text', value: 'test-' },
      {
        type: 'textDirective',
        name: 'num',
        children: [
          //{ type: 'paragraph', children: [{ type: 'text', value: 'sec' }] }
          { type: 'text', value: 'sec' }
        ],
        attributes: {}
      },
      { type: 'text', value: '-' },
      {
        type: 'textDirective',
        name: 'num',
        children: [],
        attributes: {}
      }
    ] as unknown as Node[])
    expect(numbers.define('fig-foo', counter)).toEqual('test-2-1')
  })
})

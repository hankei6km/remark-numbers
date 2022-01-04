import { Node } from 'unist'
import { AssignCounter, Assign } from '../../src/lib/assign.js'

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

describe('Numbers', () => {
  it('should define variables', async () => {
    const numbers = new Assign()
    numbers.define('foo')
    numbers.define('bar')
    expect(numbers.look('foo')).toEqual(1)
    expect(numbers.look('bar')).toEqual(2)
  })
  it('should define variables with series', async () => {
    const numbers = new Assign()
    numbers.define('foo')
    numbers.define('bar')
    numbers.define('fig-foo')
    numbers.define('fig-bar')
    numbers.define('car')
    numbers.define('tbl-foo')
    numbers.define('tbl-bar')
    expect(numbers.look('foo')).toEqual(1)
    expect(numbers.look('bar')).toEqual(2)
    expect(numbers.look('car')).toEqual(3)
    expect(numbers.look('fig-foo')).toEqual(1)
    expect(numbers.look('fig-bar')).toEqual(2)
    expect(numbers.look('tbl-foo')).toEqual(1)
    expect(numbers.look('tbl-bar')).toEqual(2)
  })
  it('should reset counter', async () => {
    const numbers = new Assign()
    numbers.addResetTrigger({ type: 'heading', depth: 2 })
    numbers.define('foo')
    numbers.define('bar')
    numbers.define('fig-foo')
    numbers.reset({ type: 'heading', depth: 2 } as Node, [
      { type: 'root', children: [] }
    ])
    numbers.define('fig-bar')
    numbers.reset({ type: 'heading', depth: 3 } as Node, [
      { type: 'root', children: [] }
    ])
    numbers.define('car')
    numbers.define('fig-car')
    expect(numbers.look('foo')).toEqual(1)
    expect(numbers.look('bar')).toEqual(2)
    expect(numbers.look('car')).toEqual(1)
    expect(numbers.look('fig-foo')).toEqual(1)
    expect(numbers.look('fig-bar')).toEqual(1)
    expect(numbers.look('fig-car')).toEqual(2)
  })
})

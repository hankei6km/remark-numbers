import { unified } from 'unified'
import { Node } from 'unist'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkDirective from 'remark-directive'
import { SimpleCounter, Counter } from '../../src/lib/counter.js'

describe('DefineCounter', () => {
  it('should count up counter', async () => {
    const counter = new SimpleCounter()
    expect(counter.up()).toEqual(1)
    expect(counter.up()).toEqual(2)
    expect(counter.look()).toEqual(2)
  })
  it('should set value to counter', async () => {
    const counter = new SimpleCounter()
    expect(counter.look()).toEqual(0)
    counter.set(10)
    expect(counter.look()).toEqual(10)
  })
  it('should reset counter by node', async () => {
    const counter = new SimpleCounter()
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
        { type: 'containerDirective', children: [] }
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
  it('should increment counter by node', async () => {
    const counter = new SimpleCounter()
    counter.addIncrementTrigger({ type: 'heading', depth: 2 })
    expect(counter.look()).toEqual(0)
    expect(
      counter.incerement({ type: 'heading', depth: 2 } as Node, [
        { type: 'root', children: [] }
      ])
    ).toBeTruthy()
    expect(counter.look()).toEqual(1)
    expect(
      counter.incerement({ type: 'heading', depth: 2 } as Node, [
        { type: 'root', children: [] },
        { type: 'containerDirective', children: [] }
      ])
    ).toBeFalsy()
    expect(counter.look()).toEqual(1)
    expect(
      counter.incerement({ type: 'heading', depth: 3 } as Node, [
        { type: 'root', children: [] }
      ])
    ).toBeFalsy()
    expect(counter.look()).toEqual(1)
  })
})

describe('Counter', () => {
  it('should define variables', async () => {
    const counter = new Counter()
    counter.define('foo')
    counter.define('bar')
    expect(counter.look('foo')).toEqual(0)
    expect(counter.look('bar')).toEqual(0)
    expect(counter.look('car')).toBeUndefined()
  })
  it('should count up variables', async () => {
    const counter = new Counter()
    counter.define('foo')
    counter.define('bar')
    expect(counter.up('foo')).toEqual(1)
    expect(counter.look('foo')).toEqual(1)
    expect(counter.look('bar')).toEqual(0)
    expect(counter.up('bar')).toEqual(1)
    expect(counter.look('foo')).toEqual(1)
    expect(counter.look('bar')).toEqual(1)
    expect(counter.up('car')).toBeUndefined()
  })
  it('should set value to variables', async () => {
    const counter = new Counter()
    counter.define('foo')
    expect(counter.look('foo')).toEqual(0)
    counter.set('foo', 10)
    expect(counter.look('foo')).toEqual(10)
  })
  it('should reset counter by node', async () => {
    const counter = new Counter()
    counter.define('foo', { type: 'heading', depth: 2 })
    counter.define('bar', { type: 'heading', depth: 3 })
    counter.define('car', { type: 'heading', depth: 2 })
    counter.define('car', { type: 'heading', depth: 3 })
    expect(counter.look('foo')).toEqual(0)
    expect(counter.look('bar')).toEqual(0)
    expect(counter.look('car')).toEqual(0)
    counter.up('foo')
    counter.up('bar')
    counter.up('car')
    expect(counter.look('foo')).toEqual(1)
    expect(counter.look('bar')).toEqual(1)
    expect(counter.look('car')).toEqual(1)
    counter.trigger({ type: 'heading', depth: 2 } as Node, [
      { type: 'root', children: [] }
    ])
    expect(counter.look('foo')).toEqual(0)
    expect(counter.look('bar')).toEqual(1)
    expect(counter.look('car')).toEqual(0)
    counter.up('foo')
    counter.up('bar')
    counter.up('car')
    expect(counter.look('foo')).toEqual(1)
    expect(counter.look('bar')).toEqual(2)
    expect(counter.look('car')).toEqual(1)
    counter.trigger({ type: 'heading', depth: 3 } as Node, [
      { type: 'root', children: [] }
    ])
    expect(counter.look('foo')).toEqual(1)
    expect(counter.look('bar')).toEqual(0)
    expect(counter.look('car')).toEqual(0)
  })
  it('should increment counter by node', async () => {
    const counter = new Counter()
    counter.define('foo')
    counter.define('bar')
    counter.addIncrementTrigger('foo', { type: 'heading', depth: 2 })
    counter.addIncrementTrigger('bar', { type: 'heading', depth: 3 })
    expect(counter.look('foo')).toEqual(0)
    expect(counter.look('bar')).toEqual(0)
    counter.trigger({ type: 'heading', depth: 2 } as Node, [
      { type: 'root', children: [] }
    ])
    expect(counter.look('foo')).toEqual(1)
    expect(counter.look('bar')).toEqual(0)
    counter.trigger({ type: 'heading', depth: 3 } as Node, [
      { type: 'root', children: [] }
    ])
    expect(counter.look('foo')).toEqual(1)
    expect(counter.look('bar')).toEqual(1)
  })
  it('should reset and increment counter by node', async () => {
    const counter = new Counter()
    counter.define('foo', { type: 'heading', depth: 2 })
    counter.define('bar', { type: 'heading', depth: 3 })
    expect(
      counter.addIncrementTrigger('foo', { type: 'heading', depth: 2 })
    ).toBeTruthy()
    expect(
      counter.addIncrementTrigger('bar', { type: 'heading', depth: 3 })
    ).toBeTruthy()
    counter.up('foo')
    counter.up('bar')
    counter.up('foo')
    counter.up('bar')
    expect(counter.look('foo')).toEqual(2)
    expect(counter.look('bar')).toEqual(2)
    counter.trigger({ type: 'heading', depth: 2 } as Node, [
      { type: 'root', children: [] }
    ])
    expect(counter.look('foo')).toEqual(1)
    expect(counter.look('bar')).toEqual(2)
    counter.up('foo')
    counter.up('bar')
    expect(counter.look('foo')).toEqual(2)
    expect(counter.look('bar')).toEqual(3)
    counter.trigger({ type: 'heading', depth: 3 } as Node, [
      { type: 'root', children: [] }
    ])
    expect(counter.look('foo')).toEqual(2)
    expect(counter.look('bar')).toEqual(1)
  })
  it('should return false when set increment trigger to undefined value', async () => {
    const counter = new Counter()
    expect(
      counter.addIncrementTrigger('foo', { type: 'heading', depth: 2 })
    ).toBeFalsy()
  })
})

import { Node } from 'unist'
import { Parent, Root, Text } from 'mdast'
import toSafeInteger from 'lodash.tosafeinteger'

export type SimpleCounterTrigger = { type: string; depth: number }
export class SimpleCounter {
  private counter: number = 0
  private resetTrigger: SimpleCounterTrigger[] = []
  private incrementTrigger: SimpleCounterTrigger[] = []
  constructor() {}
  addResetTrigger(t?: SimpleCounterTrigger) {
    if (t) {
      this.resetTrigger.push({ type: t.type, depth: t.depth })
    }
  }
  addIncrementTrigger(t?: SimpleCounterTrigger) {
    if (t) {
      this.incrementTrigger.push({ type: t.type, depth: t.depth })
    }
  }
  set(value: number) {
    this.counter = value
  }
  reset(node: Node, parents: Parent[]): boolean {
    if (
      parents.length === 1 &&
      this.resetTrigger.findIndex(
        ({ type, depth }) => type === node.type && depth === (node as any).depth
      ) >= 0
    ) {
      this.counter = 0
      return true
    }
    return false
  }
  incerement(node: Node, parents: Parent[]): boolean {
    if (
      parents.length === 1 &&
      this.incrementTrigger.findIndex(
        ({ type, depth }) => type === node.type && depth === (node as any).depth
      ) >= 0
    ) {
      this.up()
      return true
    }
    return false
  }
  up(): number {
    this.counter++
    return this.counter
  }
  look(): number {
    return this.counter
  }
}

export class Counter {
  private counters: Record<string, SimpleCounter> = {}
  constructor() {}
  define(name: string, t?: SimpleCounterTrigger) {
    if (this.counters[name] === undefined) {
      this.counters[name] = new SimpleCounter()
      this.counters[name].addResetTrigger(t)
    } else {
      this.counters[name].addResetTrigger(t)
    }
  }
  addIncrementTrigger(name: string, t?: SimpleCounterTrigger): boolean {
    if (this.counters[name]) {
      this.counters[name].addIncrementTrigger(t)
      return true
    }
    return false
  }
  set(name: string, value: number) {
    if (this.counters[name]) {
      this.counters[name].set(value)
    }
  }
  up(name: string): number | undefined {
    if (this.counters[name]) {
      return this.counters[name].up()
    }
    return undefined
  }
  look(name: string): number | undefined {
    if (this.counters[name]) {
      return this.counters[name].look()
    }
    return undefined
  }
  trigger(node: Node, parents: Parent[]) {
    Object.values(this.counters).forEach((v) => v.reset(node, parents))
    Object.values(this.counters).forEach((v) => v.incerement(node, parents))
  }
}

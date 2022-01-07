import { Counter } from '../../src/lib/counter.js'
import { ConditionalFormat } from '../../src/lib/format.js'

describe('ConditionalFormat', () => {
  it('should get format string', () => {
    const counter = new Counter()
    const format = new ConditionalFormat()
    const f = [
      {
        type: 'textDirective',
        name: 'num',
        children: [],
        attributes: {}
      }
    ]
    format.add(f)
    expect(format.get(10, counter)).toEqual({
      type: 'paragraph',
      children: [{ type: 'text', value: '10' }]
    })
  })
  it('should get format string(coverage', () => {
    const counter = new Counter()
    const format = new ConditionalFormat()
    const f = [
      {
        type: 'textDirective',
        name: 'num',
        children: []
        // attributes: {}  required でないので.
      }
    ]
    format.add(f)
    expect(format.get(10, counter)).toEqual({
      type: 'paragraph',
      children: [{ type: 'text', value: '10' }]
    })
  })
  it('should get format string with require counters', () => {
    const counter = new Counter()
    const format = new ConditionalFormat()
    const f1 = [
      {
        type: 'textDirective',
        name: 'num',
        children: [],
        attributes: {}
      }
    ]
    const f2 = [
      {
        type: 'textDirective',
        name: 'num',
        children: [
          {
            type: 'text',
            value: 'sec'
          }
        ],
        attributes: {}
      },
      {
        type: 'textDirective',
        name: 'num',
        children: [],
        attributes: {}
      }
    ]
    format.add(f1)
    format.add(f2)
    counter.define('sec')
    counter.up('sec')
    expect(format.get(10, counter)).toEqual({
      type: 'paragraph',
      children: [
        {
          type: 'textDirective',
          name: 'num',
          children: [
            {
              type: 'text',
              value: 'sec'
            }
          ],
          attributes: {}
        },
        { type: 'text', value: '10' }
      ]
    })
  })
  it('should get format string with require counters(last match)', () => {
    const counter = new Counter()
    const format = new ConditionalFormat()
    const f1 = [
      {
        type: 'textDirective',
        name: 'num',
        children: [],
        attributes: {}
      }
    ]
    const f2 = [
      {
        type: 'textDirective',
        name: 'num',
        children: [
          {
            type: 'text',
            value: 'sec'
          }
        ],
        attributes: {}
      },
      {
        type: 'textDirective',
        name: 'num',
        children: [],
        attributes: {}
      }
    ]
    const f3 = [
      {
        type: 'textDirective',
        name: 'num',
        children: [
          {
            type: 'text',
            value: 'sec'
          }
        ],
        attributes: {}
      },
      {
        type: 'textDirective',
        name: 'num',
        children: [
          {
            type: 'text',
            value: 'subsec'
          }
        ],
        attributes: {}
      },
      {
        type: 'textDirective',
        name: 'num',
        children: [],
        attributes: {}
      }
    ]
    format.add(f1)
    format.add(f2)
    format.add(f3)
    counter.define('sec')
    counter.define('subsec')
    counter.up('sec')
    counter.up('subsec')
    expect(format.get(10, counter)).toEqual({
      type: 'paragraph',
      children: [
        {
          type: 'textDirective',
          name: 'num',
          children: [
            {
              type: 'text',
              value: 'sec'
            }
          ],
          attributes: {}
        },
        {
          type: 'textDirective',
          name: 'num',
          children: [
            {
              type: 'text',
              value: 'subsec'
            }
          ],
          attributes: {}
        },
        {
          type: 'text',
          value: '10'
        }
      ]
    })
  })
  it('should return undefined when required counters is not exist', () => {
    const counter = new Counter()
    const format = new ConditionalFormat()
    const f2 = [
      {
        type: 'textDirective',
        name: 'num',
        children: [
          {
            type: 'text',
            value: 'sec'
          }
        ],
        attributes: {}
      },
      {
        type: 'textDirective',
        name: 'num',
        children: [],
        attributes: {}
      }
    ]
    format.add(f2)
    expect(format.get(10, counter)).toBeUndefined()
  })
  it('should return blank when the value of required counter is zero', () => {
    const counter = new Counter()
    const format = new ConditionalFormat()
    const f2 = [
      {
        type: 'textDirective',
        name: 'num',
        children: [
          {
            type: 'text',
            value: 'sec'
          }
        ],
        attributes: {}
      },
      {
        type: 'textDirective',
        name: 'num',
        children: [],
        attributes: {}
      }
    ]
    format.add(f2)
    counter.define('sec') // この時点では 0
    expect(format.get(10, counter)).toBeUndefined()
  })
})

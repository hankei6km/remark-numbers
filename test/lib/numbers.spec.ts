import { unified } from 'unified'
import { Node } from 'unist'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkDirective from 'remark-directive'
import {
  AssignCounter,
  Numbers,
  remarkNumbers,
  RemarkNumbersOptions
} from '../../src/lib/numbers.js'

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
    const numbers = new Numbers()
    numbers.define('foo')
    numbers.define('bar')
    expect(numbers.look('foo')).toEqual(1)
    expect(numbers.look('bar')).toEqual(2)
  })
  it('should define variables with series', async () => {
    const numbers = new Numbers()
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
    const numbers = new Numbers()
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

describe('remarkNumbers()', () => {
  const f = async (
    html: string,
    opts?: RemarkNumbersOptions | RemarkNumbersOptions[]
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      unified()
        .use(remarkParse)
        .use(remarkDirective)
        .use(remarkNumbers)
        .use(remarkStringify)
        .freeze()
        .process(html, (err, file) => {
          if (err) {
            reject(err)
          }
          resolve(String(file))
        })
    })
  }
  it('should define the value', async () => {
    expect(
      await f(
        '# test\n\ns1\n\n![fig1](/images/fig1.png)\n*fig :num{#fig}*\n\ns2\n\n## test1\n\nfig :num[fig]\n'
      )
    ).toEqual(
      '# test\n\ns1\n\n![fig1](/images/fig1.png)\n*fig 1*\n\ns2\n\n## test1\n\nfig 1\n'
    )
  })
  it('should define the value with series', async () => {
    expect(
      await f(
        '# test\n\n:num{#fig-foo}:num{#tbl-foo}:num{#fig-bar}\n\n## test1\n\n:num[fig-foo]:num[tbl-foo]:num[fig-bar]\n'
      )
    ).toEqual('# test\n\n112\n\n## test1\n\n112\n')
  })
  it('should increment counter by "define"', async () => {
    expect(
      await f('# test\n\n:num{#foo}\n\n:num{#bar}\n\n:num{#car}\n')
    ).toEqual('# test\n\n1\n\n2\n\n3\n')
  })
  it('should lookup variable with prefix "$"', async () => {
    expect(
      await f('# test\n\n:num{#foo}\n\n:num{#bar}\n\n:num[$bar]\n')
    ).toEqual('# test\n\n1\n\n2\n\n2\n')
  })
  it('should lookup variable that is define at post', async () => {
    expect(
      await f('# test\n\n:num{#foo}\n\n:num[car]\n\n:num{#bar}\n\n:num{#car}\n')
    ).toEqual('# test\n\n1\n\n3\n\n2\n\n3\n')
  })
  it('should insert a error message if the value is not defined', async () => {
    expect(
      await f('# test\n\n:num{#foo}\n\ns1:num[bar]s2\n\n:num[foo]\n')
    ).toEqual(
      '# test\n\n1\n\ns1(ReferenceError: "bar" is not defined)s2\n\n1\n'
    )
  })
  it('should reset by reset container', async () => {
    expect(
      await f(
        '# test\n\n:::num{reset}\n## :num\n:::\n\n## head2-1\n\n:num{#foo}\n\n:num{#bar}\n\n## head2-2\n\n:num{#car}\n\n## head2-3\n\n:num[foo]:num[bar]:num[car]\n'
      )
    ).toEqual(
      '# test\n\n## head2-1\n\n1\n\n2\n\n## head2-2\n\n1\n\n## head2-3\n\n121\n'
    )
  })
  it('should skip resetting counter by deeper heading', async () => {
    expect(
      await f(
        '# test\n\n:::num{reset}\n## :num\n:::\n\n## head2-1\n\n:num{#foo}\n\n:::cnt{reset}\n## :cnt{#chapter}\n:::\n\n:num{#bar}\n\n:num[foo]:num[bar]'
      )
    ).toEqual(
      '# test\n\n## head2-1\n\n1\n\n:::cnt{reset}\n## :cnt{#chapter}\n:::\n\n2\n\n12\n'
    )
  })
  it('should reset by reset container(series)', async () => {
    expect(
      await f(
        '# test\n\n:::num{reset}\n## :num\n:::\n\n## head2-1\n\n:num{#fig-foo}\n\n:num{#fig-bar}\n\n## head2-2\n\n:num{#fig-car}\n\n## head2-3\n\n:num[fig-foo]:num[fig-bar]:num[fig-car]\n'
      )
    ).toEqual(
      '# test\n\n## head2-1\n\n1\n\n2\n\n## head2-2\n\n1\n\n## head2-3\n\n121\n'
    )
  })
  it('should escape varble name in error message', async () => {
    expect(await f('# test\n\ns1:num[[bar]]s2\n')).toEqual(
      '# test\n\ns1(ReferenceError: "\\[bar]" is not defined)s2\n'
    )
  })
})

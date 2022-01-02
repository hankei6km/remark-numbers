import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkDirective from 'remark-directive'
import { remarkNumbers, RemarkNumbersOptions } from '../../src/lib/numbers'

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
  it('should assign the value by "reset"', async () => {
    expect(
      await f(
        '# test\n\ns1\n:num{name="fig" reset}\ns2\n\n## test1\n\n![fig1](/images/fig1.png)\nfig :num{name="fig" up}\n'
      )
    ).toEqual(
      '# test\n\ns1\n\ns2\n\n## test1\n\n![fig1](/images/fig1.png)\nfig 1\n'
    )
  })
  it('should assign the value by "reset"(multiple)', async () => {
    expect(
      await f(
        '# test\n\n:num{name="foo" reset}\n:num{name="bar" reset}\n\n:nun{name="foo" up}\n\n:num{name="bar" up}\n\n:num{name="bar" up}\n\n:num{name="bar" up}\n\n:num{name="foo" up}\n'
      )
    ).toEqual('# test\n\n\n\n\n1\n\n1\n\n2\n\n3\n\n2\n')
  })
  it('should assign the value by "define"', async () => {
    expect(
      await f(
        '# test\n\ns1\n\n![fig1](/images/fig1.png)\n*fig :num{name="fig" define}*\n\ns2\n\n## test1\n\nfig :num{name="fig"}\n'
      )
    ).toEqual(
      '# test\n\ns1\n\n![fig1](/images/fig1.png)\n*fig 1*\n\ns2\n\n## test1\n\nfig 1\n'
    )
  })
  it('should increment the value by "up"', async () => {
    expect(
      await f(
        '# test\n\n:num{name="fig" reset}\n\n:num{name="fig" up}\n\n:num{name="fig" up}\n'
      )
    ).toEqual('# test\n\n\n\n1\n\n2\n')
  })
  it('should increment the value by "define"', async () => {
    expect(
      await f(
        '# test\n\n:num{name="foo" define}\n\n:num{name="bar" define}\n\n:num{name="bar" define}\n'
      )
    ).toEqual('# test\n\n1\n\n2\n\n3\n')
  })
  it('should lookup variable that is counter', async () => {
    expect(
      await f(
        '# test\n\n:num{name="foo" reset}\n\n:nun{name="foo" up}\n\n:num{name="foo" look}\n\n:num{name="foo" up}\n'
      )
    ).toEqual('# test\n\n\n\n1\n\n1\n\n2\n')
  })
  it('should lookup variable that is define at post', async () => {
    expect(
      await f(
        '# test\n\n:num{name="foo" define}\n\n:nun{name="car"}\n\n:num{name="bar" define}\n\n:num{name="car" define}\n'
      )
    ).toEqual('# test\n\n1\n\n3\n\n2\n\n3\n')
  })
  it('should insert a error message if the value is not defined', async () => {
    expect(
      await f(
        '# test\n\n:num{name="foo" reset}\n\ns1:num{name="bar" up}s2\n\ns3:num{name="car" look}s4\n\n:num{name="foo" up}\n'
      )
    ).toEqual(
      '# test\n\n\n\ns1(ReferenceError: "bar" is not defined)s2\n\ns3(ReferenceError: "car" is not defined)s4\n\n1\n'
    )
    expect(
      await f(
        '# test\n\n:num{name="foo" define}\n\ns1:num{name="bar"}s2\n\n:num{name="foo"}\n'
      )
    ).toEqual(
      '# test\n\n1\n\ns1(ReferenceError: "bar" is not defined)s2\n\n1\n'
    )
  })
  it('should escape varble name in error message', async () => {
    expect(await f('# test\n\ns1:num{name="[bar]"}s2\n')).toEqual(
      '# test\n\ns1(ReferenceError: "\\[bar]" is not defined)s2\n'
    )
  })
})

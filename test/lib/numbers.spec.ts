import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkDirective from 'remark-directive'
import { remarkNumbers, RemarkNumbersOptions } from '../../src/lib/numbers.js'

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

describe('remarkNumbers() counter', () => {
  it('should assign the value by "reset"', async () => {
    expect(
      await f(
        '# test\n\ns1\n:num{#fig reset}\ns2\n\n## test1\n\n![fig1](/images/fig1.png)\n*fig :num[fig]{up}*\n'
      )
    ).toEqual(
      '# test\n\ns1\n\ns2\n\n## test1\n\n![fig1](/images/fig1.png)\n*fig 1*\n'
    )
  })
  it('should assign the value by "reset"(multiple)', async () => {
    expect(
      await f(
        '# test\n\n:num{#foo reset}\n:num{#bar reset}\n\n:num[foo]{up}\n\n:num[bar]{up}\n\n:num[bar]{up}\n\n:num[bar]{up}\n\n:num[foo]{up}\n'
      )
    ).toEqual('# test\n\n\n\n\n1\n\n1\n\n2\n\n3\n\n2\n')
  })
  it('should lookup variable with prefix "%"', async () => {
    expect(await f('# test\n\n:num{#foo reset}\n\n:num[%foo]{up}\n')).toEqual(
      '# test\n\n\n\n1\n'
    )
  })
  it('should reset by reset container', async () => {
    expect(
      await f(
        '# test\n\n:::num{reset counter}\n## :num{#foo}\n## :num{#bar}\n### :num{#bar}\n:::\n\n## head2-1\n\n:num[foo]{up}:num[bar]{up}\n\n### head3-1\n\n:num[foo]{up}:num[bar]{up}\n\n## head2-2\n\n:num[foo]{up}:num[bar]{up}\n'
      )
    ).toEqual(
      '# test\n\n## head2-1\n\n11\n\n### head3-1\n\n21\n\n## head2-2\n\n11\n'
    )
  })
  it('should increment values by increment container', async () => {
    expect(
      await f(
        '# test\n\n:::num{reset counter}\n:num{#chapter}\n:::\n:::num{increment counter}\n## :num{#chapter}\n:::\n\n## test 1\n\n:num[chapter]\n\n### test1-1\n\n:num[chapter]\n\n## test2\n\n:num[chapter]\n'
      )
    ).toEqual('# test\n\n## test 1\n\n1\n\n### test1-1\n\n1\n\n## test2\n\n2\n')
  })
  it('should skip incremental by deeper heading', async () => {
    expect(
      await f(
        '# test\n\n:::num{reset counter}\n:num{#chapter}\n:::\n:::num{increment counter}\n## :num{#chapter}\n:::\n:::tmp{reset}\n## :tmp\n:::\n## test 1\n\n:num[chapter]\n\n### test1-1\n\n:num[chapter]\n\n## test2\n\n:num[chapter]\n'
      )
    ).toEqual(
      '# test\n\n:::tmp{reset}\n## :tmp\n:::\n\n## test 1\n\n1\n\n### test1-1\n\n1\n\n## test2\n\n2\n'
    )
  })
  it('should set values by "reset"', async () => {
    expect(
      await f(
        '# test\n\n:::num{reset counter}\n:num{#chapter}\n:::\n:::num{increment counter}\n## :num{#chapter}\n:::\n:num{#chapter reset=10}\n\n## test 1\n\n:num[chapter]\n\n### test1-1\n\n:num[chapter]\n\n## test2\n\n:num[chapter]\n'
      )
    ).toEqual(
      '# test\n\n\n\n## test 1\n\n11\n\n### test1-1\n\n11\n\n## test2\n\n12\n'
    )
  })
  it('should increment the value by "up"', async () => {
    expect(
      await f('# test\n\n:num{#fig reset}\n\n:num[fig]{up}\n\n:num[fig]{up}\n')
    ).toEqual('# test\n\n\n\n1\n\n2\n')
  })
  it('should lookup variable', async () => {
    expect(
      await f(
        '# test\n\n:num{#foo reset}\n\n:num[foo]{up}\n\n:num[foo]{look}:num[foo]\n\n:num[foo]{up}\n'
      )
    ).toEqual('# test\n\n\n\n1\n\n11\n\n2\n')
  })
  it('should insert a error message if the value is not defined', async () => {
    expect(
      await f(
        '# test\n\n:num{#foo reset}\n\ns1:num[bar]{up}s2\n\ns3:num[car]{look}s4\n\ns5:num[baz]s6\n\n:num[foo]{up}\n'
      )
    ).toEqual(
      '# test\n\n\n\ns1(ReferenceError: "bar" is not defined)s2\n\ns3(ReferenceError: "car" is not defined)s4\n\ns5(ReferenceError: "baz" is not defined)s6\n\n1\n'
    )
    expect(
      await f(
        '# test\n\n:::num{increment counter}\n## :num{#chapter}\n:::\n## test1\n'
      )
    ).toEqual(
      '# test\n\n(ReferenceError: "chapter" is not defined)\n\n## test1\n'
    )
  })
  it('should escape varble name in error message', async () => {
    expect(await f('# test\n\ns1:num[[bar]]s2\n')).toEqual(
      '# test\n\ns1(ReferenceError: "\\[bar]" is not defined)s2\n'
    )
  })
})

describe('remarkNumbers() assign', () => {
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
        '# test\n\n:::num{reset assign}\n## :num\n:::\n\n## head2-1\n\n:num{#foo}\n\n:num{#bar}\n\n## head2-2\n\n:num{#car}\n\n## head2-3\n\n:num[foo]:num[bar]:num[car]\n'
      )
    ).toEqual(
      '# test\n\n## head2-1\n\n1\n\n2\n\n## head2-2\n\n1\n\n## head2-3\n\n121\n'
    )
  })
  it('should skip resetting counter by deeper heading', async () => {
    expect(
      await f(
        '# test\n\n:::num{reset assign}\n## :num\n:::\n\n## head2-1\n\n:num{#foo}\n\n:::cnt{reset}\n## :cnt{#chapter}\n:::\n\n:num{#bar}\n\n:num[foo]:num[bar]'
      )
    ).toEqual(
      '# test\n\n## head2-1\n\n1\n\n:::cnt{reset}\n## :cnt{#chapter}\n:::\n\n2\n\n12\n'
    )
  })
  it('should reset by reset container(series)', async () => {
    expect(
      await f(
        '# test\n\n:::num{reset assign}\n## :num\n:::\n\n## head2-1\n\n:num{#fig-foo}\n\n:num{#fig-bar}\n\n## head2-2\n\n:num{#fig-car}\n\n## head2-3\n\n:num[fig-foo]:num[fig-bar]:num[fig-car]\n'
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

describe('remarkNumbers() mix', () => {
  it('should reset variables for counter and assign independently', async () => {
    expect(
      await f(
        '# test\n:::num{reset counter}\n:num{#foo}\n:::\n:::num{reset assign}\n## :num\n:::\n:num{#bar}:num{#car}\n## test2-1\n\n:num[foo]{up}\n:num{#baz}\n'
      )
    ).toEqual('# test\n\n12\n\n## test2-1\n\n1\n1\n')
  })
})

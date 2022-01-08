import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkDirective from 'remark-directive'
import remarkFrontMatter from 'remark-frontmatter'
import { remarkNumbers, RemarkNumbersOptions } from '../../src/lib/numbers.js'

const f = async (
  html: string,
  opts?: RemarkNumbersOptions | RemarkNumbersOptions[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    unified()
      .use(remarkParse)
      .use(remarkDirective)
      .use(remarkFrontMatter)
      .use(remarkNumbers, opts || {})
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
        `# test
s1
:num{#fig reset}
s2
## test1
![fig1](/images/fig1.png)
*fig :num[fig]{up}*
`
      )
    ).toEqual(
      `# test

s1

s2

## test1

![fig1](/images/fig1.png)
*fig 1*
`
    )
  })
  it('should assign the value by "reset"(multiple)', async () => {
    expect(
      await f(
        `# test
:num{#foo reset}
:num{#bar reset}
:num[foo]{up}
:num[bar]{up}
:num[bar]{up}
:num[bar]{up}
:num[foo]{up}
`
      )
    ).toEqual(`# test



1
1
2
3
2
`)
  })
  it('should reset by reset container', async () => {
    expect(
      await f(
        `# test

:::num{reset counter}
## :num{#foo}
## :num{#bar}
### :num{#bar}
:::

## head2-1

:num[foo]{up}:num[bar]{up}

### head3-1

:num[foo]{up}:num[bar]{up}

## head2-2

:num[foo]{up}:num[bar]{up}
`
      )
    ).toEqual(
      `# test

## head2-1

11

### head3-1

21

## head2-2

11
`
    )
  })
  it('should increment values by increment container', async () => {
    expect(
      await f(
        `# test

:::num{reset counter}
:num{#chapter}
:::
:::num{increment counter}
## :num{#chapter}
:::

## test 1

:num[chapter]

### test1-1

:num[chapter]

## test2

:num[chapter]
`
      )
    ).toEqual(`# test

## test 1

1

### test1-1

1

## test2

2
`)
  })
  it('should skip incremental by deeper heading', async () => {
    expect(
      await f(
        `# test

:::num{reset counter}
:num{#chapter}
:::
:::num{increment counter}
## :num{#chapter}
:::
:::tmp{reset}
## :tmp
:::
## test 1

:num[chapter]

### test1-1

:num[chapter]

## test2

:num[chapter]
`
      )
    ).toEqual(
      `# test

:::tmp{reset}
## :tmp
:::

## test 1

1

### test1-1

1

## test2

2
`
    )
  })
  it('should set values by "reset"', async () => {
    expect(
      await f(
        `# test

:::num{reset counter}
:num{#chapter}
:::
:::num{increment counter}
## :num{#chapter}
:::
:num{#chapter reset=10}

## test 1

:num[chapter]

### test1-1

:num[chapter]

## test2

:num[chapter]
`
      )
    ).toEqual(
      `# test



## test 1

11

### test1-1

11

## test2

12
`
    )
  })
  it('should increment the value by "up"', async () => {
    expect(
      await f(`# test

:num{#fig reset}

:num[fig]{up}

:num[fig]{up}
`)
    ).toEqual(`# test



1

2
`)
  })
  it('should lookup variable', async () => {
    expect(
      await f(
        `# test

:num{#foo reset}

:num[foo]{up}

:num[foo]{look}:num[foo]

:num[foo]{up}
`
      )
    ).toEqual(`# test



1

11

2
`)
  })
  it('should lookup variable with "look" attribute', async () => {
    expect(
      await f(`# test

:num{#foo reset}

:num{look=foo}
`)
    ).toEqual(
      `# test



0
`
    )
  })
  it('should lookup variable with prefix "%"', async () => {
    expect(
      await f(`# test

:num{#foo reset}

:num[%foo]{up}
`)
    ).toEqual(
      `# test



1
`
    )
  })
  it('should insert a error message if the value is not defined', async () => {
    expect(
      await f(`# test

:num{#foo reset}

:num{look=bar}
`)
    ).toEqual(
      `# test



(ReferenceError: "bar" is not defined)
`
    )
    expect(
      await f(
        `# test

:::num{increment counter}
## :num{#chapter}
:::
## test1
`
      )
    ).toEqual(
      `# test

(ReferenceError: "chapter" is not defined)

## test1
`
    )
    expect(
      await f(
        `# test

:num{#foo reset}

s1:num[bar]{up}s2

s3:num[car]{look}s4

s5:num[baz]s6

:num[foo]{up}
`
      )
    ).toEqual(
      `# test



s1(ReferenceError: "bar" is not defined)s2

s3(ReferenceError: "car" is not defined)s4

s5(ReferenceError: "baz" is not defined)s6

1
`
    )
    expect(
      await f(
        `# test

:::num{increment counter}
## :num{#chapter}
:::
## test1
`
      )
    ).toEqual(
      `# test

(ReferenceError: "chapter" is not defined)

## test1
`
    )
  })
  it('should escape varble name in error message', async () => {
    expect(
      await f(`# test

s1:num[[bar]]s2
`)
    ).toEqual(
      `# test

s1(ReferenceError: "\\[bar]" is not defined)s2
`
    )
  })
})

describe('remarkNumbers() assign', () => {
  it('should define the value', async () => {
    expect(
      await f(
        `# test

s1

![fig1](/images/fig1.png)
*fig :num{#fig}*

s2

## test1

fig :num[fig]
`
      )
    ).toEqual(
      `# test

s1

![fig1](/images/fig1.png)
*fig 1*

s2

## test1

fig 1
`
    )
  })
  it('should define the value with series', async () => {
    expect(
      await f(
        `# test

:num{#test1-foo}:num{#test2-foo}:num{#test1-bar}

## test1

:num[test1-foo]:num[test2-foo]:num[test1-bar]
`
      )
    ).toEqual(`# test

112

## test1

112
`)
  })
  it('should apply format to variables', async () => {
    expect(
      await f(
        `# test

:::num{reset counter}
# :num{#cnt}
:::
:::num{increment counter}
## :num{#cnt}
:::

## test 1

:::num{format assign}
:num[test-1 :num[cnt]-:num --]{series=t1}
:num[test-2 :num[cnt]-:num --]{series=t2}
:::

:num{#t1-foo}
:num{#t1-bar}
:num{#t2-foo}
:num{#t2-bar}

## test 2

:num{#t1-car}
:num{#t1-baz}
:num{#t2-car}
:num{#t2-baz}

:num[t1-foo]
:num[t1-bar]
:num[t1-car]
:num[t1-baz]

:num[t2-foo]:num[t2-bar]
:num[t2-car]:num[t2-baz]
`
      )
    ).toEqual(`# test

## test 1

test-1 1-1 --
test-1 1-2 --
test-2 1-1 --
test-2 1-2 --

## test 2

test-1 2-1 --
test-1 2-2 --
test-2 2-1 --
test-2 2-2 --

test-1 1-1 --
test-1 1-2 --
test-1 2-1 --
test-1 2-2 --

test-2 1-1 --test-2 1-2 --
test-2 2-1 --test-2 2-2 --
`)
  })
  it('should not apply format if the counter is not defined', async () => {
    expect(
      await f(
        `# test

:::num{format assign}
:num[test-1 :num[cnt]-:num --]{series=t1}
:::

## test 1

:num{#t1-foo}
:num{#t1-bar}

:num[t1-foo]
:num[t1-bar]
`
      )
    ).toEqual(`# test

## test 1

1
2

1
2
`)
  })
  it('should apply fallbacked format if the counter is not defined', async () => {
    expect(
      await f(
        `# test

:::num{format assign}
:num[test-1 :num --]{series=t1}
:num[test-1 :num[cnt]-:num --]{series=t1}
:::

## test 1

:num{#t1-foo}
:num{#t1-bar}

:num[t1-foo]
:num[t1-bar]
`
      )
    ).toEqual(`# test

## test 1

test-1 1 --
test-1 2 --

test-1 1 --
test-1 2 --
`)
  })
  it('should apply only format that is selected by group name', async () => {
    expect(
      await f(
        `---
title: tesst
type: idea
numGroupName: simple
---
# test

:::num{format assign}
:num[global-test-1 :num --]{series=t1}
:::

:::num{format assign name=simple}
:num[simple-test-1 :num --]{series=t1}
:::

:::num{format assign name=section}
:num[section test-1 :num[sec]-:num --]{series=t1}
:::

## test 1

:num{#t1-foo}
:num{#t1-bar}

:num[t1-foo]
:num[t1-bar]
`
      )
    ).toEqual(`---
title: tesst
type: idea
---

# test

## test 1

simple-test-1 1 --
simple-test-1 2 --

simple-test-1 1 --
simple-test-1 2 --
`)
  })
  it('should apply only format that is selected by group name(fldNameInFromtMatterToSwitchGrp)', async () => {
    expect(
      await f(
        `---
title: tesst
type: idea
grp: simple
---
# test

:::num{format assign}
:num[global-test-1 :num --]{series=t1}
:::

:::num{format assign name=simple}
:num[simple-test-1 :num --]{series=t1}
:::

:::num{format assign name=section}
:num[section test-1 :num[sec]-:num --]{series=t1}
:::

## test 1

:num{#t1-foo}
:num{#t1-bar}

:num[t1-foo]
:num[t1-bar]
`,
        {
          fldNameInFromtMatterToSwitchGrp: 'grp'
        }
      )
    ).toEqual(`---
title: tesst
type: idea
---

# test

## test 1

simple-test-1 1 --
simple-test-1 2 --

simple-test-1 1 --
simple-test-1 2 --
`)
  })
  it('should not apply named format', async () => {
    expect(
      await f(
        `---
title: tesst
type: idea
---
# test

:::num{format assign}
:num[global-test-1 :num --]{series=t1}
:::

:::num{format assign name=simple}
:num[simple-test-1 :num --]{series=t1}
:::

:::num{format assign name=section}
:num[section test-1 :num[sec]-:num --]{series=t1}
:::

## test 1

:num{#t1-foo}
:num{#t1-bar}

:num[t1-foo]
:num[t1-bar]
`
      )
    ).toEqual(`---
title: tesst
type: idea
---

# test

## test 1

global-test-1 1 --
global-test-1 2 --

global-test-1 1 --
global-test-1 2 --
`)
  })
  it('should increment counter by "define"', async () => {
    expect(
      await f(`# test

:num{#foo}

:num{#bar}

:num{#car}
`)
    ).toEqual(`# test

1

2

3
`)
  })
  it('should lookup variable with prefix "$"', async () => {
    expect(
      await f(`# test

:num{#foo}

:num{#bar}

:num[$bar]
`)
    ).toEqual(`# test

1

2

2
`)
  })
  it('should lookup variable that is define at post', async () => {
    expect(
      await f(`# test

:num{#foo}

:num[car]

:num{#bar}

:num{#car}
`)
    ).toEqual(`# test

1

3

2

3
`)
  })
  it('should insert a error message if the value is not defined', async () => {
    expect(
      await f(`# test

:num{#foo}

s1:num[bar]s2

:num[foo]
`)
    ).toEqual(
      `# test

1

s1(ReferenceError: "bar" is not defined)s2

1
`
    )
  })
  it('should reset by reset container', async () => {
    expect(
      await f(
        `# test

:::num{reset assign}
## :num
:::

## head2-1

:num{#foo}

:num{#bar}

## head2-2

:num{#car}

## head2-3

:num[foo]:num[bar]:num[car]
`
      )
    ).toEqual(
      `# test

## head2-1

1

2

## head2-2

1

## head2-3

121
`
    )
  })
  it('should skip resetting counter by deeper heading', async () => {
    expect(
      await f(
        `# test

:::num{reset assign}
## :num
:::

## head2-1

:num{#foo}

:::cnt{reset}
## :cnt{#chapter}
:::

:num{#bar}

:num[foo]:num[bar]`
      )
    ).toEqual(
      `# test

## head2-1

1

:::cnt{reset}
## :cnt{#chapter}
:::

2

12
`
    )
  })
  it('should reset by reset container(series)', async () => {
    expect(
      await f(
        `# test

:::num{reset assign}
## :num
:::

## head2-1

:num{#test1-foo}

:num{#test1-bar}

## head2-2

:num{#test1-car}

## head2-3

:num[test1-foo]:num[test1-bar]:num[test1-car]
`
      )
    ).toEqual(
      `# test

## head2-1

1

2

## head2-2

1

## head2-3

121
`
    )
  })
  it('should escape varble name in error message', async () => {
    expect(
      await f(`# test

s1:num[[bar]]s2
`)
    ).toEqual(
      `# test

s1(ReferenceError: "\\[bar]" is not defined)s2
`
    )
  })
})

describe('remarkNumbers() mix', () => {
  it('should reset variables for counter and assign independently', async () => {
    expect(
      await f(
        `# test
:::num{reset counter}
:num{#foo}
:::
:::num{reset assign}
## :num
:::
:num{#bar}:num{#car}
## test2-1

:num[foo]{up}
:num{#baz}
`
      )
    ).toEqual(`# test

12

## test2-1

1
1
`)
  })
})

describe('remarkNumbers() opts.template', () => {
  it('should reset counter and by default template', async () => {
    expect(
      await f(
        `# test

:num[sec]-:num[subsec]

## test 1

:num[sec]

### test 1-1

:num[sec]-:num[subsec]

### test 1-2

:num[sec]-:num[subsec]

## test 2

:num[sec]

### test 1-1

:num[sec]-:num[subsec]

# test

:num[sec]-:num[subsec]

## test 1

:num[sec]

### test 1-1

:num[sec]-:num[subsec]

### test 1-2

:num[sec]-:num[subsec]

## test 2

:num[sec]

### test 1-1

:num[sec]-:num[subsec]

`
      )
    ).toEqual(`# test

0-0

## test 1

1

### test 1-1

1-1

### test 1-2

1-2

## test 2

2

### test 1-1

2-1

# test

0-0

## test 1

1

### test 1-1

1-1

### test 1-2

1-2

## test 2

2

### test 1-1

2-1
`)
  })
  it('should reset assign and by default template', async () => {
    expect(
      await f(
        `# test

## test 1

:num{#foo}

:num{#bar}

:num[foo]:num[bar]

## test 2

:num{#car}

:num[foo]:num[bar]:num[car]
`
      )
    ).toEqual(`# test

## test 1

1

2

12

## test 2

1

121
`)
  })
  it('should use passed template', async () => {
    expect(
      await f(
        `# test

## test 1

:num[cnt1]

### test 1-1

:num{#foo}:num{#bar}

### test 1-2

:num{#car}

:num[foo]:num[bar]:num[car]
`,
        {
          template: [
            `
:::num{reset counter}
# :num{#cnt1}
:::
:::num{increment counter}
## :num{#cnt1}
:::
:::num{reset assign}
## :num
### :num
:::
`
          ]
        }
      )
    ).toEqual(`# test

## test 1

1

### test 1-1

12

### test 1-2

1

121
`)
  })
  it('should use passed templates(multiple)', async () => {
    expect(
      await f(
        `# test

## test 1

:num[cnt1]

### test 1-1

:num{#foo}:num{#bar}

### test 1-2

:num{#car}

:num[foo]:num[bar]:num[car]
`,

        {
          template: [
            `
:::num{reset counter}
# :num{#cnt1}
:::`,
            `
:::num{increment counter}
## :num{#cnt1}
:::
:::num{reset assign}
## :num
### :num
:::
`
          ]
        }
      )
    ).toEqual(`# test

## test 1

1

### test 1-1

12

### test 1-2

1

121
`)
  })
  it('should use passed template with default template', async () => {
    expect(
      await f(
        `# test

## test :num[sec]

:num[cnt1]

### test :num[sec]-:num[subsec]

:num{#foo}:num{#bar}

### test :num[sec]-:num[subsec]

:num{#car}

:num[foo]:num[bar]:num[car]
`,
        {
          template: [
            `
:::num{reset counter}
# :num{#cnt1}
:::
:::num{increment counter}
## :num{#cnt1}
:::
:::num{reset assign}
## :num
### :num
:::
`
          ],
          keepDefaultTemplate: true
        }
      )
    ).toEqual(`# test

## test 1

1

### test 1-1

12

### test 1-2

1

121
`)
  })
})

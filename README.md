# remark-numbers

remark plugin to assign serial numbers.

## Requirement

- [`remark-directive`]


## CLI

[`remark-cli`] is required `remark-numbers` to run as command.

### Install

```console
$ mkdir numbers
$ cd numbers
$ npm init -y
$ npm install remark-cli remark-directive remark-frontmatter remark-gfm @hankei6km/remark-numbers
```

### Config

```js
// .remarkrc.mjs
import remarkDirective from 'remark-directive'
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm'
import remarkNumbers from '@hankei6km/remark-numbers'

const remarkConfig = {
  plugins: [
    remarkDirective,
    remarkFrontmatter,
    remarkGfm,
    remarkNumbers
  ]
}

export default remarkConfig
```

## Usage

The basic usage is as follows.

```console
$ npx remark < input.md
```

### Section counter

input:
```markdown
# test

## test :num[sec]

section :num[sec]

### test :num[sec]-:num[subsec]

section :num[sec]-:num[subsec]

### test :num[sec]-:num[subsec]

section :num[sec]-:num[subsec]

## test :num[sec]

section :num[sec]

### test :num[sec]-:num[subsec]

section :num[sec]-:num[subsec]
```

yield:
```markdown
# test

## test 1

section 1

### test 1-1

section 1-1

### test 1-2

section 1-2

## test 2

section 2

### test 2-1

section 2-1
```

Following counters are available with default settings

- `sec`
- `subsec`

### Assign Numbers

input:
```markdown
# test

![Charlie](/images/photo-charlie.jpg)
*Photo :num{#charlie}*

![Don](/images/don.jpg)
*Photo :num{#don}*

Charlie(Photo :num[charlie]) and Don(Photo :num[don])
```

yield:
```markdown
# test

![Charlie](/images/photo-charlie.jpg)
*Photo 1*

![Don](/images/don.jpg)
*Photo 2*

Charlie(Photo 1) and Don(Photo 2)
```

### Series

input:
```markdown
# test

今季の傾向です(Chart :num[chart-overview])

![Overview](/images/chart-overview.png)
*Chart :num{#chart-overview}*

## Fruits

資料(Chart :num[chart-fruits]) によると Orange(Photo :num[photo-orange]) が好調です。

![Fruits](/images/chart-fruits.png)
*Chart :num{#chart-fruits}*

![Apple](/images/apple.jpg)
*Photo :num{#photo-apple}*

![Banana](/images/banana.jpg)
*Photo :num{#photo-banana}*

![Orange](/images/orange.jpg)
*Photo :num{#photo-orange}*

## Drink

資料(Chart :num[chart-drink]) によると Tea(Photo :num[photo-tea]) は Apple(Photo :num[photo-apple]) とのセットメニューが好調です。

![Drink](/images/chart-drink.png)
*Chart :num{#chart-drink}*

![Coffee](/images/coffee.jpg)
*Photo :num{#photo-coffee}*

![Tea](/images/tea.jpg)
*Photo :num{#photo-tea}*
```

yield:
```markdown
# test

今季の傾向です(Chart 1)

![Overview](/images/chart-overview.png)
*Chart 1*

## Fruits

資料(Chart 1-1) によると Orange(Photo 1-3) が好調です。

![Fruits](/images/chart-fruits.png)
*Chart 1-1*

![Apple](/images/apple.jpg)
*Photo 1-1*

![Banana](/images/banana.jpg)
*Photo 1-2*

![Orange](/images/orange.jpg)
*Photo 1-3*

## Drink

資料(Chart 2-1) によると Tea(Photo 2-2) は Apple(Photo 1-1) とのセットメニューが好調です。

![Drink](/images/chart-drink.png)
*Chart 2-1*

![Coffee](/images/coffee.jpg)
*Photo 2-1*

![Tea](/images/tea.jpg)
*Photo 2-2*
```


Following series are available with default settings

- `fig`
- `photo`
- `chart`
- `graph`
- `diagram`
- `flow`
- `tbl`
- `list`

### Custom format

input:
```markdown
# test

:::num{format assign}
:num[(図 :num)]{series=fig}
:num[(図 :num[sec]-:num)]{series=fig}
:::


![Editors](/images/editors.png)
*:num{#fig-editors}*

Screenshot:num[fig-editors]

## Vim

![Vim](/images/screenshot-vim)
*:num{#fig-vim}*

Screenshot:num[fig-vim]

## VS Code

![VS Code](/images/screenshot-vscode)
*:num{#fig-vscode}*

Screenshot:num[fig-vscode]
```

yield:
```markdown
# test

![Editors](/images/editors.png)
*(図 1)*

Screenshot(図 1)

## Vim

![Vim](/images/screenshot-vim)
*(図 1-1)*

Screenshot(図 1-1)

## VS Code

![VS Code](/images/screenshot-vscode)
*(図 2-1)*

Screenshot(図 2-1)
```

### Switch format

input:
```markdown
---
numGroupName: simple
---
# test

:::num{format assign}
:num[(図 :num)]{series=fig}
:num[(図 :num[sec]-:num)]{series=fig}
:::

:::num{reset assign name=simple}
## :num{delete}
:::
:::num{format assign name=simple}
:num[(図 :num)]{series=fig}
:::


![Editors](/images/editors.png)
*:num{#fig-editors}*

Screenshot:num[fig-editors]

## Vim

![Vim](/images/screenshot-vim)
*:num{#fig-vim}*

Screenshot:num[fig-vim]

## VS Code

![VS Code](/images/screenshot-vscode)
*:num{#fig-vscode}*

Screenshot:num[fig-vscode]
```

yield:
```markdown
# test

![Editors](/images/editors.png)
*(図 1)*

Screenshot(図 1)

## Vim

![Vim](/images/screenshot-vim)
*(図 2)*

Screenshot(図 2)

## VS Code

![VS Code](/images/screenshot-vscode)
*(図 3)*

Screenshot(図 3)
```


### Custom counter

input:
```markdown
# test

:::num{reset counter}
# :num{#subsubsec}
## :num{#subsubsec}
### :num{#subsubsec}
:::

:::num{increment counter}
#### :num{#subsubsec}
:::

## test :num[sec]

### test :num[sec]-:num[subsec]

#### test :num[sec]-:num[subsec]-:num[subsubsec]

#### test :num[sec]-:num[subsec]-:num[subsubsec]

### test :num[sec]-:num[subsec]

#### test :num[sec]-:num[subsec]-:num[subsubsec]

#### test :num[sec]-:num[subsec]-:num[subsubsec]

#### test :num[sec]-:num[subsec]-:num[subsubsec]

## test :num[sec]

### test :num[sec]-:num[subsec]

#### test :num[sec]-:num[subsec]-:num[subsubsec]

#### test :num[sec]-:num[subsec]-:num[subsubsec]
```

yield:
```markdown
# test

## test 1

### test 1-1

#### test 1-1-1

#### test 1-1-2

### test 1-2

#### test 1-2-1

#### test 1-2-2

#### test 1-2-3

## test 2

### test 2-1

#### test 2-1-1

#### test 2-1-2
```

## Writing

### Counter

#### Reset

- `:num{#counter_name reset}`
- `:num{#counter_name reset=10}`

##### Function

Define(reset) the counter.

The initial value can be set with `reset` attribute.

##### Behavior

The description will be removed.

#### Reference
- `:num[counter_name]`
- `:num[counter_name]{up}`

##### Function

Refer to the value of the counter

"up" attribute increments before referencing the value of the counter

##### Behavior

Replaced by the value of the variable.

#### Auto reset

```
:::num{reset counter}
# :num{#counter_name1}
# :num{#counter_name2}
## :num{#counter_name2}
:::
```

##### Function

Set "heading node" to triggers to reset counter.

##### Behavior

The description will be removed.

#### Auto increment

```
:::num{increment counter}
## :num{#counter_name1}
### :num{#counter_name2}
:::
```

##### Function

Set "heading node" to triggers to increment counter.

##### Behavior

The description will be removed.

### Assign Numbers

#### Definition

- `:num{#variable_name}`
- `:num{#series-variable_name}`

##### Function

Define variables. The value is the number of defined times. variables. Series name is specified by `-` delimiter

##### Behavior

Replaced by the value of the variable.

#### Reference

- `:num[variable_name]`
- `:num[series-variable]`

##### Function

Refer to the variable.

If series is binded format text, it will be applied.

##### Behavior

Replaced by the value of the variable.

#### Auto reset

```markdown
:::num{reset assign}
# :num
## :num
:::
```

##### Function

Set "heading node" to triggers to reset counter.

Trigger will be removed, when `delete` attribute is written.

```markdown
:::num{reset assign}
## :num{delete}
:::
```

##### Behavior

The description will be removed.


#### Grouped auto reset

```markdown
:::num{reset assign name=group-name}
## :num
:::
```

##### Function

The group name is assigned to reset setting by `{name=groupt-name}`.

The group is switched by front-matter variabe.

```markdown
---
title: test
numGroupName: group-name
---

# test

```

##### Behavior

The description will be removed.


#### Format

```
:::num{format assign}
:num[figure :num]{series=fig}
:num[figure :num[counter_name]-:num]{series=fig}
:::
```

##### Function

Set format to series. Format is written in `[]` as Markdown.

- `:num[counter_name]` - Refer to the counter
- `:num` - Refer to the value of the variable itself

If the referenced counter is `0` or undefined, the format is not used.

The last matching format will be used, when multiple settings are described,.

##### Behavior

The description will be removed.


#### Grouped Format

```
:::num{format assign name=group-name}
:num[図 :num]{series=fig}
:num[図 :num[counter_name]-:num]{series=fig}
:::
```

##### Function

The group name is assigned to reset setting by `{name=groupt-name}`.

The group is switched by front-matter variabe.

```markdown
---
title: test
numGroupName: group-name
---

# test

```

##### Behavior

The description will be removed.



## Template

Default template:
```
:::num{reset counter}
# :num{#sec}
# :num{#subsec}
## :num{#subsec}
:::
:::num{increment counter}
## :num{#sec}
### :num{#subsec}
:::
:::num{reset assign}
# :num
## :num
:::
:::num{format assign}
:num[:num[sec]-:num]{series=fig}
:num[:num[sec]-:num]{series=photo}
:num[:num[sec]-:num]{series=chart}
:num[:num[sec]-:num]{series=graph}
:num[:num[sec]-:num]{series=diagram}
:num[:num[sec]-:num]{series=flow}
:num[:num[sec]-:num]{series=tbl}
:num[:num[sec]-:num]{series=list}
```

### Custom template

Templates are defined via plugin options

ie. define templates in config file of [`remark-cli`].


```js
// .remarkrc.mjs
import remarkDirective from 'remark-directive'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkNumbers from '@hankei6km/remark-numbers'

const remarkConfig = {
  plugins: [
    remarkDirective,
    remarkFrontmatter,
    remarkGfm,
    [
      remarkNumbers,
      {
        template: [
          `
:::num{format assign}
:num[図 :num]{series=fig}
:num[図 :num[sec]-:num]{series=fig}
:num[写真 :num]{series=photo}
:num[写真 :num[sec]-:num]{series=photo}
:num[グラフ :num]{series=chart}
:num[グラフ :num[sec]-:num]{series=chart}
:num[グラフ :num]{series=graph}
:num[グラフ :num[sec]-:num]{series=graph}
:num[図式 :num]{series=diagram}
:num[図式 :num[sec]-:num]{series=diagram}
:num[フロー :num]{series=flow}
:num[フロー :num[sec]-:num]{series=flow}
:num[表 :num]{series=tbl}
:num[表 :num[sec]-:num]{series=tbl}
:num[リスト :num]{series=list}
:num[リスト :num[sec]-:num]{series=list}
:::
      `
        ],
        keepDefaultTemplate: true
      }
    ]
  ]
}

export default remarkConfig
```

## API

```typescript
import { readFileSync } from 'fs'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkDirective from 'remark-directive'
import remarkNumbers from '@hankei6km/remark-numbers'

const markdown = readFileSync('test.md').toString()

unified()
  .use(remarkParse)
  .use(remarkDirective)
  .use(remarkNumbers)
  .use(remarkStringify)
  .freeze()
  .process(markdown, (err, file) => {
    if (err) {
      console.error(err)
    }
    console.log(String(file))
  })
```

### Options

#### `template`

Pass templates.

- type: `string[]`

#### `keepDefaultTemplate`

Use default template with passed templates.

- type: `boolean`
- default: `false`

#### `fldNameInFromtMatterToSwitchGrp`

The name of field in Front Matter to  switch group.

- type: `string`
- default: `numGroupName`

## Security

`remark-numbers` operates under the assumption that it handles trusted sources.

It is recommended to use [`rehype-sanitize`] when handle sources from a third party.


## Know Issue

- Variables and counters are processed in  AST node order. Therefore, it may not be in the order of description.


## License

MIT License

Copyright (c) 2022 hankei6km

[`remark-directive`]: https://github.com/remarkjs/remark-directive
[`remark-cli`]: (https://github.com/remarkjs/remark/tree/main/packages/remark-cli)
[`rehype-sanitize`]: https://github.com/rehypejs/rehype-sanitize


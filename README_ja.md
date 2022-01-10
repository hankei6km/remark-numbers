# remark-numbers

Markdown 内で連番を振るプラグイン。

## Requirement

- [`remark-directive`]
- [`remark-frontmatter`]


## CLI

コマンドとして実行するには [`remark-cli`] が必要です。

### Install

`numbers` ディレクトリー内で利用する場合です。

```console
$ mkdir numbers
$ cd numbers
$ npm init -y
$ npm install remark-cli remark-directive remark-frontmatter remark-gfm @hankei6km/remark-numbers
```

### Config

`numbers` ディレクトリー内に `.remarkrc.mjs` を作成します。

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

基本的な使い方は以下のとおりです。

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

デフォルトで以下のカウンターが定義されています。
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

デフォルトで以下の系列が定義されています。
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
title: test
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
---
title: test
---

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

カウンターを定義(リセット)します。

`reset` 属性で初期値を指定できます。

##### Behavior

記述は削除されます。

#### Reference
- `:num[counter_name]`
- `:num[counter_name]{up}`

##### Function

カウンターの値を参照します。

`up` 属性を指定すると `+1` させてから参照します。

##### Behavior

カウンターの値に置き換わります。

#### Auto reset

```
:::num{reset counter}
# :num{#counter_name1}
# :num{#counter_name2}
## :num{#counter_name2}
:::
```

##### Function

カウンターをリセットする見出しを設定します。

##### Behavior

記述は削除されます。

#### Auto increment

```
:::num{increment counter}
## :num{#counter_name1}
### :num{#counter_name2}
:::
```

##### Function

カウンターを `+1` させる見出しを設定します。

##### Behavior

記述は削除されます。


### Assign Numbers

#### Definition

- `:num{#variable_name}`
- `:num{#series-variable_name}`

##### Function

変数を定義します。セットされる値は定義が実行された回数です。
名前を `-` で区切ると系列を指定できます。

##### Behavior

変数の値に置き換わります。

#### Reference

- `:num[variable_name]`
- `:num[series-variable]`

##### Function

変数を参照します。系列に書式が設定されている場合はそれが適用されます。

##### Behavior

変数の値に置き換わります。


#### Auto reset

```markdown
:::num{reset assign}
# :num
## :num
:::
```

##### Function

定義実行回数のカウントをリセットする見出しを設定します。

属性に `delete` を指定すると設定を削除します。

```markdown
:::num{reset assign}
## :num{delete}
:::
```

##### Behavior

記述は削除されます。


#### Grouped auto reset

```markdown
:::num{reset assign name=group-name}
## :num
:::
```

##### Function

`{name=groupt-name}` を記述するとグループ名が付与されます。

グループは Front Matter で切り替えることができます。

```markdown
---
title: test
numGroupName: group-name
---

# test

```

##### Behavior

記述は削除されます。


#### Format

```
:::num{format assign}
:num[図 :num]{series=fig}
:num[図 :num[counter_name]-:num]{series=fig}
:::
```

##### Function

系列に書式を設定します。書式は `[]` の中に Markdown で記述します。

書式の中ではカウンターを参照できます。

- `:num[counter_name]` - カウンターを参照
- `:num` - 変数自身の値を参照

参照しているカウンターの値が `0` か未定義の場合は利用されません。

複数設定している場合は最後に有効な書式が利用されます。

##### Behavior

記述は削除されます。


#### Grouped Format

```
:::num{format assign name=group-name}
:num[図 :num]{series=fig}
:num[図 :num[counter_name]-:num]{series=fig}
:::
```

##### Function

`{name=groupt-name}` を記述するとグループ名が付与されます。

グループは Front Matter で切り替えることができます。

```markdown
---
title: test
numGroupName: group-name
---

# test

```

##### Behavior

記述は削除されます。



## Template

デフォルトで以下のテンプレートが設定されています。

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

テンプレートは plugin のオプションとして定義できます。

以下は [`remark-cli`] を利用している場合。


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

テンプレートを Markdown で指定。

- type: `string[]`

#### `keepDefaultTemplate`

デフォルトのテンプレートを上書きしない。

- type: `boolean`
- default: `false`

#### `fldNameInFromtMatterToSwitchGrp`

グループを切り替える Front Matter 内のフィールド名。

- type: `string`
- default: `numGroupName`


### Security

`remark-numbers` は信頼できるソースのみを扱う前提で動作します。

第三者からのソースを扱う状況では [`rehype-sanitize`] の併用を推奨します。

## Know Issue

変数とカウンターは AST 内に現れた順番で処理します。よって、Markdown の記述とおりにならいこともあります。

## License

MIT License

Copyright (c) 2022 hankei6km

[`remark-directive`]: https://github.com/remarkjs/remark-directive
[`remark-frontmatter`]: https://github.com/remarkjs/remark-frontmatter
[`remark-cli`]: (https://github.com/remarkjs/remark/tree/main/packages/remark-cli)
[`rehype-sanitize`]: https://github.com/rehypejs/rehype-sanitize


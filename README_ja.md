# remark-numbers

Markdown 内で連番を振るプラグイン。

## Install

npm:

```
npm install @hankei6km/remark-numbers
```

## Requirement

- [`remark-directive`](https://github.com/remarkjs/remark-directive)

## Usage

code:
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

### Definition / Reference

input:
```markdown
# test

![Charlie](/images/photo-charlie.png)
*Photo :num{name="charlie" define}*

![Don](/images/photo-don.png)
*Photo :num{name="don" define}*

Charlie(Photo :num{name="charlie"}) and Don(Photo :num{name="don"})
```

yield:
```markdown
# test

![Charlie](/images/photo-charlie.png)
*Photo 1*

![Don](/images/photo-don.png)
*Photo 2*

Charlie(Photo 1) and Don(Photo 2)

```

### Counter

input:
```markdown
# test

:num{name="fig" reset}

![first](/images/fig-first.png)
*fig :num{name="fig" up}*

![second](/images/fig-second.png)
*fig :num{name="fig" up}*

![third](/images/fig-third.png)
*fig :num{name="fig" up}*
```

yield:
```markdown
# test



![first](/images/fig-first.png)
*fig 1*

![second](/images/fig-second.png)
*fig 2*

![third](/images/fig-third.png)
*fig 3*

```


## Writing

### Definition / Reference

- Definition - `:num{name="variable-name" define}`
- Reference - `:num{name="variable-name"}`

### Counter

- Reset - `:num{name="variable-name" reset}`
- Up - `:num{name="variable-name" up}`
- Look - `:num{name="variable-name" look}`


## CLI

コマンドとして実行するには [`remark-cli`](https://github.com/remarkjs/remark/tree/main/packages/remark-cli) が必要です。

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

### Run

```console
$ npx remark < test.md
```


## License

MIT License

Copyright (c) 2022 hankei6km


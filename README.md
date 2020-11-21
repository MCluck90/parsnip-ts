# 🌱 Parsnip-ts 

Parser combinator written in and for TypeScript.

## Getting Started

### Installation

```sh
npm install parsnip-ts
```

### Example

```ts
import { list, text } from 'parsnip-ts'
import { integer } from 'parsnip-ts/numbers'
import { ws } from 'parsnip-ts/whitespace'

const array = text('[')
  .and(list(integer, ws.and(text(',').and(ws)))
  .bind(integers =>
    text(']').map(() => integers)
  )

array.parseToEnd('[1, 2, 3]') // [1, 2, 3]
```

For a more thorough example, check out the [examples folder.](https://github.com/MCluck90/parsnip-ts/tree/main/examples)

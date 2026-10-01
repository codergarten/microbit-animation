# Contributing animations — open source

Yes! Users can submit their own designs. The library stays open source as long as
submissions align to the MakeCode function format.

## Option A — in-browser (no git needed, recommended for classrooms)

1. Open `index.html` → click **＋ Create**.
2. Draw 1–8 frames on the 5×5 grid, **or** paste an existing MakeCode
   JavaScript function into *Import* and hit **Parse MakeCode function**.
   The parser extracts every `basic.showLeds(`...`)` grid automatically.
3. Fill `Name / Category / Description / Speed`, check the live function preview.
4. **Save to My Creations** (stored in your browser `localStorage`, appears as ★).
5. Hit **Submit to GitHub** — it copies your library entry and opens a
   pre-filled issue. Maintainers paste it into `animations.js`.

To enable one-click issues, set your repo in `builder.js`:

```js
const GITHUB_REPO = "yourname/microbit-motion-library";
```

## Option B — direct PR (developers)

Add one entry to `animations.js`, keeping the exact schema:

```js
{id:"my-cool-anim",name:"My Cool Anim",cat:"Space & Games",desc:"Short desc",speed:300,frames:[
[".....",".#.#.",".....","#####","#...#"],
[".....",".....",".....","#####","#...#"],
]},
```

Rules (enforced by the builder too):
- `id`: lowercase kebab-case, unique. `name`: Title Case.
- `cat`: one of `Faces, Love, Animals, People & Fun, Arrows & Shapes, Nature, Space & Games, Loaders`.
- `frames`: 1–8 entries, each exactly 5 strings of exactly 5 chars, only `#` and `.`.
- `speed`: 50–2000 (ms per `basic.pause`).
- Your own art, family-friendly, no trademarked sprites.

## MakeCode function contract

Every gallery item must round-trip through this shape:

```js
function MyAnim() {
    while (true) {               // or for (let i = 0; i < 4; i++) / once
        basic.showLeds(`
            . # . # .
            . # . # .
            . . # . .
            . # . # .
            . # . # .
            `)
        basic.pause(300)
    }
}
```

The importer accepts `# / 1 / *` as ON and `. / 0 / _ / -` as OFF, so
functions copied straight from `makecode.microbit.org` (JavaScript view) parse cleanly.
`Download .json` gives you `{id,name,cat,desc,speed,frames}` for issues/PRs.

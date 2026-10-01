# micro:bit Animations – Free 5×5 LED Gallery for MakeCode

A free gallery of BBC micro:bit 5×5 LED animations. Live preview every animation, copy the MakeCode JavaScript function (`basic.showLeds` + `basic.pause`), paste it into [makecode.microbit.org](https://makecode.microbit.org/), and run it on your micro:bit.

76 animations across Faces, Love, Animals, People & Fun, Arrows & Shapes, Nature, Space & Games, and Loaders.

## Features

- Live 5×5 LED preview on every card
- One-click **Copy function** → MakeCode JavaScript
- Search, category filter, preview speed, pause time
- Code loop modes: `while(true)`, ×4 loop, play once
- Detail view with frame stepper and big simulator
- **Create** tool: draw 1–8 frames on a 5×5 grid, or paste MakeCode code to import frames
- No build, no signup — just open `index.html`

## Quick start

Double-click `index.html`, or serve the folder:

```sh
npx serve .
```

Then open the printed local URL.

## How to use an animation in MakeCode

1. Click **Copy function** on any card.
2. Go to [makecode.microbit.org](https://makecode.microbit.org/) → switch to **JavaScript** → paste the function outside other blocks.
3. Call it from `basic.forever`, on start, or a button, then flash to your micro:bit:

```js
function Boom() {
    while (true) {
        basic.showLeds(`
            . # . # .
            . # . # .
            . . # . .
            . # . # .
            . # . # .
            `)
        basic.pause(300)
        basic.showLeds(`
            # . . . #
            . # . # .
            . . # . .
            . # . # .
            # . . . #
            `)
        basic.pause(300)
    }
}
input.onButtonPressed(Button.A, function () {
    Boom()
})
```

## Make your own

1. Click **＋ Create**.
2. Draw 1–8 frames on the 5×5 grid, or paste a MakeCode function and hit **Parse MakeCode function**.
3. Set name, category, description, speed — check the live preview.
4. **Save to My Creations**, then **Submit to GitHub** (opens a pre-filled issue).

## Files

| File | What it is |
|---|---|
| `index.html` | Gallery, detail modal, builder modal, FAQ |
| `animations.js` | Animation data + `generateMicrobitFunction()` |
| `app.js` | Gallery render, search/filter, previews, modal |
| `builder.js` | Create/import/save/submit flow |
| `styles.css` | All styling (light theme) |
| `CONTRIBUTING.md` | Submission rules and code format |

Animation entry format:

```js
{id:"my-anim", name:"My Anim", cat:"Nature", desc:"Short desc", speed:300, frames:[
[".....",".....","..#..",".....","....."],
]},
```

Rules: 1–8 frames, each exactly 5 strings of 5 chars, only `#` (on) and `.` (off), speed 50–2000ms. See `CONTRIBUTING.md`.

## Links

- MakeCode editor: https://makecode.microbit.org/
- Issues / submissions: https://github.com/codergarten/microbit-animation/issues

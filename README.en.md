# dsh-slash-space

[中文](README.md) | **English**

Type `、` in a Chinese IME and get ` /` — invoke skills and commands without ever leaving Chinese input.

![The toggle on the left of the composer toolbar](docs/composer-toolbar.png)

## Why this exists

Calling a skill is a four-step ritual:

```
switch to the English IME → type a space → type / → switch back to Chinese
```

The space comes first because `/` is only recognized as a command at the start of a line or after whitespace.

Dozens of times a day. Each time you cut into the middle of Chinese typing, the rhythm breaks and your train of thought goes with it.

And the only part of that ritual that actually forces the switch is the `/`.

On a Chinese IME, the `/` key produces `、` — the Chinese enumeration comma. Your finger is already on that key. So don't switch: let it become ` /` directly.

What disappears is the IME switch and the extra space. What remains is one continuous typing rhythm. Context gets filled faster, and more accurately.

## What it does

| Caret at line start or after whitespace | Otherwise |
| --- | --- |
| `/` | ` /` |

Type `、`, get ` /`.

## Why `、` specifically

On every Chinese IME, the `/` key outputs `、` by default. No new shortcut to memorize, no settings to change.

Under an English IME, `/` passes straight through — the plugin stays out of the way.

## Compatibility

The plugin intercepts *text insertion*, not key presses, so Microsoft Pinyin, Sogou, Rime and the rest all behave the same.

A `、` still sitting in the candidate window, not yet committed, is left alone.

## Toggle

A small switch sits on the left of the composer toolbar: track and thumb on the left, `/` on the right.

- **On** — replaced as in the table above
- **Off** — `、` is typed as-is
- State is stored locally and survives session changes and restarts

## Install

```bash
dsh plugin --profile desktop add link:/path/to/dsh-slash-space
```

Refresh the UI afterwards.

## Development

No build step. `client.js` is the file the runtime loads — edit it and press `Ctrl+R`.

## License

[MIT](LICENSE)

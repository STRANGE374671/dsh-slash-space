# dsh-slash-space

中文输入法下在 DSH 输入框里打「、」，自动变成带前导空格的英文「 /」。

**English**: A DSH client plugin that turns the Chinese full-width comma `、` typed in the composer into ` /`, with a toggle on the left of the composer toolbar. The toggle state is stored locally.

## 效果

| 光标前是行首或空白 | 其它情况 |
| --- | --- |
| `/` | ` /` |

`、` 本来就在中文输入法里，是打 `/` 时最顺手的键位；这个插件把它换成英文斜杠，并在前面补一个空格，省掉「切英文 → 打空格 → 打斜杠 → 切回来」四步。

## 安装

```bash
dsh plugin --profile desktop add link:/path/to/dsh-slash-space
```

装完刷新界面。仓库是软链接进 profile 的，改了源码刷新即可生效，不需要重新安装。

## 使用

输入框工具行左侧有一个开关：左边是轨道和滑块，右边是「/」。

- **开**：按上表替换
- **关**：`、` 原样输入
- 状态存在 `localStorage` 的 `dsh.slash-space.enabled`，换会话、重开界面都还在

## 实现

### 三条输入路径都拦

1. `beforeinput`：能取消就 `preventDefault`，直接插入替换文本
2. `compositionend` / `input`：中文输入法上屏后再修一次，兜住不走 `beforeinput` 的情况
3. 只处理 `insertText`、`insertReplacementText`、`insertCompositionText`、`insertFromComposition` 这几种输入类型

替换优先用 `document.execCommand('insertText')`，拿不到时回退到宿主注入的 `inputActions.insertText`。

### 开关尺寸按 DPR 量化

开关是纯 CSS 画的。轨道、内边距、滑块在运行时按 `devicePixelRatio` 换算成整物理像素，滑块大小由轨道高度反推：

```js
const pad    = Math.round(2  * dpr)
const trackH = Math.round(12 * dpr)
const knob   = trackH - pad * 2   // 上下留白天然相等
```

原因是 125% 缩放下 2px 内边距等于 2.5 个设备像素，写死尺寸必然一边多 1 像素。原理、实测和边界见 [docs/switch-offset-125.md](docs/switch-offset-125.md)。

## 目录

```
dsh-slash-space/
├─ client.js          客户端插件入口，浏览器直接加载，无构建
├─ index.js           宿主侧入口（空实现）
├─ cordis.patch.yml   插件装载声明
├─ icon.svg           图标
├─ locale/            中英文文案
├─ docs/              设计说明
├─ package.json
├─ CHANGELOG.md
├─ LICENSE
└─ README.md
```

## 开发

没有构建步骤。`client.js` 就是运行时加载的文件，改完在界面里按 `Ctrl+R` 刷新即可。

## 已知问题

- DSH 本体的 `Switch` 组件（设置页里那些开关）用的是固定的 2px 内边距，在 125% / 175% 缩放下同样偏 1 个设备像素。本插件的开关已修正，本体未修。

## 许可

[MIT](LICENSE)

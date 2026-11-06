window.__ModuleLoader__.load({
  id: 'dsh-slash-space',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const NS = 'dsh-slash-space'
    const STORAGE_KEY = 'dsh.slash-space.enabled'
    const COMPOSER_ATTR = 'data-composer-input'
    const STYLE_ID = 'dsh-slash-space/styles'
    const COMMA = '\u3001'

    const TEXT_INPUT_TYPES = new Set([
      'insertText',
      'insertReplacementText',
      'insertCompositionText',
      'insertFromComposition',
    ])

    const COPY = {
      zh: {
        label: '/ 加空格',
        on: '已开：中文输入法下打 / 出「 /」',
        off: '已关：打 / 保持原样',
      },
      en: {
        label: 'Space before /',
        on: 'On: Chinese slash becomes " /"',
        off: 'Off: slash stays as typed',
      },
    }

    const CSS = `
.dsh-slash-space{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px 0 5px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;line-height:1;cursor:pointer;transition:background .12s,border-color .12s,color .12s}
.dsh-slash-space:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.dsh-slash-space:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.dsh-slash-space-track{position:relative;display:block;width:var(--dsh-slash-space-track-w,22px);height:var(--dsh-slash-space-track-h,12px);border-radius:999px;background:var(--dsw-alias-state-idle-primary);transition:background .15s}
.dsh-slash-space.is-on .dsh-slash-space-track{background:var(--dsw-alias-brand-primary)}
.dsh-slash-space-knob{position:absolute;top:var(--dsh-slash-space-pad,2px);left:var(--dsh-slash-space-pad,2px);display:block;width:var(--dsh-slash-space-knob,8px);height:var(--dsh-slash-space-knob,8px);border-radius:50%;background:var(--dsw-alias-bg-base);transition:transform .15s}
.dsh-slash-space.is-on .dsh-slash-space-knob{transform:translateX(var(--dsh-slash-space-travel,10px))}
.dsh-slash-space-glyph{display:block;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;letter-spacing:.5px;white-space:pre}
`

    let inputActions = null
    let enabled = true
    let translate = (key) => key
    let repairTimer = 0
    const listeners = new Set()

    function notify() {
      for (const fn of listeners) {
        try {
          fn()
        } catch (error) {
          void error
        }
      }
    }

    function readStored() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        return raw === null ? true : raw !== '0'
      } catch (error) {
        void error
        return enabled
      }
    }

    function persist(next) {
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
      } catch (error) {
        void error
      }
    }

    function setEnabled(next) {
      const value = Boolean(next)
      if (value === enabled) return
      enabled = value
      persist(value)
      notify()
    }

    function editorFrom(target) {
      const el = target instanceof Element ? target : target && target.parentElement
      if (!el || typeof el.closest !== 'function') return null
      return el.closest('[' + COMPOSER_ATTR + ']')
    }

    function textBeforeCaret(editor) {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return null
      const range = selection.getRangeAt(0)
      if (!editor.contains(range.startContainer)) return null
      const probe = document.createRange()
      probe.selectNodeContents(editor)
      try {
        probe.setEnd(range.startContainer, range.startOffset)
      } catch (error) {
        void error
        return null
      }
      return probe.toString()
    }

    function slashTextFor(previous) {
      if (previous === null || previous === undefined || previous === '') return '/'
      return /[\s\u3000]/.test(previous) ? '/' : ' /'
    }

    function replacementAtCaret(editor) {
      const before = textBeforeCaret(editor)
      if (before === null) return null
      return slashTextFor(before.slice(-1))
    }

    function insertAtCaret(text) {
      if (inputActions !== null) {
        try {
          const span = inputActions.captureInsertion()
          if (inputActions.insertText(text, span) === true) return true
        } catch (error) {
          void error
        }
      }
      try {
        return document.execCommand('insertText', false, text) === true
      } catch (error) {
        void error
        return false
      }
    }

    function onBeforeInput(event) {
      if (!enabled) return
      if (event.data !== COMMA) return
      if (event.isComposing) return
      if (!TEXT_INPUT_TYPES.has(event.inputType)) return
      if (!event.cancelable) return
      const editor = editorFrom(event.target)
      if (editor === null) return
      const text = replacementAtCaret(editor)
      if (text === null) return
      if (!insertAtCaret(text)) return
      event.preventDefault()
      event.stopPropagation()
    }

    function repairAtCaret(editor) {
      if (!enabled || !editor.isConnected) return
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return
      const range = selection.getRangeAt(0)
      if (!range.collapsed) return
      if (!editor.contains(range.startContainer)) return
      const node = range.startContainer
      if (node.nodeType !== 3) return
      const offset = range.startOffset
      if (offset === 0) return
      const data = node.data
      if (data.charAt(offset - 1) !== COMMA) return
      const previous = offset >= 2 ? data.charAt(offset - 2) : ''
      const kill = document.createRange()
      kill.setStart(node, offset - 1)
      kill.setEnd(node, offset)
      selection.removeAllRanges()
      selection.addRange(kill)
      try {
        document.execCommand('insertText', false, slashTextFor(previous))
      } catch (error) {
        void error
      }
    }

    function scheduleRepair(editor) {
      window.clearTimeout(repairTimer)
      repairTimer = window.setTimeout(() => {
        repairTimer = 0
        repairAtCaret(editor)
      }, 0)
    }

    function onInput(event) {
      if (!enabled) return
      if (event.data !== COMMA) return
      if (!TEXT_INPUT_TYPES.has(event.inputType)) return
      const editor = editorFrom(event.target)
      if (editor === null) return
      scheduleRepair(editor)
    }

    function onCompositionEnd(event) {
      if (!enabled) return
      if (event.data !== COMMA) return
      const editor = editorFrom(event.target)
      if (editor === null) return
      scheduleRepair(editor)
    }

    function installInputHook() {
      const options = { capture: true }
      document.addEventListener('beforeinput', onBeforeInput, options)
      document.addEventListener('input', onInput, options)
      document.addEventListener('compositionend', onCompositionEnd, options)
      return () => {
        document.removeEventListener('beforeinput', onBeforeInput, options)
        document.removeEventListener('input', onInput, options)
        document.removeEventListener('compositionend', onCompositionEnd, options)
        window.clearTimeout(repairTimer)
        repairTimer = 0
      }
    }

    const METRIC_VARS = [
      '--dsh-slash-space-track-w',
      '--dsh-slash-space-track-h',
      '--dsh-slash-space-pad',
      '--dsh-slash-space-knob',
      '--dsh-slash-space-travel',
    ]

    function installMetrics() {
      const view = typeof window === 'undefined' ? null : window
      if (view === null) return () => {}
      const root = document.documentElement
      const previous = METRIC_VARS.map((name) => [
        name,
        root.style.getPropertyValue(name),
        root.style.getPropertyPriority(name),
      ])
      let media = null
      const apply = () => {
        const dpr = view.devicePixelRatio || 1
        const pad = Math.max(1, Math.round(2 * dpr))
        const trackW = Math.max(pad * 2 + 1, Math.round(22 * dpr))
        const trackH = Math.max(pad * 2 + 1, Math.round(12 * dpr))
        const knob = trackH - pad * 2
        const travel = trackW - pad * 2 - knob
        const px = (value) => Number((value / dpr).toFixed(4)) + 'px'
        root.style.setProperty(METRIC_VARS[0], px(trackW))
        root.style.setProperty(METRIC_VARS[1], px(trackH))
        root.style.setProperty(METRIC_VARS[2], px(pad))
        root.style.setProperty(METRIC_VARS[3], px(knob))
        root.style.setProperty(METRIC_VARS[4], px(travel))
        if (media !== null) media.removeEventListener('change', apply)
        media = typeof view.matchMedia === 'function' ? view.matchMedia('(resolution: ' + dpr + 'dppx)') : null
        if (media !== null) media.addEventListener('change', apply)
      }
      apply()
      return () => {
        if (media !== null) media.removeEventListener('change', apply)
        for (const [name, value, priority] of previous) {
          if (value === '') root.style.removeProperty(name)
          else root.style.setProperty(name, value, priority)
        }
      }
    }

    function installStyle() {
      if (document.querySelector('style[data-dsh-style="' + STYLE_ID + '"]')) return () => {}
      const style = document.createElement('style')
      style.dataset.dshStyle = STYLE_ID
      style.textContent = CSS
      document.head.appendChild(style)
      return () => {
        style.remove()
      }
    }

    function SlashSpaceToggle(props) {
      const [on, setOn] = React.useState(enabled)
      const actions = props.inputActions

      React.useEffect(() => {
        const listener = () => setOn(enabled)
        listeners.add(listener)
        setOn(enabled)
        return () => {
          listeners.delete(listener)
        }
      }, [])

      React.useEffect(() => {
        inputActions = actions || null
        return () => {
          if (inputActions === actions) inputActions = null
        }
      }, [actions])

      const label = translate('label')
      return h(
        'button',
        {
          type: 'button',
          role: 'switch',
          'aria-checked': on,
          'aria-label': label,
          title: on ? translate('on') : translate('off'),
          className: 'dsh-slash-space' + (on ? ' is-on' : ''),
          onClick: () => setEnabled(!enabled),
        },
        h(
          'span',
          { className: 'dsh-slash-space-track' },
          h('span', { className: 'dsh-slash-space-knob' }),
        ),
        h('span', { className: 'dsh-slash-space-glyph' }, '/'),
      )
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        enabled = readStored()
        translate = ctx.locale.bind(NS)

        ctx.effect(() => {
          try {
            return ctx.locale.register(NS, COPY)
          } catch (error) {
            void error
            return () => {}
          }
        })

        const refresh = () => {
          translate = ctx.locale.bind(NS)
          notify()
        }
        ctx.effect(() => ctx.locale.subscribe(refresh))
        ctx.effect(() => installStyle())
        ctx.effect(() => installMetrics())
        ctx.effect(() => installInputHook())

        ctx.effect(() =>
          ctx.slots.inject('conversation.input.left', () =>
            ctx.slots.register(
              {
                name: 'conversation.input.left',
                id: 'dsh-slash-space-toggle',
                order: 20,
                label: () => translate('label'),
              },
              SlashSpaceToggle,
            ),
          ),
        )
      },
    }
  },
})

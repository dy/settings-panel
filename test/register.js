// provide DOM env for node tests
import { Window } from 'happy-dom'

const window = new Window({ url: "http://localhost/" })

const props = Object.getOwnPropertyNames(window)
  .filter(p => !p.startsWith('_'))
  .filter(p => typeof globalThis[p] === 'undefined')

props.forEach(p => globalThis[p] = window[p])
globalThis.window = globalThis

Object.assign(globalThis, {
  document: window.document,
  MutationObserver: window.MutationObserver,
  Element: window.Element,
  Text: window.Text,
  HTMLElement: window.HTMLElement,
  CustomEvent: window.CustomEvent,
  DocumentFragment: window.DocumentFragment,
  Event: window.Event,
})

// happy-dom ships a non-functional localStorage stub — provide a Map-backed one so persist is testable.
const _ls = new Map()
globalThis.localStorage = {
  getItem: k => _ls.has(k) ? _ls.get(k) : null,
  setItem: (k, v) => { _ls.set(k, String(v)) },
  removeItem: k => { _ls.delete(k) },
  clear: () => { _ls.clear() },
  key: i => [..._ls.keys()][i] ?? null,
  get length() { return _ls.size },
}

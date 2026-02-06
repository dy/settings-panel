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

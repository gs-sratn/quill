import logger from './logger';
import Parchment from 'parchment';
import Quill from '../core/quill';

const debug = logger('quill:utils');

export const getContext = (rootEle) => {
  // const supportsShadowDOM = !!HTMLElement.prototype.attachShadow;
  const ctx = rootEle.getRootNode() || document;
  return ctx;
};

export const isInShadowRoot = (rootEle) => {
  const ctx = getContext(rootEle);
  const isTrue = 'host' in ctx && 'shadowRoot' in ctx.host;
  debug.info('isInShadowRoot', isTrue);
  return isTrue;
};

export const clearFormat = (quill) => {
  let range = quill.getSelection();
  if (range == null) return;
  if (range.length == 0) {
    let formats = quill.getFormat();
    Object.keys(formats).forEach((name) => {
      // Clean functionality in existing apps only clean inline formats
      if (Parchment.query(name, Parchment.Scope.INLINE) != null) {
        quill.format(name, false);
      }
    });
  } else {
    quill.removeFormat(range, Quill.sources.USER);
  }
}

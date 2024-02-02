import Module from '../core/module';
import extend from 'extend';

const AUTOLINK_PREFIX = /https?:\/\/[^\s]+/g;
const Keys = {
    SPACE: 32,
    ENTER: 13
  };
class AutoLinks extends Module {
    constructor(quill, options) {
        super(quill, options);
        const defaults = {
            type: true,
            paste: true
        }
        const opts = extend(true, defaults, options);
        if (opts.type) {
            this.quill.keyboard.addBinding({ key: Keys.SPACE}, {collapsed: true, prefix: AUTOLINK_PREFIX}, this.handleLink.bind(this));
            this.quill.keyboard.addBinding({ key: Keys.ENTER}, {collapsed: true, prefix: AUTOLINK_PREFIX}, this.handleLink.bind(this));
            this.quill.keyboard.addBinding({ key: 'K', metaKey: true}, {collapsed: true, prefix: AUTOLINK_PREFIX}, this.handleLink.bind(this));
            this.quill.keyboard.bindings[Keys.ENTER].unshift(this.quill.keyboard.bindings[Keys.ENTER].pop());
        }
        if (opts.paste) {
            this.registerPasteListener();
        }
    }
    handleLink(range) {
        var url = '';
        var prevOffset = 0;
        var text = this.quill.getText(prevOffset, range.index);
        var match = text.match(AUTOLINK_PREFIX);
        if (match === null) {
            prevOffset = range.index;
            return true;
        }
        if (match.length > 1) {
            url = match[match.length - 1];
        } else {
            url = match[0];
        }
        var ops = [];
        ops.push({ retain: range.index - url.length });
        ops.push({ 'delete': url.length });
        ops.push({ insert: url, attributes: { link: url } });
        this.quill.updateContents({ ops: ops });
        return true;
    }
    registerPasteListener() {
        this.quill.clipboard.addMatcher(Node.TEXT_NODE, function (node, delta) {
            if (typeof node.data !== 'string') {
                return;
            }
            var matches = node.data.match(AUTOLINK_PREFIX);
            if (matches && matches.length > 0) {
                var ops = [];
                var str = node.data;
                matches.forEach(function (match) {
                    var split = str.split(match);
                    var beforeLink = split.shift();
                    ops.push({ insert: beforeLink });
                    ops.push({ insert: match, attributes: { link: match } });
                    str = split.join(match);
                });
                ops.push({ insert: str });
                delta.ops = ops;
            }

            return delta;
        });
    }
}

export { AutoLinks as default };

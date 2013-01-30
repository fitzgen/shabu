define(function (require) {
  function fromDom(root) {
    var walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      { acceptNode: function (n) { return NodeFilter.FILTER_ACCEPT; } },
      false
    );

    var array = [];
    function add(keepGoing) {
      if (!keepGoing) {
        return;
      }

      if (walker.currentNode instanceof HTMLElement) {
        array.push(openTag(walker.currentNode));
        if (walker.firstChild()) {
          do {
            add(true);
          } while (walker.nextSibling());
          walker.parentNode();
        }
        array.push(closeTag());
      } else if (walker.currentNode instanceof Text) {
        array.push(text(walker.currentNode.textContent));
      } else {
        throw new Error('Unknown node type: ' + walker.currentNode.nodeName);
      }

      add(walker.nextSibling());
    }
    add(walker.nextNode());

    return array;
  }

  function openTag(node) {
    return {
      type: 'open tag',
      tagName: node.tagName,
      attrs: Array.reduce(node.attributes, function (attrs, a) {
        attrs[a.name] = a.value;
        return attrs;
      }, {})
    }
  }

  function closeTag() {
    return {
      type: 'close tag'
    };
  }

  function text(text) {
    return {
      type: 'text',
      text: text
    };
  }

  function retain() {
    return {
      type: 'retain'
    };
  }

  function del() {
    return {
      type: 'delete'
    };
  }

  var comparators = {
    'open tag': function (a, b) {
      if (a.tagName !== b.tagName) {
        return false;
      }

      var aKeys = Object.keys(a.attrs).sort();
      var bKeys = Object.keys(b.attrs).sort();

      if (aKeys.length !== bKeys.length) {
        return false;
      }

      for (var i = 0; i < aKeys.length; i++) {
        if (aKeys[i] !== bKeys[i]) {
          return false;
        }
        if (a.attrs[aKeys[i]] !== b.attrs[aKeys[i]]) {
          return false;
        }
      }

      return true;
    },
    'close tag': function (a, b) {
      return true;
    },
    'text': function (a, b) {
      return a.text === b.text;
    },
    'retain': function (a, b) {
      return true;
    },
    'delete': function (a, b) {
      return true;
    }
  };

  function equal(a, b) {
    if (a.type !== b.type) {
      return false;
    } else {
      return comparators[a.type](a, b);
    }
  }

  var updaters = {
    'open tag': function (oldTag, newTag) {
      return {
        type: 'update',
        newAttrs: Object.keys(newTag.attrs).reduce(function (newAttrs, k) {
          if (newTag.attrs[k] !== oldTag.attrs[k]) {
            newAttrs[k] = newTag.attrs[k];
          }
          return newAttrs;
        }, {}),
        deleteAttrs: Object.keys(oldTag.attrs).filter(function (k) {
          return !(k in newTag.attrs);
        })
      };
    },
    'text': function (oldText, newText) {
      return {
        type: 'update',
        text: newText.text
      }
    }
  };

  function update(a, b) {
    if (a.type !== b.type || equal(a, b)) {
      throw new Error('Must be the same type, but not equal');
    }
    return updaters[a.type](a, b);
  }

  function canUpdate(a, b) {
    return a.type === b.type &&
      !equal(a, b) &&
      (a.type === 'open tag' ? a.tagName === b.tagName : true);
  }

  return {
    fromDom: fromDom,
    openTag: openTag,
    closeTag: closeTag,
    text: text,
    retain: retain,
    del: del,
    equal: equal,
    update: update,
    canUpdate: canUpdate
  };
});

define(function () {
  var theEmptyList = {
    length: 0,
    toArray: function () {
      return [];
    }
  };

  function cons (head, tail) {
    return {
      head: head,
      tail: tail,
      length: 1 + tail.length,
      toArray: toArray
    };
  }

  function toArray () {
    var node = this,
      ary = [];
    while ( node !== theEmptyList ) {
      ary.push(node.head);
      node = node.tail;
    }
    return ary;
  }

  return {
    theEmptyList: theEmptyList,
    cons: cons,
    toArray: toArray
  };
});

define(function (require) {
  var edits = require('./edits');

  // We don't want to copy arrays between cells of our matrix, only need O(1)
  // prepend and length, and don't care about access. A custom singly linked
  // list implementation is perfect.
  var list = require('./linked-list');

  function makeEditsMatrix(m, n) {
    var matrix = [[]];
    for (var i = 1; i <= m; i++) {
      matrix[i] = new Array(n);
    }
    return matrix;
  }

  function minimum(candidates) {
    return candidates.reduce(function (minimum, candidate) {
      return candidate && candidate.length < minimum.length
        ? candidate
        : minimum
    }, { length: Infinity });
  }

  function diff(sRoot, tRoot) {
    var s = edits.fromDom(sRoot);
    var t = edits.fromDom(tRoot);

    // TODO here is where I would trim the prefix and postfix

    var m = s.length;
    var n = t.length;
    var d = makeEditsMatrix(m, n);

    var i;
    var j;

    d[0][0] = list.theEmptyList;
    for (i = 1; i <= m; i++) {
      d[i][0] = list.cons(edits.del(), d[i-1][0]);
    }
    for (j = 1; j <= n; j++) {
      d[0][j] = list.cons(t[j-1], d[0][j-1]);
    }

    var sEdit;
    var tEdit;

    for (j = 1; j <= n; j++) {
      for (i = 1; i <= m; i++) {
        sEdit = s[i-1];
        tEdit = t[j-1];
        if (edits.equal(sEdit, tEdit)) {
          d[i][j] = list.cons(edits.retain(), d[i-1][j-1]);
        } else {
          d[i][j] = minimum([
            list.cons(edits.del(), d[i-1][j]),
            list.cons(tEdit, d[i][j-1]),
            edits.canUpdate(sEdit, tEdit)
              ? list.cons(edits.update(sEdit, tEdit), d[i-1][j-1])
              : null
          ]);
        }
      }
    }

    // console.log('logging matrix');
    // document.body.innerHTML = '<pre>' + JSON.stringify(d.map(function (row) {
    //   return row.map(function (item) {
    //     return item.toArray();
    //   });
    // }), undefined, 2) + '</pre>';
    // console.log(' ');

    // TODO and then I would concatenate this return result with the prefix and
    // postfix again here

    return d[m][n].toArray().reverse();
  }

  return diff;
});

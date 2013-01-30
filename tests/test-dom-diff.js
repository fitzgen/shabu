define(function (require) {

  module('dom-diff');

  var domDiff = require('../lib/dom-diff');
  var edits = require('../lib/edits');

  function testDiff(aInnerHTML, bInnerHTML, expected) {
    var a = document.createElement('div');
    a.innerHTML = aInnerHTML;

    var b = document.createElement('div');
    b.innerHTML = bInnerHTML;

    var diff = domDiff(a, b);
    console.log(' ');
    console.log('a = ', aInnerHTML);
    console.log('b = ', bInnerHTML);
    console.log('diff = ', diff);
    return expected ? deepEqual(diff, expected) : diff;
  }

  test('diffing equal things', function () {
    var diff = testDiff('<h1 id="hello">hello world!</h1><ul><li>1</li><li>2</li></ul>',
                        '<h1 id="hello">hello world!</h1><ul><li>1</li><li>2</li></ul>');

    equal(diff.length, 11, 'The diff length should be 11');
    diff.forEach(function (edit) {
      deepEqual(edit, edits.retain(),
                'Every edit in this diff should be retain since the roots are the same');
    });
  });

  test('updating text', function () {
    testDiff(
      '<h1>hello world!</h1>',
      '<h1>goodbye world!</h1>',
      [
        edits.retain(),
        {
          type: 'update',
          text: 'goodbye world!'
        },
        edits.retain()
      ]
    );
  });

  test('updating tag attrs', function () {
    testDiff(
      '<h1 id="hello" class="foobar">hello world!</h1>',
      '<h1 class="foobar bazquux">hello world!</h1>',
      [
        {
          type: 'update',
          newAttrs: {
            'class': 'foobar bazquux'
          },
          deleteAttrs: ['id']
        },
        edits.retain(),
        edits.retain()
      ]
    );
  });

  test('changing tag types', function () {
    testDiff(
      '<h1>hello world!</h1>',
      '<h2>hello world!</h2>',
      [
        edits.openTag(document.createElement('h2')),
        edits.del(),
        edits.retain(),
        edits.retain()
      ]
    );
  });

  test('removing a tag', function () {
    testDiff(
      '<h1>hello world!</h1>',
      'hello world!',
      [
        edits.del(),
        edits.retain(),
        edits.del()
      ]
    );

  });

  test('adding a tag', function () {
    testDiff(
      'hello world!',
      '<h1>hello world!</h1>',
      [
        edits.openTag(document.createElement('h1')),
        edits.retain(),
        edits.closeTag()
      ]
    );

  });

});

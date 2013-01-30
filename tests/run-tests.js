require.config({
  paths: {
    shabu: '../shabu'
  }
});

requirejs([
  // When adding new test files, list them here.
  './test-dom-diff'
], QUnit.start.bind(QUnit));

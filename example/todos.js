require.config({
  baseUrl: '.',
  paths: {
    shabu: '../shabu'
  }
});

requirejs(['./todos/app']);

define(function (require) {
  var shabu = require('shabu');

  function makeId() {
    return String(Math.random()).slice(2) + +new Date;
  }

  function makeTodo(text) {
    return {
      id: makeId(),
      completed: false,
      text: text
    };
  }

  function add(todos, newTodo) {
    return todos.concat(newTodo);
  }

  function removeCompleted(todos) {
    return todos.filter(function (t) {
      return !t.completed;
    });
  }

  function updateTodo(todos, id, fn) {
    return todos.map(function (t) {
      return t.id !== id
        ? t
        : fn(t);
    });
  }

  function toggleComplete(todos, id) {
    return updateTodo(todos, id, function (t) {
      return shabu.update(t, {
        completed: !t.completed,
      });
    });
  }

  return {
    makeTodo: makeTodo,
    add: add,
    removeCompleted: removeCompleted,
    updateTodo: updateTodo,
    toggleComplete: toggleComplete
  };
});

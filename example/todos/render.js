define(function (require) {
  require('jquery');

  function renderTodo(t) {
    var className = 'todo' + (t.completed ? ' completed' : '');
    var checked = t.completed ? 'checked' : '';
    return $('<li class="' + className + '" data-id="' + t.id + '">' +
             '  <label>' +
             '    <input type="checkbox" ' + checked + '/> ' + t.text +
             '  </label>' +
             '</li>');
  }

  function renderForm() {
    return $('<form>' +
             '  <input id="todo-text" type="text" placeholder="To do..." />' +
             '</form>');
  }

  return function (state) {
    var frag = document.createDocumentFragment();

    frag.appendChild(renderForm()[0]);

    var list = $("<ul></ul>")
    frag.appendChild(list[0]);

    state.todos.forEach(function (t) {
      list.append(renderTodo(t));
    });

    var clearCompleted = $('<button class="remove-completed">Clear Completed</button>');
    frag.appendChild(clearCompleted[0]);

    var save = document.createElement('p');
    save.className = 'save';
    save.textContent = state.saving
      ? 'Saving...'
      : 'Last saved at ' + state.lastSave;
    if (state.saving || state.lastSave) {
      frag.appendChild(save);
    }

    return frag;
  };
});

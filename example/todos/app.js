define(function (require) {
  var shabu = require('shabu');
  var todosCollection = require('./todos-collection');

  window.todosApp = shabu({
    container: '#todos',

    initialState: {
      todos: [],
      saving: false,
      lastSave: null
    },

    events: {
      "submit form": {
        type: "new todo",
        text: shabu.val("#todo-text")
      },
      "change .todo input[type=checkbox]": {
        type: "complete todo",
        id: shabu.target(function (target) {
          return target.closest(".todo").attr("data-id");
        })
      },
      "click .remove-completed": {
        type: "remove completed"
      }
    },

    pipe: [
      shabu.tap(console.log.bind(null, "START")),

      shabu.tap(shabu.when("init", function getServerState(event, state) {
        // Pretend this is making an ajax request to a server
        window.setTimeout(function () {
          todosApp.trigger({
            type: "server state",
            todos: JSON.parse(window.localStorage['Shabu Todo App'] || '[]')
          });
        }, 3000);
      })),

      shabu.when("server state", function mergeState(event, state) {
        var todosById = state.todos.concat(event.todos).reduce(function (todosById, todo) {
          todosById[todo.id] = todo;
          return todosById;
        }, Object.create(null));

        return shabu.update(state, {
          todos: Object.keys(todosById).map(function (id) {
            return todosById[id];
          })
        });
      }),

      shabu.when("new todo", function add(event, state) {
        return shabu.update(state, {
          todos: todosCollection.add(state.todos,
                                     todosCollection.makeTodo(event.text))
        });
      }),

      shabu.when("remove completed", function removeCompleted(event, state) {
        return shabu.update(state, {
          todos: todosCollection.removeCompleted(state.todos)
        });
      }),

      shabu.when("complete todo", function complete(event, state) {
        return shabu.update(state, {
          todos: todosCollection.toggleComplete(state.todos, event.id)
        });
      }),

      shabu.when("saved", function logSaved(event, state) {
        return shabu.update(state, {
          saving: false,
          lastSave: event.timeStamp
        });
      }),

      shabu.unless([
        "init", "server state"
      ], function saveToServer(event, state) {
        if (event.type === "saved" && !state.dirty) {
          return state;
        }

        if (state.saving === true) {
          return shabu.update(state, {
            dirty: true
          });
        }

        // Pretend this is making an ajax request to a server
        window.setTimeout(function () {
          window.localStorage['Shabu Todo App'] = JSON.stringify(state.todos);
          todosApp.trigger({
            type: "saved",
            timeStamp: new Date
          });
        }, 3000);

        return shabu.update(state, {
          saving: true,
          dirty: false
        });
      }),

      function escapeTodoText(event, state) {
        return shabu.update(state, {
          todos: state.todos.map(function (t) {
            return shabu.update(t, {
              text: t.text
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
            });
          })
        });
      },

      shabu.tap(console.log.bind(null, "END")),
    ],

    render: require('./render')
  });

});

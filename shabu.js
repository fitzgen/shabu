define(function (require) {
  require('jquery');

  function Shabu(opts) {
    this._container = opts.container ? $(opts.container) : null;
    this._pipe = opts.pipe;
    this._render = opts.render;
    this._state = opts.initialState;

    if (this._container) {
      _listen(this._container, opts.events, this.trigger.bind(this));
    }

    this.trigger({ type: "init" }, this._state);
  }

  function _listen(container, events, trigger) {
    Object.keys(events).forEach(function (event) {
      var splitIdx = event.indexOf(" ");
      var eventType = event.slice(0, splitIdx);
      var selector = event.slice(splitIdx + 1);

      container.delegate(selector, eventType, function (domEvent) {
        domEvent.preventDefault();

        trigger(Object.keys(events[event]).reduce(function (semanticEvent, key) {
          var val = events[event][key];
          semanticEvent[key] = typeof val === "function"
            ? val(domEvent, container)
            : val;
          return semanticEvent;
        }, {}));
      });
    });
  }

  Shabu.prototype.trigger = function (event) {
    try {
      this._state = this._pipe.reduce(function (state, pipeFunction) {
        return pipeFunction(event, state);
      }, this._state);

      if (this._container) {
        this._container.html(this._render(this._state));
      }
    } catch (error) {
      this.onError(error);
    }
  };

  Shabu.prototype.onError = console.error.bind(console);

  function shabu(opts) {
    return new Shabu(opts);
  }

  shabu.val = function (selector) {
    return function (event, container) {
      return container.find(selector).val();
    };
  };

  shabu.text = function (selector) {
    return function (event, container) {
      return container.find(selector).text();
    };
  };

  shabu.target = function (fn) {
    return function (event, container) {
      return fn($(event.target));
    };
  };

  shabu.when = function (eventType, fn) {
    return function (event, state) {
      return eventType.indexOf(event.type) !== -1
        ? fn(event, state)
        : state;
    };
  };

  shabu.unless = function (eventType, fn) {
    var types = eventType instanceof Array
      ? eventType
      : [eventType];
    return function (event, state) {
      return eventType.indexOf(event.type) !== -1
        ? state
        : fn(event, state);
    };
  };

  shabu.update = function (existing, newAttrs) {
    var ret = {};

    function setOnRet(obj) {
      return function (key) {
        ret[key] = obj[key];
      };
    }

    Object.keys(existing).forEach(setOnRet(existing));
    Object.keys(newAttrs).forEach(setOnRet(newAttrs));

    return ret;
  };

  shabu.tap = function (fn) {
    return function (event, state) {
      fn(event, state);
      return state;
    };
  };

  return shabu;
});

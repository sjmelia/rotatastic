// Polyfill for object assign via
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

if (typeof Object.assign != 'function') {
  Object.assign = function(target, varArgs) { // .length of function is 2
    'use strict';
    if (target == null) { // TypeError if undefined or null
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource != null) { // Skip over if undefined or null
        for (var nextKey in nextSource) {
          // Avoid bugs when hasOwnProperty is shadowed
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

var rotaEntry = React.createClass({
  propTypes: {
    date: React.PropTypes.string.isRequired,
    entry: React.PropTypes.string.isRequired,
    onEntryChange: React.PropTypes.func.isRequired,
  },

  render: function() {
    var friendlyDate = moment(this.props.date)
    var dateStr = friendlyDate.format('dddd MMMM Do');
    var weekendClass = friendlyDate.day() == 0 || friendlyDate.day() == 6 ? ' weekend' : '';
    return React.createElement('tr', { key: this.props.date, className: weekendClass },
        React.createElement('td', {}, dateStr),
        React.createElement('td', {},
          React.createElement(editableText, {
            editClass: "form-control",
            displayClass: "entry-editable",
            text: this.props.entry,
            onChange: this.props.onEntryChange })));
  }
});

var editableText = React.createClass({
  propTypes: {
    displayClass: React.PropTypes.string.isRequired,
    editClass: React.PropTypes.string.isRequired,
    text: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
  },

  getInitialState: function() {
    return { isEditing: false };
  },

  handleClick: function() {
    this.setState({ isEditing: true });
  },

  handleBlur: function(e) {
    this.setState({ isEditing: false, isRefreshing: true });
    this.props.onChange(e.target.value, this.handleRefreshFinished);
  },

  handleRefreshFinished: function() {
    this.setState({ isRefreshing: false, isEditing: false });
  },

  handleKeyPress: function(e) {
    if (e.key == 'Enter') {
      this.handleBlur(e);
    }
  },

  // Set caret to end of input
  handleFocus: function(e) {
    var val = e.target.value;
    e.target.value = '';
    e.target.value = val;
  },

  render: function() {
    if (this.state.isRefreshing) {
      return React.createElement('div', { className: this.props.displayClass },
        React.createElement('span', { className: ' fa fa-spinner fa-spin' })
        );
    }

    if (this.state.isEditing) {
      return React.createElement('input', {
        onFocus: this.handleFocus,
        onKeyPress: this.handleKeyPress,
        autoFocus: true,
        className: this.props.editClass,
        onBlur: this.handleBlur,
        defaultValue: this.props.text
      });
    }

    var text = this.props.text;
    var className = this.props.displayClass;
    if (text == "")
    {
      text = "No Entry";
      className += " no-entry";
    }

    return React.createElement('div', { className: className, onClick: this.handleClick }, text);
  }
});

var monthControl = React.createClass({
  propTypes: {
    year: React.PropTypes.string.isRequired,
    month: React.PropTypes.string.isRequired,
    onNavigatePrevious: React.PropTypes.func.isRequired,
    onNavigateNext: React.PropTypes.func.isRequired,
    loading: React.PropTypes.bool,
  },

  render: function() {
    var friendlyMonth = moment({ year: this.props.year, month: this.props.month-1 })
      .format('MMMM YYYY');
    var label = React.createElement('span', { className: "page-link" }, friendlyMonth);
    if (this.props.loading)
    {
      label = React.createElement('span', { className: "page-link" },
          React.createElement('span', { className: "fa fa-spinner fa-spin" })
          );
    }

    return React.createElement('nav', {},
        React.createElement('ul', { className: "pagination" },
          React.createElement('li', { className: "page-item" },
            React.createElement('a', { className: "page-link", onClick: this.props.onNavigatePrevious }, "Previous")
          ),
          React.createElement('li', { className: "page-item active" },
            label
          ),
          React.createElement('li', { className: "page-item" },
            React.createElement('a', { className: "page-link", onClick: this.props.onNavigateNext }, "Next")
          )
        )
      );
  }
});

var rota = React.createClass({
  propTypes: {
    uuid: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    entries: React.PropTypes.array.isRequired,
    year: React.PropTypes.string.isRequired,
    month: React.PropTypes.string.isRequired,
    onNameUpdated: React.PropTypes.func.isRequired,
    onNavigatePrevious: React.PropTypes.func.isRequired,
    onNavigateNext: React.PropTypes.func.isRequired,
    onEntryChangeFactory: React.PropTypes.func.isRequired,
  },

  render: function() {
    var entryElements = this.props.entries.map(function(entry, index) {
      entry.key = entry.date;
      entry.onEntryChange = this.props.onEntryChangeFactory(this.props.uuid, entry.date);
      return React.createElement(rotaEntry, entry);
    }.bind(this));

    return React.createElement('div', { className: "rota-display" },
        React.createElement('h1', { className: "" }, "Rotatastic!"),
        React.createElement(editableText, { displayClass: "rota-title", editClass: "rota-title-input form-control form-control-lg", text: this.props.name, onChange: this.props.onNameUpdated }),
        React.createElement(monthControl, {
            year: this.props.year,
            month: this.props.month,
            onNavigatePrevious: this.props.onNavigatePrevious,
            onNavigateNext: this.props.onNavigateNext,
            loading: this.props.loading
        }),
        React.createElement('table', { className: "table" },
          React.createElement('thead', {}, React.createElement('tr', {},
              React.createElement('th', {}, 'Date'),
              React.createElement('th', {}, 'Entry'))),
          React.createElement('tbody', {}, entryElements)));
  }
});

var loading = React.createClass({
  render: function() {
    return React.createElement('div', { className: "fullscreenDiv text-center" },
      React.createElement("p", { }, "loading your rota!"),
      React.createElement('i', { className: "fa fa-spinner fa-spin" })
    );
  }
});

var createForm = React.createClass({
  propTypes: {
    onCreateRota: React.PropTypes.func.isRequired,
    onNameChange: React.PropTypes.func.isRequired,
  },

  render: function() {
    return React.createElement('div', { className: "jumbotron" },
        React.createElement('h1', { className: "display-3" }, "Rotatastic!"),
        React.createElement('p', { className: "lead" }, "Create daily rotas in minutes; and easily share them with your team!"),
        React.createElement('div', { className: "input-group input-group-lg" },
          React.createElement('input', { className: "form-control", placeholder: "Enter a name for your rota here and...", onChange: this.props.onNameChange }),
          React.createElement('span', { className: "input-group-btn" },
            React.createElement('button', { className: "btn btn-primary", onClick: this.props.onCreateRota }, "...try it now!")
          )
        )
      );
  }
});

var apiOrigin = window.location.origin;

// add behaviour
function onNameChange (e) {
  setState({ name: e.target.value });
}

function onCreateRota (e) {
  var rota = JSON.stringify({ name: state.name });
  $.ajax(apiOrigin + "/rota", {
    data: rota,
    contentType: 'application/json',
    type: 'POST',
    success: function(response) {
      response.entries = [];
      this.setState(response);
      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      setLocation(response.uuid, year, month);
    }.bind(this)});
}

function onNameUpdated (text, onRefreshFinished) {
  $.ajax(apiOrigin + "/rota/" + state.uuid, {
    data: JSON.stringify({ name: text }),
    contentType: 'application/json',
    type: 'PUT',
    success: function(response) {
      setState(response);
      onRefreshFinished();
    }});
}

function onEntryChangeFactory (uuid, date) {
  return function (text, onRefreshFinished) {
    var dateElements = date.split('-');
    var year = dateElements[0];
    var month = dateElements[1];
    var day = dateElements[2];

    $.ajax(apiOrigin + "/rota/" + state.uuid + "/entries/" + year + "/" + month + "/" + day, {
      data: text,
      contentType: 'application/json',
      type: 'PUT',
      success: function(response) {
        response = JSON.parse(response);
        // find the entry with that name
        var entries = state.entries.slice();
        for (var i = 0; i < entries.length; i++) {
          var entry = entries[i];
          if (entry.date == response.date) {
            entry.entry = response.entry;
          }
        }
        setState({ entries: entries });
        onRefreshFinished();
      }});
  };
}

function explodeParams() {
  return window.location.hash.replace(/^#\/?|\/$/g, '').split('/');
}

function setLocation(uuid, year, month) {
  var withoutFragment = (""+window.location).replace(/#[A-Za-z0-9_\-\/]*$/,'');
  window.location = withoutFragment + "#/" + uuid + "/" + year + "/" + month;
}

function onNavigated() {
  if (window.location.hash == "" || window.location.hash == "#/") {
    // set screen state to be create
    setState({ screen: SCREEN_CREATE_ROTA });
    return;
  }

  // otherwise load the rota with the given id
  var params = explodeParams();
  var uuid = params[0];
  var year = params[1];
  var month = params[2];

  if (typeof(year) === 'undefined' || typeof(month) === 'undefined')
  {
    var currentDate = new Date();
    if (typeof(year) === 'undefined') {
      year = currentDate.getFullYear();
    }

    if (typeof(month) === 'undefined') {
      month = currentDate.getMonth() + 1;
    }

    setLocation(uuid, year, month);
    return;
  }

  this.setState({ uuid: uuid, year: year, month: month });
  if (!this.state.loading)
  {
    this.setState({ screen: SCREEN_LOADING });
  }

  var getEntries = function (response) {
    this.setState({ screen: SCREEN_INDEX, loading: false, entries: JSON.parse(response) });
  }.bind(this);

  var getRota = function (response) {
    this.setState(response);
    $.ajax(apiOrigin + "/rota/" + uuid + "/entries/" + year + "/" + month, {
        success: getEntries
    });
  }.bind(this);

  $.ajax(apiOrigin + "/rota/" + uuid, {
    success: getRota
  });
}

function onNavigateNext() {
  var params = explodeParams();
  var year = parseInt(params[1]);
  var month = parseInt(params[2]);
  month += 1;
  if (month > 12) {
    year += 1;
    month = "01";
  }
  this.setState({ loading: true });
  setLocation(params[0], year, month);
}

function onNavigatePrevious() {
  var params = explodeParams();
  var year = parseInt(params[1]);
  var month = parseInt(params[2]);
  month -= 1;
  if (month < 1) {
    year -= 1;
    month = "12";
  }
  this.setState({ loading: true });
  setLocation(params[0], year, month);
}

window.addEventListener('hashchange', onNavigated, false);

var state = {};
function setState(changes) {
  Object.assign(state, changes);
  var rootElement;
  if (state.screen == SCREEN_CREATE_ROTA) {
    rootElement = React.createElement(createForm, state);
  } else if (state.screen == SCREEN_LOADING) {
    rootElement = React.createElement(loading, state);
  } else {
    rootElement = React.createElement(rota, state);
  }
  ReactDOM.render(rootElement, document.getElementById('container'));
}

var SCREEN_CREATE_ROTA = 'Create';
var SCREEN_LOADING = 'Loading';
var SCREEN_INDEX = 'Index';
// initialise
setState({
  screen: SCREEN_CREATE_ROTA,
  name: "",
  entries: [],
  onCreateRota: onCreateRota,
  onNameChange: onNameChange,
  onNameUpdated: onNameUpdated,
  onNavigateNext: onNavigateNext,
  onNavigatePrevious: onNavigatePrevious,
  onEntryChangeFactory: onEntryChangeFactory,
});

onNavigated();



// Todo: focus shortcut
// Todo: tooltips

var Search = React.createClass({
  propTypes: {
    open : React.PropTypes.func.isRequired
  },

  render: function() {
    return <div id="search">
      <input
        type="text"
        autofocus/>
      <i className="fa fa-search"></i>
      <div className="results"/>
    </div>;
  }
});
angular.module('dyanote').value('Search', Search);
console.log('Hello mondo');

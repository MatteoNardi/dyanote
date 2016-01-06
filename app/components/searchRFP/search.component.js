

// Todo: focus shortcut
// Todo: tooltips

var Search = React.createClass({
  propTypes: {
    open: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      text: '',
      selected: 0
    };
  },

  changeSelection: function (change) {
    return () => {
      console.log('selected', this.state.selected + change);
      this.setState({
        selected: this.state.selected + change
      });
    };
  },

  openSelected: function () {
    console.log('opening', this.state.selected);
  },

  searchText: function (text) {
    this.setState({
      text: text,
      selected: 0
    });
    console.log('searching', text);
  },

  render: function() {
    return <div id='search'>
      <Input
        onUp={this.changeSelection(-1)}
        onDown={this.changeSelection(+1)}
        onEnter={this.openSelected}
        onChange={this.searchText}
      />
      <i className='fa fa-search'></i>
      <div className='results'/>
    </div>;
  }
});
angular.module('dyanote').value('Search', Search);

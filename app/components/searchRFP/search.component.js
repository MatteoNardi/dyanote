
// Todo:
// - tooltips
// - Unfocus on esc
// - Show results only when focused
// - Selected iterates only results
// - Big: tree navigation
var Search = React.createClass({
  propTypes: {
    open: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      text: '',
      selected: 0,
      results: [{id: '-JzGslRW2A5ykQygsp6u', title: 'My home'},{id: '-K7I1rUP5iXISb36ICzs', title: 'Coccodrillo'},{id: '-JzGslRW2A5ykQygsp6u', title: 'My home'}]
    };
  },

  changeSelection: function (change) {
    return () => {
      this.setState({
        selected: (this.state.selected + change) % this.state.results.length
      });
      console.log('selected', this.state.selected);
    };
  },

  openSelected: function () {
    console.log('opening', this.state.selected);
    var selectedId = this.state.results[this.state.selected].id;
    setTimeout(() => { this.props.open(selectedId); }, 200);
  },

  onClick: function (i) {
    this.setState({ selected: i });
    this.openSelected();
  },

  searchText: function (text) {
    this.setState({
      text: text,
      selected: 0
    });
    console.log('searching', text);
  },

  render: function() {
    var results = this.state.results.map((result, i) =>
      <a onClick={this.openSelected}
        className={this.state.selected === i ? 'selected' : ''}>
        <p>{result.title}</p>
      </a>
    );
    return <div id='search'>
      <Input
        onUp={this.changeSelection(-1)}
        onDown={this.changeSelection(+1)}
        onEnter={this.openSelected}
        onChange={this.searchText}
      />
      <i className='fa fa-search'></i>
      <div className='results'>{results}</div>
    </div>;
  }
});
angular.module('dyanote').value('Search', Search);

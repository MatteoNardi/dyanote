
// Todo:
// - tooltips
// - Unfocus on esc
// - Show results only when focused
// - Selected iterates only results
// - Big: tree navigation
var Search = React.createClass({
  propTypes: {
    open: React.PropTypes.func.isRequired,
    search: React.PropTypes.func.isRequired,
    text: React.PropTypes.string,
    running: React.PropTypes.bool,
    results: React.PropTypes.array
  },

  getInitialState: function() {
    return {
      selected: 0
    };
  },

  changeSelection: function (change) {
    return () => {
      this.setState({
        selected: (this.state.selected + change + this.props.results.length) % this.props.results.length
      });
      console.log('selected', this.state.selected);
    };
  },

  openSelected: function () {
    console.log('opening', this.state.selected);
    var selectedId = this.props.results[this.state.selected].id;
    setTimeout(() => { this.props.open(selectedId); }, 200);
  },

  onClick: function (i) {
    this.setState({ selected: i });
    this.openSelected();
  },

  render: function() {
    var results = this.props.results.map((result, i) =>
      <a onClick={() => this.onClick(i)}
        className={this.state.selected === i ? 'selected' : ''}>
        <p>{result.title}</p>
      </a>
    );
    var icon = this.state.running ? 'fa fa-spinner fa-spin' : 'fa fa-search';
    return <div id='search'>
      <Input
        onUp={this.changeSelection(-1)}
        onDown={this.changeSelection(+1)}
        onEnter={this.openSelected}
        onChange={this.props.search}
      />
      <i className='{icon}'></i>
      <div className='results'>{results}</div>
    </div>;
  }
});
angular.module('dyanote').value('Search', Search);

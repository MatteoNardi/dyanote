
var Input = React.createClass({
  propTypes: {
    onDown: React.PropTypes.func.isRequired,
    onUp: React.PropTypes.func.isRequired,
    onEnter: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired
  },

  componentDidMount: function () {
    Mousetrap.bind('mod+f', e => {
      this.refs.input.select();
      return false;
    });
    this.mousetrap = Mousetrap(this.refs.input);
    this.mousetrap.bind('up', this.props.onUp);
    this.mousetrap.bind('down', this.props.onDown);
    this.mousetrap.bind('enter', this.props.onEnter);
  },

  componentWillUnmount: function () {
    Mousetrap.unbind('mod+f');
    this.mousetrap.reset();
  },

  render: function () {
    return <input
      onChange={ (e) => this.props.onChange(e.target.value)}
      type='text'
      ref='input'
      autofocus
    />;
  }
});

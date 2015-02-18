var eventComponent = React.createClass({
	render: function(){
		return React.createElement("div", {className: "container"},
			React.createElement(ReactBootstrap.Label, {bsStyle: "warning"}, "Warning"),
			React.createElement(ReactBootstrap.Label, {bsStyle: "danger"}, "Error"),
			React.createElement(ReactBootstrap.Label, {bsStyle: "default"}, "Alert"),
			React.createElement(ReactBootstrap.Label, {bsStyle: "success"}, "Normal")
		)
	}
})
var eventComponent = React.createClass({
	getEventRow: function(event){
		var self = this;

		var severityLable;
		if(event.data.severity === "error"){
			severityLable = React.createElement(ReactBootstrap.Label, {bsStyle: "danger"}, "Error");
		}

		if(event.data.severity === "warning"){
			severityLable = React.createElement(ReactBootstrap.Label, {bsStyle: "warning"}, "Warning");
		}

		if(event.data.severity === "normal"){
			severityLable = React.createElement(ReactBootstrap.Label, {bsStyle: "success"}, "Normal");
		}

		if(event.data.severity === "alert"){
			severityLable = React.createElement(ReactBootstrap.Label, {bsStyle: "default"}, "Alert");
		}

		return React.createElement("tr", null,
			React.createElement("th", null, event.data.description),
			React.createElement("th", null, event.data.origin),
			React.createElement("th", null, severityLable)
		)
	},

	render: function(){
		if(!this.props.data){
			return React.createElement(waitingComponent, null);
		}

		var rows = [];
		for(var i = 0; i < this.props.data.length; i++){
			rows.push(this.getEventRow(this.props.data[i]));
		}

		return React.createElement("div", null,
			React.createElement("h1", null, "Events"),
			React.createElement(ReactBootstrap.Table, {className: "striped boardered condensed hover"},
				React.createElement("tr", null,
					React.createElement("th", null, "Description"),
					React.createElement("th", null, "Origin"),
					React.createElement("th", null, "Severity")
				),
				rows
			)
		)
	}
})
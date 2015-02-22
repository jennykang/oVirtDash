var notificationComponent = React.createClass({
	render: function(){
		var self = this;
		var alertElems = [];

		for(var i = 0; i < this.props.data.length; i++){
			alertElems.push(React.createElement(ReactBootstrap.Alert, 
				{bsStyle: "danger"}, 
				this.props.data[i].description)
			);
		}

		return React.createElement("div", null, alertElems);
	}
})
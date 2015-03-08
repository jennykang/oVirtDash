var notificationComponent = React.createClass({
	render: function(){
		var self = this;
		var alertElems = [];

		for(var i = 0; i < this.props.data.length; i++){
			var bsStyle;

			if(this.props.data[i].serverity === "error"){
				bsStyle = "danger";
			}

			if(this.props.data[i].serverity === "warning"){
				bsStyle = "warning";
			}

			if(this.props.data[i].serverity === "normal"){
				bsStyle = "normal";
			}

			if(this.props.data[i].serverity === "alert"){
				bsStyle = "default";
			}

			if(this.props.data[i].serverity === "success"){
				bsStyle = "success";
			}

			alertElems.push(React.createElement(ReactBootstrap.Alert, 
				{bsStyle: bsStyle}, 
				this.props.data[i].description)
			);
		}

		return React.createElement("div", null, alertElems);
	}
})
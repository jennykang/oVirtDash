var homeComponent = React.createClass({

	render: function(){
		var self = this;
		var statisticsElement = null;
		if(self.props.statistics){
			statisticsElement = [
                React.createElement("div", null, "Total VMs: " + this.props.statistics.summary.vms.total),
                React.createElement("div", null, "Active VMs: " + this.props.statistics.summary.vms.active),
           		React.createElement("div", null, "Time: " + this.props.statistics.time)
			];
		} 

		else {
			statisticsElement = React.createElement(waitingComponent, null);
		}

		return React.createElement("div", 
			{
				className: "container"
			}, 
			React.createElement("div", {className: "row"}, 
				React.createElement("div", {className: "col-sm-3"}, 
					React.createElement(ReactBootstrap.Panel, 
						{ 
							style: {textAlign: 'center'},
							onClick: function(){
								self.props.onView("datacenters")
							},
							className: "anchor"
						}, 
						React.createElement("img", {src: "images/datacenter-icon.png"}),
						React.createElement("h3", null, "Datacenters")
					)
				),
				React.createElement("div", {className: "col-sm-3"}, 
					React.createElement(ReactBootstrap.Panel, 
						{
							style: {textAlign: 'center'},
							onClick: function(){
								self.props.onView("networks")
							},
							className: "anchor"
						}, 
						React.createElement("img", {src: "images/networks-icon.png"}),
						React.createElement("h3", null, "Networks")
					)
				),
				React.createElement("div", {className: "col-sm-3"}, 
					React.createElement(ReactBootstrap.Panel, 
						{
							style: {textAlign: 'center'},
							onClick: function(){
								self.props.onView("clusters")
							},
							className: "anchor"
						}, 
						React.createElement("img", {src: "images/cluster-icon.png", height: 64}),
						React.createElement("h3", null, "Clusters")
					)
				),
				React.createElement("div", {className: "col-sm-3"}, 
					React.createElement(ReactBootstrap.Panel, 
						{
							style: {textAlign: 'center'},
							onClick: function(){
								self.props.onView("storage")
							},
							className: "anchor"
						}, 
						React.createElement("img", {src: "images/storage-icon.png"}),
						React.createElement("h3", null, "Storage")
					)
				)
			),
			React.createElement("div", {className: "row"},
				React.createElement("div", {className: 'col-sm-5 col-lg-3'},
					React.createElement(ReactBootstrap.Panel, 
						{header: "Summary"},
		                statisticsElement
	           		)
           		)
			)
		)
	}

})
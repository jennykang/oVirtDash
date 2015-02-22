var homeComponent = React.createClass({

	render: function(){
		var self = this;

		return React.createElement("div", null,
			React.createElement("div", {className: "row"},
				React.createElement("div", {className: "col-sm-3"},
					React.createElement(ReactBootstrap.Panel,
						{
							style: {textAlign: "center"},
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
							style: {textAlign: "center"},
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
							style: {textAlign: "center"},
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
							style: {textAlign: "center"},
							onClick: function(){
								self.props.onView("storage")
							},
							className: "anchor"
						},
						React.createElement("img", {src: "images/storage-icon.png"}),
						React.createElement("h3", null, "Storage")
					)
				),

				React.createElement("div", {className: "col-sm-3"},
					React.createElement(ReactBootstrap.Panel,
						{
							style: {textAlign: "center"},
							onClick: function(){
								self.props.onView("vms")
							},
							className: "anchor"
						},
						React.createElement("img", {src: "images/vm-icon.png"}),
						React.createElement("h3", null, "VMs")
					)
				)
			)
		)
	}

})

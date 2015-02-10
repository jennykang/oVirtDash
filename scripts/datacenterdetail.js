var datacenterDetailComponent = React.createClass({

	render: function(){

        if(!this.props.datacenter){
            return React.createElement(waitingComponent, null);
        }

		var datacenter = this.props.datacenter;


        var self = this;


		var datacenterPanelChildren = [
            React.createElement("div", null, "ID: " + datacenter.data.id),
            React.createElement("div", null, "Status: " + datacenter.data.status.state)
        ];
        
        if(datacenter.data.description){
            var description = React.createElement("div", null, "Description: " + datacenter.data.description);
            datacenterPanelChildren.push(description);
        }

        datacenterPanelChildren.push(
            React.createElement("div", null, 
                "Compatibility Version: " + 
                datacenter.data.version.major + "." + 
                datacenter.data.version.minor
            )
        );

        return React.createElement("div", null,
        	React.createElement("h1", null, "Datacenter"),
            React.createElement("div", {className: "row"},
                React.createElement("div", {className: "col-md-4"},
                    React.createElement(ReactBootstrap.Panel, 
                        {
                            header: datacenter.data.name 
                        },
                        datacenterPanelChildren
                    )
                )

            ),
       		React.createElement(networksComponent, {
            	data: datacenter.data.networks
        	}),        	
        	React.createElement(clusterComponent, {
            	data: datacenter.data.clusters
        	})
        )
	}
})
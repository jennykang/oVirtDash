var datacenterDetailComponent = React.createClass({

	render: function(){
		var datacenter = this.props.datacenter;

		var datacenterPanelChildren = [
            React.createElement("div", null, "ID: " + datacenter.data.id),
            React.createElement("div", null, "Status: " + datacenter.data.status)
        ];
        
        if(datacenter.data.description){
            var description = React.createElement("div", null, "Description: " + datacenter.data.description);
            datacenterPanelChildren.push(description);
        }

        datacenterPanelChildren.push(
            React.createElement("div", null, 
                "Compatibility Version: " + 
                datacenter.data.major + "." + 
                datacenter.data.minor
            )
        );

        return React.createElement("div", null,
        	React.createElement("h1", null, "Datacenter"),
  		    React.createElement(ReactBootstrap.Panel, 
  		    	{
                	header: datacenter.data.name 
            	},
           		datacenterPanelChildren
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
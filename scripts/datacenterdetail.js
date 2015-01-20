var datacenterDetailComponent = React.createClass({

	render: function(){
		var datacenter = this.props.datacenter;

		var datacenterPanelChildren = [
            React.createElement("div", null, "ID: " + datacenter.id),
            React.createElement("div", null, "Status: " + datacenter.status)
        ];
        
        if(datacenter.description){
            var description = React.createElement("div", null, "Description: " + datacenter.description);
            datacenterPanelChildren.push(description);
        }

        datacenterPanelChildren.push(
            React.createElement("div", null, 
                "Compatibility Version: " + 
                datacenter.compatibilityMajor + "." + 
                datacenter.compatibilityMinor
            )
        );

        return React.createElement("div", null,
        	React.createElement("h1", null, "Datacenter"),
  		    React.createElement(ReactBootstrap.Panel, 
  		    	{
                	header: datacenter.name 
            	},
           		datacenterPanelChildren
        	),
       		React.createElement(networksComponent, {
            	data: datacenter.networks
        	}),        	
        	React.createElement(clusterComponent, {
            	data: datacenter.clusters
        	})
        )
	}
})
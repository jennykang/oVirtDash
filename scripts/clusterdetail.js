var clusterDetailComponent = React.createClass({

	render: function(){
		var cluster = this.props.cluster;
        var clusterPanelChildren = [
            React.createElement("div", null, "ID: " + cluster.data.id)
        ];
        
        if(cluster.data.description){
            var description = React.createElement("div", null, "Description: " + cluster.data.description);
            clusterPanelChildren.push(description);
        }

        if(cluster.data.cpu){
            var cpu = React.createElement("div", null, "CPU Type: " + cluster.data.cpu.id);
            clusterPanelChildren.push(cpu);
        }

        clusterPanelChildren.push(
            React.createElement("div", null, 
                "Compatibility Version: " + 
                cluster.data.version.major + "." + 
                cluster.data.version.minor
            )
        );
        
        return React.createElement("div", null,
        	React.createElement("h1", null, "Cluster"),
  		    React.createElement(ReactBootstrap.Panel, 
  		    	{
                	header: cluster.data.name 
            	},
           		clusterPanelChildren
        	),
       		React.createElement(datacenterComponent, {
            	data: cluster.data.datacenters
        	}),        	
        	React.createElement(networksComponent, {
            	data: cluster.data.networks
        	})
        )
	}
})
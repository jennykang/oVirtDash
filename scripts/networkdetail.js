var networkDetailComponent = React.createClass({

	render: function(){
		var network = this.props.network;

        var self = this;
        if(!network){
            return React.createElement(waitingComponent, null);
        }

        var usage = "";
        if(network.data.usages.usage.length){
            usage = network.data.usages.usage[0];
            for(var i = 1; i < network.data.usages.usage.length; i++){
                usage = usage + "," + network.data.usages.usage[i];
            }
        }

		var networkPanelChildren = [
            React.createElement("div", null, "Description: " + network.data.description),
            React.createElement("div", null, "ID: " + network.data.id),
            React.createElement("div", null, "Usage: " + usage)
        ];
        
        return React.createElement("div", null,
        	React.createElement("h1", null, "Network"),
  		    React.createElement(ReactBootstrap.Panel, 
  		    	{
                	header: network.data.name 
            	},
           		networkPanelChildren
        	),
       		React.createElement(datacenterComponent, {
            	data: network.data.datacenters
        	})
        )
	}
})
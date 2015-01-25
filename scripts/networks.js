var networksComponent = React.createClass({
    getNetworkPanel: function(network){
        var self = this;
        if(!this.props.data){
            return React.createElement(waitingComponent, null);
        }

        var usage = "";
        if(network.data.usages.usage.length){
            usage = network.data.usages.usage[0];
            for(var i = 1; i < network.data.usages.usage.length; i++){
                usage = usage + "," + network.data.usages.usage[i];
            }
        }


        var panelChildren = [
            React.createElement("div", null, "Description: " + network.data.description),
            React.createElement("div", null, "ID: " + network.data.id),
            React.createElement("div", null, "Usage: " + usage)
        ];

        return React.createElement(ReactBootstrap.Panel, {
                header: network.data.name,
                className: "anchor",
                onClick: function(){
                    self.props.onNetwork(network.data.id)
                }
            }, panelChildren
        );
    },

    render: function(){
        var panelElems = [];

        for(var i = 0; i < this.props.data.length; i++){
            panelElems.push(this.getNetworkPanel(this.props.data[i]));
        }

        return React.createElement("div", null, 
            React.createElement("h1", null, "Networks"), 
            panelElems
        );
    }
})
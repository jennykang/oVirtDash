var networkComponent = React.createClass({
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

        if(self.props.onNetwork){
            return React.createElement("div", {className: "col-md-4"},
                React.createElement(ReactBootstrap.Panel, {
                        header: network.data.name,
                        className: "anchor",
                        onClick: function(){
                            self.props.onNetwork(network.data.id)
                        }
                    }, panelChildren
                )
            );
        }

        var onClick = null;
        var className = null;
        
        if(self.props.onNetwork){
            className = "anchor";
            onClick = function(){
                self.props.onNetwork(network.data.id)
            };
        }

        return React.createElement("div", {className: "col-md-4"},
            React.createElement(ReactBootstrap.Panel, {
                    header: network.data.name,
                    className: className,
                    onClick: onClick
                }, panelChildren
            )
        );
    },

    render: function(){
        if(!this.props.data){
            return React.createElement(waitingComponent, null);
        }
        rowElems = [];
        tempElems = [];

        for(var i = 0; i < this.props.data.length; i++){
            if(tempElems.length === 3){
                rowElems.push(React.createElement("div", {className: "row"}, tempElems));
                tempElems = [];
            }
            tempElems.push(this.getNetworkPanel(this.props.data[i]));
        }

        if(tempElems.length){
            rowElems.push(React.createElement("div", {className: "row"}, tempElems));
            tempElems = [];
        }

        return React.createElement("div", null, 
            React.createElement("h1", null, "Networks"), 
            rowElems
        );
    }
})
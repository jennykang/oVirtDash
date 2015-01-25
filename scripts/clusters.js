var clusterComponent = React.createClass({
    getClusterPanel: function(cluster){
        var self = this;
        if(!this.props.data){
            return React.createElement(waitingComponent, null);
        }

        var panelChildren = [
            React.createElement("div", null, "ID: " + cluster.data.id)
        ];
        
        if(cluster.data.description){
            var description = React.createElement("div", null, "Description: " + cluster.data.description);
            panelChildren.push(description);
        }

        if(cluster.data.cpu){
            var cpu = React.createElement("div", null, "CPU Type: " + cluster.data.cpu.id);
            panelChildren.push(cpu);
        }

        panelChildren.push(
            React.createElement("div", null, 
                "Compatibility Version: " + 
                cluster.data.version.major + "." + 
                cluster.data.version.minor
            )
        );

        return React.createElement(ReactBootstrap.Panel, {
                header: cluster.data.name,
                className: "anchor",
                onClick: function(){
                    self.props.onCluster(cluster.data.id)
                }
            },
            panelChildren
        );
    },

    render: function(){
        var panelElems = [];


        for(var i = 0; i < this.props.data.length; i++){
            panelElems.push(this.getClusterPanel(this.props.data[i]));
        }

        return React.createElement("div", null, 
            React.createElement("h1", null, "Clusters"), 
            panelElems
        );
    }
})
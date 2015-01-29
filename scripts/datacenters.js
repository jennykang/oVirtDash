var datacenterComponent = React.createClass({
    getDatacenterPanel: function(datacenter) {
        var self = this;
        if(!this.props.data){
            return React.createElement(waitingComponet, null)
        }

        var panelChildren = [
            React.createElement("div", null, "ID: " + datacenter.data.id),
            React.createElement("div", null, "Status: " + datacenter.data.status.state)
        ];
        
        if(datacenter.data.description){
            var description = React.createElement("div", null, "Description: " + datacenter.data.description);
            panelChildren.push(description);
        }

        panelChildren.push(
            React.createElement("div", null, 
                "Compatibility Version: " + 
                datacenter.data.version.major + "." + 
                datacenter.data.version.minor
            )
        )
        if (self.props.onDatacenter) {
            // make datacenter clickable

            return React.createElement(ReactBootstrap.Panel, {
                    header: datacenter.data.name,
                    className: "anchor",
                    onClick: function(){
                        self.props.onDatacenter(datacenter.data.id)
                    }
                },
                panelChildren
            );

        }

        return React.createElement(ReactBootstrap.Panel, 
            { header: datacenter.data.name },
            panelChildren
        );
    },
    
    render: function() {

        var self = this;
        if(!this.props.data){
            return React.createElement(waitingComponent, null);
        }

        var panelElems = [];


        for(var i = 0; i < this.props.data.length; i++){
            panelElems.push(this.getDatacenterPanel(this.props.data[i]));
        }

        return React.createElement("div", null, 
            React.createElement("h1", null, "Datacenters"), 
            panelElems
        );
    }
})

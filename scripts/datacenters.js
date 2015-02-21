var datacenterComponent = React.createClass({
    getDatacenterPanel: function(datacenter){
        var self = this;
        if(!this.props.data){
            return React.createElement(waitingComponet, null)
        }

        var panelChildren = [
            React.createElement("div", null, "ID: " + datacenter.data.id),
            React.createElement("div", null, "Status: " + datacenter.data.status.state)
        ];
        
        if(datacenter.data.descriptionre){
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
        
        var onClick = null;
        var className = null;
        if(self.props.onDatacenter){
            className = "anchor";
            onClick = function(){
                self.props.onDatacenter(datacenter.data.id)
            };
        }

        return React.createElement("div", {className: "col-md-4"},
            React.createElement(ReactBootstrap.Panel, 
                {
                    header: datacenter.data.name,
                    className: className,
                    onClick: onClick
                },
                panelChildren
            )
        );
    },
    
    render: function() {

        var self = this;
        if(!this.props.data){
            return React.createElement(waitingComponent, null);
        }

        var rowElems = [];
        var tempElems = [];

        for(var i = 0; i < this.props.data.length; i++){
            if(tempElems.length === 3){
                rowElems.push(React.createElement("div", {className: "row"}, tempElems));
                tempElems = [];
            }
            tempElems.push(this.getDatacenterPanel(this.props.data[i]));
        }
        if(tempElems.length){
            rowElems.push(React.createElement("div", {className: "row"}, tempElems));
            tempElems = [];
        }

        return React.createElement("div", null, 
            React.createElement("h1", null, "Datacenters"), 
            rowElems
        );
    }
})

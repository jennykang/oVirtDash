var parseDatacenters = function(xml){
    var xmlDoc= $.parseXML(xml);
    var data_centers = xmlDoc.querySelectorAll("data_center");
    var objDatacenters = [];

    for(var i = 0; i < data_centers.length; i++){
        var objDatacenter = {
            name: data_centers[i].querySelector("name").textContent,
            id: data_centers[i].getAttribute("id"),
            status: data_centers[i].querySelector("state").textContent,
            compatibilityMajor: data_centers[i].querySelector("version").getAttribute("major"),
            compatibilityMinor: data_centers[i].querySelector("version").getAttribute("minor")
        };

        var descriptionElement = data_centers[i].querySelector("description");
        if(descriptionElement){
            objDatacenter.description = descriptionElement.textContent;
        }

        objDatacenters.push(objDatacenter);
    }
    
    return objDatacenters;
}

var datacenterComponent = React.createClass({
    getDatacenterPanel: function(datacenter) {
        var self = this;

        var panelChildren = [
            React.createElement("div", null, "ID: " + datacenter.id),
            React.createElement("div", null, "Status: " + datacenter.status)
        ];
        
        if(datacenter.description){
            var description = React.createElement("div", null, "Description: " + datacenter.description);
            panelChildren.push(description);
        }

        panelChildren.push(
            React.createElement("div", null, 
                "Compatibility Version: " + 
                datacenter.compatibilityMajor + "." + 
                datacenter.compatibilityMinor
            )
        )

        return React.createElement(ReactBootstrap.Panel, {
                header: datacenter.name,
                className: "anchor",
                onClick: function(){
                    self.props.onDatacenter(datacenter.id)
                }
            },
            panelChildren
        );
    },
    
    render: function() {
        var panelElems = [];


        for(var i = 0; i < this.props.data.length; i++){
            panelElems.push(this.getDatacenterPanel(this.props.data[i]));
        }

        return React.createElement("div", null, 
            React.createElement("h1", null, "Available Datacenters"), 
            panelElems
        );
    }
})

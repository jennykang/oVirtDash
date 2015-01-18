var parseDatacenters = function(xml){
    var xmlDoc= $.parseXML(xml);
    var data_centers = xmlDoc.querySelectorAll("data_center");
    var objDatacenters = [];

    for(var i = 0; i < data_centers.length; i++){
        var objDatacenter = {
            name: data_centers[i].querySelector("name").textContent,
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
    render: function() {
        var panelElems = [];


        for(var i = 0; i < this.props.data.length; i++){
            var panelChildren = [React.createElement("div", null, "Status: " + this.props.data[i].status)];
            if(this.props.data[i].description){
                var description = React.createElement("div", null, "Description: " + this.props.data[i].description);
                panelChildren.push(description);
            }

            panelChildren.push(React.createElement("div", null, "Compatibility Version: " + this.props.data[i].compatibilityMajor + "." + this.props.data[i].compatibilityMinor))

            var panel = React.createElement(ReactBootstrap.Panel, {
                    header: this.props.data[i].name
                },
                panelChildren
            );

            panelElems.push(panel);
        }

        return React.createElement("div", null, 
            React.createElement("h1", null, "Available Datacenters"), 
            panelElems
        );
    }
})
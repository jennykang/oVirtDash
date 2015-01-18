var parseNetworks = function(xml){
    var xmlDoc= $.parseXML(xml);
    var network = xmlDoc.querySelectorAll("network");
    var objNetworks = [];

    for(var i = 0; i < network.length; i++){
        var objNetwork = {
            name: network[i].querySelector("name").textContent,
            description: network[i].querySelector("description").textContent,
            datacenter: network[i].querySelector("data_center").getAttribute("id"),
            usage: network[i].querySelector("usage").textContent
        };
        objNetworks.push(objNetwork);
    }
    
    return objNetworks;
}

var networksComponent = React.createClass({
    render: function(){
        var panelElems = [];
        for(var i = 0; i < this.props.data.length; i++){
            panelElems.push(React.createElement(ReactBootstrap.Panel, {
                header: this.props.data[i].name
            }, React.createElement("div", null, "Description:  " + this.props.data[i].description), 
            React.createElement("div", null, "Datacenter (ID): " + this.props.data[i].datacenter),
            React.createElement("div", null, "Usage: " + this.props.data[i].usage)
            ));
        }

        return React.createElement("div", null,
            React.createElement("h1", null, "Networks"),
            panelElems
        );
    }
})


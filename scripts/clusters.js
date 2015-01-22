var parseClusters = function(xml){
    var xmlDoc = $.parseXML(xml);
    var cluster = xmlDoc.getElementsByTagName("cluster");
    var objClusters = [];

    for(var i = 0; i < cluster.length; i++){
        var objCluster = {
            name: cluster[i].querySelector("name").textContent,
            id: cluster[i].getAttribute("id"),
            datacenter: cluster[i].querySelector("data_center").getAttribute("id"),
            compatibilityMajor: cluster[i].querySelector("version").getAttribute("major"),
            compatibilityMinor: cluster[i].querySelector("version").getAttribute("minor")
        };
        objClusters.push(objCluster);
    }

    return objClusters;
}

var clusterComponent = React.createClass({
    render: function(){
        if(!this.props.data){
            return React.createElement(waitingComponent, null);
        }

        var panelElems = [];
        
        for(var i = 0; i < this.props.data.length; i++){
            panelElems.push(React.createElement(ReactBootstrap.Panel,{
                header: this.props.data[i].name
            }, React.createElement("div", null, "ID: " + this.props.data[i].id),
            React.createElement("div", null, "Datacenter (ID): " + this.props.data[i].datacenter),
            React.createElement("div", null, "Compatibility version: " + this.props.data[i].compatibilityMajor + "." + this.props.data[i].compatibilityMinor)
            ));
        }

        return React.createElement("div", null,
            React.createElement("h1", null, "Clusters"),
            panelElems
        );
    }
})
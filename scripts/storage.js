var praseStorage = function(xml){
    var xmlDoc = $.parseXML(xml);
    var storage_domains = xmlDoc.querySelectorAll("storage_domain");
    objStorages = [];

    for(var i = 0; i < storage_domains.length; i++){
        var objStorage = {
            name: storage_domains[i].querySelector("name").textContent,
            type: storage_domains[i].querySelector("type").textContent,
            storageType: storage_domains[i].querySelector("storage type").textContent,
            storageFormat: storage_domains[i].querySelector("storage_format").textContent
        }

        objStorages.push(objStorage);
    }

    return objStorages;
}

var storageComponent = React.createClass({
    render: function(){
        var panelElems = [];
        for(var i = 0; i < this.props.data.length; i++){
            panelElems.push(React.createElement(ReactBootstrap.Panel, {
                header: this.props.data[i].name
            },
            React.createElement("div", null, "Type: " + this.props.data[i].type),
            React.createElement("div", null, "Storage type: " + this.props.data[i].storageType),
            React.createElement("div", null, "Storage format: " + this.props.data[i].storageFormat)
            ));
        }

        return React.createElement("div", null,
            React.createElement("h1", null, "Storage"),
            panelElems
        );
    }
})

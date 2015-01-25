var storageComponent = React.createClass({
     getStoragePanel: function(storage) {
        var self = this;
        if(!this.props.data){
            return React.createElement(waitingComponet, null)
        }

        var panelChildren = [
            React.createElement("div", null, "ID: " + storage.data.id),
            React.createElement("div", null, "Type: " + storage.data.type),
            React.createElement("div", null, "Storage type: " + storage.data.storage.type),
            React.createElement("div", null, "Storage format: " + storage.data.storage_format)
        ];
        
        if(storage.data.available != 0){
            var total = (storage.data.available + storage.data.used)/(1024*1024*1024);
            var available = (storage.data.available)/(1024*1024*1024);
            var totalSpace = React.createElement("div", null, "Total space: " + total + "GB");
            var availableSpace = React.createElement("div", null, "Available space: " + available + "GB");
            panelChildren.push(totalSpace)
            panelChildren.push(availableSpace);
        }

        return React.createElement(ReactBootstrap.Panel, {
                header: storage.data.name,
                className: "anchor",
                onClick: function(){
                    self.props.onStorage(storage.data.id)
                }
            },
            panelChildren
        );
    },

    render: function(){
        var panelElems = [];


        for(var i = 0; i < this.props.data.length; i++){
            panelElems.push(this.getStoragePanel(this.props.data[i]));
        }

        return React.createElement("div", null, 
            React.createElement("h1", null, "Storage domains"), 
            panelElems
        );
    }
})

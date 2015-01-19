var datacenterDetailComponent = React.createClass({
	

	render: function(){
		var datacenter = this.props.data;

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
        );

        return React.createElement(ReactBootstrap.Panel, {
                header: datacenter.name
            },
            panelChildren
        );
	}
})
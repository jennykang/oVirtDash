var vmComponent = React.createClass({
	getVmPanel: function(vm){
		var self = this;
		if(!this.props.data){
            return React.createElement(waitingComponent, null)
        }

        var onClick = null;
        var className = null;
        if(self.props.onVm){
        	className = "anchor";
        	onClick = function(){
        		self.props.onVm(vm.data.id)
        	};
        }

        return React.createElement("div", {className: "col-md-4"},
        	React.createElement(ReactBootstrap.Panel, {
        		style: {textAlign: "center"},
        		header: vm.data.name,
        		className: className,
        		onClick: onClick
        	}, React.createElement("img", {src: "images/linux-icon.png"}))
        )
	},

	render: function(){
		var self = this;
		if(!this.props.data){
			return React.createElement(waitingComponent, null)
		}

        var rowElems = [];
        var tempElems = [];

        for(var i = 0; i < this.props.data.length; i++){
            if(tempElems.length === 3){
                rowElems.push(React.createElement("div", {className: "row"}, tempElems));
                tempElems = [];
            }
            tempElems.push(this.getVmPanel(this.props.data[i]));
        }
        if(tempElems.length){
            rowElems.push(React.createElement("div", {className: "row"}, tempElems));
            tempElems = [];
        }

        return React.createElement("div", null, 
            React.createElement("h1", null, "VMs"), 
            rowElems
        );


	}

})
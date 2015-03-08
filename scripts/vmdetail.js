var vmDetailComponent = React.createClass({
		render: function(){
			if(!this.props.vm){
				return React.createElement(waitingComponent, null);
			}

			var self = this;
			var vm = this.props.vm;

			var definedMemory = vm.data.memory/(1024*1024);
			var guaranteedMemory = vm.data.memory_policy.guaranteed/(1024*1024)
			var usbPolicy;
			if(vm.data.usb.enabled){
				usbPolicy = "Enabled";
			}
			else{
				usbPolicy = "Disabled";
			}
			var clusterId = vm.data.cluster.id;

			var vmPanelChildren = [
				React.createElement("div", null, "ID: " + vm.data.id),
				React.createElement("div", null, "Description: " + vm.data.description),
				//React.createElement("div", null, "Template: " + vm.data.template.id),
				React.createElement("div", null, "OS: " + vm.data.os.type),
				React.createElement("div", null, "Display type: " + vm.data.display.type),
				React.createElement("div", null, "Priority: " + vm.data.high_availability.priority),
				React.createElement("div", null, "Defined memory: " + definedMemory + "MB"),
				React.createElement("div", null, "Guaranteed memory: " + guaranteedMemory + "MB"),
				React.createElement("div", null, "Number of CPU cores: " + vm.data.cpu.topology.cores),
				React.createElement("div", null, "Number of monitors: " + vm.data.display.monitors),
				React.createElement("div", null, "USB policy: " + usbPolicy),
				React.createElement("div", null, "Origin: " + vm.data.origin),
			];

			return React.createElement("div", null,
				React.createElement("h1", null, "VM"),
				React.createElement("div", {className: "row"},
					React.createElement("div", {className: "col-md-4"},
						React.createElement(ReactBootstrap.Panel,{header: vm.data.name}, vmPanelChildren)
					)
				)
			);
		}
	}
)
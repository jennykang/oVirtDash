var username = docCookies.getItem("username");
var password = docCookies.getItem("password");
var enginehost = docCookies.getItem("enginehost");

if(!username || !password || !enginehost){
    window.location = "login.html";
}

var apiurl = "http://" + enginehost + "/ovirt-engine/api";
ovirt.api.options.engineBaseUrl = "http://" + encodeURIComponent(username) + ':' + password + '@' + enginehost;

var rootComponent = React.createClass({
    componentDidMount: function(){

        var self = this;
        var promise = ovirt.api.init();
        promise.then(function(){
            self.state.initialized = true;
            self.setState(self.state);

            self.refresh();

            self.addNotification({description: "connected to oVirt", severity: "success"});
        });

        promise.catch(function(){
            alert("Cannot connect. Going back to sign in page");
			return;
            window.location = "login.html";
        });
    },

    refresh: function(){
        ovirt.api.datacenters.list().run().then(this.updateDatacenters).catch(this.onError);
        ovirt.api.networks.list().run().then(this.updateNetworks).catch(this.onError);
        ovirt.api.storagedomains.list().run().then(this.updateStorageDomains).catch(this.onError);
        ovirt.api.clusters.list().run().then(this.updateClusters).catch(this.onError);
        ovirt.api.vms.list().run().then(this.updateVms).catch(this.onError);
        ovirt.api.events.list().run().then(this.updateEvents).catch(this.onError);
    },

    updateDatacenters: function(data){
        if(!data){
            return this.onError(new Error("No data given to update datacenters"));
        }

        this.state.data.datacenters = data;
        this.setState(this.state);
    },

    updateNetworks: function(data){
        if(!data){
            return this.onError(new Error("No data given to update network"));
        }

        this.state.data.networks = data;
        this.setState(this.state);
    },

    updateStorageDomains: function(data){
        if(!data){
            return this.onError(new Error("No data given to update stroage domains"));
        }

        this.state.data.storage = data;
        this.setState(this.state);
    },

    updateClusters: function(data){
        if(!data){
            return this.onError(new Error("No data given to update clusters"));
        }

        this.state.data.clusters = data;
        this.setState(this.state);
    },

    updateVms: function(data){
        if(!data){
            return this.onError(new Error("No data given to update vms"));
        }

        this.state.data.vms = data;
        this.setState(this.state);
    },

    updateEvents: function(data){
        if(!data){
            return this.onError(new Error("No data given to update events"));
        }

        this.state.data.events = data;
        this.setState(this.state);
    },

	onError: function(err) {
        console.log('got back error: ', err);

		var self = this;
		var state = self.state;
		state.data.error = {
			message: err.message
		}
		state.view = "error";
		self.setState(state);
	},

    getInitialState: function(){
        return {
            initialized: false,
            refreshing: false,
            view: "home",
            data: {
                details: {
                    datacenterId: null,
                    networkId: null,
                    clusterId: null,
                    vmId: null
                },
                datacenters: null,
                storage: null,
                networks: null,
                clusters: null,
                vms: null,
                events: null,
                notifications: [],
                error: null
            }
        }
    },

    getDatacenterById: function(id) {
        var datacenters = this.state.data.datacenters;
        if(datacenters == null){
            return null;
        }

        for(var i = 0; i < datacenters.length; i++){
            if(datacenters[i].data.id == id){
                return datacenters[i];
            }
        }


        return null;
    },

    getDatacenterNetworks: function(id){
        var self = this;

        var datacenter = this.getDatacenterById(id);
        datacenter.networks.list().run().then(function(data){
			if(!data){
				return this.onError(new Error("did not get data successfully!!"));
			}
            var networks = data;
            datacenter.data.networks = networks;
            self.setState(self.state);
        }).catch(this.onError);

    },

    getDatacenterClusters: function(id){
        var self = this;

        var datacenter = this.getDatacenterById(id);
        datacenter.clusters.list().run().then(function(data){
            var clusters = data;
            datacenter.data.clusters = clusters;
            self.setState(self.state);
        }).catch(this.onError);
    },

    showDatacenterDetails: function(id){
        var state = this.state;

        state.data.details.datacenterId = id;

        this.getDatacenterClusters(id);
        this.getDatacenterNetworks(id);

        state.view = "datacenter-detail";
        this.setState(state);
    },

    getNetworkById: function(id){
        var networks = this.state.data.networks;
        if (networks == null) {
            return null;
        }

        for(var i = 0; i < networks.length; i++){
            if(networks[i].data.id == id){
                return networks[i];
            }
        }

        return null;
    },

    getNetworkDatacenters: function(id){
        var self = this;

        var network = this.getNetworkById(id);
        var networkDatacenterId = network.data.data_center.id;
        ovirt.api.datacenters.get(networkDatacenterId).run().then(function(data){

			if(!data){
				return this.onError(new Error("did not get data successfully!!"));
			}
            var datacenter = data;
            network.data.datacenters = [datacenter];
            self.setState(self.state);
        }).catch(this.onError)
    },

    showNetworkDetails: function(id){
        var state = this.state;

        state.data.details.networkId = id;

        this.getNetworkDatacenters(id);

        state.view = "network-detail";
        this.setState(state);
    },


    getClusterById: function(id){
        var clusters = this.state.data.clusters;
        if (clusters == null) {
            return null;
        }

        for(var i = 0; i < clusters.length; i++){
            if(clusters[i].data.id == id){
                return clusters[i];
            }
        }

        return null;
    },

    getClusterDatacenters: function(id){
        var self = this;

        var cluster = this.getClusterById(id);
        var clusterDatacenterID = cluster.data.data_center.id;
        ovirt.api.datacenters.get(clusterDatacenterID).run().then(function(data){

			if(!data){
				return this.onError(new Error("did not get data successfully!!"));
			}

            var datacenter = data;
            cluster.data.datacenters = [datacenter];
            self.setState(self.state);
        }).catch(this.onError);
    },

    getClusterNetworks: function(id){
        var self = this;

        var cluster = this.getClusterById(id);

        cluster.networks.list().run().then(function(data){
            var networks = data;
            cluster.data.networks = networks;
            self.setState(self.state);
        }).catch(this.onError);
    },

    showClusterDetail: function(id){
        var state = this.state;

        state.data.details.clusterId = id;

        this.getClusterDatacenters(id);
        this.getClusterNetworks(id);

        state.view = "cluster-detail";
        this.setState(state);
    },

    showVmDetail: function(id){
        var state = this.state;
        state.data.details.vmId = id;
        state.view = "vm-detail";
        this.setState(state);        
    },

    getVmById: function(id){
        var vms = this.state.data.vms;
        if(vms === null){
            return null;
        }

        for(var i = 0; i < vms.length; i++){
            if(vms[i].data.id === id){
                return vms[i];
            }
        }

        return null;

    },

    addNotification: function(notification){
        var self = this;
        this.state.data.notifications.push(notification);
        this.setState(this.state);

        setTimeout(function(){
            self.removeNotification(notification)
        }, 5000);
    },

    removeNotification: function(notification){
        var ind = this.state.data.notifications.indexOf(notification);
        if(ind === -1){
            return;
        }

        this.state.data.notifications.splice(ind, 1);
        this.setState(this.state);
    },

    changeView: function(view){
        var state = this.state;
        state.view = view;
        this.setState(state);
    },

    render: function(){
        var self = this;
        var navElement = React.createElement(navbarComponent, {
            onView: this.changeView
        });
        var notificationElement = React.createElement(notificationComponent, {
            data: this.state.data.notifications
        });

        if(!this.state.initialized){
            return React.createElement("div",
                {className: "container"},
                notificationElement,
                React.createElement(waitingComponent, null)
            );
        }

        if(this.state.view === "error"){
            return React.createElement("div", null,
                navElement,
                React.createElement("div", {className: "container"},
                    notificationElement,
                    React.createElement("h1", null, "error: " + this.state.data.error.message)
                )
            );
        }


        var waitingElement = React.createElement("div", null,
            navElement,
            React.createElement("div", {className: "container"},
                notificationElement,
                React.createElement(waitingComponent, null)
            )
        );

        if(this.state.view === "home"){
            return React.createElement("div", null,
                navElement,
                React.createElement("div", {className: "container"},
                    notificationElement,
                    React.createElement(homeComponent, {onView: this.changeView})
                )
               
            );
        }

        if(this.state.view === "datacenters"){
            return React.createElement("div", null,
                navElement,
                React.createElement("div", {className: "container"},
                    notificationElement,
                    React.createElement(datacenterComponent, {
                        data: this.state.data.datacenters,
                        onDatacenter: this.showDatacenterDetails
                    })
                )
            );
        }

        if(this.state.view === "datacenter-detail"){
            var datacenter = this.getDatacenterById(this.state.data.details.datacenterId);
            return React.createElement("div", null,
                navElement,
                React.createElement("div", {className: "container"},
                    notificationElement,
                    React.createElement(datacenterDetailComponent, {
                        datacenter: datacenter
                    })
                )
            )
        }

        if(this.state.view === "storage"){
            return React.createElement("div", null,
                navElement,
                React.createElement("div", {className: "container"},
                    notificationElement,
                    React.createElement(storageComponent,{
                        data: this.state.data.storage,
                        onStorage: this.showStorageDetails
                    })
                )
            );
        }

        if(this.state.view === "networks"){
            return React.createElement("div", null,
                navElement,
                React.createElement("div", {className: "container"},
                    notificationElement,
                    React.createElement(networkComponent, {
                        data: this.state.data.networks,
                        onNetwork: this.showNetworkDetails
                    })
                )
            );
        }

        if(this.state.view === "network-detail"){
            var network = this.getNetworkById(this.state.data.details.networkId);
            return React.createElement("div", null,
                navElement,
                React.createElement("div", {className: "container"},
                    notificationElement,
                    React.createElement(networkDetailComponent, {
                        network: network
                    })
                )
            )
        }

        if(this.state.view === "clusters"){
            return React.createElement("div", null,
                navElement,
                React.createElement("div", {className: "container"},
                    notificationElement,
                    React.createElement(clusterComponent,{
                        data: this.state.data.clusters,
                        onCluster: this.showClusterDetail
                    })
                )
            );
        }

        if(this.state.view === "cluster-detail"){
            var cluster = this.getClusterById(this.state.data.details.clusterId);
            return React.createElement("div", null,
                navElement,
                React.createElement("div", {className: "container"},
                    notificationElement,
                    React.createElement(clusterDetailComponent, {
                        cluster: cluster
                    })
                )
            );
        }

        if(this.state.view === "vms"){
            return React.createElement("div", null,
                navElement,
                React.createElement("div", {className: "container"}, 
                    notificationElement,
                    React.createElement(vmComponent, {
                        data: this.state.data.vms,
                        onVm: this.showVmDetail
                    })
                )
            );
        }

        if(this.state.view === "vm-detail"){
            var vm = this.getVmById(this.state.data.details.vmId);
            return React.createElement("div", null,
                navElement,
                React.createElement("div", {className: "container"},
                    notificationElement,
                    React.createElement(vmDetailComponent, {
                        vm: vm
                    })
                )
            )
        }

        if(this.state.view === "events"){
            return React.createElement("div", null,
                navElement,
                React.createElement("div", {className: "container"},
                    notificationElement,
                    React.createElement(eventComponent, {
                        data: this.state.data.events
                    })
                )
            )
        }

        return React.createElement("div", null,
            navElement,
            React.createElement("div", {className: "container"}, notificationElement)
        );
    }
})

React.render(React.createElement(rootComponent, null), document.body);

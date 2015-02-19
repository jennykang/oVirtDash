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
        });
        promise.catch(function(){
            alert("Cannot connect. Going back to sign in page");
			return;
            window.location = "login.html";
        });
    },

	onError: function(err) {
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
            loading: {
                datacenters: false,
                storage: false,
                networks: false,
                clusters: false,
                vms: false,
                events: false
            },
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

    getDatacenters: function(){

        if(this.state.loading.datacenters){
            return; //datacenters already loading so no need to get data again
        }

        this.state.loading.datacenters = true;
        var self = this;

        ovirt.api.datacenters.list().run().then(function(data){
			if(!data){
				return this.onError(new Error("did not get data successfully!!"));
			}

            self.state.loading.datacenters = false;
            self.state.data.datacenters = data;
            self.setState(self.state);
        }).catch(this.onError)
    },

    getStorage: function(){

        var self = this;


        if(this.state.loading.storage){
            return; //storage already loading so no need to get data again
        }
        this.state.loading.storage = true;

        ovirt.api.storagedomains.list().run().then(function(data){

			if(!data){
				return this.onError(new Error("did not get data successfully!!"));
			}
            self.state.loading.storage = false;
            self.state.data.storage = data;
            self.setState(self.state);
        }).catch(this.onError)

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

    getNetworks: function(){
        var self = this;


        if(this.state.loading.networks){
            return; //networks already loading so no need to get data again
        }
        this.state.loading.networks = true;


        ovirt.api.networks.list().run().then(function(data){

			if(!data){
				return this.onError(new Error("did not get data successfully!!"));
			}
            self.state.loading.networks = false;
            self.state.data.networks = data;
            self.setState(self.state);
        }).catch(this.onError)
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

    getClusters: function(){
        var self = this;

        if(this.state.loading.clusters){
            return; //clusters already loading so no need to get data again
        }
        this.state.loading.clusters = true;

        ovirt.api.clusters.list().run().then(function(data){
			if(!data){
				return this.onError(new Error("did not get data successfully!!"));
			}
            self.state.loading.clusters = false;
            self.state.data.clusters = data;
            self.setState(self.state);
        }).catch(this.onError)
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

    getVms: function(){
        var self = this;

        if(this.state.loading.vms){
            return;
        }
        this.state.loading.vms = true;

        ovirt.api.vms.list().run().then(function(data){
            if(!data){
                return this.onError(new Error("did not get data successfully!!"));
            }
            self.state.loading.vms = false;
            self.state.data.vms = data;
            self.setState(self.state);
        }).catch(this.onError)
    },

    getEvents: function(){
        var self = this;

        if(this.state.loading.events){
            return;
        }
        this.state.loading.events = true;

        ovirt.api.events.list().run().then(function(data){
            if(!data){
                return this.onError(new Error("did not get data successfully!!"));
            }
            self.state.loading.events = false;
            self.state.data.events = data;
            self.setState(self.state);
        }).catch(this.onError)
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

        if(!this.state.initialized){
            return React.createElement("div",
                {className: "container"},
                React.createElement(waitingComponent, null)
            );
        }

        if(this.state.view === "error"){
            return React.createElement("div", null,
                navElement,
                React.createElement("h1", null, "error: " + this.state.data.error.message)
            );
        }

        if(!this.state.data.datacenters){
            this.getDatacenters();
        }

        if(!this.state.data.networks){
            this.getNetworks();
        }

        if(!this.state.data.storage){
            this.getStorage();
        }

        if(!this.state.data.clusters){
            this.getClusters();
        }

        if(!this.state.data.vms){
            this.getVms();
        }

        if(!this.state.data.events){
            this.getEvents();
        }

        var waitingElement = React.createElement("div", null,
            navElement,
            React.createElement(waitingComponent, null)
        );

        if(this.state.view === "home"){
            return React.createElement("div", null,
                navElement,
                React.createElement(homeComponent, {
                    onView: this.changeView
                })
            );
        }

        if(this.state.view === "datacenters"){
            return React.createElement("div", null,
                navElement,
                React.createElement("div",
                    {className: "container"},
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
                React.createElement("div",
                    {className: "container"},
                    React.createElement(datacenterDetailComponent, {
                        datacenter: datacenter
                    })
                )
            )
        }

        if(this.state.view === "storage"){
            return React.createElement("div", null,
                navElement,
                React.createElement("div",
                    {className: "container"},
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
                React.createElement("div",
                    {className: "container"},
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
                React.createElement("div",
                    {className: "container"},
                    React.createElement(networkDetailComponent, {
                        network: network
                    })
                )
            )
        }

        if(this.state.view === "clusters"){
            return React.createElement("div", null,
                navElement,
                React.createElement("div",
                    {className: "container"},
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
                React.createElement("div",
                    {className: "container"},
                    React.createElement(clusterDetailComponent, {
                        cluster: cluster
                    })
                )
            );
        }

        if(this.state.view === "vms"){
            return React.createElement("div", null,
                navElement,
                React.createElement("div", 
                    {className: "container"}, 
                    React.createElement(vmComponent, {
                        data: this.state.data.vms,
                        onVm: this.showVmDetail
                    })
                )
            );
        }

        if(this.state.view === "vm-detail"){
            var vm = this.getVmById(this.state.data.details.vmId);
            console.log("got back vm", vm);
            return React.createElement("div", null,
                navElement,
                React.createElement("div",
                    {className: "container"},
                    React.createElement(vmDetailComponent, {
                        vm: vm
                    })
                )
            )
        }

        if(this.state.view === "events"){
            return React.createElement("div", null,
                navElement,
                React.createElement("div",
                    {className: "container"},
                    React.createElement(eventComponent, {
                        data: this.state.data.events
                    })
                )
            )
        }

        return React.createElement("div", null,
            navElement
        );
    }
})

React.render(React.createElement(rootComponent, null), document.body);

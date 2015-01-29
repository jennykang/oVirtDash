var username = docCookies.getItem("username");
var password = docCookies.getItem("password");
var enginehost = docCookies.getItem("enginehost");

if(!username || !password || !enginehost){
    window.location = "login.html";
}

var apiurl = "http://" + enginehost + "/ovirt-engine/api";
ovirt.api.options.engineBaseUrl = "http://" + enginehost;

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
            window.location = "login.html";
        });
    },

    getInitialState: function(){
        return {
            initialized: false,
            loading: {
                statistics: false,
                datacenters: false,
                storage: false,
                networks: false,
                clusters: false
            },  
            view: "statistics",
            data: {
                details: {
                    datacenterId: null,
                    networkId: null,
                    clusterId: null
                },
                statistics: null,
                datacenters: null,
                storage: null,
                networks: null,
                clusters: null,
                error: null
            }
        }
    },

    getStatistics: function(){
        if(this.state.loading.statistics){
            return; //statistics already loading so no need to get data again
        }

        var self = this;
        $.ajax({
            url: apiurl,
            type: "GET",
            dataType: "text",
            username: username,
            password: password,

            success: function(data){
                var statistics = parseStatistics(data);
                var state = self.state;
                state.loading.statistics = false;
                state.data.statistics = statistics;
                self.setState(state);
            },

            error: function(err){
                var state = self.state;
                state.data.error = {
                    message: err.statusText
                }
                state.view = "error";
                self.setState(state);
            }
        });

        setTimeout(function() {
            var state =  self.state;
            state.loading.statistics = true;
            self.setState(state);
        }, 0);
    },

    getDatacenterById: function(id) {
        var datacenters = this.state.data.datacenters;
        if (datacenters == null) {
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
            var networks = data;
            datacenter.data.networks = networks;
            self.setState(self.state);
        }).catch(function(err){
            var state = self.state;
            state.data.error = {
                message: err.message
            }
            state.view = "error";
            self.setState(state);
        });
    },

    getDatacenterClusters: function(id){
        var self = this;

        var datacenter = this.getDatacenterById(id);
        datacenter.clusters.list().run().then(function(data){
            var clusters = data;
            datacenter.data.clusters = clusters;
            self.setState(self.state);
        }).catch(function(err){
            var state = self.state;
            state.data.error = {
                message: err.message
            }
            state.view = "error";
            self.setState(state);
        });
    },

    showDatacenterDetails: function(id) {
        var state = this.state;

        state.data.details.datacenterId = id;

        this.getDatacenterClusters(id);
        this.getDatacenterNetworks(id);

        state.view = "datacenter-detail";
        this.setState(state);
    },

    getDatacenters: function(){
        var self = this;

        ovirt.api.datacenters.list().run().then(function(data){
            self.state.loading.datacenters = false;
            self.state.data.datacenters = data;
            self.setState(self.state);
        }).catch(function(err){
            var state = self.state;
            state.data.error = {
                message: err.message
            }
            state.view = "error";
            self.setState(state);
        })

        setTimeout(function() {
            var state =  self.state;
            state.loading.datacenters = true;
            self.setState(state);
        }, 0)
    },

    getStorage: function(){
        var self = this;

        ovirt.api.storagedomains.list().run().then(function(data){
            self.state.loading.storage = false;
            self.state.data.storage = data;
            self.setState(self.state);
        }).catch(function(err){
            var state = self.setState;
            state.data.error = {
                message: err.message
            }
            state.view = "error";
            self.setState(state);
        })

        setTimeout(function(){
            var state = self.state;
            state.loading.storage = true;
            self.setState(state);
        }, 0);
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
            var datacenter = data;
            network.data.datacenters = [datacenter];
            self.setState(self.state);
        }).catch(function(err){
            var state = self.setState;
            state.data.error = {
                message: err.message
            }
            state.view = "error";
            self.setState(state);
        })
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

        ovirt.api.networks.list().run().then(function(data){
            self.state.loading.networks = false;
            self.state.data.networks = data;
            self.setState(self.state);
        }).catch(function(err){
            var state = self.state;
            state.data.error = {
                message: err.message
            }
            state.view = "error";
            self.setState(state);
        })

        setTimeout(function() {
            var state =  self.state;
            state.loading.networks = true;
            self.setState(state);
        }, 0)
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
            var datacenter = data;
            cluster.data.datacenters = [datacenter];
            self.setState(self.state);
        }).catch(function(err){
            var state = self.state;
            state.data.error = {
                message: err.message
            }
            state.view = "error";
            self.setState(state);
        });         
    },

    getClusterNetworks: function(id){
        var self = this;

        var cluster = this.getClusterById(id); 


        cluster.networks.list().run().then(function(data){
            var networks = data;
            cluster.data.networks = networks;
            self.setState(self.state);
        }).catch(function(err){
            var state = self.state;
            state.data.error = {
                message: err.message
            }
            state.view="error";
            self.setState(state);
        }); 
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

        ovirt.api.clusters.list().run().then(function(data){
            self.state.loading.clusters = false;
            self.state.data.clusters = data;
            self.setState(self.state);
        }).catch(function(err){
            var state = self.state;
            state.data.error = {
                message: err.message
            }
            state.view = "error";
            self.setState(state);
        })

        setTimeout(function() {
            var state =  self.state;
            state.loading.clusters = true;
            self.setState(state);
        }, 0)
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
            return React.createElement("div", {
                className: "container"
            }, React.createElement(waitingComponent, null));
        }

        var waitingElement = React.createElement("div", null, 
            navElement,
            React.createElement(waitingComponent, null)
        );

        if(this.state.view === "statistics"){
            if(this.state.loading.statistics){
                return waitingElement;
            }

            if(this.state.data.statistics){
                return React.createElement("div", null, 
                    navElement,
                    React.createElement("div", {
                            className: "container"
                        }, 
                        React.createElement(statisticsComponent, {
                            data: this.state.data.statistics
                        })
                    )
                );
            }

            else{
                this.getStatistics();
            }
        }

        if(this.state.view === "datacenters"){
            if(this.state.loading.datacenters){
                return waitingElement;
            }

            if(this.state.data.datacenters){
                return React.createElement("div", null, 
                    navElement,
                    React.createElement("div", 
                        {
                            className: "container"
                        }, 
                        React.createElement(datacenterComponent, {
                            data: this.state.data.datacenters,
                            onDatacenter: this.showDatacenterDetails
                        })
                    )
                );
            }
            else {
                this.getDatacenters();
            }
        }

        if(this.state.view === "datacenter-detail"){
            var datacenter = this.getDatacenterById(this.state.data.details.datacenterId);
            return React.createElement("div", null, 
                navElement,
                React.createElement("div",
                    {
                        className: "container"
                    },
                    React.createElement(datacenterDetailComponent, {
                        datacenter: datacenter
                    })
                )
            )
        }           

        if(this.state.view === "storage"){
            if(this.state.loading.storage){
                return waitingElement;
            }

            if(this.state.data.storage){
                return React.createElement("div", null,
                    navElement,
                    React.createElement("div", 
                        {
                            className: "container"
                        },
                        React.createElement(storageComponent,{
                            data: this.state.data.storage,
                            onStorage: this.showStorageDetails
                        })
                    )
                );
            }

            else{
                this.getStorage();
            }
        }

        if(this.state.view === "networks"){
            if(this.state.loading.networks){
                return waitingElement;
            }

            if(this.state.data.networks){
                return React.createElement("div", null, 
                    navElement,
                    React.createElement("div", 
                        {
                            className: "container"
                        }, 
                        React.createElement(networksComponent, {
                            data: this.state.data.networks,
                            onNetwork: this.showNetworkDetails
                        })
                    )
                );
            }

            else{
                this.getNetworks();
            }
        }

        if(this.state.view === "network-detail"){
            var network = this.getNetworkById(this.state.data.details.networkId);
            return React.createElement("div", null, 
                navElement,
                React.createElement("div",
                    {
                        className: "container"
                    },
                    React.createElement(networkDetailComponent, {
                        network: network
                    })
                )
            )
        }           

        if(this.state.view === "clusters"){
            if(this.state.loading.clusters){
                return waitingElement;
            }

            if(this.state.data.clusters){
                return React.createElement("div", null,
                    navElement,
                    React.createElement("div", {
                        className: "container"
                    },
                    React.createElement(clusterComponent,{
                        data: this.state.data.clusters,
                        onCluster: this.showClusterDetail
                    })
                    )   
                )
            }

            else{
                this.getClusters();
            }
        }

        if(this.state.view ==="cluster-detail"){
            var cluster = this.getClusterById(this.state.data.details.clusterId);
            return React.createElement("div", null,
                navElement,
                React.createElement("div",
                    {   
                        className: "container"
                    },
                    React.createElement(clusterDetailComponent, {
                        cluster: cluster
                    })
                )
            )
        }

        if(this.state.view === "error"){
            return React.createElement("div", null, 
                navElement,
                React.createElement("h1", null, "error: " + this.state.data.error.message)
            );
        }

        return React.createElement("div", null, 
            navElement
        );
    }
})

React.render(React.createElement(rootComponent, null), document.body);
var username = docCookies.getItem("username");
var password = docCookies.getItem("password");
var enginehost = docCookies.getItem("enginehost");

if(!username || !password || !enginehost){
    window.location = "/login.html";
}

var apiurl = "http://" + enginehost + "/ovirt-engine/api";

var rootComponent = React.createClass({
    getInitialState: function(){
        return {
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
                    datacenter: null
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
        // returns datacenter or null
        var datacenters = this.state.data.datacenters;
        if (datacenters == null) {
            return null;
        }

        for(var i = 0; i < datacenters.length; i++){
            if(datacenters[i].id == id){
                return datacenters[i];
            }
        }

        return null;
    },

    showDatacenterDetails: function(id) {
        var state = this.state;
        var datacenter = this.getDatacenterById(id);
        state.data.details.datacenter = datacenter;
        state.view = "datacenter-detail";
        this.setState(state);
    },

    getDatacenter: function(){
        var self = this;

        $.ajax({
            url: apiurl + "/datacenters",
            type: "GET",
            dataType: "text",
            username: username,
            password: password,

            success: function(xml){
                var datacenters = parseDatacenters(xml);
                var state = self.state;
                state.loading.datacenters = false;
                state.data.datacenters = datacenters;
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
            state.loading.datacenters = true;
            self.setState(state);
        }, 0)
    },

    getStorage: function(){
        var self = this;

        $.ajax({
            url: apiurl + "/storagedomains",
            type: "GET",
            dataType: "text",
            username: username,
            password: password,

            success: function(xml){
                var storage = praseStorage(xml);
                var state = self.state;
                state.loading.storage = false;
                state.data.storage = storage;
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

        setTimeout(function(){
            var state = self.state;
            state.loading.storage = true;
            self.setState(state);
        }, 0);
    },

    getNetworks: function(){
        var self = this;

        $.ajax({
            url: apiurl + "/networks",
            type: "GET",
            dataType: "text",
            username: username,
            password: password,

            success: function(xml){
                var networks = parseNetworks(xml);
                var state = self.state;
                state.loading.networks = false;
                state.data.networks = networks;
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
            state.loading.networks = true;
            self.setState(state);
        }, 0)
    },

    getClusters: function(){
        var self = this;

        $.ajax({
            url: apiurl + "/clusters",
            type: "GET",
            dataType: "text",
            username:username,
            password: password,

            success: function(xml){
                var state = self.state;
                var clusters = parseClusters(xml);
                state.loading.clusters = false;
                state.data.clusters = clusters;
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

        setTimeout(function(){
            var state = self.state;
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

        var waitingElement = React.createElement("div", null, 
            navElement,
            React.createElement("div", {className: "container"}, 
                React.createElement("h1", null, 
                    React.createElement("span", {
                        className:"glyphicon glyphicon-refresh glyphicon-refresh-animate"
                    }), " Loading..."
                )
            )
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
                this.getDatacenter();
            }
        }

        if(this.state.view === "datacenter-detail"){
            return React.createElement("div", null, 
                navElement,
                React.createElement("div",
                    {
                        className: "container"
                    },
                    React.createElement(datacenterDetailComponent, {
                        data: this.state.data.details.datacenter
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
                            data: this.state.data.storage
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
                            data: this.state.data.networks
                        })
                    )
                );
            }

            else{
                this.getNetworks();
            }
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
                        data: this.state.data.clusters
                    })
                    )   
                )
            }

            else{
                this.getClusters();
            }
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
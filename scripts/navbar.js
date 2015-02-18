var navbarComponent =  React.createClass({
    render: function(){
        var self = this;
        return React.createElement(ReactBootstrap.Navbar, {
                brand: React.createElement("img", {
                    src: "images/ovirt.png",
                    onClick: function(){
                        self.props.onView("home");
                    },
                    className: "anchor"
                }),
                defaultNavExpanded: true,
                toggleNavKey: 1
            }, 
            React.createElement(ReactBootstrap.Nav, {
                onSelect: function(eventKey){
                    self.props.onView(eventKey);
                }
            },

                React.createElement(ReactBootstrap.NavItem, {
                    eventKey: "datacenters",
                    href: "#"
                }, "Datacenters"),

                React.createElement(ReactBootstrap.NavItem, {
                    eventKey: "storage",
                    href: "#"
                }, "Storage"),

                React.createElement(ReactBootstrap.NavItem, {
                    eventKey: "networks",
                    href: "#"
                }, "Networks"),

                React.createElement(ReactBootstrap.NavItem, {
                    eventKey: "clusters",
                    href: "#"
                }, "Clusters"),

                React.createElement(ReactBootstrap.NavItem, {
                    eventKey: "vms",
                    href: "#"
                }, "VMs"),

                React.createElement(ReactBootstrap.NavItem, {
                    eventKey: "events",
                    href: "#"
                }, "Events")
            ),

            React.createElement("form", {
                className:"navbar-form pull-right"
            }, React.createElement("button", {
                type: "submit",
                className: "btn btn-success",
                onClick: function(ev){
                    window.location = "login.html"

                    ev.preventDefault();
                }
            }, "Sign out"))
        );
    }
})
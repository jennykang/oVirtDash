var navbarComponent =  React.createClass({
    render: function(){
        var self = this;
        return React.createElement(ReactBootstrap.Navbar, {
                brand: React.createElement("img", {
                    src: "images/ovirt.png"
                }),
                defaultNavExpanded: true,
                toggleButton: [
                    React.createElement("span", {
                        className: "sr-only"
                    }, "Toggle Navigation"),
                    React.createElement("span", {
                        className: "icon-bar"
                    }),
                    React.createElement("span", {
                        className: "icon-bar"
                    })
                ]
            }, 
            React.createElement(ReactBootstrap.Nav, {
                onSelect: function(eventKey){
                    self.props.onView(eventKey);
                }
            },

                React.createElement(ReactBootstrap.NavItem, {
                    eventKey:"statistics",
                    href: "#"
                }, "Statistics"),

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
                }, "Clusters")
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
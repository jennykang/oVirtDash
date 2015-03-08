var parseStatistics = function(xml) {

    var xmlDoc= $.parseXML(xml);
    var product_info = xmlDoc.querySelector("product_info");

    var summary = xmlDoc.querySelector("summary");
    var vms = summary.querySelector("vms");
    var time = xmlDoc.querySelector("time");

    var objStatistics = {
        product_info: {
            name: product_info.querySelector("name").textContent,
            vendor: product_info.querySelector("vendor").textContent,
            full_version: product_info.querySelector("full_version").textContent
        },

        summary: {
            vms: {
                total: parseInt(vms.querySelector("total").textContent),
                active: parseInt(vms.querySelector("active").textContent)
            },
        },

        time: time.textContent
    };

    return objStatistics;
}

var statisticsComponent = React.createClass({
    render: function (){
        if (!this.props.data){
            return React.createElement(waitingComponent, null);
        }

        return React.createElement("div", null,
            React.createElement("h1", null, "Statistics"), 
            React.createElement(ReactBootstrap.Panel, {
                    header: "Product information"
                },
                React.createElement("div", null, "Name: " + this.props.data.product_info.name),
                React.createElement("br", null),
                React.createElement("div", null, "Vendor: " + this.props.data.product_info.vendor),
                React.createElement("br", null),
                React.createElement("div", null, "Version: " + this.props.data.product_info.full_version)
            ),

            React.createElement(ReactBootstrap.Panel, {
                    header: "Summary"
                },
                React.createElement("div", null, "Total VMs: " + this.props.data.summary.vms.total),
                React.createElement("br", null),
                React.createElement("div", null, "Active VMs: " + this.props.data.summary.vms.active)
            ),

            React.createElement("div", null, "Time: " + this.props.data.time)
        );
    }
})
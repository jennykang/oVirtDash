var waitingComponent = React.createClass({
    render: function(){
        return React.createElement("div", null, 
            React.createElement("h1", null, 
                React.createElement("span", {
                    className:"glyphicon glyphicon-refresh glyphicon-refresh-animate"
                }), " Loading..."
            )
        )
    }
});
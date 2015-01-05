$(document).ready(function(){
	var username = docCookies.getItem("username");
	var password = docCookies.getItem("password");
	var enginehost = docCookies.getItem("enginehost");

	alert("username: " + username + ", password: " + password + ", enginehost: " + enginehost);
	alert(window.location);

	var parseOverview = function(xml) {

        var xmlDoc= $.parseXML(xml);

        var product_info = xmlDoc.getElementsByTagName("product_info")[0];

        var summary = xmlDoc.getElementsByTagName("summary")[0];
        var vms = summary.getElementsByTagName("vms")[0];
        var time = xmlDoc.getElementsByTagName("time")[0];

        var objOverview = {
            product_info: {
                name: product_info.getElementsByTagName("name")[0].textContent,
                vendor: product_info.getElementsByTagName("vendor")[0].textContent,
                version: product_info.getElementsByTagName("version")[0].textContent
    	    },

            summary: {
                vms: {
                    total: parseInt(vms.getElementsByTagName("total")[0].textContent),
                    active: parseInt(vms.getElementsByTagName("active")[0].textContent)
                },
            },

            time: time.textContent
        };

        return objOverview;
    };


    var parseCapabilities = function(xml) {
        //TODO
        return;
    };

    var displayUIOverview = function(objOverview){
        var name = objOverview.product_info.name;
        var vendor = objOverview.product_info.vendor;
        var version = objOverview.product_info.version;
        var time = objOverview.time;
        var total = objOverview.summary.vms.total;
        var active = objOverview.summary.vms.active;
        $("#name").text(name);
        $("#vendor").text(vendor);
        $("#time").text(time);
        $("#total").text("total: " + total);
        $("#active").text("active: " + active);
    };

    var apiurl = "http://" + enginehost + "/ovirt-engine/api";
    $.ajax({
        url: apiurl,
        type: "GET",
        dataType: "text",
        username: username,
        password: password,

        success: function(data){
            alert(":)");
            var obj = parseOverview(data);
            displayUIOverview(obj);

            console.log(obj);
        },

        error: function(data){
            console.log("Got back error", data);
        }
    });



	$.ajax({
		url: apiurl + "/capabilities",
		type: "GET",
		dataType: "text",
		username: username,
		password: password,

		success: function(data){

		},

		error: function(data){

		}
	}); 
});


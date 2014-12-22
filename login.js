//http://admin%40internal:jk951229@localhost:8080/ovirt-engine/api
$(document).ready(function(){
	var button = $("#submitButton");


	button.on('click', function(eventOptions){
		eventOptions.preventDefault(); //prevents the page from refreshing

		var username = $("#inputUsername").val();
		var password = $("#inputPassword").val();
		var enginehost = $("#inputEngine").val();

		if(username.length === 0){
			$(".alert-danger").removeClass("collapse");
			$(".errorText").text("Please input valid username");
			return;
		}

		if(password.length === 0){
			$(".alert-danger").removeClass("collapse");
			$(".errorText").text("Please input valid password");
			return;
		}

		if(enginehost.length === 0){
			$(".alert-danger").removeClass("collapse");
			$(".errorText").text("Please input valid engine host");
			return;
		}


		var apiurl = "http://" + username + "%40internal:" + password + "@" + enginehost + "/ovirt-engine/";
		
		//alert(apiurl);
	});
});



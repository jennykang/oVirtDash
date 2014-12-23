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


		var apiurl = "https://" + username + "%40internal:" + password + "@" + enginehost + "/ovirt-engine/";
		$.ajax({
			url: apiurl,
			type: "GET",
			dataType: "xml",

			success: function(data){
				$(".alert-success").removeClass("collapse");
				alert(":)");
			},

			error: function(data){
				console.log("Got back error", data);
				$(".alert-danger").removeClass("collapse");
				$(".errorText").text(data.statusText);
				return;
			}
		})
		alert(apiurl);
	});
});




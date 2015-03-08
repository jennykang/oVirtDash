$(document).ready(function(){
	var button = $("#submitButton");


	if(docCookies.hasItem("username")){
		$("#inputUsername").val(docCookies.getItem("username"));
	}

	if(docCookies.hasItem("password")){
		$("#inputPassword").val(docCookies.getItem("password"));
	}

	if(docCookies.hasItem("enginehost")){
		$("#inputEngine").val(docCookies.getItem("enginehost"));
	}

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


		var apiurl = "http://" + /* username + ":" + password + "@" +*/ enginehost + "/ovirt-engine/api";

		jQuery.support.cors = true;
		function make_base_auth(user, password) {
			var tok = user + ':' + password;
			var hash = btoa(tok);

			return "Basic " + hash;
		}

		$.ajax({
			url: apiurl,
			type: "GET",
			dataType: "xml",
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", make_base_auth(username, password));
			},

			success: function(data){
				$(".alert-success").removeClass("collapse");
				docCookies.setItem("username", username);
				docCookies.setItem("password", password);
				docCookies.setItem("enginehost", enginehost);

				window.location = "index.html";
			},

			error: function(data){
				console.log("Got back error", data);
				$(".alert-danger").removeClass("collapse");
				$(".errorText").text(data.statusText);
				return;
			}
		})
	});
});

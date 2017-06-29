function internalErrorAlert() {
	alert("There was an internal server error. Please try again later.");
}


function customAjax(method, url, data, successCallback, failCallback) {
	$.ajax({
	    type: method,
	    url: url,
	    data: data,
	    dataType: "json",
	    contentType: "application/x-www-form-urlencoded"

	})
	.done(function(data) {
	    if(data.type == 'success'){
	    	if(successCallback) {
	    		successCallback(data);
	    	}
	    }
	    else {
	    	if(failCallback) {
	    		failCallback(data);
	    	}
	        else {
	        	alert(data.error);
	        }
	    }

	})
	.fail(function(data) {
	    alert("Internal Server Error");
	    console.log(data);
	});
}

function escapeHtml(text) {
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};

	return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

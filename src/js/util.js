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

// Borrowed from Kevin Ennis (http://kevvv.in/currying-in-javascript/)
// Permission pending [email sent]
function curry( fn ) {
	var arity = fn.length;

	return (function resolver() {
		var memory = Array.prototype.slice.call( arguments );
		return function() {
			var local = memory.slice(), next;
			Array.prototype.push.apply( local, arguments );
			next = local.length >= arity ? fn : resolver;
			return next.apply( null, local );
		};
	}());
}
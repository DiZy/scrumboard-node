module.exports = function(app) {

	app.post('/tasks/create', hasPermissions, function(req, res) {

	});



	function hasPermissions(req, res, next) {
		if(req.session.userId) {
			var teamId = req.body.teamId;
			
		}
		else {

		}

	}

}
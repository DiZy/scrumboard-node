team = (function() {
	var _teamJson;
    

    return {
    	initialize: function(teamjson) {
    		_teamJson = teamjson;
    		board.render(teamjson);
    	}
    }

})();
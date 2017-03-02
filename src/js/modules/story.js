var story = function() {
	var _storyJson;

    function render() {
    	//render each task in appropriate spot
    }

    return {
    	initialize: function(storyJson) {
    		_storyJson = storyJson;
    		render();
    	}

    }
}
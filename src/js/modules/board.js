board = (function(){

    var _teamJson;

    function renderStories() {
    	var storyList = getListOfStoryJson();
    	for(var i = 0; i < storyList.length; i++) {
    		var story = story.initialize(storyList[i]);
    	}

    }

    function getListOfStoryJson() {
    	return [];
    }

    return {
        render: function(teamjson) {
        	_teamJson = teamjson;
        	renderStories();
        }
    }

})();
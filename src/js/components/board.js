board = (function(){

    var _teamJson;

    function renderHeader() {
        var boardDiv = $('<div>').attr('id', 'board').addClass('container').appendTo('body');
        boardDiv[0].innerHTML = '<div class="row">' +
                            '<div class="col-xs-2 progresscol"><h4>Story</h4></div>' +
                            '<div class="col-xs-4 progresscol"><h4>Not started</h4></div>' +
                            '<div class="col-xs-2 progresscol"><h4>In Progress</h4></div>' +
                            '<div class="col-xs-2 progresscol"><h4>To Be Verified</h4></div>' +
                            '<div class="col-xs-2 progresscol"><h4>Done</h4></div>' +
                        '</div>';
    }

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
            renderHeader();
        	renderStories();
        },

        testFunctionality: function() {
            renderHeader();
            story().initialize();
            task().initialize({statusCode: 0}, $('.story'));
            task().initialize({statusCode: 0}, $('.story'));
            task().initialize({statusCode: 1}, $('.story'));
            task().initialize({statusCode: 2}, $('.story'));
            $('.progresscol').resizable({
                handles: 'e'
            });
        }
    }

})();
var story = function() {
	var _storyJson;

    function render() {
        var storyRow = $('<div>').addClass('row story');
        var leftcol = $('<div>').addClass('col-xs-2 progresscol').attr('data-column', -1).appendTo(storyRow);

        var maxColumn = 4;
        $('<div>').addClass('progress-0 col-xs-4 progresscol').attr('data-column', 0).appendTo(storyRow);
        $('<div>').addClass('progress-1 col-xs-2 progresscol').attr('data-column', 1).appendTo(storyRow);
        $('<div>').addClass('progress-2 col-xs-2 progresscol').attr('data-column', 2).appendTo(storyRow);
        $('<div>').addClass('progress-3 col-xs-2 progresscol done-col').attr('data-column', 3).appendTo(storyRow);

        var allTasks = getTasks();
        for(var i = 0; i < allTasks.length; i++) {
            var task = task();
            task.initialize(allTasks[i], storyRow);
        }

        storyRow.appendTo('#board');



    }

    function getTasks() {
        //TODO
        return [];

    }

    return {
    	initialize: function(storyJson) {
    		_storyJson = storyJson;
    		render();
    	},
    	addTask: function(name) {
    		
    	}

    }
}
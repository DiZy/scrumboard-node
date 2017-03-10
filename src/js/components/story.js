var story = function() {
	var _storyJson;

    function render() {
        var storyRow = $('<div>').addClass('row story');
        var leftcol = $('<div>').addClass('col-xs-2 progresscol').appendTo(storyRow);

        var maxColumn = 4;
        $('<div>').addClass('progress-0').addClass('col-xs-4 progresscol').appendTo(storyRow);
        $('<div>').addClass('progress-1').addClass('col-xs-2 progresscol').appendTo(storyRow);
        $('<div>').addClass('progress-2').addClass('col-xs-2 progresscol').appendTo(storyRow);
        $('<div>').addClass('progress-3').addClass('col-xs-2 progresscol').appendTo(storyRow);

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
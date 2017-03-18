var story = function() {
	var _storyJson;
    var _storyRow;

    function render() {
        _storyRow = $('<div>').addClass('row story');
        var leftcol = $('<div>').addClass('col-xs-2 progresscol').attr('data-column', -1).appendTo(_storyRow);

        var maxColumn = 4;
        $('<div>').addClass('progress-0 col-xs-4 progresscol').attr('data-column', 0).appendTo(_storyRow);
        $('<div>').addClass('progress-1 col-xs-2 progresscol').attr('data-column', 1).appendTo(_storyRow);
        $('<div>').addClass('progress-2 col-xs-2 progresscol').attr('data-column', 2).appendTo(_storyRow);
        $('<div>').addClass('progress-3 col-xs-2 progresscol done-col').attr('data-column', 3).appendTo(_storyRow);

        var allTasks = getTasks();
        for(var i = 0; i < allTasks.length; i++) {
            var task = task();
            task.initialize(allTasks[i], _storyRow);
        }

        _storyRow.appendTo('#board');



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
            var newTask = {};
            //send request to get back id to assign
            //newTask.id = 
            //_storyJson.task.push(newTask);
            //task.initialize(newTask, _storyRow);
    		
    	}

    }
}
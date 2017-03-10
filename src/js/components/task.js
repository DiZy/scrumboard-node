var task = function() {
	var _taskJson;
	var _$storyRow;

	function render() {
		var taskDiv = $('<div>').addClass('row task');

		var leftPanel = $('<div>').addClass('col-xs-2 taskpanel').text('test').appendTo(taskDiv);
		var middlePanel = $('<div>').addClass('col-xs-8 taskpanel').text('test').appendTo(taskDiv);
		var rightPanel = $('<div>').addClass('col-xs-2 taskpanel').text('test').appendTo(taskDiv);


		//if board.maxColumn == _taskJson.statusCode: dont display right arrow

		var colSelector = "." + 'progress-' + _taskJson.statusCode;
		_$storyRow.children(colSelector).append(taskDiv);
	}



    return {

    	initialize: function(taskJson, $storyRow) {
    		_taskJson = taskJson;
    		_$storyRow = $storyRow;
    		render();
    	}

        
    }
}
var task = function() {
	var _taskJson;
	var _$storyRow;

	function render() {
		var taskDiv = $('<div>').addClass('task');

		var leftPanel = $('<div>').addClass('col-xs-2 taskpanel').text('<').appendTo(taskDiv);
		var middlePanel = $('<div>').addClass('col-xs-8 taskpanel taskcenter').text('Task Name').appendTo(taskDiv);
		var rightPanel = $('<div>').addClass('col-xs-2 taskpanel').text('>').appendTo(taskDiv);


		//if board.maxColumn == _taskJson.statusCode: dont display right arrow

		var colSelector = "." + 'progress-' + _taskJson.statusCode;
		_$storyRow.children(colSelector).append(taskDiv);


		taskDiv.resizable({
			classes: {
				"ui-resizable-se": "ui-icon ui-icon-gripsmall-diagonal-se"
			},
			resize: function(e, ui) {
				$('.task').height($(this).height());
				$('.task').width($(this).width());
			}
		});
	}



    return {

    	initialize: function(taskJson, $storyRow) {
    		_taskJson = taskJson;
    		_$storyRow = $storyRow;
    		render();
    	}

        
    }
}
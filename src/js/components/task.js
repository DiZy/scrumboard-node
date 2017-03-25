var task = function() {
	var _taskJson;
	var _$storyRow;
	var _taskDiv;
	var _storyIndex;
	var _storyId;
	var _teamId;

	function render() {
		_taskDiv = $('<div>').addClass('task');

		console.log(_taskJson);
		//set size
		if(_taskJson.width){
			_taskDiv.width(_taskJson.width);
		}
		if(_taskJson.height){
			_taskDiv.height(_taskJson.height);
		}

		//add panels
		var leftPanel = $('<div>').addClass('col-xs-2 taskpanel').appendTo(_taskDiv);
		var middlePanel = $('<div>').addClass('col-xs-8 taskpanel taskcenter').appendTo(_taskDiv);
		if(_taskJson.name) {
			middlePanel.text(_taskJson.name);
		} else {
			middlePanel.text('New Task');
		}
		var rightPanel = $('<div>').addClass('col-xs-2 taskpanel').appendTo(_taskDiv);
		leftPanelInit(leftPanel, _taskJson.people);
		rightPanelInit(rightPanel, _taskJson.people);
		middlePanelInit(middlePanel);

		//if board.maxColumn == _taskJson.statusCode: dont display right arrow

		var colSelector = "." + 'progress-' + _taskJson.statusCode;
		_$storyRow.children(colSelector).append(_taskDiv);


		_taskDiv.resizable({
			handles: 'se',
			classes: {
				"ui-resizable-se": "ui-icon ui-icon-gripsmall-diagonal-se show-on-hover"
			},
			stop: function(e, ui) {
				_taskJson.width = ui.size.width;
				_taskJson.height = ui.size.height;
				//TODO: send request to save size
			}
		});
		_taskDiv.children('.ui-resizable-handle').css('display', 'none');
		//attempt at droppable
		// var dragScope = "story_" + _storyIndex;
		// _taskDiv.draggable({
		// 	scope: dragScope,
		// 	revert: "invalid",
		// 	stop: function(e, ui) {
		// 		console.log(e);
		// 		console.log(ui);
		// 	}
		// });

		_taskDiv.hover(
			//Hover in
			function() {
				// $(this).stop(false, true);
				// if($(_taskDiv).find('.hide-on-hover').length > 0) {
				// 	$(_taskDiv).find('.hide-on-hover').fadeOut( "fast", function() {
				// 		$(this).hide();
				// 		$(_taskDiv).find('.show-on-hover').fadeIn( "fast", function() {
				// 			$(this).show();
				// 		});
				// 	});
				// }
				// else {
				// 	$(_taskDiv).find('.show-on-hover').fadeIn( "fast", function() {
				// 		$(this).show();
				// 	});
				// }
				$(_taskDiv).find('.hide-on-hover').hide();
				$(_taskDiv).find('.show-on-hover').show();
			},
			//Hover out
			function() {
				// $(this).stop(false, true);
				// if($(_taskDiv).find('.show-on-hover').length > 0) {
				// 	$(_taskDiv).find('.show-on-hover').fadeOut( "fast", function() {
				// 		$(this).hide();
				// 		$(_taskDiv).find('.hide-on-hover').fadeIn( "fast", function() {
				// 			$(this).show();
				// 		});
				// 	});
				// }
				// else {
				// 	$(_taskDiv).find('.hide-on-hover').fadeIn( "fast", function() {
				// 		$(this).show();
				// 	});
				// }

				$(_taskDiv).find('.show-on-hover').hide();
				$(_taskDiv).find('.hide-on-hover').show();
			}
		);
	}

	function leftPanelInit($leftPanel, people) {
		var middleArrow = $('<span>').addClass('arrow glyphicon glyphicon-menu-left show-on-hover').css('display', 'none').appendTo($leftPanel);

		if(people && people.length > 0) {
			var topPerson = $('<div>').addClass('people-row hide-on-hover').text(people[0]).appendTo($leftPanel);
		}
		if(people && people.length > 1) {
			var bottomPerson = $('<div>').addClass('people-row hide-on-hover').text(people[1]).appendTo($leftPanel);
		}

		middleArrow.click(function() {
			updateStatusCode(parseInt(_taskJson.statusCode) - 1);
		});

	}

	function rightPanelInit($rightPanel, people, isLastColumn) {
		var middleArrow = $('<span>').addClass('arrow glyphicon glyphicon-menu-right show-on-hover').css('display', 'none').appendTo($rightPanel);
		var deleteButton = $('<span>').addClass('delete glyphicon glyphicon-remove show-on-hover').css('display', 'none').appendTo($rightPanel);

		if(people && people.length > 0) {
			var topPerson = $('<div>').addClass('people-row hide-on-hover').text(people[2]).appendTo($rightPanel);
		}
		if(people && people.length > 1) {
			var bottomPerson = $('<div>').addClass('people-row hide-on-hover').text(people[3]).appendTo($rightPanel);
		}

		middleArrow.click(function() {
			updateStatusCode(parseInt(_taskJson.statusCode) + 1);
		});

		deleteButton.click(removeTask);

	}

	function updateStatusCode(newStatusCode) {
		$.ajax({
		    type: 'PUT',
		    url: '/moveTask',
		    data: {
		    	teamId: _teamId,
		        storyId: _storyId,
		        taskId: _taskJson._id,
		        newStatusCode: newStatusCode
		    },
		    dataType: "json",
		    contentType: "application/x-www-form-urlencoded"

		})
		.done(function(data) {
		    console.log(data);
		    if(data.type == 'success'){
		    	console.log(data.result);
		       _taskJson.statusCode = data.newStatusCode;
		       _taskDiv.remove();
		       render();
		    }
		    else {
		        alert(data.error);
		    }

		})
		.fail(function(data) {
		    alert("Internal Server Error");
		    console.log(data);
		});
	}

	function removeTask() {
		$.ajax({
		    type: 'DELETE',
		    url: '/deleteTask',
		    data: {
		    	teamId: _teamId,
		        storyId: _storyId,
		        taskId: _taskJson._id
		    },
		    dataType: "json",
		    contentType: "application/x-www-form-urlencoded"

		})
		.done(function(data) {
		    console.log(data);
		    if(data.type == 'success'){
		       _taskDiv.remove();
		    }
		    else {
		        alert(data.error);
		    }

		})
		.fail(function(data) {
		    alert("Internal Server Error");
		    console.log(data);
		});
	}

	function editTask() {
		editTaskModal.open(_taskJson, function(newTaskJson) {
			$.ajax({
                type: 'PUT',
                url: '/editTask',
                data: {
                	teamId: _teamId,
                    storyId: _storyId,
                    taskId: _taskJson._id,
                    newTaskJson: newTaskJson
                },
                dataType: "json",
                contentType: "application/x-www-form-urlencoded"

            })
            .done(function(data) {
                console.log(data);
                if(data.type == 'success'){
                    _taskJson = data.task;
                    _taskDiv.children('.taskcenter').text(_taskJson.name);

                    var leftPanelDO = _taskDiv.children('.taskpanel')[0];
                    var rightPanelDO = _taskDiv.children('.taskpanel')[2];
                    leftPanelDO.innerHTML = "";
                    rightPanelDO.innerHTML = "";

                    leftPanelInit($(leftPanelDO), _taskJson.people);
                    rightPanelInit($(rightPanelDO), _taskJson.people);
                }
                else {
                    alert(data.error);
                }

            })
            .fail(function(data) {
                alert("Internal Server Error");
                console.log(data);
            });
		});
	}

	function middlePanelInit($middlePanel) {
		var editCover = $("<div>").addClass('editCover show-on-hover').css('display', 'none').appendTo($middlePanel);
		var editIcon = $("<span>").addClass('glyphicon glyphicon-pencil').appendTo(editCover);

		editCover.click(editTask);
	}


    return {

    	initialize: function(taskJson, $storyRow, storyIndex, storyId, teamId) {
    		_taskJson = taskJson;
    		_$storyRow = $storyRow;
    		_storyIndex = storyIndex;
    		_storyId = storyId;
    		_teamId = teamId;
    		render();
    	}

        
    }
}
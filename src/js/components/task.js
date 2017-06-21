var task = function() {
	var _taskJson;
	var _$storyRow;
	var _taskDiv;
	var _storyId;
	var _teamId;

	function render() {
		_taskDiv = $('<div>').addClass('task');

		var colSelector = ".progresscol[data-column=" + _taskJson.statusCode + "]";
		_$storyRow.children(colSelector).append(_taskDiv);

		//add panels
		var taskPanels = $('<div>').addClass('col-xs-12 task-panels').appendTo(_taskDiv);
		var leftPanel = $('<div>').addClass('taskpanel').appendTo(taskPanels);
		var middlePanel = $('<div>').addClass('taskpanel taskcenter').appendTo(taskPanels);
		if(_taskJson.name) {
			middlePanel.text(_taskJson.name);
		} else {
			middlePanel.text('New Task');
		}
		var rightPanel = $('<div>').addClass('taskpanel').appendTo(taskPanels);
		$('<br>').appendTo(_taskDiv);
		var peopleRow = $('<div>').addClass('people-row').appendTo(_taskDiv);

		leftPanelInit(leftPanel);
		rightPanelInit(rightPanel);
		middlePanelInit(middlePanel);
		peopleRowInit(peopleRow);

		setDefaultSize(leftPanel, middlePanel, rightPanel, peopleRow);
		makeResizable(leftPanel, middlePanel, rightPanel, peopleRow);


		_taskDiv.droppable({
			accept: '.person',
			drop: personDropHandler
		});

		_taskDiv.draggable({
			revert: true,
			handle: ".taskcenter"
		});

		_taskDiv.attr("data-taskId", _taskJson._id);
		_taskDiv.attr("data-storyId", _storyId);

		_taskDiv.hover(
			//Hover in
			function() {
				$(_taskDiv).find('.hide-on-hover').hide();
				$(_taskDiv).find('.show-on-hover').show();
				$(_taskDiv).attr('title', "Notes:\n" + _taskJson.notes);
			},
			//Hover out
			function() {
				$(_taskDiv).find('.show-on-hover').hide();
				$(_taskDiv).find('.hide-on-hover').show();
			}
		);


	}

	function leftPanelInit($leftPanel, people) {
		var middleArrow = $('<span>').addClass('arrow glyphicon glyphicon-menu-left show-on-hover').css('display', 'none');
		if(_taskJson.statusCode != 0) {
			middleArrow.appendTo($leftPanel);
		}

		middleArrow.click(function() {
			updateStatusCode(parseInt(_taskJson.statusCode) - 1);
		});

	}

	function middlePanelInit($middlePanel) {
		var editCover = $("<div>").addClass('editCover show-on-hover').css('display', 'none').appendTo($middlePanel);
		var editIcon = $("<span>").addClass('glyphicon glyphicon-pencil').appendTo(editCover);

		editCover.click(editTask);

		var points = $('<div>').addClass('points').text(_taskJson.points).appendTo($middlePanel);
	}

	function rightPanelInit($rightPanel) {
		var middleArrow = $('<span>').addClass('arrow glyphicon glyphicon-menu-right show-on-hover').css('display', 'none');
		var deleteButton = $('<span>').addClass('delete glyphicon glyphicon-remove show-on-hover').css('display', 'none').appendTo($rightPanel);

		if(_taskJson.statusCode != _$storyRow.children('.progresscol').length - 2) {
			middleArrow.appendTo($rightPanel)
		}

		middleArrow.click(function() {
			updateStatusCode(parseInt(_taskJson.statusCode) + 1);
		});

		deleteButton.click(removeTask);

	}

	function peopleRowInit($peopleRow) {
		$('<div>').addClass('peopleMargin').appendTo($peopleRow);
		var peopleDiv = $('<div>').addClass('peopleDiv').appendTo($peopleRow);
		$('<div>').addClass('peopleMargin').appendTo($peopleRow);

		var people = team.getPeopleForTask(_taskJson._id);
		people.forEach(function(p) {
			person().render(p, peopleDiv);
		});
	}

	function setDefaultSize(leftPanel, middlePanel, rightPanel, peopleRow) {
		if(_taskJson.width){
			middlePanel.width(_taskJson.width);
			peopleRow.children('.peopleDiv').width(_taskJson.width);
		}
		if(_taskJson.height){
			leftPanel.height(_taskJson.height);
			middlePanel.height(_taskJson.height);
			rightPanel.height(_taskJson.height);
		}
	}

	function makeResizable(leftPanel, middlePanel, rightPanel, peopleRow) {
		middlePanel.resizable({
			handles: 'se',
			classes: {
				"ui-resizable-se": "ui-icon ui-icon-gripsmall-diagonal-se show-on-hover"
			},
			resize: function(e, ui) {
				_taskJson.width = ui.size.width;
				_taskJson.height = ui.size.height;

				setDefaultSize(leftPanel, middlePanel, rightPanel, peopleRow);
			},
			stop: function(e, ui) {
				$.ajax({
				    type: 'PUT',
				    url: '/updateTaskStyling',
				    data: {
				    	teamId: _teamId,
				        storyId: _storyId,
				        taskId: _taskJson._id,
				        width: ui.size.width,
				        height: ui.size.height
				    },
				    dataType: "json",
				    contentType: "application/x-www-form-urlencoded"

				})
				.done(function(data) {
				    if(data.type == 'success'){
				    	//Socket handles
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
		});

		_taskDiv.children('.ui-resizable-handle').css('display', 'none');
	}

	function personDropHandler(event, ui) {
		var personDiv = ui.draggable;
		var divToRenderTo = _taskDiv.children('.people-row').children('.peopleDiv');
		team.assignPersonToTask(personDiv.attr('data-person'), _taskJson._id, _storyId);
		return true;
	}

	function getPersonRenderDiv() {
		var toReturn;
		_taskDiv.find('.people-row').each(function(index, pplRow) {
			console.log($(pplRow).html());
			if(!$(pplRow).html()) {
				toReturn = $(pplRow);
				return;
			}
		});
		return toReturn;
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
		       //Socket handles
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
		    	//Socket handles
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
		if (_taskDiv.hasClass("ui-draggable-dragging")) {
			return;
		}
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
                    //Socket handles
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


    return {

    	initialize: function(taskJson, $storyRow, storyId, teamId) {
    		_taskJson = taskJson;
    		_$storyRow = $storyRow;
    		_storyId = storyId;
    		_teamId = teamId;
    		render();
    	},
		getPeopleDiv: function() {
			return _taskDiv.children('.people-row').children('.peopleDiv');
		},
		handleRemove: function() {
			_taskDiv.find('.person').each(function(index, personDiv) {
				team.assignPersonToTask($(personDiv).attr('data-person'), "", _storyId);
			});
			_taskDiv.remove();
		},
		handleEdit: function(taskData) {
			_taskJson = taskData;
			var middlePanel = _taskDiv.children('.task-panels').children('.taskcenter');
			middlePanel.text(_taskJson.name);
			middlePanelInit(middlePanel);
		},
		/** Asks the server to move (change the status code) the task **/
		requestStatusCodeChange: updateStatusCode,
		/** Moves the task UI (called in response to the server) */
		handleMove: function(newStatusCode) {
			_taskJson.statusCode = newStatusCode;
			_taskDiv.remove();
			render();
		},
		handleRestyle: function(height, width) {
			_taskJson.width = width;
			_taskJson.height = height;

			var leftPanel = $(_taskDiv.children('.task-panels').children()[0]);
			var middlePanel = $(_taskDiv.children('.task-panels').children()[1]);
			var rightPanel = $(_taskDiv.children('.task-panels').children()[2]);
			var peopleRow = $(_taskDiv.children('.people-row'));

			setDefaultSize(leftPanel, middlePanel, rightPanel, peopleRow);
		}
        
    }
}
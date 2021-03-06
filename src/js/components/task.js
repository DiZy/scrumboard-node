let task = function() {
	let _taskJson;
	let _$storyRow;
	let _taskDiv;
	let _storyId;
	let _teamId;
	let _taskUrl;

	function render() {
		_taskDiv = $('<div>').addClass('task');

		let colSelector = ".progresscol[data-column=" + _taskJson.statusCode + "]";
		_$storyRow.children(colSelector).append(_taskDiv);

		//add panels
		let taskPanels = $('<div>').addClass('col-xs-12 task-panels').appendTo(_taskDiv);
		let leftPanel = $('<div>').addClass('taskpanel').appendTo(taskPanels);
		let middlePanel = $('<div>').addClass('taskpanel taskcenter').appendTo(taskPanels);
		if(_taskJson.name) {
			middlePanel.text(_taskJson.name);
		} else {
			middlePanel.text('New Task');
		}
		let rightPanel = $('<div>').addClass('taskpanel').appendTo(taskPanels);
		$('<br>').appendTo(_taskDiv);
		let peopleRow = $('<div>').addClass('people-row').appendTo(_taskDiv);

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
		let middleArrow = $('<span>').addClass('arrow glyphicon glyphicon-menu-left show-on-hover').css('display', 'none');
		if(_taskJson.statusCode !== 0) {
			middleArrow.appendTo($leftPanel);
		}

		middleArrow.click(function() {
			updateStatusCode(parseInt(_taskJson.statusCode) - 1);
		});

	}

	function middlePanelInit($middlePanel) {
		let editCover = $("<div>").addClass('editCover show-on-hover').css('display', 'none').appendTo($middlePanel);
		let editIcon = $("<span>").addClass('glyphicon glyphicon-pencil').appendTo(editCover);

		editCover.click(editTask);

		let points = $('<div>').addClass('points').text(_taskJson.points).appendTo($middlePanel);
	}

	function rightPanelInit($rightPanel) {
		let middleArrow = $('<span>').addClass('arrow glyphicon glyphicon-menu-right show-on-hover').css('display', 'none');
		let deleteButton = $('<span>').addClass('delete glyphicon glyphicon-remove show-on-hover').css('display', 'none').appendTo($rightPanel);

		if(_taskJson.statusCode !== _$storyRow.children('.progresscol').length - 2) {
			middleArrow.appendTo($rightPanel)
		}

		middleArrow.click(function() {
			updateStatusCode(parseInt(_taskJson.statusCode) + 1);
		});

		deleteButton.click(removeTask);

	}

	function peopleRowInit($peopleRow) {
		$('<div>').addClass('peopleMargin').appendTo($peopleRow);
		let peopleDiv = $('<div>').addClass('peopleDiv').appendTo($peopleRow);
		$('<div>').addClass('peopleMargin').appendTo($peopleRow);

		let people = team.getPeopleForTask(_taskJson._id);
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
				    url: _taskUrl + '/styling',
				    data: {/*
				    	teamId: _teamId,
				        storyId: _storyId,
				        taskId: _taskJson._id,*/
				        width: ui.size.width,
				        height: ui.size.height
				    },
				    dataType: "json",
				    contentType: "application/x-www-form-urlencoded"

				})
				.done(function(data) {
				    if(data.type === 'success'){
				    	//Socket handles
				    }
				    else {
				        alert(data.error);
				    }

				})
				.fail(function(data) {
				    alert("Internal Server Error");
				    console.error(data);
				});
			}
		});

		_taskDiv.children('.ui-resizable-handle').css('display', 'none');
	}

	function personDropHandler(event, ui) {
		let personDiv = ui.draggable;
		let divToRenderTo = _taskDiv.children('.people-row').children('.peopleDiv');
		team.assignPersonToTask(personDiv.attr('data-person'), _taskJson._id, _storyId);
		return true;
	}

	function getPersonRenderDiv() {
		let toReturn = null;
		_taskDiv.find('.people-row').each(function(index, pplRow) {
			if(!$(pplRow).html()) {
				toReturn = $(pplRow);
			}
		});
		return toReturn;
	}

	function updateStatusCode(newStatusCode) {
		$.ajax({
		    type: 'PATCH',
		    url: _taskUrl + '/move',
		    data: {/*
		    	teamId: _teamId,
		        storyId: _storyId,
		        taskId: _taskJson._id,*/
		        newStatusCode: newStatusCode
		    },
		    dataType: "json",
		    contentType: "application/x-www-form-urlencoded"
		})
		.done(function(data) {
		    if(data.type === 'success'){
		       //Socket handles
		    }
		    else {
		        alert(data.error);
		    }
		})
		.fail(function(data) {
		    alert("Internal Server Error");
		    console.error(data);
		});
	}

	function removeTask() {
		$.ajax({
		    type: 'DELETE',
		    url: _taskUrl + '/delete',
		    /*data: {
		    	teamId: _teamId,
		        storyId: _storyId,
		        taskId: _taskJson._id
		    },*/
		    dataType: "json",
		    contentType: "application/x-www-form-urlencoded"

		})
		.done(function(data) {
		    if(data.type === 'success'){
		    	//Socket handles
		    }
		    else {
		        alert(data.error);
		    }

		})
		.fail(function(data) {
		    alert("Internal Server Error");
		    console.error(data);
		});
	}

	function editTask() {
		if (_taskDiv.hasClass("ui-draggable-dragging")) {
			return;
		}
		editTaskModal.open(_taskJson, function(newTaskJson) {
			$.ajax({
                type: 'PATCH',
                url: _taskUrl,
                data: {
                	/*teamId: _teamId,
                    storyId: _storyId,
                    taskId: _taskJson._id,*/
                    newTaskJson: newTaskJson
                },
                dataType: "json",
                contentType: "application/x-www-form-urlencoded"

            })
            .done(function(data) {
                if(data.type === 'success'){
                    //Socket handles
                }
                else {
                    alert(data.error);
                }

            })
            .fail(function(data) {
                alert("Internal Server Error");
                console.error(data);
            });
		});
	}


    return {

    	initialize: function(taskJson, $storyRow, storyId, teamId) {
    		_taskJson = taskJson;
    		_$storyRow = $storyRow;
    		_storyId = storyId;
    		_teamId = teamId;
    		_taskUrl = '/teams/' + teamId + '/stories/' +storyId + '/tasks/' + taskJson._id;
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
			let middlePanel = _taskDiv.children('.task-panels').children('.taskcenter');
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

			let leftPanel = $(_taskDiv.children('.task-panels').children()[0]);
			let middlePanel = $(_taskDiv.children('.task-panels').children()[1]);
			let rightPanel = $(_taskDiv.children('.task-panels').children()[2]);
			let peopleRow = $(_taskDiv.children('.people-row'));

			setDefaultSize(leftPanel, middlePanel, rightPanel, peopleRow);
		}
        
    }
};
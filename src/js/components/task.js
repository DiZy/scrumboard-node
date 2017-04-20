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
		var peopleRow = $('<div>').addClass('people-row').appendTo(_taskDiv);

		leftPanelInit(leftPanel);
		rightPanelInit(rightPanel);
		middlePanelInit(middlePanel);
		peopleRowInit(peopleRow);

		var colSelector = "." + 'progress-' + _taskJson.statusCode;
		_$storyRow.children(colSelector).append(_taskDiv);

		makeResizable();


		_taskDiv.droppable({
			accept: '.person',
			drop: handlePersonDrop
		});

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
				$(_taskDiv).attr('title', "Notes:\n" + _taskJson.notes);
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
		var middleArrow = $('<span>').addClass('arrow glyphicon glyphicon-menu-left show-on-hover').css('display', 'none');
		if(_taskJson.statusCode != 0) {
			middleArrow.appendTo($leftPanel);
		}
		var topPerson = $('<div>').addClass('people-row hide-on-hover').appendTo($leftPanel);
		var bottomPerson = $('<div>').addClass('people-row hide-on-hover').appendTo($leftPanel);

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

		if(_taskJson.statusCode != 3) {
			middleArrow.appendTo($rightPanel)
		}

		var topPerson = $('<div>').addClass('people-row hide-on-hover').appendTo($rightPanel);
		var bottomPerson = $('<div>').addClass('people-row hide-on-hover').appendTo($rightPanel);

		middleArrow.click(function() {
			updateStatusCode(parseInt(_taskJson.statusCode) + 1);
		});

		deleteButton.click(removeTask);

	}

	function peopleRowInit($peopleRow) {
		$('<div>').addClass('col-xs-2').appendTo($peopleRow);
		var peopleDiv = $('<div>').addClass('col-xs-8 peopleDiv').appendTo($peopleRow);
		$('<div>').addClass('col-xs-2').appendTo($peopleRow);

		var people = team.getPeopleForTask(_taskJson._id);
		people.forEach(function(p) {
			person().render(p, peopleDiv);
		});
	}

	function makeResizable() {
		_taskDiv.resizable({
			handles: 'se',
			classes: {
				"ui-resizable-se": "ui-icon ui-icon-gripsmall-diagonal-se show-on-hover"
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
				    	_taskJson.width = ui.size.width;
						_taskJson.height = ui.size.height;
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

	function handlePersonDrop(event, ui) {
		var personDiv = ui.draggable;
		var divToRenderTo = _taskDiv.children('.people-row').children('.peopleDiv');
		if(divToRenderTo.children('.person').length == 4) {
			return false;
		}
		team.assignPerson(personDiv, _taskJson._id, divToRenderTo);
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
		    	var peopleDiv = $('#unassignedPeople');
		    	_taskDiv.find('.person').each(function(index, personDiv) {
		    		console.log(personDiv);
		    		team.assignPerson($(personDiv), "", peopleDiv);
		    	});
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

                    leftPanelInit($(leftPanelDO));
                    rightPanelInit($(rightPanelDO));
                    middlePanelInit(_taskDiv.children('.taskcenter'));
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
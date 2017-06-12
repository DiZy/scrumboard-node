var story = function() {
	var _storyJson;
    var _storyRow;
    var _storySticky;
    var _taskObjMap;
    var _storiesSection;
    var _columnNames;
    var STORY_COLUMN = -1;

    function stickyDropHandler(e, ui) {
        var newStatusCode = $(this).attr("data-column");
        var droppedSticky = ui.helper;
        var stickyStoryId = droppedSticky.attr("data-storyId");
        if (stickyStoryId !== _storyJson._id) { // The dropped sticky doesn't belong to this row, so cancel the drag
            return false;
        }
        if (droppedSticky.hasClass("story-descr")){ // Sticky is a story
            updateStatusCode(newStatusCode);
        } else { // Sticky is a task
            if (newStatusCode === STORY_COLUMN) { // Cannot drop a task into the story column
                return false;
            }
            var stickyTaskId = droppedSticky.attr("data-taskId");
            _taskObjMap[stickyTaskId].requestStatusCodeChange(newStatusCode);
        }
        return true;
    }

    function renderStorySticky() {
        _storySticky = $("<div>").addClass('task story-descr');
        _storySticky.attr("data-storyId", _storyJson._id);
        _storySticky.draggable({
            revert: true,
            handle: ".taskcenter"
        });

        var colSelector = "." + 'progresscol[data-column=' + _storyJson.statusCode + ']';
        _storyRow.children(colSelector).append(_storySticky);

        //Add Panels
        var storyPanels = $('<div>').addClass('col-xs-12 task-panels').appendTo(_storySticky);
        var leftPanel = $('<div>').addClass('taskpanel').appendTo(storyPanels);
        var middlePanel = $('<div>').addClass('taskpanel taskcenter story-sticky').appendTo(storyPanels);
        middlePanel.text(_storyJson.name);
        var rightPanel = $('<div>').addClass('taskpanel').appendTo(storyPanels);
        leftPanelInit(leftPanel);
        rightPanelInit(rightPanel);
        middlePanelInit(middlePanel);

        _storySticky.hover(
            //Hover in
            function() {
                $(this).find('.hide-on-hover').hide();
                $(this).find('.show-on-hover').show();
            },
            //Hover out
            function() {
                $(this).find('.show-on-hover').hide();
                $(this).find('.hide-on-hover').show();
            }
        );


        var addTaskButton = $('<button>').text('Add task').addClass('btn btn-default addTaskButton');
        addTaskButton.addClass('show-on-hover');
        addTaskButton.css('display', 'none');
        addTaskButton.appendTo(_storySticky);


        addTaskButton.click(addTaskToStory);
    }

    function render() {
        _storyRow = $('<div>').addClass('row story');

        var headerCols = $('#boardHeader>.progresscol'); 

        var storyColumn = $('<div>').addClass('progresscol').attr('data-column', STORY_COLUMN).appendTo(_storyRow);
        storyColumn.droppable({
            accept: '.task',
            drop: stickyDropHandler
        });
        storyColumn.width($(headerCols[0]).width() + 1);

        var cols = [];
        for(var i = 0; i < _columnNames.length; i++) {
            var newColumn = $('<div>').addClass('progresscol').attr('data-column', i).appendTo(_storyRow);
            newColumn.droppable({
                accept: '.task',
                drop: stickyDropHandler
            });
            newColumn.width($(headerCols[i + 1]).width() + 1);
            if(i == _columnNames.length - 1) {
                newColumn.addClass('done-col');
            }
            cols.push(newColumn);
        }

        renderStorySticky();

        var allTasks = _storyJson.tasks;
        _taskObjMap = {};
        for(var i = 0; i < allTasks.length; i++) {
            var taskObj = task();
            var taskData = allTasks[i];
            _taskObjMap[taskData._id] = taskObj;
            taskObj.initialize(taskData, _storyRow, _storyJson._id, _storyJson.teamId);
        }

        _storyRow.appendTo(_storiesSection);
    }

    function leftPanelInit($leftPanel, people) {
        var middleArrow = $('<span>').addClass('arrow glyphicon glyphicon-menu-left show-on-hover').css('display', 'none');
        if(_storyJson.statusCode != -1) {
            middleArrow.appendTo($leftPanel);
        }
        middleArrow.click(function() {
            updateStatusCode(parseInt(_storyJson.statusCode) - 1);
        });

    }

    function middlePanelInit($middlePanel) {
        var editCover = $("<div>").addClass('editCover show-on-hover').css('display', 'none').appendTo($middlePanel);
        var editIcon = $("<span>").addClass('glyphicon glyphicon-pencil').appendTo(editCover);

        editCover.click(editStory);

        var points = $('<div>').addClass('points').text(_storyJson.points).appendTo($middlePanel);

    }

    function rightPanelInit($rightPanel, people) {
        var middleArrow = $('<span>').addClass('arrow glyphicon glyphicon-menu-right show-on-hover').css('display', 'none');
        var deleteButton = $('<span>').addClass('delete glyphicon glyphicon-remove show-on-hover').css('display', 'none').appendTo($rightPanel);

        if(_storyJson.statusCode != _columnNames.length - 1) {
            middleArrow.appendTo($rightPanel)
        }

        middleArrow.click(function() {
            updateStatusCode(parseInt(_storyJson.statusCode) + 1);
        });

        deleteButton.click(function() {
            var confirmation = confirm('Are you sure you want to delete this story and all its tasks?');
            if(confirmation) {
                removeStory();
            }
        });

    }

    function updateStatusCode(newStatusCode) {
        $.ajax({
            type: 'PUT',
            url: '/moveStory',
            data: {
                teamId: _storyJson.teamId,
                storyId: _storyJson._id,
                newStatusCode: newStatusCode
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

    function editStory() {
        var oldTeamId = _storyJson.teamId;
        editStoryModal.open(oldTeamId, _storyJson, function(newStoryJson) {
            $.ajax({
                type: 'PUT',
                url: '/editStory',
                data: {
                    teamId: oldTeamId,
                    newStoryJson: newStoryJson
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
        });
    }

    function removeStory() {
        $.ajax({
            type: 'DELETE',
            url: '/deleteStory',
            data: {
                teamId: _storyJson.teamId,
                storyId: _storyJson._id
            },
            dataType: "json",
            contentType: "application/x-www-form-urlencoded"

        })
        .done(function(data) {
            console.log(data);
            if(data.type == 'success'){
                //Handled by Socket
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

    function addTaskToStory() {
        editTaskModal.open(undefined, function(taskJson) {
            $.ajax({
                type: 'POST',
                url: '/addTask',
                data: {
                    teamId: _storyJson.teamId,
                    storyId: _storyJson._id,
                    name: taskJson.name,
                    points: taskJson.points,
                    notes: taskJson.notes
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
    	initialize: function(storyJson, storiesSection, columnNames) {
    		_storyJson = storyJson;
            _storiesSection = storiesSection;
            _columnNames = columnNames;
    		render();
    	},
        handleRemove: function() {
            _storyRow.remove();
        },
        handleEdit: function(storyData) {
            _storyJson = storyData;
            _storyRow.find('.story-sticky').text(_storyJson.name);
            middlePanelInit(_storyRow.find('.story-sticky'));
        },
        handleMove: function(newStatusCode) {
            _storyJson.statusCode = newStatusCode;
            _storyRow.find(".story-descr").remove()
            renderStorySticky();
        },
        handleAddTask: function(taskData) {
            var taskObj = task();
            _taskObjMap[taskData._id] = taskObj;
            taskObj.initialize(taskData, _storyRow, _storyJson._id, _storyJson.teamId);
        },
        handleRemoveTask: function(taskId) {
            _taskObjMap[taskId].handleRemove();
        },
        handleEditTask: function(taskData) {
            _taskObjMap[taskData._id].handleEdit(taskData);
        },
        handleMoveTask: function(taskId, newStatusCode) {
            _taskObjMap[taskId].handleMove(newStatusCode);
        },
        handleRestyleTask: function(taskId, height, width) {
            _taskObjMap[taskId].handleRestyle(height, width);
        },
        getPeopleDivForTask: function(taskId) {
            return _taskObjMap[taskId].getPeopleDiv();
        }

    }
}
var story = function() {
	var _storyJson;
    var _storyRow;
    var _index;
    var _storySticky;
    var _taskObjMap;

    function render() {
        _storyRow = $('<div>').addClass('row story').attr('data-story', _index);
        var leftcol = $('<div>').addClass('col-xs-2 progresscol').attr('data-column', -1).appendTo(_storyRow);

        //add panels
        _storySticky = $("<div>").addClass('task story-descr');
        var leftPanel = $('<div>').addClass('col-xs-2 taskpanel').appendTo(_storySticky);
        var middlePanel = $('<div>').addClass('col-xs-8 taskpanel taskcenter story-sticky').appendTo(_storySticky);
        middlePanel.text(_storyJson.name);
        var rightPanel = $('<div>').addClass('col-xs-2 taskpanel').appendTo(_storySticky);
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


        var addTaskButton = $('<button>').text('Add task').addClass('btn btn-default addTaskButton').appendTo(leftcol);
        addTaskButton.addClass('show-on-hover');
        addTaskButton.css('display', 'none');
        addTaskButton.appendTo(_storySticky);


        addTaskButton.click(addTaskToStory);

        // var dropScope = "story_" + _index;
        var maxColumn = 4;
        var cols = [];
        cols.push($('<div>').addClass('progress-0 col-xs-4 progresscol').attr('data-column', 0).appendTo(_storyRow));
        cols.push($('<div>').addClass('progress-1 col-xs-2 progresscol').attr('data-column', 1).appendTo(_storyRow));
        cols.push($('<div>').addClass('progress-2 col-xs-2 progresscol').attr('data-column', 2).appendTo(_storyRow));
        cols.push($('<div>').addClass('progress-3 col-xs-2 progresscol done-col').attr('data-column', 3).appendTo(_storyRow));
        
        //attempt at droppable
        // for(var i = 0; i < cols.length;i++) {
        //     console.log('make droppable' + cols[i]);
        //     cols[i].droppable({scope: dropScope});
        // }


        var allTasks = _storyJson.tasks;
        _taskObjMap = {};
        for(var i = 0; i < allTasks.length; i++) {
            var taskObj = task();
            var taskData = allTasks[i];
            _taskObjMap[taskData._id] = taskObj;
            taskObj.initialize(taskData, _storyRow, _index, _storyJson._id, _storyJson.teamId);
        }

        _storyRow.appendTo('#board');
        var colSelector = "." + 'progresscol[data-column=' + _storyJson.statusCode + ']';
        _storyRow.children(colSelector).append(_storySticky);



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

    function rightPanelInit($rightPanel, people, isLastColumn) {
        var middleArrow = $('<span>').addClass('arrow glyphicon glyphicon-menu-right show-on-hover').css('display', 'none');
        var deleteButton = $('<span>').addClass('delete glyphicon glyphicon-remove show-on-hover').css('display', 'none').appendTo($rightPanel);

        if(_storyJson.statusCode != 3) {
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
        editStoryModal.open(_storyJson, function(newStoryJson) {
            $.ajax({
                type: 'PUT',
                url: '/editStory',
                data: {
                    teamId: _storyJson.teamId,
                    newStoryJson: newStoryJson
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
    	initialize: function(storyJson, currentIndex) {
    		_storyJson = storyJson;
            _index = currentIndex;
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

            var leftPanelDO = _storySticky.children('.taskpanel')[0];
            var rightPanelDO = _storySticky.children('.taskpanel')[2];

            _storyRow.remove('.story-descr');

            leftPanelDO.innerHTML = "";
            rightPanelDO.innerHTML = "";

            leftPanelInit($(leftPanelDO));
            rightPanelInit($(rightPanelDO));

            var colSelector = "." + 'progresscol[data-column=' + _storyJson.statusCode + ']';
            _storyRow.children(colSelector).append(_storySticky);
        },
        handleAddTask: function(taskData) {
            var taskObj = task();
            _taskObjMap[taskData._id] = taskObj;
            taskObj.initialize(taskData, _storyRow, _index, _storyJson._id, _storyJson.teamId);
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
        }

    }
}
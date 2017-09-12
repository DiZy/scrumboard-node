let story = function() {
	let _storyJson;
    let _storyRow;
    let _storySticky;
    let _taskObjMap;
    let _storiesSection;
    let _columnNames;
    let _storyUrl;
    let STORY_COLUMN = -1;

    function stickyDropHandler(e, ui) {
        let newStatusCode = $(this).attr("data-column");
        let droppedSticky = ui.helper;
        let stickyStoryId = droppedSticky.attr("data-storyId");
        if (stickyStoryId !== _storyJson._id) { // The dropped sticky doesn't belong to this row, so cancel the drag
            return false;
        }
        if (droppedSticky.hasClass("story-descr")){ // Sticky is a story
            updateStatusCode(newStatusCode);
        } else { // Sticky is a task
            let stickyTaskId = droppedSticky.attr("data-taskId");
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

        let colSelector = "." + 'progresscol[data-column=' + _storyJson.statusCode + ']';
        _storyRow.children(colSelector).append(_storySticky);

        //Add Panels
        let storyPanels = $('<div>').addClass('col-xs-12 task-panels').appendTo(_storySticky);
        let leftPanel = $('<div>').addClass('taskpanel').appendTo(storyPanels);
        let middlePanel = $('<div>').addClass('taskpanel taskcenter story-sticky').appendTo(storyPanels);
        middlePanel.text(_storyJson.name);
        var rightPanel = $('<div>').addClass('taskpanel').appendTo(storyPanels);
        var peopleRow = $('<div>').addClass('people-row').appendTo(_storySticky);

        leftPanelInit(leftPanel);
        rightPanelInit(rightPanel);
        middlePanelInit(middlePanel);
        peopleRowInit(peopleRow);

        setDefaultSize(leftPanel, middlePanel, rightPanel, peopleRow);
        makeResizable(leftPanel, middlePanel, rightPanel, peopleRow);

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

        _storySticky.droppable({
            accept: '.person',
            drop: personDropHandler
        });
    }

    function render() {
        _storyRow = $('<div>').addClass('row story');

        let headerCols = $('#boardHeader').children('.progresscol');

        let storyColumn = $('<div>').addClass('progresscol').attr('data-column', STORY_COLUMN).appendTo(_storyRow);
        storyColumn.droppable({
            accept: '.story-descr',
            drop: stickyDropHandler
        });
        storyColumn.width($(headerCols[0]).width() + 1);

        let cols = [];
        for(let i = 0; i < _columnNames.length; i++) {
            let newColumn = $('<div>').addClass('progresscol').attr('data-column', i).appendTo(_storyRow);
            newColumn.droppable({
                accept: '.task',
                drop: stickyDropHandler
            });
            newColumn.width($(headerCols[i + 1]).width() + 1);
            if(i === _columnNames.length - 1) {
                newColumn.addClass('done-col');
            }
            cols.push(newColumn);
        }

        let addTaskButton = $('<button>').addClass('btn btn-lg btn-default addTaskButton').attr('title', 'Add a task').text("+").appendTo(cols[0]);
        addTaskButton.click(addTaskToStory);

        renderStorySticky();

        let allTasks = _storyJson.tasks;
        _taskObjMap = {};
        for(let i = 0; i < allTasks.length; i++) {
            let taskObj = task();
            let taskData = allTasks[i];
            _taskObjMap[taskData._id] = taskObj;
            taskObj.initialize(taskData, _storyRow, _storyJson._id, _storyJson.teamId);
        }

        _storyRow.appendTo(_storiesSection);
    }

    function leftPanelInit($leftPanel, people) {
        let middleArrow = $('<span>').addClass('arrow glyphicon glyphicon-menu-left show-on-hover').css('display', 'none');
        if(_storyJson.statusCode !== -1) {
            middleArrow.appendTo($leftPanel);
        }
        middleArrow.click(function() {
            updateStatusCode(parseInt(_storyJson.statusCode) - 1);
        });

    }

    function middlePanelInit($middlePanel) {
        let editCover = $("<div>").addClass('editCover show-on-hover').css('display', 'none').appendTo($middlePanel);
        let editIcon = $("<span>").addClass('glyphicon glyphicon-pencil').appendTo(editCover);

        editCover.click(editStory);

        let points = $('<div>').addClass('points').text(_storyJson.points).appendTo($middlePanel);

    }

    function rightPanelInit($rightPanel, people) {
        let middleArrow = $('<span>').addClass('arrow glyphicon glyphicon-menu-right show-on-hover').css('display', 'none');
        let deleteButton = $('<span>').addClass('delete glyphicon glyphicon-remove show-on-hover').css('display', 'none').appendTo($rightPanel);

        if(_storyJson.statusCode !== _columnNames.length - 1) {
            middleArrow.appendTo($rightPanel)
        }

        middleArrow.click(function() {
            updateStatusCode(parseInt(_storyJson.statusCode) + 1);
        });

        deleteButton.click(function() {
            let confirmation = confirm('Are you sure you want to delete this story and all its tasks?');
            if(confirmation) {
                removeStory();
            }
        });

    }

    function peopleRowInit($peopleRow) {
        $('<div>').addClass('peopleMargin').appendTo($peopleRow);
        var peopleDiv = $('<div>').addClass('peopleDiv').appendTo($peopleRow);
        $('<div>').addClass('peopleMargin').appendTo($peopleRow);

        var people = team.getPeopleForStory(_storyJson._id);
        people.forEach(function(p) {
            person().render(p, peopleDiv);
        });
    }

    function setDefaultSize(leftPanel, middlePanel, rightPanel, peopleRow) {
        if(_storyJson.width){
            middlePanel.width(_storyJson.width);
            peopleRow.children('.peopleDiv').width(_storyJson.width);
        }
        if(_storyJson.height){
            leftPanel.height(_storyJson.height);
            middlePanel.height(_storyJson.height);
            rightPanel.height(_storyJson.height);
        }
    }

    function makeResizable(leftPanel, middlePanel, rightPanel, peopleRow) {
        middlePanel.resizable({
          handles: 'se',
          classes: {
              "ui-resizable-se": "ui-icon ui-icon-gripsmall-diagonal-se show-on-hover"
          },
          resize: function(e, ui) {
              _storyJson.width = ui.size.width;
              _storyJson.height = ui.size.height;

              setDefaultSize(leftPanel, middlePanel, rightPanel, peopleRow);
          },
          stop: function(e, ui) {
              $.ajax({
                         type: 'PATCH',
                         url: _storyUrl + '/' + _storyJson._id + '/styling',
                         data: {/*
                             teamId: _storyJson.teamId,
                             storyId: _storyJson._id,*/
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
                  });
          }
        });

        _storySticky.children('.ui-resizable-handle').css('display', 'none');
    }

    function personDropHandler(event, ui) {
        let personDiv = ui.draggable;
        let divToRenderTo = _storySticky.children('.people-row').children('.peopleDiv');
        team.assignPersonToTask(personDiv.attr('data-person'), undefined, _storyJson._id);
        return true;
    }

    function updateStatusCode(newStatusCode) {
        $.ajax({
            type: 'PUT',
            url: _storyUrl + '/' + _storyJson._id + '/move',
            data: {/*
                teamId: _storyJson.teamId,
                storyId: _storyJson._id,*/
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

    function editStory() {
        let oldTeamId = _storyJson.teamId;
        editStoryModal.open(oldTeamId, _storyJson, function(newStoryJson) {
            $.ajax({
                type: 'PUT',
                url: _storyUrl + '/' + _storyJson._id + '/edit',
                data: {
                    teamId: oldTeamId,
                    newStoryJson: newStoryJson
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
            });
        });
    }

    function removeStory() {
        $.ajax({
            type: 'DELETE',
            url: _storyUrl + '/' + _storyJson._id,
            /*data: {
                teamId: _storyJson.teamId,
                storyId: _storyJson._id
            },*/
            dataType: "json",
            contentType: "application/x-www-form-urlencoded"

        })
        .done(function(data) {
            if(data.type === 'success'){
                //Handled by Socket
            }
            else {
                alert(data.error);
            }

        })
        .fail(function(data) {
            alert("Internal Server Error");
        });
    }

    function addTaskToStory() {
        editTaskModal.open(undefined, function(taskJson) {
            $.ajax({
                type: 'POST',
                url: _storyUrl + '/' + _storyJson._id + '/tasks',
                data: {
                    /*teamId: _storyJson.teamId,
                    storyId: _storyJson._id,*/
                    name: taskJson.name,
                    points: taskJson.points,
                    notes: taskJson.notes
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
            });
        });
    }

    return {
    	initialize: function(storyJson, storiesSection, columnNames) {
    		_storyJson = storyJson;
            _storiesSection = storiesSection;
            _columnNames = columnNames;
            _storyUrl = '/teams/' + storyJson.teamId + '/stories';
    		render();
    	},
        getPeopleDiv: function() {
            return _storySticky.children('.people-row').children('.peopleDiv');
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
            _storyRow.find(".story-descr").remove();
            renderStorySticky();
        },
        handleRestyle: function(height, width) {
            _storyJson.width = width;
            _storyJson.height = height;

            let leftPanel = $(_storySticky.children('.task-panels').children()[0]);
            let middlePanel = $(_storySticky.children('.task-panels').children()[1]);
            let rightPanel = $(_storySticky.children('.task-panels').children()[2]);
            let peopleRow = $(_storySticky.children('.people-row'));

            setDefaultSize(leftPanel, middlePanel, rightPanel, peopleRow);
        },
        handleAddTask: function(taskData) {
            let taskObj = task();
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
};
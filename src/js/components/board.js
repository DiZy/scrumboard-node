board = (function(){

    var _teamJson;
    var _currentStoryIndex;
    var _storyObjMap;
    var _storiesSection;

    function renderPeople() {
        var peopleDiv = $('<div>').attr('id', 'unassignedPeople').appendTo('body');
        var peopleText = $('<div>').text('People:').appendTo(peopleDiv);
        var people = team.getPeopleForTask("");

        var addPersonButton = $('<div>').attr('id', 'addPersonButton').addClass('person').text('+').appendTo(peopleDiv);

        people.forEach(function(p) {
            person().render(p, peopleDiv);
        });

        addPersonButton.click(function() {
            addPersonModal.open(function(personName) {
                team.addPerson(personName);
            });;
        });

        peopleDiv.droppable({
            accept: '.person',
            drop: function(event, ui) {
                var personDiv = ui.draggable;
                team.assignPersonToTask(personDiv.attr('data-person'), "");
            }
        });

        //deletes Person
        addPersonButton.droppable({
            accept: '.person',
            drop: function(event, ui) {
                var personDiv = ui.draggable;
                team.removePerson(personDiv.attr('data-person'));
            },
            greedy: true
        });

    }

    function renderHeader() {
        var boardDiv = $('<div>').attr('id', 'board').addClass('container').appendTo('body');
        var boardWidth = ((_teamJson.columnNames.length + 1) * 20) + "vw";
        boardDiv.width(boardWidth);
        var boardHeader = $('<div>').addClass('row').attr('id', 'boardHeader').appendTo(boardDiv);
        var boardStoryCol = $('<div>').addClass('progresscol').attr('data-column', -1).html('<h4>Story</h4>').appendTo(boardHeader);
        board.makeResizableCol(boardStoryCol);

        for(var i = 0; i < _teamJson.columnNames.length; i++) {
            var colText = '<h4>' + _teamJson.columnNames[i] + '</h4>';
            var boardCol = $('<div>').addClass('progresscol').attr('data-column', i).html(colText).appendTo(boardHeader);

            board.makeResizableCol(boardCol);

            if(i == _teamJson.columnNames.length - 1) {
                boardCol.addClass('done-col');

                var editColumnsButton = $('<span>').addClass('glyphicon glyphicon-cog').attr('id', 'editColumnsButton').appendTo(boardCol);
                editColumnsButton.attr('title', 'Edit columns');
                editColumnsButton.on('click', editColumns);
            }
        }

        _storiesSection = $('<div>').addClass('row').attr('id', 'storiesSection').appendTo('#board');

        var addStoryButton = $('<button>').addClass('btn btn-lg btn-default').attr('id', 'addStoryButton').text('Add a story').appendTo('#board');
        addStoryButton.click(function() {
            editStoryModal.open(_teamJson._id, undefined, createStory)
        });

        adjustDoneColumnWidth();
    }

    function editColumns() {
        editColumnsModal.open(_teamJson.columnNames, function(newColumnNames) {
            customAjax('PUT', '/updateTeamColumns',
                {
                    teamId: _teamJson._id,
                    newColumnNames: newColumnNames
                }
            );
        });
    }

    function createStory(storyJson) {
        $.ajax({
                type: 'POST',
                url: '/addStory',
                data: {
                    teamId: storyJson.teamId,
                    name: storyJson.name,
                    points: storyJson.points
                },
                dataType: "json",
                contentType: "application/x-www-form-urlencoded"

            })
            .done(function(data) {
                console.log(data);
                if(data.type == 'success'){
                    //Socket has listener
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

    function renderStories() {
    	getListOfStoryJson(function(storyList) {
            _storyObjMap = {};
            var doneStories = [];

        	for(var i = 0; i < storyList.length; i++) {
                var storyData = storyList[i];
                if(storyData.statusCode != 3) {
                    var storyObj = story();
                    _storyObjMap[storyData._id] = storyObj;
            		storyObj.initialize(storyData, _currentStoryIndex, _storiesSection, _teamJson.columnNames);
                    _currentStoryIndex++;
                }
                else {
                    doneStories.push(storyData);
                }
        	}
            for(var i = 0; i < doneStories.length; i++) {
                var storyData = doneStories[i];
                var storyObj = story();
                _storyObjMap[storyData._id] = storyObj;
                storyObj.initialize(storyData, _currentStoryIndex, _storiesSection, _teamJson.columnNames);
                _currentStoryIndex++;
            }
            $('body').ploading({action: 'destroy'});
        });
    }

    function getListOfStoryJson(callback) {
    	$.ajax({
            type: 'GET',
            url: '/getStories',
            data: {
                teamId: _teamJson._id
            },
            dataType: "json",
            contentType: "application/x-www-form-urlencoded"

        })
        .done(function(data) {
            console.log(data);
            if(data.type == 'success'){
                callback(data.stories);
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

    function removeBoard() {
        $('#unassignedPeople').remove();
        $('#board').remove();
        $('#addStoryButton').remove();
    }

    function adjustDoneColumnWidth() {
        //adjust last column to fill screen width
        var doneColWidth = $('#boardHeader>.done-col').width();
        var otherColsWidth = 0;
        var otherCols = $('#boardHeader>.progresscol:not(.done-col)');
        for(var i = 0; i < otherCols.length; i++) {
            otherColsWidth += ($(otherCols[i]).width() + 1);
        }

        var windowWidth = $(window).width();

        if(otherColsWidth + 100 < windowWidth) {
            $('.done-col').width(windowWidth - otherColsWidth - 3);
            $('#board').width(windowWidth);
        }
    }

    return {
        clear: function() {
            removeBoard();
        },
        render: function(teamjson) {
        	_teamJson = teamjson;
            _currentStoryIndex = 0;
            removeBoard();
            renderPeople();
            renderHeader();
        	renderStories();
        },
        resizeColumn: function(columnNumber, newWidth) {
            var selector = '.progresscol[data-column=' + columnNumber + ']';
            $(selector).width(newWidth);
        },
        makeResizableCol: function($div) {
            $div.resizable({
                handles: 'e',
                start: function(e, ui) {
                    colOriginalWidth = $(this).width();
                },
                resize: function(e, ui) {
                    ui.size.width = ui.size.width >= 100 ? ui.size.width : 100;

                    board.resizeColumn($(this).attr('data-column'), ui.size.width + 1);

                    var widthAdded = ui.size.width - colOriginalWidth;
                    var originalBoardWidth = $('#board').width();
                    $('#board').width(originalBoardWidth + widthAdded + 1);

                    colOriginalWidth = ui.size.width;

                },
                stop: function(e, ui) {
                    board.resizeColumn($(this).attr('data-column'), $(this).width() + 1);

                    adjustDoneColumnWidth();
                }
            });
        },
        handleAddStory: function(storyData) {
            if(storyData.teamId == _teamJson._id) {
                var storyObj = story();
                _storyObjMap[storyData._id] = storyObj;
                storyObj.initialize(storyData, _currentStoryIndex, _storiesSection, _teamJson.columnNames);
                _currentStoryIndex++;
            }
        },
        handleRemoveStory: function(storyId) {
            _storyObjMap[storyId].handleRemove();
        },
        handleEditStory: function(storyData) {
            if(storyData.teamId != _teamJson._id) {
                _storyObjMap[storyData._id].handleRemove();
            }
            else {
                _storyObjMap[storyData._id].handleEdit(storyData);
            }
        },
        requestStoryStatusCodeChange: function(storyId, newStatusCode) {
            _storyObjMap[storyId].requestStoryStatusCodeChange(newStatusCode);
        },
        handleMoveStory: function(storyId, newStatusCode) {
            _storyObjMap[storyId].handleMove(newStatusCode);
        },
        handleAddTask: function(storyId, taskData) {
            _storyObjMap[storyId].handleAddTask(taskData);
        },
        handleRemoveTask: function(storyId, taskId) {
            _storyObjMap[storyId].handleRemoveTask(taskId);
        },
        handleEditTask: function(storyId, taskData) {
             _storyObjMap[storyId].handleEditTask(taskData);
        },
        requestTaskStatusCodeChange: function(storyId, taskId, newStatusCode) {
            _storyObjMap[storyId].requestTaskStatusCodeChange(taskId, newStatusCode);
        },
        handleMoveTask: function(storyId, taskId, newStatusCode) {
            _storyObjMap[storyId].handleMoveTask(taskId, newStatusCode);
        },
        handleRestyleTask: function(storyId, taskId, height, width) {
            _storyObjMap[storyId].handleRestyleTask(taskId, height, width);
        },
        getPeopleDivForTask: function(storyId, taskId) {
            return _storyObjMap[storyId].getPeopleDivForTask(taskId);
        },
        handleEditColumns: function() {
            $('#select-div .selectpicker').trigger('change');
        }
    }

})();
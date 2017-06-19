board = (function(){

    let _teamJson;
    let _storyObjMap;
    let _storiesSection;

    function renderPeople() {
        let peopleDiv = $('<div>').attr('id', 'unassignedPeople').appendTo('body');
        let peopleText = $('<div>').text('People:').appendTo(peopleDiv);
        let people = team.getPeopleForTask("");

        let addPersonButton = $('<div>').attr('id', 'addPersonButton').addClass('person').text('+').appendTo(peopleDiv);

        people.forEach(function(p) {
            person().render(p, peopleDiv);
        });

        addPersonButton.click(function() {
            addPersonModal.open(function(personName) {
                team.addPerson(personName);
            });
        });

        peopleDiv.droppable({
            accept: '.person',
            drop: function(event, ui) {
                let personDiv = ui.draggable;
                team.assignPersonToTask(personDiv.attr('data-person'), "");
            }
        });

        //deletes Person
        addPersonButton.droppable({
            accept: '.person',
            drop: function(event, ui) {
                let personDiv = ui.draggable;
                team.removePerson(personDiv.attr('data-person'));
            },
            greedy: true
        });

    }

    function renderHeader() {
        let boardDiv = $('<div>').attr('id', 'board').addClass('container').appendTo('body');
        let boardWidth = ((_teamJson.columnNames.length + 1) * 20) + "vw";
        boardDiv.width(boardWidth);
        let boardHeader = $('<div>').addClass('row').attr('id', 'boardHeader').appendTo(boardDiv);
        let boardStoryCol = $('<div>').addClass('progresscol').attr('data-column', -1).html('<h4>Story</h4>').appendTo(boardHeader);
        board.makeResizableCol(boardStoryCol);

        for(let i = 0; i < _teamJson.columnNames.length; i++) {
            let colText = '<h4>' + _teamJson.columnNames[i] + '</h4>';
            let boardCol = $('<div>').addClass('progresscol').attr('data-column', i).html(colText).appendTo(boardHeader);

            board.makeResizableCol(boardCol);

            if(i === _teamJson.columnNames.length - 1) {
                boardCol.addClass('done-col');

                let editColumnsButton = $('<span>').addClass('glyphicon glyphicon-cog').attr('id', 'editColumnsButton').appendTo(boardCol);
                editColumnsButton.attr('title', 'Edit columns');
                editColumnsButton.on('click', editColumns);
            }
        }

        _storiesSection = $('<div>').addClass('row').attr('id', 'storiesSection').appendTo('#board');

        let addStoryButton = $('<button>').addClass('btn btn-lg btn-default').attr('id', 'addStoryButton').attr('title', 'Add a story').text("+").appendTo(boardStoryCol);
        addStoryButton.click(function() {
            editStoryModal.open(_teamJson._id, undefined, createStory)
        });

        adjustDoneColumnWidth();

        $(window).off('scroll').on('scroll', function() {
            boardHeader.css('left', '-' + window.scrollX + 'px');
        });
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
                if(data.type === 'success'){
                    //Socket has listener
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

    function renderStories() {
    	getListOfStoryJson(function(storyList) {
            _storyObjMap = {};
            let doneStories = [];

        	for(let i = 0; i < storyList.length; i++) {
                let storyData = storyList[i];
                if(storyData.statusCode !== 3) {
                    let storyObj = story();
                    _storyObjMap[storyData._id] = storyObj;
            		storyObj.initialize(storyData, _storiesSection, _teamJson.columnNames);
                }
                else {
                    doneStories.push(storyData);
                }
        	}
            for(let i = 0; i < doneStories.length; i++) {
                let storyData = doneStories[i];
                let storyObj = story();
                _storyObjMap[storyData._id] = storyObj;
                storyObj.initialize(storyData, _storiesSection, _teamJson.columnNames);
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
            if(data.type === 'success'){
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
        let doneColWidth = $('#boardHeader').children('.done-col').width();
        let otherColsWidth = 0;
        let otherCols = $('#boardHeader').children('.progresscol:not(.done-col)');
        for(let i = 0; i < otherCols.length; i++) {
            otherColsWidth += ($(otherCols[i]).width() + 1);
        }

        let windowWidth = $(window).width();

        if(otherColsWidth + 100 < windowWidth) {
            $('.done-col').width(windowWidth - otherColsWidth - 4);
            $('#board').width(windowWidth);
        }
    }

    return {
        clear: function() {
            removeBoard();
        },
        render: function(teamjson) {
        	_teamJson = teamjson;
            removeBoard();
            renderPeople();
            renderHeader();
        	renderStories();
        },
        resizeColumn: function(columnNumber, newWidth) {
            let selector = '.progresscol[data-column=' + columnNumber + ']';
            $(selector).width(newWidth);
        },
        makeResizableCol: function($div) {
            let colOriginalWidth;
            $div.resizable({
                handles: 'e',
                start: function(e, ui) {
                    colOriginalWidth = $(this).width();
                },
                resize: function(e, ui) {
                    ui.size.width = ui.size.width >= 100 ? ui.size.width : 100;

                    board.resizeColumn($(this).attr('data-column'), ui.size.width + 1);

                    let widthAdded = ui.size.width - colOriginalWidth;
                    let originalBoardWidth = $('#board').width();
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
            if(storyData.teamId === _teamJson._id) {
                let storyObj = story();
                _storyObjMap[storyData._id] = storyObj;
                storyObj.initialize(storyData, _storiesSection, _teamJson.columnNames);
            }
        },
        handleRemoveStory: function(storyId) {
            _storyObjMap[storyId].handleRemove();
        },
        handleEditStory: function(storyData) {
            if(storyData.teamId !== _teamJson._id) {
                _storyObjMap[storyData._id].handleRemove();
            }
            else {
                _storyObjMap[storyData._id].handleEdit(storyData);
            }
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
            $('#select-div').find('.selectpicker').trigger('change');
        }
    }

})();
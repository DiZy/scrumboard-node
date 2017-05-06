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
        boardDiv[0].innerHTML = '<div class="row" id="boardHeader">' +
                            '<div class="col-xs-2 progresscol" data-column="-1"><h4>Story</h4></div>' +
                            '<div class="col-xs-4 progresscol" data-column="0"><h4>Not started</h4></div>' +
                            '<div class="col-xs-2 progresscol" data-column="1"><h4>In Progress</h4></div>' +
                            '<div class="col-xs-2 progresscol" data-column="2"><h4>To Be Verified</h4></div>' +
                            '<div class="col-xs-2 progresscol done-col" data-column="3"><h4>Done</h4></div>' +
                        '</div>';
        board.makeResizableCol($($('#boardHeader>div')[0]));
        board.makeResizableCol($($('#boardHeader>div')[1]));
        board.makeResizableCol($($('#boardHeader>div')[2]));
        board.makeResizableCol($($('#boardHeader>div')[3]));

        _storiesSection = $('<div>').addClass('row').attr('id', 'storiesSection').appendTo('#board');

        var addStoryButton = $('<button>').addClass('btn btn-lg btn-default').attr('id', 'addStoryButton').text('Add a story').appendTo("#board");
        addStoryButton.click(function() {
            editStoryModal.open(undefined, createStory)
        });
    }

    function createStory(storyJson) {
        console.log(storyJson);
        $.ajax({
                type: 'POST',
                url: '/addStory',
                data: {
                    teamId: _teamJson._id,
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
        	for(var i = 0; i < storyList.length; i++) {
                var storyObj = story();
                var storyJson = storyList[i];
                _storyObjMap[storyJson._id] = storyObj;
        		storyObj.initialize(storyJson, _currentStoryIndex, _storiesSection);
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

    return {
        render: function(teamjson) {
        	_teamJson = teamjson;
            _currentStoryIndex = 0;
            removeBoard();
            renderPeople();
            renderHeader();
        	renderStories();
        },
        resizeColumn: function(columnNumber, newWidth) {
            var selector = 'div[data-column=' + columnNumber + ']';
            $(selector).width(newWidth);
        },
        makeResizableCol: function($div) {
            $div.resizable({
                handles: 'e',
                start: function(e, ui) {
                    otherColWidths = $($('#boardHeader>div')[0]).width() +
                                     $($('#boardHeader>div')[1]).width() +
                                     $($('#boardHeader>div')[2]).width() +
                                     $($('#boardHeader>div')[3]).width() +
                                     100 - $(this).width();
                },
                resize: function(e, ui) {
                    var headerWidth = $('#boardHeader').width();
                    var tooBig = (ui.size.width + otherColWidths) >= headerWidth;
                    ui.size.width = tooBig ? (headerWidth - otherColWidths - 5) : ui.size.width;
                    board.resizeColumn($(this).attr('data-column'), ui.size.width);
                    var doneColWidth = headerWidth - $(this).width() - otherColWidths + 100 - 5;
                    board.resizeColumn(3, doneColWidth);
                },
                stop: function(e, ui) {
                    board.resizeColumn($(this).attr('data-column'), $(this).width());
                }
            });
        },
        handleAddStory: function(storyData) {
            var storyObj = story();
            _storyObjMap[storyData._id] = storyObj;
            storyObj.initialize(storyData, _currentStoryIndex, _storiesSection);
            _currentStoryIndex++;
        },
        handleRemoveStory: function(storyId) {
            _storyObjMap[storyId].handleRemove();
        },
        handleEditStory: function(storyData) {
            _storyObjMap[storyData._id].handleEdit(storyData);
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
        }
    }

})();
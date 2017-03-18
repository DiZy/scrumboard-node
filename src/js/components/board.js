board = (function(){

    var _teamJson;

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

        var addStoryButton = $('<button>').addClass('btn btn-lg btn-default').attr('id', 'addStoryButton').text('Add a story').appendTo("body");
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
                    name: storyJson.name
                },
                dataType: "json",
                contentType: "application/x-www-form-urlencoded"

            })
            .done(function(data) {
                console.log(data);
                if(data.type == 'success'){
                    story().initialize(data.story);
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
            console.log(storyList);
        	for(var i = 0; i < storyList.length; i++) {
        		story().initialize(storyList[i]);
        	}
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
        $('#board').remove();
        $('#addStoryButton').remove();
    }

    return {
        render: function(teamjson) {
        	_teamJson = teamjson;
            removeBoard();
            renderHeader();
        	renderStories();
        },

        testFunctionality: function() {
            renderHeader();
            story().initialize();
            task().initialize({statusCode: 0}, $('.story'));
            task().initialize({statusCode: 0}, $('.story'));
            task().initialize({statusCode: 1}, $('.story'));
            task().initialize({statusCode: 2}, $('.story'));
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
        }
    }

})();
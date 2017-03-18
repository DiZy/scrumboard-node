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
    }

    function renderStories() {
    	var storyList = getListOfStoryJson();
    	for(var i = 0; i < storyList.length; i++) {
    		var story = story.initialize(storyList[i]);
    	}

    }

    function getListOfStoryJson() {
    	return [];
    }

    return {
        render: function(teamjson) {
        	_teamJson = teamjson;
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
                    $($('#boardHeader>div')[4]).width(doneColWidth);
                },
                stop: function(e, ui) {
                    board.resizeColumn($(this).attr('data-column'), $(this).width());
                }
            });
        }
    }

})();
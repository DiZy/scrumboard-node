var task = function() {
	var _taskJson;
	var _$storyRow;
	var _taskDiv;
	var _storyIndex;

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
		leftPanelInit(leftPanel, _taskJson.people);
		rightPanelInit(rightPanel, _taskJson.people);

		//if board.maxColumn == _taskJson.statusCode: dont display right arrow

		var colSelector = "." + 'progress-' + _taskJson.statusCode;
		_$storyRow.children(colSelector).append(_taskDiv);


		_taskDiv.resizable({
			handles: 'se',
			classes: {
				"ui-resizable-se": "ui-icon ui-icon-gripsmall-diagonal-se show-on-hover"
			},
			stop: function(e, ui) {
				_taskJson.width = ui.size.width;
				_taskJson.height = ui.size.height;
				//TODO: send request to save size
			}
		});
		_taskDiv.children('.ui-resizable-handle').css('display', 'none');

		//attempt at droppable
		// var dragScope = "story_" + _storyIndex;
		// _taskDiv.draggable({
		// 	scope: dragScope,
		// 	revert: "invalid",
		// 	stop: function(e, ui) {
		// 		console.log(e);
		// 		console.log(ui);
		// 	}
		// });

		_taskDiv.hover(
			//Hover in
			function() {
				$(_taskDiv).find('.hide-on-hover').fadeOut( "fast", function() {
					$(this).hide();
					$(_taskDiv).find('.show-on-hover').fadeIn( "fast", function() {
						$(this).show();
					});
				});
			},
			//Hover out
			function() {
				$(_taskDiv).find('.show-on-hover').fadeOut( "fast", function() {
					$(this).hide();
					$(_taskDiv).find('.hide-on-hover').fadeIn( "fast", function() {
						$(this).show();
					});
				});
			}
		);
	}

	function leftPanelInit($leftPanel, people) {
		var topArrow = $('<div>').addClass('arrow-row show-on-hover').css('display', 'none').appendTo($leftPanel);
		var middleArrow = $('<div>').addClass('arrow-row show-on-hover').css('display', 'none').appendTo($leftPanel);
		var bottomArrow = $('<div>').addClass('arrow-row show-on-hover').css('display', 'none').appendTo($leftPanel);

		if(people && people.length > 0) {
			var topPerson = $('<div>').addClass('people-row hide-on-hover').text(people[0]).appendTo($leftPanel);
		}
		if(people && people.length > 1) {
			var bottomPerson = $('<div>').addClass('people-row hide-on-hover').text(people[1]).appendTo($leftPanel);
		}

		middleArrow[0].innerHTML = '<span class="glyphicon glyphicon-menu-left"></span>';

		middleArrow.click(function() {
			_taskJson.statusCode -= 1;
			_taskDiv.remove();
			render();
			//TODO: send request

		});

	}

	function rightPanelInit($rightPanel, people, isLastColumn) {

		var topArrow = $('<div>').addClass('arrow-row show-on-hover').css('display', 'none').appendTo($rightPanel);
		var middleArrow = $('<div>').addClass('arrow-row show-on-hover').css('display', 'none').appendTo($rightPanel);
		var bottomArrow = $('<div>').addClass('arrow-row show-on-hover').css('display', 'none').appendTo($rightPanel);

		if(people && people.length > 0) {
			var topPerson = $('<div>').addClass('people-row hide-on-hover').text(people[2]).appendTo($rightPanel);
		}
		if(people && people.length > 1) {
			var bottomPerson = $('<div>').addClass('people-row hide-on-hover').text(people[3]).appendTo($rightPanel);
		}

		middleArrow[0].innerHTML = '<span class="glyphicon glyphicon-menu-right"></span>';

		middleArrow.click(function() {
			_taskJson.statusCode += 1;
			_taskDiv.remove();
			render();
			//TODO: send request

		});

	}



    return {

    	initialize: function(taskJson, $storyRow, storyIndex) {
    		_taskJson = taskJson;
    		_$storyRow = $storyRow;
    		_storyIndex = storyIndex;
    		render();
    	}

        
    }
}
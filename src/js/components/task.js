var task = function() {
	var _taskJson;
	var _$storyRow;
	var _taskDiv;

	function render() {
		_taskDiv = $('<div>').addClass('task');

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
		var people = getPeople();
		leftPanelInit(leftPanel, people);
		rightPanelInit(rightPanel, people);

		//if board.maxColumn == _taskJson.statusCode: dont display right arrow

		var colSelector = "." + 'progress-' + _taskJson.statusCode;
		_$storyRow.children(colSelector).append(_taskDiv);


		_taskDiv.resizable({
			handles: 'se',
			stop: function(e, ui) {
				_taskJson.width = ui.size.width;
				_taskJson.height = ui.size.height;
				//TODO: send request to save size
			}
		});

		_taskDiv.hover(
			//Hover in
			function() {
				$(this).children('.taskpanel').children('.arrow-row').fadeIn( "slow", function() {
					$(this).show();
				});

			},
			//Hover out
			function() {
				$(this).children('.taskpanel').children('.arrow-row').fadeOut( "slow", function() {
					$(this).hide();
				});
			}
		);
	}

	function getPeople() {

	}

	function leftPanelInit($leftPanel, people) {
		var topArrow = $('<div>').addClass('arrow-row').css('display', 'none').appendTo($leftPanel);
		var middleArrow = $('<div>').addClass('arrow-row').css('display', 'none').appendTo($leftPanel);
		var bottomArrow = $('<div>').addClass('arrow-row').css('display', 'none').appendTo($leftPanel);

		middleArrow[0].innerHTML = '<span class="glyphicon glyphicon-menu-left"></span>';

		middleArrow.click(function() {
			_taskJson.statusCode -= 1;
			_taskDiv.remove();
			render();
			//TODO: send request

		});

	}

	function rightPanelInit($rightPanel, people, isLastColumn) {

		var topArrow = $('<div>').addClass('arrow-row').css('display', 'none').appendTo($rightPanel);
		var middleArrow = $('<div>').addClass('arrow-row').css('display', 'none').appendTo($rightPanel);
		var bottomArrow = $('<div>').addClass('arrow-row').css('display', 'none').appendTo($rightPanel);

		middleArrow[0].innerHTML = '<span class="glyphicon glyphicon-menu-right"></span>';

		middleArrow.click(function() {
			_taskJson.statusCode += 1;
			_taskDiv.remove();
			render();
			//TODO: send request

		});

	}



    return {

    	initialize: function(taskJson, $storyRow) {
    		_taskJson = taskJson;
    		_$storyRow = $storyRow;
    		render();
    	}

        
    }
}
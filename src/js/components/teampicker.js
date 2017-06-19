teampicker = (function() {
	let _selectpicker;
    let _teamsArray = [];
    let _socket;


    function createTeamAddRequest(name, callback) {
        customAjax('POST', '/addTeam',
            {
                name: name
            },
            callback
        );
    }

	function getTeams(callback) {
		customAjax('GET', '/getTeams', {},
            function(data) {
                callback(data.teams);
            }
        );
	}

    function loadSelectOptions(callback) {
        $('.selectpicker').children('option').remove();
        getTeams(function(teams) {
            _teamsArray = teams;
            if(teams.length > 0) {
                for(let i = 0; i < teams.length; i++) {
                    let newOption = $('<option>').text(teams[i].name).attr('id', i);
                    newOption.val(teams[i]._id);
                    $('.selectpicker').append(newOption);
                }
                $('.selectpicker').selectpicker('val', teams[teams.length - 1]._id);
                $('.selectpicker').selectpicker('refresh');
                $('.bootstrap-select').find('.dropdown-menu li').each(function(index, value) {
                    let removeTeamButton = $('<span>').addClass('glyphicon glyphicon-remove-circle remove-team');
                    removeTeamButton.click(function(e) {
                        e.stopPropagation();
                        deleteTeam(_teamsArray[index]._id, _teamsArray[index].name);
                    });

                    removeTeamButton.appendTo(value);
                });
                if(callback) {
                    callback();
                }
            }
            else {
                board.clear();
                $('.selectpicker').selectpicker('refresh');
                $('#select-div').find('.bs-placeholder').find('.filter-option').text('Please add or select a team here.');
                if(callback) {
                    callback();
                }
            }
        });
    }

    function deleteTeam(teamId, teamName) {
        let confirmation = confirm('Are you sure you want to remove the team "' + teamName + '"?');
        if(confirmation) {
            customAjax('DELETE', '/deleteTeam',
                {
                    teamId: teamId
                },
                function(data) {
                   loadSelectOptions(function() {
                        $('.selectpicker').selectpicker('toggle');
                        $('#select-div').find('.selectpicker').trigger('change');
                   });
                }
            );
        }
    }

    let handleSearch = function() {
        if($('.no-results').length > 0) {
            if($('#create').length == 0) {
                //add option to create
                let dropdownMenu = $('#select-div').find('.dropdown-menu').find('.inner');
                let addOption = $('<li>').attr('id', 'create').appendTo(dropdownMenu);
                let addLink = $('<a>').appendTo(addOption);
                let addSpan = $('<span>').addClass('text').text('CREATE THIS TEAM').css('color', 'red');
                addSpan.appendTo(addLink);

                addOption.click(function() {
                    let newText = $('.bs-searchbox').children('input').val();
                    createTeamAddRequest(newText, function() {
                        loadSelectOptions(function() {
                            $('#select-div').find('.selectpicker').trigger('change');
                        });
                    });
                });
            }
        }
        else {
            $('#create').remove();
        }
    };

    $(document).ready(function() {
        $('body').ploading({action: 'show'});

    	_selectpicker = $('<select>').addClass('selectpicker').attr('data-live-search', 'true');
    	_selectpicker.appendTo('#select-div');
    	_selectpicker.selectpicker('refresh');

        _socket = io();

        loadSelectOptions(function() {
            $('body').ploading({action: 'destroy'});

            $('#select-div').find('.selectpicker').change(function() {
                let id = $(this).children(":selected").attr('id');
                if(id) {
                    team.initialize(_teamsArray[id]);
                    _socket.disconnect();
                    _socket = io();
                    _socket.emit('join room', _teamsArray[id]._id);
                    initializeSocket(_socket);
                }
            });

            $('#select-div').click(function(){
                let inputs = $('.bs-searchbox').children('input');
                inputs.attr('placeholder', 'Search through your existing teams or type a new team name');
                inputs.off('input', handleSearch).on('input', handleSearch);
            });

            $('#select-div').find('.selectpicker').trigger('change');

        });

        $('#left-menu').click(function() {
            $('#sidebar').fadeIn("fast");
        });
        $('#sidebar-close').click(function() {
            $('#sidebar').fadeOut("fast");
        });

    });

    function initializeSocket(socket) {
        socket.off('add story');
        socket.on('add story', function(data) {
            board.handleAddStory(data.story);
        });

        socket.off('remove story');
        socket.on('remove story', function(data) {
            board.handleRemoveStory(data.storyId);
        });

        socket.off('edit story');
        socket.on('edit story', function(data) {
            board.handleEditStory(data.story);
        });

        socket.off('move story');
        socket.on('move story', function(data) {
            board.handleMoveStory(data.storyId, data.newStatusCode);
        });

        socket.off('add task');
        socket.on('add task', function(data) {
            board.handleAddTask(data.storyId, data.task);
        });

        socket.off('remove task');
        socket.on('remove task', function(data) {
            board.handleRemoveTask(data.storyId, data.taskId);
        });

        socket.off('edit task');
        socket.on('edit task', function(data) {
            board.handleEditTask(data.storyId, data.task);
        });

        socket.off('move task');
        socket.on('move task', function(data) {
            board.handleMoveTask(data.storyId, data.taskId, data.newStatusCode);
        });

        socket.off('update task style');
        socket.on('update task style', function(data) {
            board.handleRestyleTask(data.storyId, data.taskId, data.height, data.width);
        });

        socket.off('assign person');
        socket.on('assign person', function(data) {
            team.handleAssignPerson(data.personId, data.storyId, data.taskId)
        });

        socket.off('add person');
        socket.on('add person', function(data) {
            team.handleAddPerson(data.person)
        });

        socket.off('remove person');
        socket.on('remove person', function(data) {
            team.handleRemovePerson(data.personId)
        });

        socket.off('start burndown');
        socket.on('start burndown', function(data) {
            burndown.handleStart();
        });

        socket.off('mark burndown');
        socket.on('mark burndown', function(data) {
            burndown.handleMark(data.newHours, data.newPoints);
        });

        socket.off('undo burndown');
        socket.on('undo burndown', function(data) {
            burndown.handleUndo();
        });

        socket.off('edit columns');
        socket.on('edit columns', function(data) {
            board.handleEditColumns(data.newColumnNames);
        });
    }
})();
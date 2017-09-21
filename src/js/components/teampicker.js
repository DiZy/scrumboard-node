teampicker = (function() {
	let _selectpicker;
    let _teamsArray = [];
    let _teamsUrl = '/teams';
    const _socket = io();
    _socket.on('connect_failed', function() {
        alert('Socket connection issue.');
    });
    _socket.on('error', function() {
        alert('Socket issue.');
    });


    function createTeamAddRequest(name, callback) {
        customAjax('POST', _teamsUrl,
            {
                name: name
            },
            callback
        );
    }

	function getTeams(callback) {
		customAjax('GET', _teamsUrl, {},
            function(data) {
                callback(data.teams);
            }
        );
	}

    function loadSelectOptions(callback) {
        let selectPicker = $('.selectpicker');
        selectPicker.children('option').remove();
        getTeams(function(teams) {
            _teamsArray = teams;
            if(teams.length > 0) {
                for(let i = 0; i < teams.length; i++) {
                    let newOption = $('<option>').text(teams[i].name).attr('id', i);
                    newOption.val(teams[i]._id);
                    selectPicker.append(newOption);
                }
                selectPicker.selectpicker('val', teams[teams.length - 1]._id);
                selectPicker.selectpicker('refresh');
                $('.bootstrap-select').find('.dropdown-menu li').each(function(index, value) {
                    let editTeamButton = $('<span>').addClass('glyphicon glyphicon-edit edit-team').appendTo(value);

                    editTeamButton.click(function(e) {
                        e.stopPropagation();
                        editTeam(_teamsArray[index]._id, _teamsArray[index].name);
                    });

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
                selectPicker.selectpicker('refresh');
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
            customAjax('DELETE', _teamsUrl,
                {
                    teamId: teamId
                },
                function(data) {
                   loadSelectOptions(function() {
                       let selectPicker = $('#select-div').find('.selectpicker');
                       selectPicker.selectpicker('toggle');
                       selectPicker.trigger('change');
                   });
                }
            );
        }
    }

    function editTeam(teamId, teamName) {
        editTeamNameModal.open(teamName, function(newTeamName) {
            customAjax('patch', _teamsUrl + '/' + teamId,
                {
                    /*teamId: teamId,*/
                    name: newTeamName
                },
                function(data) {
                   loadSelectOptions(function() {
                        let selectPicker = $('#select-div').find('.selectpicker');
                        selectPicker.selectpicker('toggle');
                        selectPicker.trigger('change');
                   });
                }
            );
        });
    }

    let handleSearch = function() {
        let createDiv = $('#create');
        if($('.no-results').length > 0) {
            if(createDiv.length === 0) {
                //add option to create
                let selectDiv = $('#select-div');
                let dropdownMenu = selectDiv.find('.dropdown-menu').find('.inner');
                let addOption = $('<li>').attr('id', 'create').appendTo(dropdownMenu);
                let addLink = $('<a>').appendTo(addOption);
                let addSpan = $('<span>').addClass('text').text('CREATE THIS TEAM').css('color', 'red');
                addSpan.appendTo(addLink);

                addOption.click(function() {
                    let newText = $('.bs-searchbox').children('input').val();
                    createTeamAddRequest(newText, function() {
                        loadSelectOptions(function() {
                            selectDiv.find('.selectpicker').trigger('change');
                        });
                    });
                });
            }
        }
        else {
            createDiv.remove();
        }
    };

    $(document).ready(function() {
        $('body').ploading({action: 'show'});
        let selectDiv = $('#select-div');
    	let selectpicker = $('<select>')
            .addClass('selectpicker')
            .attr('data-live-search', 'true')
            .appendTo(selectDiv);
    	selectpicker.selectpicker('refresh');

        loadSelectOptions(function() {
            $('body').ploading({action: 'destroy'});

            selectpicker.change(function() {
                let id = $(this).children(":selected").attr('id');
                if(id) {
                    let selectedTeamId = _teamsArray[id]._id;
                    if(team.getCurrentTeamId() !== selectedTeamId) {
                        _socket.emit('join room', selectedTeamId);
                        initializeSocket(_socket);
                    }
                    team.initialize(_teamsArray[id]);
                }
            });

            $('#select-div').click(function(){
                let searchBox = $('.bs-searchbox>input');
                searchBox.attr('placeholder', 'Search through your existing teams or type a new team name')
                searchBox.off('input', handleSearch).on('input', handleSearch);
            });

            selectpicker.trigger('change');

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

        socket.off('update story style');
        socket.on('update story style', function(data) {
            board.handleRestyleStory(data.storyId, data.height, data.width);
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
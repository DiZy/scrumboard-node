teampicker = (function() {
	var _selectpicker;
    var _teamsArray = [];
    var _socket;


    function createTeamAddRequest(name, callback) {
        $.ajax({
            type: 'POST',
            url: '/addTeam',
            data: {
                name: name
            },
            dataType: "json",
            contentType: "application/x-www-form-urlencoded"

        })
        .done(function(data) {
            if(data.type == 'success'){
                callback();
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

	function getTeams(callback) {
		$.ajax({
            type: 'GET',
            url: '/getTeams',
            data: {
            },
            dataType: "json",
            contentType: "application/x-www-form-urlencoded"

        })
        .done(function(data) {
            console.log(data);
            if(data.type == 'success'){
                callback(data.teams);
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

    function loadSelectOptions(callback) {
        $('.selectpicker>option').remove();
        getTeams(function(teams) {
            _teamsArray = teams;
            if(teams.length > 0) {
                for(var i = 0; i < teams.length; i++) {
                    var newOption = $('<option>').text(teams[i].name).attr('id', i);
                    $('.selectpicker').append(newOption);
                }
                $('.selectpicker').selectpicker('val', teams[teams.length - 1].name);
                $('.selectpicker').selectpicker('refresh');
                $('.bootstrap-select .dropdown-menu li').each(function(index, value) {
                    var removeTeamButton = $('<spann>').addClass('glyphicon glyphicon-remove-circle remove-team');
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
                $('.selectpicker').selectpicker('refresh');
                $('#select-div .bs-placeholder .filter-option').text('Please add or select a team here.');
                if(callback) {
                    callback();
                }
            }
        });
    }

    function deleteTeam(teamId, teamName) {
        var confirmation = confirm('Are you sure you want to remove the team "' + teamName + '"?');
        if(confirmation) {
            $.ajax({
                type: 'DELETE',
                url: '/deleteTeam',
                data: {
                    teamId: teamId
                },
                dataType: "json",
                contentType: "application/x-www-form-urlencoded"

            })
            .done(function(data) {
                console.log(data);
                if(data.type == 'success'){
                   loadSelectOptions();
                   $('.selectpicker').selectpicker('toggle');
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
    }

    var handleSearch = function() {
        if($('.no-results').length > 0) {
            if($('#create').length == 0) {
                //add option to create
                var dropdownMenu = $('#select-div .dropdown-menu .inner');
                var addOption = $('<li>').attr('id', 'create').appendTo(dropdownMenu);
                var addLink = $('<a>').appendTo(addOption);
                var addSpan = $('<span>').addClass('text').text('CREATE THIS TEAM').css('color', 'red');
                addSpan.appendTo(addLink);

                addOption.click(function() {
                    var newText = $('.bs-searchbox>input').val();
                    createTeamAddRequest(newText, function() {
                        loadSelectOptions();
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

            $('#select-div .selectpicker').change(function() {
                var id = $(this).children(":selected").attr('id');
                console.log(_teamsArray[id]);
                team.initialize(_teamsArray[id]);
                _socket.emit('join room', _teamsArray[id]._id);
                initializeSocket(_socket);
            });

            $('#select-div').click(function(){
                $('.bs-searchbox>input').attr('placeholder', 'Search through your existing teams or type a new team name')
                $('.bs-searchbox>input').off('input', handleSearch).on('input', handleSearch);
            });

            $('#select-div .selectpicker').trigger('change');

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
    }
})();
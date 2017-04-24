team = (function() {
	var _teamJson;
	var _personIdToAttrMap;
	var _personAttrToDataMap;
	var _nextPersonAttr;

    return {
    	initialize: function(teamData) {
    		$('body').ploading({action: 'show'});
    		$.ajax({
	            type: 'GET',
	            url: '/getTeamDetails',
	            data: {
	                teamId: teamData._id,
	            },
	            dataType: "json",
	            contentType: "application/x-www-form-urlencoded"

	        })
	        .done(function(data) {
	            if(data.type == 'success'){
	            	_teamJson = data.team;
	            	_nextPersonAttr = 1;
					_personIdToAttrMap = {};
					_personAttrToDataMap = {};
		    		board.render(_teamJson);
		    		burndown.initialize(_teamJson._id);
	            }
	            else {
	                alert(data.error);
	            }

	        })
	        .fail(function(data) {
	            alert("Internal Server Error");
	            console.log(data);
	        });
    	},
    	getPeopleForTask: function(taskId) {
    		var toReturn = [];
    		_teamJson.people.forEach(function(p) {
    			if(p.taskId == taskId) {
    				toReturn.push(p);
    			}
    		});
    		return JSON.parse(JSON.stringify(toReturn));
    	},
    	addPerson: function(personName) {
			$.ajax({
	            type: 'POST',
	            url: '/addPersonToTeam',
	            data: {
	                teamId: _teamJson._id,
	                personName: personName
	            },
	            dataType: "json",
	            contentType: "application/x-www-form-urlencoded"

	        })
	        .done(function(data) {
	            if(data.type == 'success'){
	            	//Socket
	            }
	            else {
	                alert(data.error);
	            }

	        })
	        .fail(function(data) {
	            alert("Internal Server Error");
	            console.log(data);
	        });
    	},

    	getNextPersonAttr: function() {
    		return _nextPersonAttr++;
    	},

    	putPersonInMap: function(attr, personData) {
    		_personIdToAttrMap[personData._id] = attr;
			_personAttrToDataMap[attr] = personData;
    	},

    	assignPersonToTask: function(attr, taskId, storyId) {
			var p = _personAttrToDataMap[attr];
    		if(p) {
				$.ajax({
		            type: 'PUT',
		            url: '/assignPerson',
		            data: {
		                teamId: _teamJson._id,
		                personId: p._id,
		                newTaskId: taskId,
						storyId: storyId
		            },
		            dataType: "json",
		            contentType: "application/x-www-form-urlencoded"

		        })
		        .done(function(data) {
		            if(data.type == 'success'){
		                //Socket handles
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
    	},

    	removePerson: function(attr) {
    		var p = _personAttrToDataMap[attr];

    		if(p) {
				$.ajax({
		            type: 'DELETE',
		            url: '/removePersonFromTeam',
		            data: {
		                teamId: _teamJson._id,
		                personId: p._id
		            },
		            dataType: "json",
		            contentType: "application/x-www-form-urlencoded"

		        })
		        .done(function(data) {
		            if(data.type == 'success'){
		                //Socket handles
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
    	},
		handleAddPerson: function(personData) {
			_teamJson.people.push(personData);
			person().render(personData, $('#unassignedPeople'));	
		},
		handleRemovePerson: function(personId) {
			var attr = _personIdToAttrMap[personId];
			var personDiv = $('div[data-person=' + attr + ']');
			personDiv.remove();
			for(var i = 0; i < _teamJson.people.length; i++) {
				if(_teamJson.people[i] && _teamJson.people[i]._id == personId) {
					delete _teamJson.people[i];
					break;
				}
			}
			delete _personIdToAttrMap[personId];
			delete _personAttrToDataMap[attr];
		},
		handleAssignPerson: function(personId, storyId, taskId) {
			for(var i = 0; i < _teamJson.people.length; i++) {
				if(_teamJson.people[i] && _teamJson.people[i]._id == personId) {
					_teamJson.people[i].taskId = taskId;
				}
			}
			var attr = _personIdToAttrMap[personId];
			var p = _personAttrToDataMap[attr];

			var personDiv = $('div[data-person=' + attr + ']');

			var divToRenderTo;
			if(taskId) {
				divToRenderTo = board.getPeopleDivForTask(storyId, taskId);
			} else {
				 divToRenderTo = $('#unassignedPeople')
			}

			personDiv.remove();
			p.taskId = taskId;
			delete _personIdToAttrMap[p._id];
			delete _personAttrToDataMap[attr];
			person().render(p, divToRenderTo);
		}
    }

})();
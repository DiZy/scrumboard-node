team = (function() {
	let _teamJson;
	let _personIdToAttrMap;
	let _personAttrToDataMap;
	let _nextPersonAttr;
	let _peopleUrl;

    return {
    	getCurrentTeamId: function() {
    		if(!_teamJson) {
    			return null;
    		}
    		return _teamJson._id;
    	},
    	initialize: function(teamData) {
    		$('body').ploading({action: 'show'});
    		$.ajax({
	            type: 'GET',
	            url: '/teams/' + teamData._id,
	            /*data: {
	                teamId: teamData._id,
	            },*/
	            dataType: "json",
	            contentType: "application/x-www-form-urlencoded"

	        })
	        .done(function(data) {
	            if(data.type === 'success'){
	            	_teamJson = data.team;
	            	_nextPersonAttr = 1;
					_personIdToAttrMap = {};
					_personAttrToDataMap = {};
					_peopleUrl = '/teams/' + _teamJson._id + '/people';
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
    		let toReturn = [];
    		_teamJson.people.forEach(function(p) {
    			if(p.taskId === taskId) {
    				toReturn.push(p);
    			}
    		});
    		return JSON.parse(JSON.stringify(toReturn));
    	},
    	getPeopleForStory: function(storyId) {
    		let toReturn = [];
    		_teamJson.people.forEach(function(p) {
    			if(!p.taskId && p.storyId == storyId) {
    				toReturn.push(p);
    			}
    		});
    		return JSON.parse(JSON.stringify(toReturn));
    	},
    	addPerson: function(personName) {
			$.ajax({
	            type: 'POST',
	            url: _peopleUrl,
	            data: {
	                /*teamId: _teamJson._id,*/
	                personName: personName
	            },
	            dataType: "json",
	            contentType: "application/x-www-form-urlencoded"
	        })
	        .done(function(data) {
	            if(data.type === 'success'){
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
			let p = _personAttrToDataMap[attr];
    		if(p) {
				$.ajax({
		            type: 'PUT',
		            url: _peopleUrl + '/' + p._id,
		            data: {
		                /*teamId: _teamJson._id,*/
		                /*personId: p._id,*/
		                taskId: taskId,
						storyId: storyId
		            },
		            dataType: "json",
		            contentType: "application/x-www-form-urlencoded"

		        })
		        .done(function(data) {
		            if(data.type === 'success'){
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
    		let person = _personAttrToDataMap[attr];

    		if(person) {
				$.ajax({
		            type: 'DELETE',
		            url: _peopleUrl + '/' + person._id,
		            /*data: {
		                teamId: _teamJson._id,
		                personId: person._id
		            },*/
		            dataType: "json",
		            contentType: "application/x-www-form-urlencoded"

		        })
		        .done(function(data) {
		            if(data.type === 'success'){
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
			let attr = _personIdToAttrMap[personId];
			let personDiv = $('div[data-person=' + attr + ']');
			personDiv.remove();
			for(let i = 0; i < _teamJson.people.length; i++) {
				if(_teamJson.people[i] && _teamJson.people[i]._id === personId) {
					delete _teamJson.people[i];
					break;
				}
			}
			delete _personIdToAttrMap[personId];
			delete _personAttrToDataMap[attr];
		},
		handleAssignPerson: function(personId, storyId, taskId) {
			for(let i = 0; i < _teamJson.people.length; i++) {
				if(_teamJson.people[i] && _teamJson.people[i]._id === personId) {
					_teamJson.people[i].taskId = taskId;
					_teamJson.people[i].storyId = storyId;
				}
			}
			let attr = _personIdToAttrMap[personId];
			let p = _personAttrToDataMap[attr];

			let personDiv = $('div[data-person=' + attr + ']');

			let divToRenderTo;
			if(storyId && taskId) {
				divToRenderTo = board.getPeopleDivForTask(storyId, taskId);
			}
			else if(storyId) {
				divToRenderTo = board.getPeopleDivForStory(storyId);
			}
			else {
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
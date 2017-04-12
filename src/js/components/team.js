team = (function() {
	var _teamJson;
	var _peopleMap;
	var _nextPersonAttr;

    return {
    	initialize: function(teamjson) {
    		_teamJson = teamjson;
    		_nextPersonAttr = 1;
    		_peopleMap = {};
    		board.render(teamjson);
    		burndown.initialize(teamjson._id);
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
	            console.log(data);
	            if(data.type == 'success'){
	                person().render(data.person, $('#unassignedPeople'));
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

    	putPersonInMap: function(attr, personJson) {
    		_peopleMap[attr] = personJson;
    	},

    	assignPerson: function(personDiv, taskId, divToRenderTo) {

    		var num = personDiv.attr('data-person');

    		var p = _peopleMap[num];

    		if(p) {
				$.ajax({
		            type: 'PUT',
		            url: '/assignPerson',
		            data: {
		                teamId: _teamJson._id,
		                personId: p._id,
		                newTaskId: taskId
		            },
		            dataType: "json",
		            contentType: "application/x-www-form-urlencoded"

		        })
		        .done(function(data) {
		            console.log(data);
		            if(data.type == 'success'){
		                $('.person[data-person=' + num + ']').remove();
		                p.taskId = taskId;
		                person().render(p, divToRenderTo);
		                delete _peopleMap[num];
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

    	removePerson: function(personDiv) {
    		var num = personDiv.attr('data-person');

    		var p = _peopleMap[num];

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
		            console.log(data);
		            if(data.type == 'success'){
		                $('.person[data-person=' + num + ']').remove();
		                delete _peopleMap[num];
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
    }

})();
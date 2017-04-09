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
    	},
    	getPeopleForTask: function(taskId) {
    		var toReturn = [];
    		_teamJson.people.forEach(function(p) {
    			if(p.taskId == taskId) {
    				toReturn += p;
    			}
    		});
    		return JSON.parse(JSON.stringify(toReturn));
    	},
    	addPerson: function() {
    		//TODO
    		person().render({taskId: null, name: 'dz'}, $('#unassignedPeople'));
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
				// $.ajax({
		  //           type: 'PUT',
		  //           url: '/assignPerson',
		  //           data: {
		  //               teamId: _teamJson.id,
		  //               personId: p.id,
		  //               newTaskId: taskId
		  //           },
		  //           dataType: "json",
		  //           contentType: "application/x-www-form-urlencoded"

		  //       })
		  //       .done(function(data) {
		  //           console.log(data);
		  //           if(data.type == 'success'){
		  //               $('.person[data-person=' + num + ']').remove();
		  //               p.taskId = taskId;
		  //               person().render(p, divToRenderTo);
		  //               delete _peopleMap[num];
		  //           }
		  //           else {
		  //               alert(data.error);
		  //           }

		  //       })
		  //       .fail(function(data) {
		  //           alert("Internal Server Error");
		  //           console.log(data);
		  //       });
				$('.person[data-person=' + num + ']').remove();
				p.taskId = taskId;
				person().render(p, divToRenderTo);
				delete _peopleMap[num];
    		}

    	},

    	removePerson: function(personDiv) {
    		var num = personDiv.attr('data-person');
    		$('.person[data-person=' + num + ']').remove();
    		delete _peopleMap[num];
    		//TODO: ajax
    	}
    }

})();
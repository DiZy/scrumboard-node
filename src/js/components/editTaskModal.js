editTaskModal = (function() {
	var _taskJsonEdited;

	function removeDetails() {

	}

	function renderDetails(taskJson) {
		_taskJsonEdited = taskJson ? taskJson : {name: "New Task", people: []};

	}

	function renderSaveButton(callback) {

	}

	return {
		open: function(taskJson, callback) {
			removeDetails();
			renderDetails(taskJson);
			renderSaveButton(callback);
		}
	}
})();
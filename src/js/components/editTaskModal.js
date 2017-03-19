editTaskModal = (function() {
	var _taskJsonEdited;
	var _taskForm;

	function removeDetails() {
		$('#editDetails').remove();
		$('#editModal .modal-save').remove();
	}

	function renderDetails(taskJson) {
		if(taskJson) {
			$('#editModal .modal-title').text('Edit task');
		}
		else {
			$('#editModal .modal-title').text('Add task');
		}

		_taskJsonEdited = taskJson ? taskJson : {name: "New Task", people: []};
		var modalBody = $('#editModal .modal-body');
		var editDetails = $('<div>').attr('id', 'editDetails').appendTo(modalBody);

		_taskForm = $('<form id="peopleForm">' +
			'<input type="text" class="input form-control" placeholder="Task Name" name="taskName" id="taskName">' +
			'</form').appendTo(editDetails);

		var personCount = _taskJsonEdited.people.length;

		for(var i = 0; i < personCount; i++) {
			var personInput = $('<input type="text" class="input form-control" placeholder="Person Name" name="people[]">').appendTo(_taskForm);
			personInput.val(_taskJsonEdited.people[i]);
		}

		if(personCount < 4) {
			var addPeopleButton = $('<button>').addClass('btn btn-default').text('Add A Person').appendTo(editDetails);

			addPeopleButton.click(function() {
				$('<input type="text" class="input form-control" placeholder="Person Name" name="people[]">').appendTo(_taskForm);
				personCount++;
				if(personCount >= 4) {
					$(this).hide();
				}
			});
		}

		$('#taskName').val(_taskJsonEdited.name);

	}

	function renderSaveButton(callback) {
		var modalFooter = $('#editModal .modal-footer');
		var saveButton = $('<button type="button" class="btn btn-primary modal-save">Save</button>').appendTo(modalFooter);

		saveButton.click(function() {
			_taskJsonEdited.name = $('#taskName').val();
			_taskJsonEdited.people = $("#peopleForm input[name='people\\[\\]']").map(function(){return $(this).val();}).get();
			$('#editModal').modal('hide');
			callback(_taskJsonEdited);
		});
	}

	return {
		open: function(taskJson, callback) {
			removeDetails();
			renderDetails(taskJson);
			renderSaveButton(callback);
			$('#editModal').modal('show');
		}
	}
})();
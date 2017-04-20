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

		_taskJsonEdited = taskJson ? taskJson : {name: "New Task"};
		var modalBody = $('#editModal .modal-body');
		var editDetails = $('<div>').attr('id', 'editDetails').appendTo(modalBody);

		_taskForm = $('<form id="peopleForm">' +
			'<input type="text" class="input form-control" placeholder="Task Name" name="taskName" id="taskName">' +
			'</form').appendTo(editDetails);

		var pointsInput = $('<input>').addClass('input form-control').attr('placeholder', 'Task Hours').attr('id', 'taskHours').appendTo(_taskForm);
		pointsInput.val(_taskJsonEdited.points);

		var notesInput = $('<textarea>').addClass('input form-control').attr('placeholder', 'Notes').attr('id', 'taskNotes').appendTo(_taskForm);
		notesInput.val(_taskJsonEdited.notes);

		$('#taskName').val(_taskJsonEdited.name);

	}

	function renderSaveButton(callback) {
		var modalFooter = $('#editModal .modal-footer');
		var saveButton = $('<button type="button" class="btn btn-primary modal-save">Save</button>').appendTo(modalFooter);

		saveButton.click(function() {
			_taskJsonEdited.name = $('#taskName').val();
			_taskJsonEdited.points = parseInt($('#taskHours').val());
			_taskJsonEdited.notes = $('#taskNotes').val();
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
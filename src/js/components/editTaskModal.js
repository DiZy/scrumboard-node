editTaskModal = (function() {
	let _taskJsonEdited;
	let _taskForm;

	function removeDetails() {
		$('#editDetails').remove();
		$('#editModal').find('.modal-save').remove();
	}

	function renderDetails(taskJson) {
		if(taskJson) {
			$('#editModal').find('.modal-title').text('Edit task');
		}
		else {
			$('#editModal').find('.modal-title').text('Add task');
		}

		_taskJsonEdited = taskJson ? taskJson : {name: "New Task"};
		let modalBody = $('#editModal').find('.modal-body');
		let editDetails = $('<div>').attr('id', 'editDetails').appendTo(modalBody);

		_taskForm = $('<form id="peopleForm">' +
			'<textarea type="text" class="input form-control" placeholder="Task Name" name="taskName" id="taskName"></textarea>' +
			'</form').appendTo(editDetails);

		let pointsInput = $('<input>').addClass('input form-control').attr('placeholder', 'Task Hours').attr('id', 'taskHours').appendTo(_taskForm);
		pointsInput.val(_taskJsonEdited.points);

		let notesInput = $('<textarea>').addClass('input form-control').attr('placeholder', 'Notes').attr('id', 'taskNotes').appendTo(_taskForm);
		notesInput.val(_taskJsonEdited.notes);

		$('#taskName').val(_taskJsonEdited.name);

	}

	function renderSaveButton(callback) {
		let modalFooter = $('#editModal').find('.modal-footer');
		let saveButton = $('<button type="button" class="btn btn-primary modal-save">Save</button>').appendTo(modalFooter);

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
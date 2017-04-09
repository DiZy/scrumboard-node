addPersonModal = (function() {
	var _personName;

	function removeDetails() {
		$('#editDetails').remove();
		$('#editModal .modal-save').remove();
	}

	function renderDetails() {
		$('#editModal .modal-title').text('Add Person');

		_personName = "";

		var modalBody = $('#editModal .modal-body');
		var editDetails = $('<div>').attr('id', 'editDetails').appendTo(modalBody);

		var personNameInput = $('<input>').addClass('input form-control').attr('placeholder', 'Person Initials').appendTo(editDetails);

		personNameInput.on('input', function() {
			_personName = $(this).val();
		});

	}

	function renderSaveButton(callback) {
		var modalFooter = $('#editModal .modal-footer');
		var saveButton = $('<button type="button" class="btn btn-primary modal-save">Save</button>').appendTo(modalFooter);

		saveButton.click(function() {
			$('#editModal').modal('hide');
			callback(_personName);
		});
	}

	return {
		open: function(callback) {
			removeDetails();
			renderDetails();
			renderSaveButton(callback);
			$('#editModal').modal('show');
		}
	}
})();
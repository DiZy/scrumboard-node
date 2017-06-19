addPersonModal = (function() {
	let _personName;

	function removeDetails() {
		$('#editDetails').remove();
		$('#editModal').find('.modal-save').remove();
	}

	function renderDetails() {
		$('#editModal').find('.modal-title').text('Add Person');

		_personName = "";

		let modalBody = $('#editModal').find('.modal-body');
		let editDetails = $('<div>').attr('id', 'editDetails').appendTo(modalBody);

		let personNameInput = $('<input>').addClass('input form-control').attr('placeholder', 'Person Initials').appendTo(editDetails);

		personNameInput.on('input', function() {
			_personName = $(this).val();
		});

	}

	function renderSaveButton(callback) {
		let modalFooter = $('#editModal').find('.modal-footer');
		let saveButton = $('<button type="button" class="btn btn-primary modal-save">Save</button>').appendTo(modalFooter);

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
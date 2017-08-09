editTeamNameModal = (function() {
	function removeDetails() {
		$('#editDetails').remove();
		$('#editModal .modal-save').remove();
	}

	function renderDetails(teamName) {
		$('#editModal .modal-title').text('Edit Team Name');

		var modalBody = $('#editModal .modal-body');
		var editDetails = $('<div>').attr('id', 'editDetails').appendTo(modalBody);

		var teamNameInput = $('<input>').attr('id', 'teamNameInput').addClass('input form-control').attr('placeholder', 'Team Name').appendTo(editDetails);
		teamNameInput.val(teamName);
	}

	function renderSaveButton(callback) {
		var modalFooter = $('#editModal .modal-footer');
		var saveButton = $('<button type="button" class="btn btn-primary modal-save">Save</button>').appendTo(modalFooter);

		saveButton.click(function() {
			$('#editModal').modal('hide');
			callback($('#teamNameInput').val());
		});
	}

	return {
		open: function(teamName, callback) {
			removeDetails();
			renderDetails(teamName);
			renderSaveButton(callback);
			$('#editModal').modal('show');
		}
	}
})();
editStoryModal = (function() {
	var _storyJsonEdited;

	function removeDetails() {
		$('#editDetails').remove();
		$('#editModal .modal-save').remove();
	}

	function renderDetails(storyJson) {
		if(storyJson) {
			$('#editModal .modal-title').text('Edit story');
		}
		else {
			$('#editModal .modal-title').text('Add story');
		}

		_storyJsonEdited = storyJson ? storyJson : {name: "New Story"};
		var modalBody = $('#editModal .modal-body');
		var editDetails = $('<div>').attr('id', 'editDetails').appendTo(modalBody);

		var nameInput = $('<input>').addClass('input form-control').attr('placeholder', 'Story Name').appendTo(editDetails);
		nameInput.val(_storyJsonEdited.name);

		nameInput.on('input', function() {
			_storyJsonEdited.name = nameInput.val();
		});

	}

	function renderSaveButton(callback) {
		var modalFooter = $('#editModal .modal-footer');
		var saveButton = $('<button type="button" class="btn btn-primary modal-save">Save</button>').appendTo(modalFooter);

		saveButton.click(function() {
			$('#editModal').modal('hide');
			callback(_storyJsonEdited);
		});

	}

	return {
		open: function(storyJson, callback) {
			removeDetails();
			renderDetails(storyJson);
			renderSaveButton(callback);
			$('#editModal').modal('show');
		}
	}
})();
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

		_storyJsonEdited = storyJson ? storyJson : {name: "New Story", points: ""};
		var modalBody = $('#editModal .modal-body');
		var editDetails = $('<div>').attr('id', 'editDetails').appendTo(modalBody);

		var nameInput = $('<input>').addClass('input form-control').attr('placeholder', 'Story Name').appendTo(editDetails);
		nameInput.val(_storyJsonEdited.name);

		nameInput.on('input', function() {
			_storyJsonEdited.name = nameInput.val();
		});

		var pointsInput = $('<input>').addClass('input form-control').attr('placeholder', 'Story Points').appendTo(editDetails);
		pointsInput.val(_storyJsonEdited.points);

		pointsInput.on('input', function() {
			_storyJsonEdited.points = parseInt(pointsInput.val());
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
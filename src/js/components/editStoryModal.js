editStoryModal = (function() {
	var _storyJsonEdited;

	function removeDetails() {
		$('#editDetails').remove();
		$('#editModal .modal-save').remove();
	}

	function renderDetails(teamId, storyJson) {
		if(storyJson) {
			$('#editModal .modal-title').text('Edit story');
		}
		else {
			$('#editModal .modal-title').text('Add story');
		}

		_storyJsonEdited = storyJson ? storyJson : {name: "New Story", points: "", teamId: teamId};
		var modalBody = $('#editModal .modal-body');
		var editDetails = $('<div>').attr('id', 'editDetails').appendTo(modalBody);

		var nameInput = $('<textarea>').addClass('input form-control').attr('placeholder', 'Story Name').appendTo(editDetails);
		nameInput.val(_storyJsonEdited.name);

		nameInput.on('input', function() {
			_storyJsonEdited.name = nameInput.val();
		});

		var pointsInput = $('<input>').addClass('input form-control').attr('placeholder', 'Story Points').appendTo(editDetails);
		pointsInput.val(_storyJsonEdited.points);

		pointsInput.on('input', function() {
			_storyJsonEdited.points = parseInt(pointsInput.val());
		});

		var teamInput = $('<select>').attr('data-live-search', 'true').appendTo(editDetails);
		loadTeamOptions(teamInput);
    	teamInput.val(teamId);
    	teamInput.selectpicker('refresh');
		teamInput.change(function() {
    		_storyJsonEdited.teamId = teamInput.val();
    	});
	}

	function loadTeamOptions(teamInput) {
		var mainTeamSelector = $('#select-div').children('.bootstrap-select').children('.selectpicker');
		var options = mainTeamSelector.children('option');
		for(var i = 0; i < options.length; i++) {
			var option = options[i];
			var optionText = $(option).text();
			var optionVal = $(option).val();
			var newOption = $('<option>').text(optionText).val(optionVal).appendTo(teamInput)
		};
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
		open: function(teamId, storyJson, callback) {
			removeDetails();
			renderDetails(teamId, storyJson);
			renderSaveButton(callback);
			$('#editModal').modal('show');
		}
	}
})();
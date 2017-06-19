editStoryModal = (function() {
	var _storyJsonEdited;

	function removeDetails() {
		$('#editDetails').remove();
		$('#editModal').find('.modal-save').remove();
	}

	function renderDetails(teamId, storyJson) {
		if(storyJson) {
			$('#editModal').find('.modal-title').text('Edit story');
		}
		else {
			$('#editModal').find('.modal-title').text('Add story');
		}

		_storyJsonEdited = storyJson ? storyJson : {name: "New Story", points: "", teamId: teamId};
		var modalBody = $('#editModal').find('.modal-body');
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

		$('<h6>').text('Choose a team/board').appendTo(editDetails);
		var teamInput = $('<select>').attr('data-live-search', 'true').appendTo(editDetails);
		loadTeamOptions(teamInput);
    	teamInput.val(teamId);
    	teamInput.selectpicker('refresh');
		teamInput.change(function() {
    		_storyJsonEdited.teamId = teamInput.val();
    	});

		$('<br>').appendTo(editDetails);
		$('<h6>').text('Additional Acceptance Criteria').appendTo(editDetails);

		$('<div>').attr('id', 'editCriteriaDiv').appendTo(editDetails);

		if(_storyJsonEdited.acceptanceCriteria) {
			_storyJsonEdited.acceptanceCriteria.forEach(function(criteria) {
				var isChecked = criteria.isChecked == true || criteria.isChecked == "true";
				addCriteria(criteria.name, isChecked);
			});
		}

		var newAcceptanceCriteriaInput = $('<textarea>').addClass('input form-control').attr('placeholder', 'New criteria').appendTo(editDetails);
		var addCriteriaButton = $('<button>').addClass('btn btn-default').text('Add Criteria').appendTo(editDetails);

		addCriteriaButton.click(function() {
			addCriteria(newAcceptanceCriteriaInput.val());
		});
	}

	function addCriteria(criteriaName, isChecked) {
		if(criteriaName) {
			var criteriaNameRow = $('<div>').addClass('row').appendTo('#editCriteriaDiv');
			var criteriaCheckbox = $('<input>').attr('type', 'checkbox').addClass('col-xs-2 criteriaCheckbox').appendTo(criteriaNameRow);
			var criteriaNameDiv = $('<div>').addClass('col-xs-8 criteriaNameDiv').text(criteriaName).appendTo(criteriaNameRow);
			var criteriaDeleteButton = $('<span>').addClass('col-xs-2 glyphicon glyphicon-remove').appendTo(criteriaNameRow);

			if(isChecked) {
				criteriaCheckbox.attr('checked', true);
			}

			criteriaDeleteButton.click(function() {
				criteriaNameRow.remove();
			});
		}
		else {
			alert('Please enter a criteria description.');
		}
	}

	function loadTeamOptions(teamInput) {
		var mainTeamSelector = $('#select-div').children('.bootstrap-select').children('.selectpicker');
		var options = mainTeamSelector.children('option');
		for(var i = 0; i < options.length; i++) {
			var option = options[i];
			var optionText = $(option).text();
			var optionVal = $(option).val();
			var newOption = $('<option>').text(optionText).val(optionVal).appendTo(teamInput)
		}
	}

	function renderSaveButton(callback) {
		var modalFooter = $('#editModal').find('.modal-footer');
		var saveButton = $('<button type="button" class="btn btn-primary modal-save">Save</button>').appendTo(modalFooter);

		saveButton.click(function() {
			var acceptanceCriteria = [];
			var acceptanceCriteriaDiv = $('#editCriteriaDiv>.row');
			for(var i = 0; i < acceptanceCriteriaDiv.length; i++) {
				var row = $(acceptanceCriteriaDiv[i]);
				acceptanceCriteria.push({
					name: row.children('.criteriaNameDiv').text(),
					isChecked: row.children('.criteriaCheckbox').get()[0].checked
				});
			}
			_storyJsonEdited.acceptanceCriteria = acceptanceCriteria;
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
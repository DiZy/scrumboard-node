editStoryModal = (function() {
	let _storyJsonEdited;

	function removeDetails() {
		$('#editDetails').remove();
		$('#editModal').find('.modal-save').remove();
	}

	function renderDetails(teamId, storyJson) {
        let editModal = $('#editModal'),
            modalTitle = editModal.find('.modal-title'),
            modalBody = editModal.find('.modal-body'),
			editDetails,
			nameInput,
			pointsInput,
			teamInput,
            newAcceptanceCriteriaInput,
            addCriteriaButton;

		modalTitle.text(storyJson ? 'Edit Story' : 'Add Story');

		_storyJsonEdited = storyJson ? storyJson : {name: "New Story", points: "", teamId: teamId, tasks: []};
		editDetails = $('<div>').attr('id', 'editDetails').appendTo(modalBody);

        nameInput = $('<textarea>')
            .addClass('input form-control')
            .attr('placeholder', 'Story Name')
            .appendTo(editDetails)
            .val(_storyJsonEdited.name)
            .on('input', function() {
                _storyJsonEdited.name = nameInput.val();
            });

		pointsInput = $('<input>')
			.addClass('input form-control')
			.attr('placeholder', 'Story Points')
			.appendTo(editDetails)
			.val(_storyJsonEdited.points)
			.on('input', function() {
				_storyJsonEdited.points = parseInt(pointsInput.val());
			});

		$('<h6>').text('Choose a team/board').appendTo(editDetails);
		teamInput = $('<select>').attr('data-live-search', 'true').appendTo(editDetails);
		loadTeamOptions(teamInput);
    	teamInput.val(teamId)
			.selectpicker('refresh')
			.change(function() {
				_storyJsonEdited.teamId = teamInput.val();
			});

		$('<br>').appendTo(editDetails);
		$('<h6>').text('Additional Acceptance Criteria').appendTo(editDetails);

		$('<div>').attr('id', 'editCriteriaDiv').appendTo(editDetails);

		if(_storyJsonEdited.acceptanceCriteria) {
			_storyJsonEdited.acceptanceCriteria.forEach(function(criteria) {
				let isChecked = criteria.isChecked === true || criteria.isChecked === "true";
				addCriteria(criteria.name, isChecked);
			});
		}

		newAcceptanceCriteriaInput = $('<textarea>')
			.addClass('input form-control')
			.attr('placeholder', 'New criteria')
			.appendTo(editDetails);
		addCriteriaButton = $('<button>')
			.addClass('btn btn-default')
			.text('Add Criteria')
			.appendTo(editDetails)
			.click(function() {
				addCriteria(newAcceptanceCriteriaInput.val());
			});
	}

	function addCriteria(criteriaName, isChecked) {
		if(criteriaName) {
			let criteriaNameRow = $('<div>').addClass('row').appendTo('#editCriteriaDiv');
			let criteriaCheckbox = $('<input>').attr('type', 'checkbox').addClass('col-xs-2 criteriaCheckbox').appendTo(criteriaNameRow);
			let criteriaNameDiv = $('<div>').addClass('col-xs-8 criteriaNameDiv').text(criteriaName).appendTo(criteriaNameRow);
			let criteriaDeleteButton = $('<span>').addClass('col-xs-2 glyphicon glyphicon-remove').appendTo(criteriaNameRow);

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
		let mainTeamSelector = $('#select-div').children('.bootstrap-select').children('.selectpicker');
		let options = mainTeamSelector.children('option');
		for(let i = 0; i < options.length; i++) {
			let option = options[i];
			let optionText = $(option).text();
			let optionVal = $(option).val();
			let newOption = $('<option>').text(optionText).val(optionVal).appendTo(teamInput)
		}
	}

	function renderSaveButton(callback) {
        let editModal = $('#editModal');
		let modalFooter = editModal.find('.modal-footer');
		let saveButton = $('<button type="button" class="btn btn-primary modal-save">Save</button>').appendTo(modalFooter);

		saveButton.click(function() {
			let acceptanceCriteria = [];
			let acceptanceCriteriaDiv = $('#editCriteriaDiv').children('.row');
			for(let i = 0; i < acceptanceCriteriaDiv.length; i++) {
				let row = $(acceptanceCriteriaDiv[i]);
				acceptanceCriteria.push({
					name: row.children('.criteriaNameDiv').text(),
					isChecked: row.children('.criteriaCheckbox').get()[0].checked
				});
			}
			_storyJsonEdited.acceptanceCriteria = acceptanceCriteria;
            editModal.modal('hide');
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
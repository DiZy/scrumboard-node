editColumnsModal = (function() {
	var _editedColumnNames;

	function removeDetails() {
		$('#editDetails').remove();
		$('#editModal .modal-save').remove();
	}

	function renderDetails() {
		$('#editModal .modal-title').text('Edit Columns');


		var modalBody = $('#editModal .modal-body');
		var editDetails = $('<div>').attr('id', 'editDetails').appendTo(modalBody);

		var editColumnNamesDiv = $('<div>').attr('id', 'editColumnNamesDiv').appendTo(editDetails);

		_editedColumnNames.forEach(function(columnName) {
			addColumn(columnName);
		});

		var newColumnInput = $('<input>').addClass('input form-control').attr('placeholder', 'New column name').appendTo('#editDetails');
		var addColumnButton = $('<button>').addClass('btn btn-default').text('Add Column').appendTo('#editDetails');

		addColumnButton.click(function() {
			addColumn(newColumnInput.val());
		});

		$('<br>').appendTo(editDetails);
		$('<div>').addClass('center').text('The last column will be treated as the done column for the burndown.').appendTo(editDetails);
		$('<br>').appendTo(editDetails);
		$('<div>').addClass('center').text('It is recommended not to remove columns while tasks are present on the board.').appendTo(editDetails);
	}

	function addColumn(columnName) {
		if(columnName) {
			var columnNameRow = $('<div>').addClass('row').appendTo('#editColumnNamesDiv');
			var columnNameDiv = $('<div>').addClass('col-xs-10 columnNameDiv').text(columnName).appendTo(columnNameRow);
			var columnDeleteButton = $('<span>').addClass('col-xs-2 glyphicon glyphicon-remove').appendTo(columnNameRow);

			columnDeleteButton.click(function() {
				if($('#editColumnNamesDiv').find('.columnNameDiv').length > 1) {
					columnNameRow.remove();
				}
				else {
					alert('You cannot remove all columns.');
				}
			});
		}
		else {
			alert('Please enter a column name.');
		}
	}

	function renderSaveButton(callback) {
		var modalFooter = $('#editModal .modal-footer');
		var saveButton = $('<button type="button" class="btn btn-primary modal-save">Save</button>').appendTo(modalFooter);

		saveButton.click(function() {
			var columnNameDivs = $('#editColumnNamesDiv').find('.columnNameDiv');
			_editedColumnNames = [];
			for(var i = 0; i < columnNameDivs.length; i++) {
				_editedColumnNames.push($(columnNameDivs[i]).text());
			}
			$('#editModal').modal('hide');
			callback(_editedColumnNames);
		});
	}

	return {
		open: function(columnNames, callback) {
			_editedColumnNames = columnNames
			removeDetails();
			renderDetails();
			renderSaveButton(callback);
			$('#editModal').modal('show');
		}
	}
})();
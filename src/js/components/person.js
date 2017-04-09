var person = (function() {

	var _personJson;

	return {
		render: function(personJson, $div) {
			_personJson = personJson;
			var personDiv = $('<div>').addClass('person').text(personJson.name).appendTo($div);
			var attrToUse = team.getNextPersonAttr();
			team.putPersonInMap(attrToUse, personJson);
			personDiv.attr('data-person', attrToUse);
			personDiv.draggable({
				revert: true,
				start: function() {
					$('#addPersonButton').text('X');
				},
				stop: function() {
					$('#addPersonButton').text('+');
				}
			});
		}
	}
});
let person = (function() {

	let _personJson;

	return {
		render: function(personJson, $div) {
			_personJson = personJson;
			let personDiv = $('<div>').addClass('person').text(personJson.name).appendTo($div);
			let attrToUse = team.getNextPersonAttr();
			team.putPersonInMap(attrToUse, personJson);
			personDiv.attr('data-person', attrToUse);
			personDiv.draggable({
				revert: true,
				start: function() {
					$('#addPersonButton')[0].innerHTML = "<span class='glyphicon glyphicon-trash'></span>";
				},
				stop: function() {
					$('#addPersonButton').text('+');
				}
			});
		}
	}
});
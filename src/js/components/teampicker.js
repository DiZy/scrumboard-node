teampicker = (function() {
	var _selectpicker;

	function selectTeam(teamName) {
		//TODO
	}

	function getTeam() {
		//TODO
		return [];
	}

    $(document).ready(function() {
    	_selectpicker = $('<select>').addClass('selectpicker').attr('data-live-search', 'true');
    	_selectpicker.appendTo('#select-div');
    	_selectpicker.selectpicker('refresh');

    	//add initial select options

    	_selectpicker.change(function() {

    	});

    });

    //Add on change event handler to initialize team

})();
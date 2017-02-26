teampicker = (function() {
	var _selectpicker;
    $(document).ready(function() {
    	_selectpicker = $('<select>').addClass('selectpicker').attr('data-live-search', 'true');
    	_selectpicker.appendTo('#select-div');
    	_selectpicker.selectpicker('refresh');

    });

})();
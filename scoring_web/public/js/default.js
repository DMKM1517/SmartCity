$(document).ready(function() {
	$('form').submit(function() {
		$('#score_it').prop('disabled', true);
		$('#msg').text('Processing...');
	});
});
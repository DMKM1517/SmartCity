$(function() {
	$('#fsenti').submit(function(event) {
		event.preventDefault();
		$('#submit1').prop('disabled', true);
		$('#submit1').text('Processing...');
		$('#results1').text('');
		$('#text1').text('');
		$.ajax({
			type: 'POST',
			url: 'score/myScore',
			data: $(this).serialize(),
			dataType: 'json'
		}).done(function(resp) {
			if (resp.score) {
				$('#results1').text('Score: ' + resp.score);
				$('#text1').text($('#txa').val());
				$('#txa').val('');
			}
			$('#submit1').prop('disabled', false);
			$('#submit1').text('Submit');
		}).fail(function(err) {
			console.log(err);
			$('#submit1').prop('disabled', false);
			$('#submit1').text('Submit');
			$('#text1').text('An error occurred');
		});
	});
	
	$('#fword2vec').submit(function(event) {
		event.preventDefault();
		$('#submit2').prop('disabled', true);
		$('#submit2').text('Processing...');
		$('#results2').html('');
		$('#text2').text('');
		$('#txtword').val($('#txtword').val().split(' ')[0]);
		$.ajax({
			type: 'POST',
			url: 'score/myScore',
			data: $(this).serialize(),
			dataType: 'json'
		}).done(function(resp) {
			if (resp) {
				$('#text2').text($('#txtword').val());
				$('#txtword').val('');
				var cont = '<thead><tr>' +
						'<th>Word</th><th>Prob</th>' +
						'</tr></thead>';
				for (var i in resp) {
					cont += '<tr>' +
						'<td>' + resp[i].word + '</td>' +
						'<td>' + resp[i].prob + '</td>' +
						'</tr>';
				}
				$('#results2').html(cont);
			}
			$('#submit2').prop('disabled', false);
			$('#submit2').text('Submit');
		}).fail(function(err) {
			console.log(err);
			$('#submit2').prop('disabled', false);
			$('#submit2').text('Submit');
			$('#text2').text('An error occurred');
		});
	});
});
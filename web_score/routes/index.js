var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ScoreText' });
});

router.post('/', function(req, res) {
	var PythonShell = require('python-shell');
	var text = req.body.text || '';
	var options = {
		mode: 'text',
		// pythonPath: 'path/to/python',
		// pythonOptions: ['-u'],
		scriptPath: __dirname + '/../../DataScienceNotebooks',
		args: [text]
	};

	PythonShell.run('SmartModel.py', options, function(err, results) {
		if (err) throw err;
		var msg = 'Score: ' + results.toString();
		res.render('index', {
			title: 'ScoreText', 
			msg: msg,
			text: text
		});
	});
});

module.exports = router;

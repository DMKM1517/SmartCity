/**
 * PointsController
 *
 * @description :: Server-side logic for managing Points
 */

module.exports = {
	myScore: function(req, res) {
		console.log(req.body.text)
		// res.json("Hello World")
		var PythonShell = require('python-shell');
		var text = req.body.text || '';
		var options = {
			mode: 'text',
			// pythonPath: 'path/to/python',
			// pythonOptions: ['-u'],
			scriptPath: __dirname + '/../../../DataScienceNotebooks',
			args: [text]
		};
	PythonShell.run('SmartModel.py', options, function(err, results) {
		if (err) throw err;
		var msg = 'Score: ' + results.toString();
		res.render('homepage', {
			title: 'ScoreText', 
			msg: msg,
			text: text
		});
	});
	}

};

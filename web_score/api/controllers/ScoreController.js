/**
 * PointsController
 *
 * @description :: Server-side logic for managing Points
 */

module.exports = {
	myScore: function(req, res) {
		"use strict";
		var PythonShell = require('python-shell');
		var text = req.body.text || '';
		var script = req.body.script || 'senti';
		var options = {
			mode: 'text',
			// pythonPath: 'path/to/python',
			// pythonOptions: ['-u'],
			scriptPath: __dirname + '/../../../DataScienceNotebooks',
			args: [script, text]
		};
		if (text != '') {
			PythonShell.run('SmartModel.py', options, function(err, results) {
				if (err) {
					res.serverError(err);
				} else {
					if (script == 'senti') {
						res.json({
							score: results.toString()
						});
					} else {
						if (results[0]) {
							let prob = eval(results[0]);
							let words = results[0].match(/'.+'/)[0].split('\'');
							let resp = {};
							let i = 0;
							for (let r of words) {
								if (r.length > 0 && !r.startsWith(',')) {
									resp[i] = ({
										word: r,
										prob: prob[i++]
									});
								}
							}
							res.json(resp);
						} else {
							res.serverError(results);
						}
					}
				}
			});
		} else {
			res.ok();
		}
	}

};
exports.install = function() {
	F.route('/', view_index);
	F.route('/', json_index, ['post']);
	// or
	// F.route('/');
};

function view_index() {
	var self = this;
	self.view('index');
}

function json_index() {
	var self = this;
	var PythonShell = require('python-shell');
	var text = self.post.text || '';
	var options = {
		mode: 'text',
		// pythonPath: 'path/to/python',
		// pythonOptions: ['-u'],
		scriptPath: __dirname + '/../../DataScienceNotebooks',
		args: [text]
	};

	PythonShell.run('SmartModel.py', options, function(err, results) {
		if (err) throw err;
		// results is an array consisting of messages collected during execution 
		self.msg = 'Score: ' + results.toString();
		self.view('index');
	});
}

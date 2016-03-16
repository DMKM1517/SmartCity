var path = require('path');
var srcDir = path.join(__dirname, '..', '..', 'api');

require('blanket')({
	// Only files that match the pattern will be instrumented
	pattern: srcDir,
	"data-cover-never": ["responses","policies"],
	"data-cover-reporter-options": {
		"shortnames": true
	}
});

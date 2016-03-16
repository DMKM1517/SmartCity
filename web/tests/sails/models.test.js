var expect = require('expect.js');

describe('Model: Points', function() {

  describe('#find()', function() {
    it('gets results with limit', function(done) {
      Points.find({ limit: 5 })
        .then(function(results) {
          expect(results.length).to.be(5);
          done();
        })
        .catch(done);
    });
  });

});

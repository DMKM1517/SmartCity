var request = require('supertest');
var expect = require('expect.js');

describe('Controller: PointsController', function() {
	describe('#getPoints()', function() {
		it('returns the points of the given page', function(done) {
			request(sails.hooks.http.app)
				.get('/points/getPoints?page=1')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					expect(res.body).to.have.length(50);
				})
				.end(function(err, res) {
					if (err) return done(err);
					done();
				});
		});
		it('returns points of page 1 if it is undefined', function(done) {
			request(sails.hooks.http.app)
				.get('/points/getPoints')
				.expect('Content-Type', /json/)
				.expect(200)
				.expect(function(res) {
					expect(res.body).to.have.length(50);
				})
				.end(function(err, res) {
					if (err) return done(err);
					done();
				});
		});
	});
});

var expect = require('chai').expect;
var solve = require('../src/index');
var Promise = require('es6-promise').Promise;

describe('solve', function () {
	it('should return a function', function () {
		var returned = solve(true);

		expect(returned).to.be.a('function');
	});

	it('should allow listeners to be added via the return function', function () {
		var returned = solve(true);

		returned(function (val) {
			expect(val).to.be.true;
		});
	});

	it('should allow chaining from first listener', function () {
		function addOne(val) {
			return val + 1;
		}

		solve(1, addOne, addOne)(addOne, addOne)(function (result) {
			expect(result).to.equal(5);
		});
	});

	it('should allow separate chain paths of listeners', function () {
		var solution = solve(1);

		solution(function (value) {
			return value + 1;
		})(function (result) {
			expect(result).to.equal(2);
		});

		solution(function (value) {
			return value + 2;
		})(function (result) {
			expect(result).to.equal(3);
		});
	});

	it('should allow combining streams in solution', function (done) {
		solve({
			one: solve(function (callback) {
				setTimeout(function() {
					callback(1);
				}, 1);
			}),
			two: solve(2)
		}, function (result) {
			// wait until the timeout is done
			if (result.one) {
				expect(result.one).to.equal(1);
				expect(result.two).to.equal(2);
				done();
			}
		});
	});

	it('should delay execution until listener is added', function () {
		var value = 0,
			stream = solve(function () {
				value = 1;
			});

		expect(value).to.equal(0);

		stream(function(){});

		expect(value).to.equal(1);
	});

	it('should solve booleans immediately', function () {
		solve(true, function (val) {
			expect(val).to.be.true;
		});

		solve(false, function (val) {
			expect(val).to.be.false;
		});
	});

	it('should solve strings immediately', function () {
		solve('hello', function (val) {
			expect(val).to.equal('hello');
		});
	});

	it('should solve nulls immediately', function () {
		solve(null, function (val) {
			expect(val).to.be.null;
		});
	});

	it('should solve undefined immediately', function () {
		solve(undefined, function (val) {
			expect(val).to.be.undefined;
		});
	});

	it('should solve numbers immediately', function () {
		solve(1, function (val) {
			expect(val).to.equal(1);
		});

		solve(1.4, function (val) {
			expect(val).to.equal(1.4);
		});

		solve(-1/0, function (val) {
			expect(val).to.equal(-Infinity);
		});

		solve(1/0, function (val) {
			expect(val).to.equal(Infinity);
		});

		solve(0/0, function (val) {
			expect(val).to.be.NaN;
		});
	});

	it('should solve functions recursively', function () {
		function fn() {
			return function(){
				return function(){
					return 123;
				};
			};
		}

		solve(fn, function (val) {
			expect(val).to.equal(123);
		});
	});

	it('should solve functions via a callback parameter', function (done) {
		function fn(callback) {
			setTimeout(function(){
				callback('bar');
			}, 1);

			return 'foo';
		};

		var call = 0;

		solve(fn, function (val) {
			call++;
			
			if (call === 1) {
				// first time
				expect(val).to.equal('foo');
			}

			if (call === 2) {
				// second time
				expect(val).to.equal('bar');
				done();
			}
		});
	});

	it('should solve promises that succeed', function (done) {
		var promise = new Promise(function (resolve) {
			resolve('hello');
		});

		solve(promise, function (val) {
			if (val) {
				expect(val).to.equal('hello');
				done();
			}
		});
	});

	it('should solve synchronous promises (non-spec)', function () {
		var nonSpecPromise = {
			then: function (callback) {
				// Promises should always resolve asynchronously (eg. nextTick)
				// but let's create a bad implementation where that is not true
				callback('done');
			}
		};

		solve(nonSpecPromise, function (val) {
			expect(val).to.equal('done');
		});
	});

	it('should not solve promises that fail', function (done) {
		var promise = new Promise(function () {
			throw new Error('boo');
		});

		solve(promise, function (val) {
			expect(val).to.be.undefined;
			done();
		});
	});

	it('should recursively process promise results', function (done) {
		var promise = new Promise(function (resolve) {
			resolve(function (callback) {
				callback('recursive');
			});
		});

		solve(promise, function (val) {
			if (val) {
				expect(val).to.equal('recursive');
				done();
			}
		});
	});

	it('should solve each element of an array', function (done) {
		var arr = [
				'foo',
				'bar',
				function (cb) {
					cb(123);
				},
				new Promise(function (resolve) {
					resolve(456)
				})
			],
			tick = 0;

		solve(arr, function (val) {
			// on second tick
			if (tick++ >= 1) {
				setTimeout(function () {
					expect(val).to.eql(['foo','bar',123,456]);
					done();
				}, 1);
			}
		});
	});

	it('should not solve inherited properties, eg. on Object.prototype', function () {
		Object.prototype.dumb = function () {
			return 'ick';
		};

		solve({}, function (val) {
			expect(val).to.be.empty;
		});
	});

	it('should not get messed up by custom hasOwnProperty method', function () {
		var data = {
			hasOwnProperty: function(){},
			foo: function () {
				return 'bar';
			}
		};

		solve(data, function (val) {
			expect(val.foo).to.equal('bar');
		});
	});

	it('should not recursively dig into objects & arrays in results', function () {
		var called = false;
		var data = {
			foo: function () {
				called = true;
			}
		};

		solve({
			data: function (callback) {
				return data;
			}
		})();

		expect(called).to.equal(false);
	});

	it('should do all the above recursively', function (done) {
		var data = {
			bool: true,
			num: 123,
			promise: new Promise(function (resolve) {
				resolve('success');
			}),
			fn: function () {
				return 'static';
			},
			callback: function(cb) {
				cb(function (cb2) {
					return function (cb3) {
						return cb3('dynamic');
					};
				});
			},
			nested: function (cb) {
				cb(function () {
					return new Promise(function (resolve) {
						resolve({
							complex: {
								inner: 'yay'
							}
						});
					});
				});
			}
		};

		solve(data, function (all) {
			// wait for everything to finish
			if (all && all.promise && all.nested && all.nested.complex && all.nested.complex.inner) {
				expect(all.bool).to.be.true;
				expect(all.num).to.equal(123);

				expect(all.promise).to.equal('success');
				expect(all.fn).to.equal('static');
				expect(all.callback).to.equal('dynamic');

				expect(all.nested.complex.inner).to.equal('yay');

				done();
			}
		});
	});
});

describe('solve.destroy', function () {
	it('should prevent downstream callbacks from being called', function (done) {
		var called = false;
		var stream = solve(function (callback) {
			setTimeout(function() {
				callback(1);
			}, 1);
		});

		stream(function (data) {
			if (data === 1) {
				called = true;
			}
		});

		stream.destroy();

		setTimeout(function() {
			expect(called).to.be.false;
			done();
		}, 2);
	});

	it('should stop callback from being called', function (done) {
		var called = false;
		var stream = solve(function (callback) {
			setTimeout(function() {
				callback(1);
			}, 1);
		});

		var downstream = stream(function (data) {
			if (data === 1) {
				called = true;
			}
		});

		downstream.destroy();

		setTimeout(function() {
			expect(called).to.be.false;
			done();
		}, 2);
	});

	it('should prevent new listeners from being added', function () {
		var stream = solve(true);

		stream.destroy();

		expect(function() {
			stream(function(){});
		}).to.throw(ReferenceError, /^Unable to add listener after calling destroy$/);
	});

	it('should allow calling destroy multiple times', function () {
		var stream = solve(true);

		stream.destroy();
		stream.destroy();
		stream.destroy();
	});

	it('should destroy downstream solves', function () {
		var stream = solve(true);

		var downstream = stream(function(data){ return data });

		stream.destroy();

		expect(function() {
			downstream(function(){});
		}).to.throw(ReferenceError, /^Unable to add listener after calling destroy$/);
	});

	it('should allow calling destroy on destroyed downstream solves', function () {
		var stream = solve(true);

		var downstream = stream(function(data){ return data });

		stream.destroy();
		downstream.destroy();
	});
});

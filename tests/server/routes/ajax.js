module.exports = function(app) {

	app.get('/ajaxEndpoint800', function(req, res) {
		setTimeout(function() {
			res.sendStatus(200);
		}, 800);
	});

	app.get('/ajaxEndpoint100', function(req, res) {
		setTimeout(function() {
			res.sendStatus(200);
		}, 100);
	});


	app.post('/ajaxFormEndpoint800', function(req, res) {
		setTimeout(function() {
			res.send(req.body);
		}, 800);
	});
}
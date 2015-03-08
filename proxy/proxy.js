var httpProxy = require('http-proxy');
var serveStatic = require('serve-static');

var URL = require('url');

var http = require('http');

if (process.argv.length != 4) {
	console.log('The ovirt API host not given. Run this proxy as:');
	console.log('node proxy.js http://192.168.0.1/ovirt-engine/api ../');

	return;
}

var ovirtHost = process.argv[2];
if (ovirtHost.slice(0, 4) !== 'http') {
	ovirtHost = 'http://' + ovirtHost;
}

var staticDir = process.argv[3];

console.log('The proxy server will use ', ovirtHost, ' as the ovirt host and ', staticDir, ' to look for html files');

var port = 8888;

var ovirtProxy = httpProxy.createProxyServer();
var fileServe = serveStatic(staticDir);

ovirtProxy.on('proxyReq', function(proxyReq, req, res, options) {
	//proxyReq.setHeader('filter', 'True');
	var host = URL.parse(ovirtHost).host;
	proxyReq.setHeader('Host', host);
	console.log('setting host as:', host);
});

var server = http.createServer(function(req, res) {
	var url = req.url;

	fileServe(req, res, function(err) {
		console.log('proxying url:', url);

		req.url = url.split('/api')[1]
		if (!req.url || !req.url.length) {
			req.url = '/';
		}

		res.setHeader('Access-Control-Allow-Origin', 'http://' + URL.parse(req.headers.origin || '').host || '*');
		res.setHeader('Access-Control-Allow-Headers', 'accpet, content-type, filter, authorization');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
		res.setHeader('Access-Control-Allow-Credentials', 'true');

		if (req.method.toLowerCase() === 'options') {
			//req.method = 'GET';
			res.end('proxy success options response');
			console.log('initiating authentication!');
			return;
		}

		console.log('proxying to:', ovirtHost + req.url);
		ovirtProxy.web(req, res, {
			secure: false,
			target: ovirtHost,

			changeOrigin: true,
			hostRewrite: true
		}, function(err) {
			if (err) {
				console.log('got back error:', err);
				res.end();
			}
		});
	});
});

server.listen(port, '0.0.0.0');
console.log("Proxy listening on http://localhost:" + port);


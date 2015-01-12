var httpProxy = require('http-proxy');
var serveStatic = require('serve-static');

var http = require('http');

if (process.argv.length != 4) {
	console.log('The ovirt API host not given. Run this proxy as:');
	console.log('node proxy.js 192.168.0.1 ../');

	return;
}

var ovirtHost = process.argv[2];
var staticDir = process.argv[3];

console.log('The proxy server will use ', ovirtHost, ' as the ovirt host and ', staticDir, ' to look for html files');

var port = 8888;

var ovirtProxy = httpProxy.createProxyServer();
var fileServe = serveStatic(staticDir);

var server = http.createServer(function(req, res) {
	var url = req.url;

	if (url.indexOf('/ovirt-engine/api') != -1) {
		ovirtProxy.web(req, res, {
			secure: false,
			target: 'https://' + ovirtHost,

			changeOrigin: true,
			hostRewrite: true
		});

		return;
	}

	fileServe(req, res, function() {
		console.log('cannot find file:', url);
		res.writeHeader(404);
		res.end('File not Found!');
		return;
	});
});

server.listen(port);
console.log("Proxy listening on http://localhost:" + port);


oVirtDash
=========
oVirtDash is a mobile-friendly web dashboard for oVirt.

![Home screenshot](/screenshots/home.png?raw=true "Home screenshot")

Getting Started
===============
1- Install NodeJS, NPM, Bower
2- Clone this repository and run to get dependencies:
	npm install && bower install
3- Start the proxy
	node ./proxy/proxy.js https://{{ip of ovirt}}/ovirt-engine/api ./
4- Go to http://localhost:8888 to start using oVirt dashboard and on your local devices at http://{{ip of server}}:8888

module.exports = function(grunt){
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		mocha: {
			all:{
				src:['tests/testrunner.html'],
			},
			options: {
				run: true
			}
		}
	});
	grunt.loadNpmTasks('grunt-mocha');
	grunt.registerTask('default', ['mocha']);
};

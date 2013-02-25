module.exports = function(grunt) {
    "use strict";

    // Add our custom tasks.
    grunt.loadNpmTasks('grunt-mocha-test');

    // Project configuration.
    grunt.initConfig({
        pkg: '<json:package.json>',
        mochaTest: {
            files: ['test/**/*.js']
        },
        lint: {
            files: ['grunt.js', 'lib/**/*.js', 'test/**/*.js']
        },
        watch: {
            files: '<config:lint.files>',
            tasks: 'default'
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                node: true
            },
            globals: {
                exports: true,
                it: true,
                describe: true
            }
        }
    });

    // Default task.
    grunt.registerTask('default', 'lint mochaTest');
};
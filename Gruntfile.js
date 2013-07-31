module.exports = function(grunt) {
    'use strict';

    // Add our custom tasks.
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Project configuration.
    grunt.initConfig({
        mochaTest: {
            files: ['test/**/*.js']
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: 'Gruntfile.js',
            lib: 'lib/**/*.js',
            tests: {
                options: {
                    jshintrc: './test/.jshintrc'
                },
                files: {
                    src: 'test/**/*.js',
                }
            }
        }
    });

    // Default task.
    grunt.registerTask('default', ['jshint', 'mochaTest']);
};
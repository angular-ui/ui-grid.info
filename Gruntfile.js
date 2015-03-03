/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    shell: {
      hexogen: {
        command: 'hexo generate',
        options: {
          execOptions: {
              cwd: '_blog_src'
          }
        }
      }
    },

    stylus: {
      compile: {
        options: {
          compress: true
        },
        files: {
          'blog/css/style.css': '_blog_src/themes/casper_custom/source/css/style.styl'
        }
      }
    },

    connect: {
      server: {
        options: {
          port: 4000,
          base: '.',
          livereload: true
        }
      }
    },

    watch: {
      hexo: {
        files: ['_blog_src/_config.yml', '_blog_src/themes/**', '_blog_src/scaffolds/**', '_blog_src/scripts/**', '_blog_src/source/**'],
        tasks: ['shell:hexogen']
      },
      livereload: {
        options: { livereload: true },
        files: ['blog/**'],
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-shell');

  // Default task.
  grunt.registerTask('dev', ['shell:hexogen', 'connect', 'watch']);

};

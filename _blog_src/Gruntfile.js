/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    shell: {
      hexogen: {
        command: 'hexo generate'
      }
    },

    stylus: {
      compile: {
        options: {
          compress: true
        },
        files: {
          'public/css/style.css': 'themes/landscape/source/css/style.styl'
        }
      }
    },

    connect: {
      server: {
        options: {
          port: 4000,
          base: 'public',
          livereload: true
        }
      }
    },

    watch: {
      hexo: {
        files: ['_config.yml', 'themes/**', 'scaffolds/**', 'scripts/**', 'source/**'],
        tasks: ['shell:hexogen']
      },
      livereload: {
        options: { livereload: true },
        files: ['public/**'],
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

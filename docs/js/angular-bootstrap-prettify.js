'use strict';

var directive = {};
var service = { value: {} };

var DEPENDENCIES = {
  'angular.js': 'http://code.angularjs.org/' + angular.version.full + '/angular.min.js',
  'angular-resource.js': 'http://code.angularjs.org/' + angular.version.full + '/angular-resource.min.js',
  'angular-route.js': 'http://code.angularjs.org/' + angular.version.full + '/angular-route.min.js',
  'angular-animate.js': 'http://code.angularjs.org/' + angular.version.full + '/angular-animate.min.js',
  'angular-sanitize.js': 'http://code.angularjs.org/' + angular.version.full + '/angular-sanitize.min.js',
  'angular-cookies.js': 'http://code.angularjs.org/' + angular.version.full + '/angular-cookies.min.js'
};

/**
 * @uidoc function
 * @name bootstrapPrettify.function:escape
 * @kind function
 * @description Properly Escapes some special symbols for HTML.
 * @param {string} text HTML to be added inside the pre tag
 * @returns {DOMElement} The text passed in with its contents updated.
 */
function escape(text) {
  return text.
    replace(/\&/g, '&amp;').
    replace(/\</g, '&lt;').
    replace(/\>/g, '&gt;').
    replace(/"/g, '&quot;');
}

/**
 * @uidoc function
 * @name bootstrapPrettify.function:setHtmlIe8SafeWay
 * @kind function
 * @description
 * Ensures that pre tag does not lose line breaks on IE8.
 * - http://stackoverflow.com/questions/451486/pre-tag-loses-line-breaks-when-setting-innerhtml-in-ie
 * - http://stackoverflow.com/questions/195363/inserting-a-newline-into-a-pre-tag-ie-javascript
 * @param {DOMElement} element DOM Element to be updated
 * @param {string} html HTML to be added inside the pre tag
 * @returns {DOMElement} The element with its contents updated.
 */
function setHtmlIe8SafeWay(element, html) {
  var newElement = angular.element('<pre>' + html + '</pre>');

  element.empty();
  element.append(newElement.contents());
  return element;
}

/**
 * @uidoc directive
 * @name bootstrapPrettify.directive:jsFiddle
 * @requires bootstrapPrettify.service:getEmbeddedTemplate
 * @description A directive that adds a jsFiddle window to the docs.
 */
directive.jsFiddle = function(getEmbeddedTemplate, escape, script) {
  return {
    terminal: true,
    link: function(scope, element, attr) {
      var name = '',
        stylesheet = '<link rel="stylesheet" href="http://twitter.github.com/bootstrap/assets/css/bootstrap.css">\n',
        fields = {
          html: '',
          css: '',
          js: ''
        };

      angular.forEach(attr.jsFiddle.split(' '), function(file, index) {
        var fileType = file.split('.')[1];

        if (fileType == 'html') {
          if (index == 0) {
            fields[fileType] +=
              '<div ng-app' + (attr.module ? '="' + attr.module + '"' : '') + '>\n' +
                getEmbeddedTemplate(file, 2);
          } else {
            fields[fileType] += '\n\n\n  <!-- CACHE FILE: ' + file + ' -->\n' +
              '  <script type="text/ng-template" id="' + file + '">\n' +
              getEmbeddedTemplate(file, 4) +
              '  </script>\n';
          }
        } else {
          fields[fileType] += getEmbeddedTemplate(file) + '\n';
        }
      });

      fields.html += '</div>\n';

      setHtmlIe8SafeWay(element,
        '<form class="jsfiddle" method="post" action="http://jsfiddle.net/api/post/library/pure/" target="_blank">' +
          hiddenField('title', 'AngularJS Example: ' + name) +
          hiddenField('css', '</style> <!-- Ugly Hack due to jsFiddle issue: http://goo.gl/BUfGZ --> \n' +
            stylesheet +
            script.angular +
            (attr.resource ? script.resource : '') +
            '<style>\n' +
            fields.css) +
          hiddenField('html', fields.html) +
          hiddenField('js', fields.js) +
          '<button class="btn btn-primary"><i class="icon-white icon-pencil"></i> Edit Me</button>' +
          '</form>');

      function hiddenField(name, value) {
        return '<input type="hidden" name="' +  name + '" value="' + escape(value) + '">';
      }
    }
  }
};

/**
 * @uidoc directive
 * @name bootstrapPrettify.directive:code
 * @restrict E
 * @description A directive that tells Angular to not compile any directives on
 * the code tag.
 */
directive.code = function() {
  return {restrict: 'E', terminal: true};
};

/**
 * @uidoc directive
 * @name bootstrapPrettify.directive:prettyprint
 * @requires bootstrapPrettify.service:reindentCode
 * @element pre
 * @terminal true
 * @restrict C
 * @description A directive that pretty prints code.
 */
directive.prettyprint = ['reindentCode', function(reindentCode) {
  return {
    restrict: 'C',
    compile: function(element) {
      var html = element.html();
      //ensure that angular won't compile {{ curly }} values
      html = html.replace(/\{\{/g, '<span>{{</span>')
                 .replace(/\}\}/g, '<span>}}</span>');
      if (window.RUNNING_IN_NG_TEST_RUNNER) {
        element.html(html);
      }
      else {
        element.html(window.prettyPrintOne(reindentCode(html), undefined, true));
      }
    }
  };
}];

/**
 * @uidoc directive
 * @name bootstrapPrettify.directive:ngSetText
 * @requires bootstrapPrettify.service:getEmbeddedTemplate
 * @restrict CA
 * @priority 10
 * @description A directive that sets Text in a way that is supported by IE8.
 */
directive.ngSetText = ['getEmbeddedTemplate', function(getEmbeddedTemplate) {
  return {
    restrict: 'CA',
    priority: 10,
    compile: function(element, attr) {
      setHtmlIe8SafeWay(element, escape(getEmbeddedTemplate(attr.ngSetText)));
    }
  }
}]

/**
 * @uidoc directive
 * @name bootstrapPrettify.directive:ngHtmlWrap
 * @requires bootstrapPrettify.service:reindentCode
 * @requires bootstrapPrettify.service:templateMerge
 * @description A directive that wraps HTML with the expected HTML5 markup.
 */
directive.ngHtmlWrap = ['reindentCode', 'templateMerge', function(reindentCode, templateMerge) {
  return {
    compile: function(element, attr) {
      var properties = {
            head: '',
            module: '',
            body: element.text()
          },
        html = "<!doctype html>\n<html ng-app{{module}}>\n  <head>\n{{head:4}}  </head>\n  <body>\n{{body:4}}  </body>\n</html>";

      angular.forEach((attr.ngHtmlWrap || '').split(' '), function(dep) {
        if (!dep) return;
        dep = DEPENDENCIES[dep] || dep;

        var ext = dep.split(/\./).pop();

        if (ext == 'css') {
          properties.head += '<link rel="stylesheet" href="' + dep + '" type="text/css">\n';
        } else if(ext == 'js') {
          properties.head += '<script src="' + dep + '"></script>\n';
        } else {
          properties.module = '="' + dep + '"';
        }
      });

      setHtmlIe8SafeWay(element, escape(templateMerge(html, properties)));
    }
  }
}];

/**
 * @uidoc directive
 * @name bootstrapPrettify.directive:ngSetHtml
 * @requires bootstrapPrettify.service:getEmbeddedTemplate
 * @restrict CA
 * @priority 10
 * @description A directive that sets HTML in a way that is supported by IE8.
 */
directive.ngSetHtml = ['getEmbeddedTemplate', function(getEmbeddedTemplate) {
  return {
    restrict: 'CA',
    priority: 10,
    compile: function(element, attr) {
      setHtmlIe8SafeWay(element, getEmbeddedTemplate(attr.ngSetHtml));
    }
  }
}];

/**
 * @uidoc directive
 * @name bootstrapPrettify.directive:ngEvalJavascript
 * @requires bootstrapPrettify.service:getEmbeddedTemplate
 * @description A directive that evaluates JavaScript.
 */
directive.ngEvalJavascript = ['getEmbeddedTemplate', function(getEmbeddedTemplate) {
  return {
    compile: function (element, attr) {
      var fileNames = attr.ngEvalJavascript.split(' ');
      angular.forEach(fileNames, function(fileName) {
        var script = getEmbeddedTemplate(fileName);
        try {
          if (window.execScript) { // IE
            window.execScript(script || '""'); // IE complains when evaling empty string
          } else {
            window.eval(script + '//@ sourceURL=' + fileName);
          }
        } catch (e) {
          if (window.console) {
            window.console.log(script, '\n', e);
          } else {
            window.alert(e);
          }
        }
      });
    }
  };
}];

/**
 * @uidoc directive
 * @name bootstrapPrettify.directive:ngEmbedApp
 * @requires {@link https://docs.angularjs.org/api/ng/service/$browser $browser}
 * @requires {@link https://docs.angularjs.org/api/ng/service/$exceptionHandler $exceptionHandler}
 * @requires {@link https://docs.angularjs.org/api/ng/service/$location $location}
 * @requires {@link https://docs.angularjs.org/api/ng/service/$rootScope $rootScope}
 * @requires {@link https://docs.angularjs.org/api/ng/service/$templateCache $templateCache}
 * @description A directive that runs an embedded APP in the doc.
 * Used for examples.
 */
directive.ngEmbedApp = ['$templateCache', '$browser', '$rootScope', '$location', '$sniffer', '$exceptionHandler',
                function($templateCache,   $browser,  docsRootScope, $location,   $sniffer,   $exceptionHandler) {
  return {
    terminal: true,
    link: function(scope, element, attrs) {
      var modules = ['ngAnimate'],
          embedRootScope,
          deregisterEmbedRootScope;

      modules.push(['$provide', function($provide) {
        $provide.value('$templateCache', $templateCache);
        $provide.value('$anchorScroll', angular.noop);
        $provide.value('$browser', $browser);
        $provide.value('$sniffer', $sniffer);
        $provide.provider('$location', function() {
          this.$get = ['$rootScope', function($rootScope) {
            docsRootScope.$on('$locationChangeSuccess', function(event, oldUrl, newUrl) {
              $rootScope.$broadcast('$locationChangeSuccess', oldUrl, newUrl);
            });
            return $location;
          }];
          this.html5Mode = angular.noop;
          this.hashPrefix = function () {
              return '';
          };
        });

        $provide.decorator('$rootScope', ['$delegate', function($delegate) {
          embedRootScope = $delegate;

          // Since we are teleporting the $animate service, which relies on the $$postDigestQueue
          // we need the embedded scope to use the same $$postDigestQueue as the outer scope
          function docsRootDigest() {
            var postDigestQueue = docsRootScope.$$postDigestQueue;
            while (postDigestQueue.length) {
              try {
                postDigestQueue.shift()();
              } catch (e) {
                $exceptionHandler(e);
              }
            }
          }
          embedRootScope.$watch(function () {
            embedRootScope.$$postDigest(docsRootDigest);
          })

          deregisterEmbedRootScope = docsRootScope.$watch(function embedRootScopeDigestWatch() {
            embedRootScope.$digest();
          });

          return embedRootScope;
        }]);
      }]);
      if (attrs.ngEmbedApp)  modules.push(attrs.ngEmbedApp);

      element.on('click', function(event) {
        if (event.target.attributes.getNamedItem('ng-click')) {
          event.preventDefault();
        }
      });

      element.bind('$destroy', function() {
        if (deregisterEmbedRootScope) {
          deregisterEmbedRootScope();
        }
        if (embedRootScope) {
          embedRootScope.$destroy();
        }
      });

      element.data('$injector', null);
      angular.bootstrap(element, modules);
    }
  };
}];

/**
 * @uidoc service
 * @name bootstrapPrettify.service:reindentCode
 * @description A factory that returns a single function which is used to
 * indent the code in a clean and consistent way.
 */
service.reindentCode = function() {

  /**
   * @uidoc method
   * @name reindentCode
   * @methodOf bootstrapPrettify.service:reindentCode
   * @kind function
   * @description Indent the text passed in a clean and consistent way.
   * @param {string} text Text to be indented.
   * @param {number} spaces Number of spaces to be used in the indentation.
   * @returns {string} Properly indented text.
   */
  return function (text, spaces) {
    if (!text) return text;
    var lines = text.split(/\r?\n/);
    var prefix = '      '.substr(0, spaces || 0);
    var i;

    // remove any leading blank lines
    while (lines.length && lines[0].match(/^\s*$/)) lines.shift();
    // remove any trailing blank lines
    while (lines.length && lines[lines.length - 1].match(/^\s*$/)) lines.pop();
    var minIndent = 999;
    for (i = 0; i < lines.length; i++) {
      var line = lines[0];
      var reindentCode = line.match(/^\s*/)[0];
      if (reindentCode !== line && reindentCode.length < minIndent) {
        minIndent = reindentCode.length;
      }
    }

    for (i = 0; i < lines.length; i++) {
      lines[i] = prefix + lines[i].substring(minIndent);
    }
    lines.push('');
    return lines.join('\n');
  };
};

/**
 * @uidoc service
 * @name bootstrapPrettify.service:templateMerge
 * @requires bootstrapPrettify.service:reindentCode
 * @description A factory that returns a single function which is used to
 * replace keys in a template with the appropiate properties.
 */
service.templateMerge = ['reindentCode', function(indentCode) {

  /**
   * @uidoc method
   * @name templateMerge
   * @methodOf bootstrapPrettify.service:templateMerge
   * @kind function
   * @description Replaces keys in a template with the appropiate properties.
   * @param {string} template Template to be merged
   * @param {object} properties Properties object to be applied to the template.
   * @returns {string} The desired HTML template with all of the propeties replaced.
   */
  return function(template, properties) {
    return template.replace(/\{\{(\w+)(?:\:(\d+))?\}\}/g, function(_, key, indent) {
      var value = properties[key];

      if (indent) {
        value = indentCode(value, indent);
      }

      return value == undefined ? '' : value;
    });
  };
}];

/**
 * @uidoc service
 * @name bootstrapPrettify.service:getEmbeddedTemplate
 * @requires bootstrapPrettify.service:reindentCode
 * @description A factory that returns a single function which is used to
 * clean up the spacing in the sample codes in the docs.
 */
service.getEmbeddedTemplate = ['reindentCode', function(reindentCode) {

  /**
   * @uidoc method
   * @name getEmbeddedTemplate
   * @methodOf bootstrapPrettify.service:getEmbeddedTemplate
   * @kind function
   * @description Cleans up the spacing in the sample codes in the docs.
   * @param {string} id An element id to reindent
   * @returns {string} Element HTML with all spaces cleaned up.
   */
  return function (id) {
    var element = document.getElementById(id);

    if (!element) {
      return null;
    }

    return reindentCode(angular.element(element).html(), 0);
  }
}];

/**
 * @uidoc overview
 * @name bootstrapPrettify
 *
 * @description
 * # bootstrapPrettify
 *
 * This module provides some enhancements for grunt-uidocs-generator to work
 * alongside bootstrap.
 */
angular.module('bootstrapPrettify', []).directive(directive).factory(service);

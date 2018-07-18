'use strict';

var directive = {};

/**
 * @ngdoc directive
 * @name bootstrap.directive:dropdownToggle
 * @element button
 * @restrict C
 *
 * @description
 * Toggles a dropdown menu that follows the expect bootstrap layout.
 *
 * @example
   <example module="bootstrap">
     <file name="index.html">
         <div class="dropdown">
             <button id="toggleExample" class="btn btn-default dropdown-toggle" type="button">
                 Dropdown Toggle
                 <span class="caret" aria-hidden="true"></span>
             </button>
             <ul class="dropdown-menu" aria-labelledby="toggleExample">
                 <li><a href="">Menu Item 1</a></li>
                 <li><a href="">Menu Item 2</a></li>
                 <li><a href="">Menu Item 3</a></li>
                 <li><a href="">Menu Item 4</a></li>
             </ul>
         </div>
     </file>
   </example>
 */
directive.dropdownToggle =
          ['$document', '$location', '$window',
  function ($document,   $location,   $window) {
    var openElement = null, close;
    return {
      restrict: 'C',
      link: function(scope, element, attrs) {
        scope.$watch(function dropdownTogglePathWatch(){return $location.path();}, function dropdownTogglePathWatchAction() {
          close && close();
        });

        element.parent().on('click', function(event) {
          close && close();
        });

        element.on('click', function(event) {
          event.preventDefault();
          event.stopPropagation();

          var iWasOpen = false;

          if (openElement) {
            iWasOpen = openElement === element;
            close();
          }

          if (!iWasOpen){
            element.parent().addClass('open');
            openElement = element;

            close = function (event) {
              event && event.preventDefault();
              event && event.stopPropagation();
              $document.off('click', close);
              element.parent().removeClass('open');
              close = null;
              openElement = null;
            }

            $document.on('click', close);
          }
        });
      }
    };
  }];

/**
 * @ngdoc directive
 * @name bootstrap.directive:syntax
 * @restrict A
 *
 * @description
 * Generates a Github, Plunkr or JSFiddle link that opens in a new tab,
 * depending on the attributes provided.
 *
 * @example
   <example module="bootstrap">
     <file name="index.html">
         <div syntax
              syntax-github="https://github.com/angular-ui/grunt-uidocs-generator/"
              syntax-plunkr="http://plnkr.co/edit/"
              syntax-fiddle="https://jsfiddle.net/">
         </div>
     </file>
   </example>
 */
directive.syntax = function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      function makeLink(type, text, link, icon) {
        return '<a href="' + link + '" class="btn syntax-' + type + '" target="_blank" rel="nofollow">' +
                '<span class="' + icon + '"></span> ' + text +
               '</a>';
      };

      var html = '';
      var types = {
        'github' : {
          text : 'View on Github',
          key : 'syntaxGithub',
          icon : 'icon-github'
        },
        'plunkr' : {
          text : 'View on Plunkr',
          key : 'syntaxPlunkr',
          icon : 'icon-arrow-down'
        },
        'jsfiddle' : {
          text : 'View on JSFiddle',
          key : 'syntaxFiddle',
          icon : 'icon-cloud'
        }
      };
      for(var type in types) {
        var data = types[type];
        var link = attrs[data.key];
        if(link) {
          html += makeLink(type, data.text, link, data.icon);
        }
      };

      var nav = document.createElement('nav');
      nav.className = 'syntax-links';
      nav.innerHTML = html;

      var node = element[0];
      var par = node.parentNode;
      par.insertBefore(nav, node);
    }
  }
}

/**
 * @ngdoc directive
 * @name bootstrap.directive:tabbable
 * @element ul
 * @restrict C
 *
 * @description
 * Generates bootstrap tabs and adds them inside the element with
 * the tabbable class.
 */
directive.tabbable = function() {
  return {
    restrict: 'C',
    compile: function(element) {
      var navTabs = angular.element('<ul class="nav nav-tabs"></ul>'),
          tabContent = angular.element('<div class="tab-content"></div>');

      tabContent.append(element.contents());
      element.append(navTabs).append(tabContent);
    },
    controller: ['$scope', '$element', function($scope, $element) {
      var navTabs = $element.contents().eq(0),
          ngModel = $element.controller('ngModel') || {},
          tabs = [],
          selectedTab;

      ngModel.$render = function() {
        var $viewValue = this.$viewValue;

        if (selectedTab ? (selectedTab.value != $viewValue) : $viewValue) {
          if(selectedTab) {
            selectedTab.paneElement.removeClass('active');
            selectedTab.tabElement.removeClass('active');
            selectedTab = null;
          }
          if($viewValue) {
            for(var i = 0, ii = tabs.length; i < ii; i++) {
              if ($viewValue == tabs[i].value) {
                selectedTab = tabs[i];
                break;
              }
            }
            if (selectedTab) {
              selectedTab.paneElement.addClass('active');
              selectedTab.tabElement.addClass('active');
            }
          }
        }
      };

      this.addPane = function(element, attr) {
        var li = angular.element('<li><a href></a></li>'),
            a = li.find('a'),
            tab = {
              paneElement: element,
              paneAttrs: attr,
              tabElement: li
            };

        tabs.push(tab);

        attr.$observe('value', update)();
        attr.$observe('title', function(){ update(); a.text(tab.title); })();

        function update() {
          tab.title = attr.title;
          tab.value = attr.value || attr.title;
          if (!ngModel.$setViewValue && (!ngModel.$viewValue || tab == selectedTab)) {
            // we are not part of angular
            ngModel.$viewValue = tab.value;
          }
          ngModel.$render();
        }

        navTabs.append(li);
        li.on('click', function(event) {
          event.preventDefault();
          event.stopPropagation();
          if (ngModel.$setViewValue) {
            $scope.$apply(function() {
              ngModel.$setViewValue(tab.value);
              ngModel.$render();
            });
          } else {
            // we are not part of angular
            ngModel.$viewValue = tab.value;
            ngModel.$render();
          }
        });

        return function() {
          tab.tabElement.remove();
          for(var i = 0, ii = tabs.length; i < ii; i++ ) {
            if (tab == tabs[i]) {
              tabs.splice(i, 1);
            }
          }
        };
      }
    }]
  };
};

/**
 * @ngdoc directive
 * @name bootstrap.directive:table
 * @element table
 * @restrict E
 *
 * @description
 * Adds bootstrap classes to a table that has none.
 *
 * @example
   <example module="bootstrap">
     <file name="index.html">
       <table>
         <thead>
           <tr>
             <th>Hero Name</th>
             <th>Real Name</th>
           </tr>
         </thead>
         <tbody>
           <tr>
             <td>Iron Man</td>
             <td>Tony Stark</td>
           </tr>
           <tr>
             <td>Hulk</td>
             <td>Bruce Banner</td>
           </tr>
           <tr>
             <td>Spider-Man</td>
             <td>Peter Parker</td>
           </tr>
           <tr>
             <td>Captain America</td>
             <td>Steve Rogers</td>
           </tr>
         </tbody>
       </table>
     </file>
   </example>
 */
directive.table = function() {
  return {
    restrict: 'E',
    link: function(scope, element, attrs) {
      if (!attrs['class']) {
        element.addClass('table table-bordered table-striped code-table');
      }
    }
  };
};

/**
 * @ngdoc service
 * @name bootstrap.service:popoverElement
 *
 * @description
 * Provides helper functions for {@link bootstrap.directive:popover the popover directive}
 *
 */
var popoverElement = function() {
  var object = {
    /**
     * @ngdoc method
     * @name init
     * @kind function
     * @methodOf bootstrap.service:popoverElement
     * @description Attaches a popover element to the body of the page.
     */
    init : function() {
      this.element = angular.element(
        '<div class="popover popover-incode top">' +
          '<div class="arrow"></div>' +
          '<div class="popover-inner">' +
            '<div class="popover-title"><code></code></div>' +
            '<div class="popover-content"></div>' +
          '</div>' +
        '</div>'
      );
      this.node = this.element[0];
      this.element.css({
        'display':'block',
        'position':'absolute'
      });
      angular.element(document.body).append(this.element);

      var inner = this.element.children()[1];
      this.titleElement   = angular.element(inner.childNodes[0].firstChild);
      this.contentElement = angular.element(inner.childNodes[1]);

      //stop the click on the tooltip
      this.element.bind('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
      });

      var self = this;
      angular.element(document.body).bind('click',function(event) {
        if(self.visible()) self.hide();
      });
    },

    /**
     * @ngdoc method
     * @name show
     * @kind function
     * @methodOf bootstrap.service:popoverElement
     * @description Adds visible class to the popover element on the page and
     * set its position.
     */
    show : function(x,y) {
      this.element.addClass('visible');
      this.position(x || 0, y || 0);
    },

    /**
     * @ngdoc method
     * @name hide
     * @kind function
     * @methodOf bootstrap.service:popoverElement
     * @description Removes visible class to the popover element on the page and
     * set its position to be out of bounds.
     */
    hide : function() {
      this.element.removeClass('visible');
      this.position(-9999,-9999);
    },

    /**
     * @ngdoc method
     * @name visible
     * @kind function
     * @methodOf bootstrap.service:popoverElement
     * @description Returns whether or not the popover element is visible.
     * @returns {boolean} true if the elements y position is greater than 0.
     */
    visible : function() {
      return this.position().y >= 0;
    },

    /**
     * @ngdoc method
     * @name isSituatedAt
     * @kind function
     * @methodOf bootstrap.service:popoverElement
     * @description Returns whether or not the popover element is situated
     * next to the element passed in.
     * @param {DOMElement} element Element to check against.
     * @returns {boolean} Returns true is the current element is the besideElement
     */
    isSituatedAt : function(element) {
      return this.besideElement ? element[0] == this.besideElement[0] : false;
    },

    /**
     * @ngdoc method
     * @name title
     * @kind function
     * @methodOf bootstrap.service:popoverElement
     * @description Updates the title value of the popover element.
     * @param {string} value New title for the popover element.
     * @returns {string} The new value of the title of the popover element.
     */
    title : function(value) {
      return this.titleElement.html(value);
    },

    /**
     * @ngdoc method
     * @name content
     * @kind function
     * @methodOf bootstrap.service:popoverElement
     * @description Runs the value passed in through the marked library and
     * updates the value of the content of the popover element.
     * @param {string} value New content for the popover element.
     * @returns {string} The new value of the content of the popover element.
     */
    content : function(value) {
      if(value && value.length > 0) {
        value = marked(value);
      }
      return this.contentElement.html(value);
    },

    /**
     * @ngdoc method
     * @name positionArrow
     * @kind function
     * @methodOf bootstrap.service:popoverElement
     * @description Adds the position class for the arrow on the popover element.
     * @param {string} position Position class for popover arrow.
     */
    positionArrow : function(position) {
      this.node.className = 'popover ' + position;
    },

    /**
     * @ngdoc method
     * @name positionAway
     * @kind function
     * @methodOf bootstrap.service:popoverElement
     * @description Sets besideElement to null and hides the popover element.
     */
    positionAway : function() {
      this.besideElement = null;
      this.hide();
    },

    /**
     * @ngdoc method
     * @name positionBeside
     * @kind function
     * @methodOf bootstrap.service:popoverElement
     * @description Sets besideElement to element passed in and
     * shows the popover element.
     * @param {DOMElement} element Element to position the popover besides.
     */
    positionBeside : function(element) {
      this.besideElement = element;

      var elm = element[0],
          x = element[0].getBoundingClientRect().left,
          y = elm.offsetTop - 20;

      this.show(x, y);
    },

    /**
     * @ngdoc method
     * @name position
     * @kind function
     * @methodOf bootstrap.service:popoverElement
     * @description Sets the top and left position of the popover element if
     * x and y are not null. Otherwise returns the x and y coordinates of
     * the popover element.
     * @param {number} x Left position for the popover element.
     * @param {number} y Top position for the popover element.
     * @returns {object | null} The current x and y coordinates of the popover
     * element or nothing if valid x and y coordinates are provided.
     */
    position : function(x, y) {
      if(x != null && y != null) {
        this.element.css('left',x + 'px');
        this.element.css('top', y + 'px');
      } else {
        return {
          x: this.node.offsetLeft,
          y: this.node.offsetTop
        };
      }
    }
  };

  object.init();
  object.hide();

  return object;
};

/**
 * @ngdoc directive
 * @name bootstrap.directive:popover
 * @element button
 * @restrict A
 *
 * @description
 * Opens a bootstrap popover element with the data from the tile and content tags.
 *
 * @example
   <example module="bootstrap">
     <file name="index.html">
       <button popover
               type="button"
               class="btn btn-default"
               title="Popover Title"
               content="Popover Content">
               Open Popover
       </button>
     </file>
   </example>
 */
directive.popover = ['popoverElement', function(popover) {
  return {
    restrict: 'A',
    priority : 500,
    link: function(scope, element, attrs) {
      element.bind('click',function(event) {
        event.preventDefault();
        event.stopPropagation();
        if(popover.isSituatedAt(element) && popover.visible()) {
          popover.title('');
          popover.content('');
          popover.positionAway();
        } else {
          popover.title(attrs.title);
          popover.content(attrs.content);
          popover.positionBeside(element);
        }
      });
    }
  }
}];

/**
 * @ngdoc directive
 * @name bootstrap.directive:tabPane
 * @requires bootstrap.directive:tabbable
 * @element li
 * @restrict C
 *
 * @description
 * Add tabs to the tabbale element generated by tabbable directive.
 */
directive.tabPane = function() {
  return {
    require: '^tabbable',
    restrict: 'C',
    link: function(scope, element, attrs, tabsCtrl) {
      element.on('$remove', tabsCtrl.addPane(element, attrs));
    }
  };
};

/**
 * @ngdoc directive
 * @name bootstrap.directive:foldout
 * @element button
 * @restrict A
 *
 * @description
 * Makes a button open a foldout to the target of the button.
 *
 * @example
   <example module="bootstrap">
     <file name="index.html">
         <div class="foldout-container">
           <button foldout
              class="btn btn-default" type="button"
              url="/partials/api/bootstrap.html">
              Show Foldout
           </button>
         </div>
     </file>
   </example>
 */
directive.foldout = ['$http', '$animate','$window', function($http, $animate, $window) {
  return {
    restrict: 'A',
    priority : 500,
    link: function(scope, element, attrs) {
      var container, loading, url = attrs.url;
      if(/\/build\//.test($window.location.href)) {
        url = '/build/docs' + url;
      }
      element.bind('click',function() {
        scope.$apply(function() {
          if(!container) {
            if(loading) return;

            loading = true;
            var par = element.parent();
            container = angular.element('<div class="foldout">loading...</div>');
            $animate.enter(container, null, par);

            $http.get(url, {cache: true}).then(function(response) {
              loading = false;

              var html = '<div class="foldout-inner">' +
                      '<div class="foldout-arrow"></div>' +
                      response.data +
                     '</div>';
              container.html(html);

              //avoid showing the element if the user has already closed it
              if(container.css('display') == 'block') {
                container.css('display','none');
                $animate.addClass(container, 'ng-hide');
              }
            });
          } else {
            container.hasClass('ng-hide') ? $animate.removeClass(container, 'ng-hide') : $animate.addClass(container, 'ng-hide');
          }
        });
      });
    }
  }
}];

/**
 *  @ngdoc overview
 *  @name bootstrap
 *
 *  @description
 *  # bootstrap
 *
 *  This module provides an angular wrapper to a few of the bootstrap
 *  components that are used by grunt-uidocs-generator.
 */
angular.module('bootstrap', [])
  .directive(directive)
  .factory('popoverElement', popoverElement)
  .run(function() {
    marked.setOptions({
      gfm: true,
      tables: true
    });
  });

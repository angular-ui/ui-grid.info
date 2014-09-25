/*! ui-grid - v3.0.0-rc.10 - 2014-09-25
* Copyright (c) 2014 ; License: MIT */
(function () {
  'use strict';
  angular.module('ui.grid.i18n', []);
  angular.module('ui.grid', ['ui.grid.i18n']);
})();
(function () {
  'use strict';
  angular.module('ui.grid').constant('uiGridConstants', {
    CUSTOM_FILTERS: /CUSTOM_FILTERS/g,
    COL_FIELD: /COL_FIELD/g,
    DISPLAY_CELL_TEMPLATE: /DISPLAY_CELL_TEMPLATE/g,
    TEMPLATE_REGEXP: /<.+>/,
    FUNC_REGEXP: /(\([^)]*\))?$/,
    DOT_REGEXP: /\./g,
    APOS_REGEXP: /'/g,
    BRACKET_REGEXP: /^(.*)((?:\s*\[\s*\d+\s*\]\s*)|(?:\s*\[\s*"(?:[^"\\]|\\.)*"\s*\]\s*)|(?:\s*\[\s*'(?:[^'\\]|\\.)*'\s*\]\s*))(.*)$/,
    COL_CLASS_PREFIX: 'ui-grid-col',
    events: {
      GRID_SCROLL: 'uiGridScroll',
      COLUMN_MENU_SHOWN: 'uiGridColMenuShown',
      ITEM_DRAGGING: 'uiGridItemDragStart' // For any item being dragged
    },
    // copied from http://www.lsauer.com/2011/08/javascript-keymap-keycodes-in-json.html
    keymap: {
      TAB: 9,
      STRG: 17,
      CTRL: 17,
      CTRLRIGHT: 18,
      CTRLR: 18,
      SHIFT: 16,
      RETURN: 13,
      ENTER: 13,
      BACKSPACE: 8,
      BCKSP: 8,
      ALT: 18,
      ALTR: 17,
      ALTRIGHT: 17,
      SPACE: 32,
      WIN: 91,
      MAC: 91,
      FN: null,
      UP: 38,
      DOWN: 40,
      LEFT: 37,
      RIGHT: 39,
      ESC: 27,
      DEL: 46,
      F1: 112,
      F2: 113,
      F3: 114,
      F4: 115,
      F5: 116,
      F6: 117,
      F7: 118,
      F8: 119,
      F9: 120,
      F10: 121,
      F11: 122,
      F12: 123
    },
    ASC: 'asc',
    DESC: 'desc',
    filter: {
      STARTS_WITH: 2,
      ENDS_WITH: 4,
      EXACT: 8,
      CONTAINS: 16,
      GREATER_THAN: 32,
      GREATER_THAN_OR_EQUAL: 64,
      LESS_THAN: 128,
      LESS_THAN_OR_EQUAL: 256,
      NOT_EQUAL: 512
    },

    aggregationTypes: {
      sum: 2,
      count: 4,
      avg: 8,
      min: 16,
      max: 32
    },

    // TODO(c0bra): Create full list of these somehow. NOTE: do any allow a space before or after them?
    CURRENCY_SYMBOLS: ['ƒ', '$', '£', '$', '¤', '¥', '៛', '₩', '₱', '฿', '₫']
  });

})();
angular.module('ui.grid').directive('uiGridCell', ['$compile', '$log', '$parse', 'gridUtil', 'uiGridConstants', function ($compile, $log, $parse, gridUtil, uiGridConstants) {
  var uiGridCell = {
    priority: 0,
    scope: false,
    require: '?^uiGrid',
    compile: function() {
      return {
        pre: function($scope, $elm, $attrs, uiGridCtrl) {
          function compileTemplate() {
            var compiledElementFn = $scope.col.compiledElementFn;

            compiledElementFn($scope, function(clonedElement, scope) {
              $elm.append(clonedElement);
            });
          }

          // If the grid controller is present, use it to get the compiled cell template function
          if (uiGridCtrl) {
             compileTemplate();
          }
          // No controller, compile the element manually (for unit tests)
          else {
            var html = $scope.col.cellTemplate
              .replace(uiGridConstants.COL_FIELD, 'grid.getCellValue(row, col)');
            var cellElement = $compile(html)($scope);
            $elm.append(cellElement);
          }
        },
        post: function($scope, $elm, $attrs, uiGridCtrl) {
          $elm.addClass($scope.col.getColClass(false));
          if ($scope.col.cellClass) {
            //var contents = angular.element($elm[0].getElementsByClassName('ui-grid-cell-contents'));
            var contents = $elm;
            if (angular.isFunction($scope.col.cellClass)) {
              contents.addClass($scope.col.cellClass($scope.grid, $scope.row, $scope.col, $scope.rowRenderIndex, $scope.colRenderIndex));
            }
            else {
              contents.addClass($scope.col.cellClass);
            }
          }
        }
      };
    }
  };

  return uiGridCell;
}]);


(function(){

angular.module('ui.grid').directive('uiGridColumnMenu', ['$log', '$timeout', '$window', '$document', '$injector', 'gridUtil', 'uiGridConstants', 'i18nService', function ($log, $timeout, $window, $document, $injector, gridUtil, uiGridConstants, i18nService) {

  var uiGridColumnMenu = {
    priority: 0,
    scope: true,
    require: '?^uiGrid',
    templateUrl: 'ui-grid/uiGridColumnMenu',
    replace: true,
    link: function ($scope, $elm, $attrs, uiGridCtrl) {
      gridUtil.enableAnimations($elm);

      $scope.grid = uiGridCtrl.grid;

      var self = this;

      // Store a reference to this link/controller in the main uiGrid controller
      // to allow showMenu later
      uiGridCtrl.columnMenuScope = $scope;

      // Save whether we're shown or not so the columns can check
      self.shown = $scope.menuShown = false;

      // Put asc and desc sort directions in scope
      $scope.asc = uiGridConstants.ASC;
      $scope.desc = uiGridConstants.DESC;

      // $scope.i18n = i18nService;

      // Get the grid menu element. We'll use it to calculate positioning
      $scope.menu = $elm[0].querySelectorAll('.ui-grid-menu');

      // Get the inner menu part. It's what slides up/down
      $scope.inner = $elm[0].querySelectorAll('.ui-grid-menu-inner');

      /**
       * @ngdoc boolean
       * @name enableSorting
       * @propertyOf ui.grid.class:GridOptions.columnDef
       * @description (optional) True by default. When enabled, this setting adds sort
       * widgets to the column header, allowing sorting of the data in the individual column.
       */
      $scope.sortable = function() {
        if (uiGridCtrl.grid.options.enableSorting && typeof($scope.col) !== 'undefined' && $scope.col && $scope.col.enableSorting) {
          return true;
        }
        else {
          return false;
        }
      };

      /**
       * @ngdoc boolean
       * @name enableFiltering
       * @propertyOf ui.grid.class:GridOptions.columnDef
       * @description (optional) True by default. When enabled, this setting adds filter
       * widgets to the column header, allowing filtering of the data in the individual column.
       */
      $scope.filterable = function() {
        if (uiGridCtrl.grid.options.enableFiltering && typeof($scope.col) !== 'undefined' && $scope.col && $scope.col.enableFiltering) {
          return true;
        }
        else {
          return false;
        }
      };
      
      var defaultMenuItems = [
        // NOTE: disabling this in favor of a little filter text box
        // Column filter input
        // {
        //   templateUrl: 'ui-grid/uiGridColumnFilter',
        //   action: function($event) {
        //     $event.stopPropagation();
        //     $scope.filterColumn($event);
        //   },
        //   cancel: function ($event) {
        //     $event.stopPropagation();

        //     $scope.col.filter = {};
        //   },
        //   shown: function () {
        //     return filterable();
        //   }
        // },
        {
          title: i18nService.getSafeText('sort.ascending'),
          icon: 'ui-grid-icon-sort-alt-up',
          action: function($event) {
            $event.stopPropagation();
            $scope.sortColumn($event, uiGridConstants.ASC);
          },
          shown: function () {
            return $scope.sortable();
          },
          active: function() {
            return (typeof($scope.col) !== 'undefined' && typeof($scope.col.sort) !== 'undefined' && typeof($scope.col.sort.direction) !== 'undefined' && $scope.col.sort.direction === uiGridConstants.ASC);
          }
        },
        {
          title: i18nService.getSafeText('sort.descending'),
          icon: 'ui-grid-icon-sort-alt-down',
          action: function($event) {
            $event.stopPropagation();
            $scope.sortColumn($event, uiGridConstants.DESC);
          },
          shown: function() {
            return $scope.sortable();
          },
          active: function() {
            return (typeof($scope.col) !== 'undefined' && typeof($scope.col.sort) !== 'undefined' && typeof($scope.col.sort.direction) !== 'undefined' && $scope.col.sort.direction === uiGridConstants.DESC);
          }
        },
        {
          title: i18nService.getSafeText('sort.remove'),
          icon: 'ui-grid-icon-cancel',
          action: function ($event) {
            $event.stopPropagation();
            $scope.unsortColumn();
          },
          shown: function() {
            return ($scope.sortable() && typeof($scope.col) !== 'undefined' && (typeof($scope.col.sort) !== 'undefined' && typeof($scope.col.sort.direction) !== 'undefined') && $scope.col.sort.direction !== null);
          }
        },
        {
          title: i18nService.getSafeText('column.hide'),
          icon: 'ui-grid-icon-cancel',
          action: function ($event) {
            $event.stopPropagation();
            $scope.hideColumn();
          }
        }
      ];

      // Set the menu items for use with the column menu. Let's the user specify extra menu items per column if they want.
      $scope.menuItems = defaultMenuItems;
      $scope.$watch('col.menuItems', function (n, o) {
        if (typeof(n) !== 'undefined' && n && angular.isArray(n)) {
          n.forEach(function (item) {
            if (typeof(item.context) === 'undefined' || !item.context) {
              item.context = {};
            }
            item.context.col = $scope.col;
          });

          $scope.menuItems = defaultMenuItems.concat(n);
        }
        else {
          $scope.menuItems = defaultMenuItems;
        }
      });

      var $animate;
      try {
        $animate = $injector.get('$animate');
      }
      catch (e) {
        $log.info('$animate service not found (ngAnimate not add as a dependency?), menu animations will not occur');
      }

      // Show the menu
      $scope.showMenu = function(column, $columnElement) {
        // Swap to this column
        //   note - store a reference to this column in 'self' so the columns can check whether they're the shown column or not
        self.col = $scope.col = column;

        // Remove an existing document click handler
        $document.off('click', documentClick);

        /* Reposition the menu below this column's element */
        var left = $columnElement[0].offsetLeft;
        var top = $columnElement[0].offsetTop;

        // Get the grid scrollLeft
        var offset = 0;
        if (column.grid.options.offsetLeft) {
          offset = column.grid.options.offsetLeft;
        }

        var height = gridUtil.elementHeight($columnElement, true);
        var width = gridUtil.elementWidth($columnElement, true);

        // Flag for whether we're hidden for showing via $animate
        var hidden = false;

        // Re-position the menu AFTER it's been shown, so we can calculate the width correctly.
        function reposition() {
          $timeout(function() {
            if (hidden && $animate) {
              $animate.removeClass($scope.inner, 'ng-hide');
              self.shown = $scope.menuShown = true;
              $scope.$broadcast('show-menu');
            }
            else if (angular.element($scope.inner).hasClass('ng-hide')) {
              angular.element($scope.inner).removeClass('ng-hide');
            }

            // var containerScrollLeft = $columnelement
            var containerId = column.renderContainer ? column.renderContainer : 'body';
            var renderContainer = column.grid.renderContainers[containerId];
            // var containerScrolLeft = renderContainer.prevScrollLeft;

            // It's possible that the render container of the column we're attaching to is offset from the grid (i.e. pinned containers), we
            //   need to get the different in the offsetLeft between the render container and the grid
            var renderContainerElm = gridUtil.closestElm($columnElement, '.ui-grid-render-container');
            var renderContainerOffset = renderContainerElm.offsetLeft - $scope.grid.element[0].offsetLeft;

            var containerScrolLeft = renderContainerElm.querySelectorAll('.ui-grid-viewport')[0].scrollLeft;

            var myWidth = gridUtil.elementWidth($scope.menu, true);

            // TODO(c0bra): use padding-left/padding-right based on document direction (ltr/rtl), place menu on proper side
            // Get the column menu right padding
            var paddingRight = parseInt(gridUtil.getStyles(angular.element($scope.menu)[0])['padding-right'], 10);

            // $log.debug('position', left + ' + ' + width + ' - ' + myWidth + ' + ' + paddingRight);

            $elm.css('left', (left + renderContainerOffset - containerScrolLeft + width - myWidth + paddingRight) + 'px');
            $elm.css('top', (top + height) + 'px');

            // Hide the menu on a click on the document
            $document.on('click', documentClick);
          });
        }

        if ($scope.menuShown && $animate) {
          // Animate closing the menu on the current column, then animate it opening on the other column
          $animate.addClass($scope.inner, 'ng-hide', reposition);
          hidden = true;
        }
        else {
          self.shown = $scope.menuShown = true;
          $scope.$broadcast('show-menu');
          reposition();
        }
      };

      // Hide the menu
      $scope.hideMenu = function() {
        delete self.col;
        delete $scope.col;
        self.shown = $scope.menuShown = false;
        $scope.$broadcast('hide-menu');
      };

      // Prevent clicks on the menu from bubbling up to the document and making it hide prematurely
      // $elm.on('click', function (event) {
      //   event.stopPropagation();
      // });

      function documentClick() {
        $scope.$apply($scope.hideMenu);
        $document.off('click', documentClick);
      }
      
      function resizeHandler() {
        $scope.$apply($scope.hideMenu);
      }
      angular.element($window).bind('resize', resizeHandler);

      $scope.$on('$destroy', $scope.$on(uiGridConstants.events.GRID_SCROLL, function(evt, args) {
        $scope.hideMenu();
        // if (!$scope.$$phase) { $scope.$apply(); }
      }));

      $scope.$on('$destroy', $scope.$on(uiGridConstants.events.ITEM_DRAGGING, function(evt, args) {
        $scope.hideMenu();
        // if (!$scope.$$phase) { $scope.$apply(); }
      }));

      $scope.$on('$destroy', function() {
        angular.element($window).off('resize', resizeHandler);
        $document.off('click', documentClick);
      });

      /* Column methods */
      $scope.sortColumn = function (event, dir) {
        event.stopPropagation();

        uiGridCtrl.grid.sortColumn($scope.col, dir, true)
          .then(function () {
            uiGridCtrl.grid.refresh();
            $scope.hideMenu();
          });
      };

      $scope.unsortColumn = function () {
        $scope.col.unsort();

        uiGridCtrl.grid.refresh();
        $scope.hideMenu();
      };

      $scope.hideColumn = function () {
        $scope.col.colDef.visible = false;

        uiGridCtrl.grid.refresh();
        $scope.hideMenu();
      };
    },
    controller: ['$scope', function ($scope) {
      var self = this;
      
      $scope.$watch('menuItems', function (n, o) {
        self.menuItems = n;
      });
    }]
  };

  return uiGridColumnMenu;

}]);

})();
(function () {
  'use strict';

  angular.module('ui.grid').directive('uiGridFooterCell', ['$log', '$timeout', 'gridUtil', '$compile', function ($log, $timeout, gridUtil, $compile) {
    var uiGridFooterCell = {
      priority: 0,
      scope: {
        col: '=',
        row: '=',
        renderIndex: '='
      },
      replace: true,
      require: '^uiGrid',
      compile: function compile(tElement, tAttrs, transclude) {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            function compileTemplate(template) {
              gridUtil.getTemplate(template).then(function (contents) {
                var linkFunction = $compile(contents);
                var html = linkFunction($scope);
                $elm.append(html);
              });
            }

            //compile the footer template
            if ($scope.col.footerCellTemplate) {
              //compile the custom template
              compileTemplate($scope.col.footerCellTemplate);
            }
            else {
              //use default template
              compileTemplate('ui-grid/uiGridFooterCell');
            }
          },
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
            //$elm.addClass($scope.col.getColClass(false));
            $scope.grid = uiGridCtrl.grid;

            $elm.addClass($scope.col.getColClass(false));
          }
        };
      }
    };

    return uiGridFooterCell;
  }]);

})();

(function () {
  'use strict';

  angular.module('ui.grid').directive('uiGridFooter', ['$log', '$templateCache', '$compile', 'uiGridConstants', 'gridUtil', '$timeout', function ($log, $templateCache, $compile, uiGridConstants, gridUtil, $timeout) {
    var defaultTemplate = 'ui-grid/ui-grid-footer';

    return {
      restrict: 'EA',
      replace: true,
      // priority: 1000,
      require: ['^uiGrid', '^uiGridRenderContainer'],
      scope: true,
      compile: function ($elm, $attrs) {
        return {
          pre: function ($scope, $elm, $attrs, controllers) {
            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];

            $scope.grid = uiGridCtrl.grid;
            $scope.colContainer = containerCtrl.colContainer;

            containerCtrl.footer = $elm;

            var footerTemplate = ($scope.grid.options.footerTemplate) ? $scope.grid.options.footerTemplate : defaultTemplate;
            gridUtil.getTemplate(footerTemplate)
              .then(function (contents) {
                var template = angular.element(contents);

                var newElm = $compile(template)($scope);
                $elm.append(newElm);

                if (containerCtrl) {
                  // Inject a reference to the footer viewport (if it exists) into the grid controller for use in the horizontal scroll handler below
                  var footerViewport = $elm[0].getElementsByClassName('ui-grid-footer-viewport')[0];

                  if (footerViewport) {
                    containerCtrl.footerViewport = footerViewport;
                  }
                }
              });
          },

          post: function ($scope, $elm, $attrs, controllers) {
            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];

            $log.debug('ui-grid-footer link');

            var grid = uiGridCtrl.grid;

            // Don't animate footer cells
            gridUtil.disableAnimations($elm);

            containerCtrl.footer = $elm;

            var footerViewport = $elm[0].getElementsByClassName('ui-grid-footer-viewport')[0];
            if (footerViewport) {
              containerCtrl.footerViewport = footerViewport;
            }
          }
        };
      }
    };
  }]);

})();
(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridGroupPanel', ["$compile", "uiGridConstants", "gridUtil", function($compile, uiGridConstants, gridUtil) {
    var defaultTemplate = 'ui-grid/ui-grid-group-panel';

    return {
      restrict: 'EA',
      replace: true,
      require: '?^uiGrid',
      scope: false,
      compile: function($elm, $attrs) {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            var groupPanelTemplate = $scope.grid.options.groupPanelTemplate  || defaultTemplate;

             gridUtil.getTemplate(groupPanelTemplate)
              .then(function (contents) {
                var template = angular.element(contents);
                
                var newElm = $compile(template)($scope);
                $elm.append(newElm);
              });
          },

          post: function ($scope, $elm, $attrs, uiGridCtrl) {
            $elm.bind('$destroy', function() {
              // scrollUnbinder();
            });
          }
        };
      }
    };
  }]);

})();
(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridHeaderCell', ['$log', '$compile', '$timeout', '$window', '$document', 'gridUtil', 'uiGridConstants', 
  function ($log, $compile, $timeout, $window, $document, gridUtil, uiGridConstants) {
    // Do stuff after mouse has been down this many ms on the header cell
    var mousedownTimeout = 500;

    var uiGridHeaderCell = {
      priority: 0,
      scope: {
        col: '=',
        row: '=',
        renderIndex: '='
      },
      require: '?^uiGrid',
      replace: true,
      compile: function() {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            var cellHeader = $compile($scope.col.headerCellTemplate)($scope);
            $elm.append(cellHeader);
          },
          
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
            $scope.grid = uiGridCtrl.grid;
            
            /**
             * @ngdoc event
             * @name filterChanged
             * @eventOf  ui.grid.core.api:PublicApi
             * @description  is raised after the filter is changed.  The nature
             * of the watch expression doesn't allow notification of what changed,
             * so the receiver of this event will need to re-extract the filter 
             * conditions from the columns.
             * 
             */
            if (!$scope.grid.api.core.raise.filterChanged){
              $scope.grid.api.registerEvent( 'core', 'filterChanged' );
            }
                        
    
            $elm.addClass($scope.col.getColClass(false));
    // shane - No need for watch now that we trackby col name
    //        $scope.$watch('col.index', function (newValue, oldValue) {
    //          if (newValue === oldValue) { return; }
    //          var className = $elm.attr('class');
    //          className = className.replace(uiGridConstants.COL_CLASS_PREFIX + oldValue, uiGridConstants.COL_CLASS_PREFIX + newValue);
    //          $elm.attr('class', className);
    //        });
    
            // Hide the menu by default
            $scope.menuShown = false;
    
            // Put asc and desc sort directions in scope
            $scope.asc = uiGridConstants.ASC;
            $scope.desc = uiGridConstants.DESC;
    
            // Store a reference to menu element
            var $colMenu = angular.element( $elm[0].querySelectorAll('.ui-grid-header-cell-menu') );
    
            var $contentsElm = angular.element( $elm[0].querySelectorAll('.ui-grid-cell-contents') );
    
            // Figure out whether this column is sortable or not
            if (uiGridCtrl.grid.options.enableSorting && $scope.col.enableSorting) {
              $scope.sortable = true;
            }
            else {
              $scope.sortable = false;
            }
    
            if (uiGridCtrl.grid.options.enableFiltering && $scope.col.enableFiltering) {
              $scope.filterable = true;
            }
            else {
              $scope.filterable = false;
            }
    
            function handleClick(evt) {
              // If the shift key is being held down, add this column to the sort
              var add = false;
              if (evt.shiftKey) {
                add = true;
              }
    
              // Sort this column then rebuild the grid's rows
              uiGridCtrl.grid.sortColumn($scope.col, add)
                .then(function () {
                  if (uiGridCtrl.columnMenuScope) { uiGridCtrl.columnMenuScope.hideMenu(); }
                  uiGridCtrl.grid.refresh();
                });
            }
    
            // Long-click (for mobile)
            var cancelMousedownTimeout;
            var mousedownStartTime = 0;
            $contentsElm.on('mousedown', function(event) {
              if (typeof(event.originalEvent) !== 'undefined' && event.originalEvent !== undefined) {
                event = event.originalEvent;
              }
    
              // Don't show the menu if it's not the left button
              if (event.button && event.button !== 0) {
                return;
              }
    
              mousedownStartTime = (new Date()).getTime();
    
              cancelMousedownTimeout = $timeout(function() { }, mousedownTimeout);
    
              cancelMousedownTimeout.then(function () {
                uiGridCtrl.columnMenuScope.showMenu($scope.col, $elm);
              });
            });
    
            $contentsElm.on('mouseup', function () {
              $timeout.cancel(cancelMousedownTimeout);
            });
    
            $scope.toggleMenu = function($event) {
              $event.stopPropagation();
    
              // If the menu is already showing...
              if (uiGridCtrl.columnMenuScope.menuShown) {
                // ... and we're the column the menu is on...
                if (uiGridCtrl.columnMenuScope.col === $scope.col) {
                  // ... hide it
                  uiGridCtrl.columnMenuScope.hideMenu();
                }
                // ... and we're NOT the column the menu is on
                else {
                  // ... move the menu to our column
                  uiGridCtrl.columnMenuScope.showMenu($scope.col, $elm);
                }
              }
              // If the menu is NOT showing
              else {
                // ... show it on our column
                uiGridCtrl.columnMenuScope.showMenu($scope.col, $elm);
              }
            };
    
            // If this column is sortable, add a click event handler
            if ($scope.sortable) {
              $contentsElm.on('click', function(evt) {
                evt.stopPropagation();
    
                $timeout.cancel(cancelMousedownTimeout);
    
                var mousedownEndTime = (new Date()).getTime();
                var mousedownTime = mousedownEndTime - mousedownStartTime;
    
                if (mousedownTime > mousedownTimeout) {
                  // long click, handled above with mousedown
                }
                else {
                  // short click
                  handleClick(evt);
                }
              });
    
              $scope.$on('$destroy', function () {
                // Cancel any pending long-click timeout
                $timeout.cancel(cancelMousedownTimeout);
              });
            }
    
            if ($scope.filterable) {
              var filterDeregisters = [];
              angular.forEach($scope.col.filters, function(filter, i) {
                filterDeregisters.push($scope.$watch('col.filters[' + i + '].term', function(n, o) {
                  uiGridCtrl.grid.api.core.raise.filterChanged();
                  uiGridCtrl.grid.refresh()
                    .then(function () {
                      if (uiGridCtrl.prevScrollArgs && uiGridCtrl.prevScrollArgs.y && uiGridCtrl.prevScrollArgs.y.percentage) {
                         uiGridCtrl.fireScrollingEvent({ y: { percentage: uiGridCtrl.prevScrollArgs.y.percentage } });
                      }
                      // uiGridCtrl.fireEvent('force-vertical-scroll');
                    });
                }));  
              });
              $scope.$on('$destroy', function() {
                angular.forEach(filterDeregisters, function(filterDeregister) {
                  filterDeregister();
                });
              });
            }
          }
        };
      }
    };

    return uiGridHeaderCell;
  }]);

})();

(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridHeader', ['$log', '$templateCache', '$compile', 'uiGridConstants', 'gridUtil', '$timeout', function($log, $templateCache, $compile, uiGridConstants, gridUtil, $timeout) {
    var defaultTemplate = 'ui-grid/ui-grid-header';
    var emptyTemplate = 'ui-grid/ui-grid-no-header';

    return {
      restrict: 'EA',
      // templateUrl: 'ui-grid/ui-grid-header',
      replace: true,
      // priority: 1000,
      require: ['^uiGrid', '^uiGridRenderContainer'],
      scope: true,
      compile: function($elm, $attrs) {
        return {
          pre: function ($scope, $elm, $attrs, controllers) {
            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];

            $scope.grid = uiGridCtrl.grid;
            $scope.colContainer = containerCtrl.colContainer;

            containerCtrl.header = $elm;
            containerCtrl.colContainer.header = $elm;

            /**
             * @ngdoc property
             * @name hideHeader
             * @propertyOf ui.grid.class:GridOptions
             * @description Null by default. When set to true, this setting will replace the
             * standard header template with '<div></div>', resulting in no header being shown.
             */
            
            var headerTemplate;
            if ($scope.grid.options.hideHeader){
              headerTemplate = emptyTemplate;
            } else {
              headerTemplate = ($scope.grid.options.headerTemplate) ? $scope.grid.options.headerTemplate : defaultTemplate;            
            }

             gridUtil.getTemplate(headerTemplate)
              .then(function (contents) {
                var template = angular.element(contents);
                
                var newElm = $compile(template)($scope);
                $elm.append(newElm);

                if (containerCtrl) {
                  // Inject a reference to the header viewport (if it exists) into the grid controller for use in the horizontal scroll handler below
                  var headerViewport = $elm[0].getElementsByClassName('ui-grid-header-viewport')[0];

                  if (headerViewport) {
                    containerCtrl.headerViewport = headerViewport;
                  }
                }
              });
          },

          post: function ($scope, $elm, $attrs, controllers) {
            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];

            $log.debug('ui-grid-header link');

            var grid = uiGridCtrl.grid;

            // Don't animate header cells
            gridUtil.disableAnimations($elm);

            function updateColumnWidths() {
              var asterisksArray = [],
                  percentArray = [],
                  manualArray = [],
                  asteriskNum = 0,
                  totalWidth = 0;

              // Get the width of the viewport
              var availableWidth = containerCtrl.colContainer.getViewportWidth();

              if (typeof(uiGridCtrl.grid.verticalScrollbarWidth) !== 'undefined' && uiGridCtrl.grid.verticalScrollbarWidth !== undefined && uiGridCtrl.grid.verticalScrollbarWidth > 0) {
                availableWidth = availableWidth + uiGridCtrl.grid.verticalScrollbarWidth;
              }

              // The total number of columns
              // var equalWidthColumnCount = columnCount = uiGridCtrl.grid.options.columnDefs.length;
              // var equalWidth = availableWidth / equalWidthColumnCount;

              // The last column we processed
              var lastColumn;

              var manualWidthSum = 0;

              var canvasWidth = 0;

              var ret = '';


              // uiGridCtrl.grid.columns.forEach(function(column, i) {

              var columnCache = containerCtrl.colContainer.visibleColumnCache;

              columnCache.forEach(function(column, i) {
                // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + i + ' { width: ' + equalWidth + 'px; left: ' + left + 'px; }';
                //var colWidth = (typeof(c.width) !== 'undefined' && c.width !== undefined) ? c.width : equalWidth;

                // Skip hidden columns
                if (!column.visible) { return; }

                var colWidth,
                    isPercent = false;

                if (!angular.isNumber(column.width)) {
                  isPercent = isNaN(column.width) ? gridUtil.endsWith(column.width, "%") : false;
                }

                if (angular.isString(column.width) && column.width.indexOf('*') !== -1) { //  we need to save it until the end to do the calulations on the remaining width.
                  asteriskNum = parseInt(asteriskNum + column.width.length, 10);
                  
                  asterisksArray.push(column);
                }
                else if (isPercent) { // If the width is a percentage, save it until the very last.
                  percentArray.push(column);
                }
                else if (angular.isNumber(column.width)) {
                  manualWidthSum = parseInt(manualWidthSum + column.width, 10);
                  
                  canvasWidth = parseInt(canvasWidth, 10) + parseInt(column.width, 10);

                  column.drawnWidth = column.width;

                  // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + column.width + 'px; }';
                }
              });

              // Get the remaining width (available width subtracted by the manual widths sum)
              var remainingWidth = availableWidth - manualWidthSum;

              var i, column, colWidth;

              if (percentArray.length > 0) {
                // Pre-process to make sure they're all within any min/max values
                for (i = 0; i < percentArray.length; i++) {
                  column = percentArray[i];

                  var percent = parseInt(column.width.replace(/%/g, ''), 10) / 100;

                  colWidth = parseInt(percent * remainingWidth, 10);

                  if (column.colDef.minWidth && colWidth < column.colDef.minWidth) {
                    colWidth = column.colDef.minWidth;

                    remainingWidth = remainingWidth - colWidth;

                    canvasWidth += colWidth;
                    column.drawnWidth = colWidth;

                    // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';

                    // Remove this element from the percent array so it's not processed below
                    percentArray.splice(i, 1);
                  }
                  else if (column.colDef.maxWidth && colWidth > column.colDef.maxWidth) {
                    colWidth = column.colDef.maxWidth;

                    remainingWidth = remainingWidth - colWidth;

                    canvasWidth += colWidth;
                    column.drawnWidth = colWidth;

                    // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';

                    // Remove this element from the percent array so it's not processed below
                    percentArray.splice(i, 1);
                  }
                }

                percentArray.forEach(function(column) {
                  var percent = parseInt(column.width.replace(/%/g, ''), 10) / 100;
                  var colWidth = parseInt(percent * remainingWidth, 10);

                  canvasWidth += colWidth;

                  column.drawnWidth = colWidth;

                  // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';
                });
              }

              if (asterisksArray.length > 0) {
                var asteriskVal = parseInt(remainingWidth / asteriskNum, 10);

                 // Pre-process to make sure they're all within any min/max values
                for (i = 0; i < asterisksArray.length; i++) {
                  column = asterisksArray[i];

                  colWidth = parseInt(asteriskVal * column.width.length, 10);

                  if (column.colDef.minWidth && colWidth < column.colDef.minWidth) {
                    colWidth = column.colDef.minWidth;

                    remainingWidth = remainingWidth - colWidth;
                    asteriskNum--;

                    canvasWidth += colWidth;
                    column.drawnWidth = colWidth;

                    // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';

                    lastColumn = column;

                    // Remove this element from the percent array so it's not processed below
                    asterisksArray.splice(i, 1);
                  }
                  else if (column.colDef.maxWidth && colWidth > column.colDef.maxWidth) {
                    colWidth = column.colDef.maxWidth;

                    remainingWidth = remainingWidth - colWidth;
                    asteriskNum--;

                    canvasWidth += colWidth;
                    column.drawnWidth = colWidth;

                    // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';

                    // Remove this element from the percent array so it's not processed below
                    asterisksArray.splice(i, 1);
                  }
                }

                // Redo the asterisk value, as we may have removed columns due to width constraints
                asteriskVal = parseInt(remainingWidth / asteriskNum, 10);

                asterisksArray.forEach(function(column) {
                  var colWidth = parseInt(asteriskVal * column.width.length, 10);

                  canvasWidth += colWidth;

                  column.drawnWidth = colWidth;

                  // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';
                });
              }

              // If the grid width didn't divide evenly into the column widths and we have pixels left over, dole them out to the columns one by one to make everything fit
              var leftoverWidth = availableWidth - parseInt(canvasWidth, 10);

              if (leftoverWidth > 0 && canvasWidth > 0 && canvasWidth < availableWidth) {
                var variableColumn = false;
                // uiGridCtrl.grid.columns.forEach(function(col) {
                columnCache.forEach(function(col) {
                  if (col.width && !angular.isNumber(col.width)) {
                    variableColumn = true;
                  }
                });

                if (variableColumn) {
                  var remFn = function (column) {
                    if (leftoverWidth > 0) {
                      column.drawnWidth = column.drawnWidth + 1;
                      canvasWidth = canvasWidth + 1;
                      leftoverWidth--;
                    }
                  };
                  while (leftoverWidth > 0) {
                    columnCache.forEach(remFn);
                  }
                }
              }

              if (canvasWidth < availableWidth) {
                canvasWidth = availableWidth;
              }

              // Build the CSS
              // uiGridCtrl.grid.columns.forEach(function (column) {
              columnCache.forEach(function (column) {
                ret = ret + column.getColClassDefinition();
              });

              // Add the vertical scrollbar width back in to the canvas width, it's taken out in getCanvasWidth
              if (grid.verticalScrollbarWidth) {
                canvasWidth = canvasWidth + grid.verticalScrollbarWidth;
              }
              // canvasWidth = canvasWidth + 1;

              containerCtrl.colContainer.canvasWidth = parseInt(canvasWidth, 10);

              // Return the styles back to buildStyles which pops them into the `customStyles` scope variable
              return ret;
            }
            
            containerCtrl.header = $elm;
            
            var headerViewport = $elm[0].getElementsByClassName('ui-grid-header-viewport')[0];
            if (headerViewport) {
              containerCtrl.headerViewport = headerViewport;
            }

            //todo: remove this if by injecting gridCtrl into unit tests
            if (uiGridCtrl) {
              uiGridCtrl.grid.registerStyleComputation({
                priority: 5,
                func: updateColumnWidths
              });
            }
          }
        };
      }
    };
  }]);

})();
(function(){

/**
 * @ngdoc directive
 * @name ui.grid.directive:uiGridColumnMenu
 * @element style
 * @restrict A
 *
 * @description
 * Allows us to interpolate expressions in `<style>` elements. Angular doesn't do this by default as it can/will/might? break in IE8.
 *
 * @example
 <doc:example module="app">
 <doc:source>
 <script>
 var app = angular.module('app', ['ui.grid']);

 app.controller('MainCtrl', ['$scope', function ($scope) {
   
 }]);
 </script>

 <div ng-controller="MainCtrl">
   <div ui-grid-menu shown="true"  ></div>
 </div>
 </doc:source>
 <doc:scenario>
 </doc:scenario>
 </doc:example>
 */
angular.module('ui.grid')

.directive('uiGridMenu', ['$log', '$compile', '$timeout', '$window', '$document', 'gridUtil', function ($log, $compile, $timeout, $window, $document, gridUtil) {
  var uiGridMenu = {
    priority: 0,
    scope: {
      // shown: '&',
      menuItems: '=',
      autoHide: '=?'
    },
    require: '?^uiGrid',
    templateUrl: 'ui-grid/uiGridMenu',
    replace: false,
    link: function ($scope, $elm, $attrs, uiGridCtrl) {
      gridUtil.enableAnimations($elm);

      if (typeof($scope.autoHide) === 'undefined' || $scope.autoHide === undefined) {
        $scope.autoHide = true;
      }

      if ($scope.autoHide) {
        angular.element($window).on('resize', $scope.hideMenu);
      }

      $scope.$on('hide-menu', function () {
        $scope.shown = false;
      });

      $scope.$on('show-menu', function () {
        $scope.shown = true;
      });

      $scope.$on('$destroy', function() {
        angular.element($window).off('resize', $scope.hideMenu);
      });
    },
    controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
      var self = this;

      self.hideMenu = $scope.hideMenu = function() {
        $scope.shown = false;
      };

      function documentClick() {
        $scope.$apply(function () {
          self.hideMenu();
          angular.element(document).off('click', documentClick);
        });
      }

      self.showMenu = $scope.showMenu = function() {
        $scope.shown = true;

        // Turn off an existing dpcument click handler
        angular.element(document).off('click', documentClick);

        // Turn on the document click handler, but in a timeout so it doesn't apply to THIS click if there is one
        $timeout(function() {
          angular.element(document).on('click', documentClick);
        });
      };

      $scope.$on('$destroy', function () {
        angular.element(document).off('click', documentClick);
      });
    }]
  };

  return uiGridMenu;
}])

.directive('uiGridMenuItem', ['$log', 'gridUtil', '$compile', 'i18nService', function ($log, gridUtil, $compile, i18nService) {
  var uiGridMenuItem = {
    priority: 0,
    scope: {
      title: '=',
      active: '=',
      action: '=',
      icon: '=',
      shown: '=',
      context: '=',
      templateUrl: '='
    },
    require: ['?^uiGrid', '^uiGridMenu'],
    templateUrl: 'ui-grid/uiGridMenuItem',
    replace: true,
    compile: function($elm, $attrs) {
      return {
        pre: function ($scope, $elm, $attrs, controllers) {
          var uiGridCtrl = controllers[0],
              uiGridMenuCtrl = controllers[1];
          
          if ($scope.templateUrl) {
            gridUtil.getTemplate($scope.templateUrl)
                .then(function (contents) {
                  var template = angular.element(contents);
                    
                  var newElm = $compile(template)($scope);
                  $elm.replaceWith(newElm);
                });
          }
        },
        post: function ($scope, $elm, $attrs, controllers) {
          var uiGridCtrl = controllers[0],
              uiGridMenuCtrl = controllers[1];

          // TODO(c0bra): validate that shown and active are functions if they're defined. An exception is already thrown above this though
          // if (typeof($scope.shown) !== 'undefined' && $scope.shown && typeof($scope.shown) !== 'function') {
          //   throw new TypeError("$scope.shown is defined but not a function");
          // }
          if (typeof($scope.shown) === 'undefined' || $scope.shown === null) {
            $scope.shown = function() { return true; };
          }

          $scope.itemShown = function () {
            var context = {};
            if ($scope.context) {
              context.context = $scope.context;
            }

            if (typeof(uiGridCtrl) !== 'undefined' && uiGridCtrl) {
              context.grid = uiGridCtrl.grid;
            }

            return $scope.shown.call(context);
          };

          $scope.itemAction = function($event,title) {
            $log.debug('itemAction');
            $event.stopPropagation();

            if (typeof($scope.action) === 'function') {
              var context = {};

              if ($scope.context) {
                context.context = $scope.context;
              }

              // Add the grid to the function call context if the uiGrid controller is present
              if (typeof(uiGridCtrl) !== 'undefined' && uiGridCtrl) {
                context.grid = uiGridCtrl.grid;
              }

              $scope.action.call(context, $event, title);

              uiGridMenuCtrl.hideMenu();
            }
          };

          $scope.i18n = i18nService.get();
        }
      };
    }
  };

  return uiGridMenuItem;
}]);

})();
(function () {
// 'use strict';

  angular.module('ui.grid').directive('uiGridNativeScrollbar', ['$log', '$timeout', '$document', 'uiGridConstants', 'gridUtil',
    function ($log, $timeout, $document, uiGridConstants, gridUtil) {
    var scrollBarWidth = gridUtil.getScrollbarWidth();
    scrollBarWidth = scrollBarWidth > 0 ? scrollBarWidth : 17;

    // If the browser is IE, add 1px to the scrollbar container, otherwise scroll events won't work right (in IE11 at least)
    var browser = gridUtil.detectBrowser();
    if (browser === 'ie') {
      scrollBarWidth = scrollBarWidth + 1;
    }

    return {
      scope: {
        type: '@'
      },
      require: ['^uiGrid', '^uiGridRenderContainer'],
      link: function ($scope, $elm, $attrs, controllers) {
        var uiGridCtrl = controllers[0];
        var containerCtrl = controllers[1];
        var rowContainer = containerCtrl.rowContainer;
        var colContainer = containerCtrl.colContainer;
        var grid = uiGridCtrl.grid;

        var contents = angular.element('<div class="contents">&nbsp;</div>');

        $elm.addClass('ui-grid-native-scrollbar');

        var previousScrollPosition;

        var elmMaxScroll = 0;

        if ($scope.type === 'vertical') {
          // Update the width based on native scrollbar width
          $elm.css('width', scrollBarWidth + 'px');

          $elm.addClass('vertical');

          grid.verticalScrollbarWidth = scrollBarWidth;
          colContainer.verticalScrollbarWidth = scrollBarWidth;

          // Save the initial scroll position for use in scroll events
          previousScrollPosition = $elm[0].scrollTop;
        }
        else if ($scope.type === 'horizontal') {
          // Update the height based on native scrollbar height
          $elm.css('height', scrollBarWidth + 'px');

          $elm.addClass('horizontal');

          // Save this scrollbar's dimension in the grid properties
          grid.horizontalScrollbarHeight = scrollBarWidth;
          rowContainer.horizontalScrollbarHeight = scrollBarWidth;

          // Save the initial scroll position for use in scroll events
          previousScrollPosition = gridUtil.normalizeScrollLeft($elm);
        }

        // Save the contents elm inside the scrollbar elm so it sizes correctly
        $elm.append(contents);

        // Get the relevant element dimension now that the contents are in it
        if ($scope.type === 'vertical') {
          elmMaxScroll = gridUtil.elementHeight($elm);
        }
        else if ($scope.type === 'horizontal') {
          elmMaxScroll = gridUtil.elementWidth($elm);
        }

        function updateNativeVerticalScrollbar() {
          // Get the height that the scrollbar should have
          var height = rowContainer.getViewportHeight();

          // Update the vertical scrollbar's content height so it's the same as the canvas
          var contentHeight = rowContainer.getCanvasHeight();

          // TODO(c0bra): set scrollbar `top` by height of header row
          // var headerHeight = gridUtil.outerElementHeight(containerCtrl.header);
          var headerHeight = colContainer.headerHeight ? colContainer.headerHeight : grid.headerHeight;

          // $log.debug('headerHeight in scrollbar', headerHeight);

          // var ret = '.grid' + uiGridCtrl.grid.id + ' .ui-grid-native-scrollbar.vertical .contents { height: ' + h + 'px; }';
          var ret = '.grid' + grid.id + ' .ui-grid-render-container-' + containerCtrl.containerId + ' .ui-grid-native-scrollbar.vertical .contents { height: ' + contentHeight + 'px; }';
          ret += '\n .grid' + grid.id + ' .ui-grid-render-container-' + containerCtrl.containerId + ' .ui-grid-native-scrollbar.vertical { height: ' + height + 'px; top: ' + headerHeight + 'px}';

          elmMaxScroll = contentHeight;

          return ret;
        }

        // Get the grid's bottom border height (TODO(c0bra): need to account for footer here!)
        var gridElm = gridUtil.closestElm($elm, '.ui-grid');
        var gridBottomBorder = gridUtil.getBorderSize(gridElm, 'bottom');

        function updateNativeHorizontalScrollbar() {
          var w = colContainer.getCanvasWidth();

          // Scrollbar needs to be negatively positioned beyond the bottom of the relatively-positioned render container
          var bottom = (scrollBarWidth * -1) + gridBottomBorder;
          if (grid.options.showFooter) {
            bottom -= 1;
          }
          var ret = '.grid' + grid.id + ' .ui-grid-render-container-' + containerCtrl.containerId + ' .ui-grid-native-scrollbar.horizontal { bottom: ' + bottom + 'px; }';
          ret += '.grid' + grid.id + ' .ui-grid-render-container-' + containerCtrl.containerId + ' .ui-grid-native-scrollbar.horizontal .contents { width: ' + w + 'px; }';

          elmMaxScroll = w;

          return ret;
        }

        // NOTE: priority 6 so they run after the column widths update, which in turn update the canvas width
        if ($scope.type === 'vertical') {
          grid.registerStyleComputation({
            priority: 6,
            func: updateNativeVerticalScrollbar
          });
        }
        else if ($scope.type === 'horizontal') {
          grid.registerStyleComputation({
            priority: 6,
            func: updateNativeHorizontalScrollbar
          });
        }


        $scope.scrollSource = null;

        function scrollEvent(evt) {
          if ($scope.type === 'vertical') {
            grid.flagScrollingVertically();
            var newScrollTop = $elm[0].scrollTop;

            var yDiff = previousScrollPosition - newScrollTop;

            var vertScrollLength = (rowContainer.getCanvasHeight() - rowContainer.getViewportHeight());

            // Subtract the h. scrollbar height from the vertical length if it's present
            if (grid.horizontalScrollbarHeight && grid.horizontalScrollbarHeight > 0) {
              vertScrollLength = vertScrollLength - uiGridCtrl.grid.horizontalScrollbarHeight;
            }

            var vertScrollPercentage = newScrollTop / vertScrollLength;

            if (vertScrollPercentage > 1) {
              vertScrollPercentage = 1;
            }
            if (vertScrollPercentage < 0) {
              vertScrollPercentage = 0;
            }

            var yArgs = {
              target: $elm,
              y: {
                percentage: vertScrollPercentage
              }
            };

            // If the source of this scroll is defined (i.e., not us, then don't fire the scroll event because we'll be re-triggering)
            if (!$scope.scrollSource) {
              uiGridCtrl.fireScrollingEvent(yArgs);
            }
            else {
              // Reset the scroll source for the next scroll event
              $scope.scrollSource = null;
            }

            previousScrollPosition = newScrollTop;
          }
          else if ($scope.type === 'horizontal') {
            grid.flagScrollingHorizontally();
            // var newScrollLeft = $elm[0].scrollLeft;
            var newScrollLeft = gridUtil.normalizeScrollLeft($elm);

            var xDiff = previousScrollPosition - newScrollLeft;

            var horizScrollLength = (colContainer.getCanvasWidth() - colContainer.getViewportWidth());
            var horizScrollPercentage = newScrollLeft / horizScrollLength;

            var xArgs = {
              target: $elm,
              x: {
                percentage: horizScrollPercentage
              }
            };

            // If the source of this scroll is defined (i.e., not us, then don't fire the scroll event because we'll be re-triggering)
            if (!$scope.scrollSource) {
              uiGridCtrl.fireScrollingEvent(xArgs);
            }
            else {
              // Reset the scroll source for the next scroll event
              $scope.scrollSource = null;
            }

            previousScrollPosition = newScrollLeft;
          }
        }

        $elm.on('scroll', scrollEvent);

        $elm.on('$destroy', function () {
          $elm.off('scroll');
        });

        function gridScroll(evt, args) {
          // Don't listen to our own scroll event!
          if (args.target && (args.target === $elm || angular.element(args.target).hasClass('ui-grid-native-scrollbar'))) {
            return;
          }

          // Set the source of the scroll event in our scope so it's available in our 'scroll' event handler
          $scope.scrollSource = args.target;

          if ($scope.type === 'vertical') {
            if (args.y && typeof(args.y.percentage) !== 'undefined' && args.y.percentage !== undefined) {
              grid.flagScrollingVertically();
              var vertScrollLength = (rowContainer.getCanvasHeight() - rowContainer.getViewportHeight());

              var newScrollTop = Math.max(0, args.y.percentage * vertScrollLength);

              $elm[0].scrollTop = newScrollTop;


            }
          }
          else if ($scope.type === 'horizontal') {
            if (args.x && typeof(args.x.percentage) !== 'undefined' && args.x.percentage !== undefined) {
              grid.flagScrollingHorizontally();
              var horizScrollLength = (colContainer.getCanvasWidth() - colContainer.getViewportWidth());

              var newScrollLeft = Math.max(0, args.x.percentage * horizScrollLength);

              // $elm[0].scrollLeft = newScrollLeft;
              $elm[0].scrollLeft = gridUtil.denormalizeScrollLeft($elm, newScrollLeft);
            }
          }
        }

        var gridScrollDereg = $scope.$on(uiGridConstants.events.GRID_SCROLL, gridScroll);
        $scope.$on('$destroy', gridScrollDereg);



      }
    };
  }]);
})();
(function () {
  'use strict';

  var module = angular.module('ui.grid');
  
  module.directive('uiGridRenderContainer', ['$log', '$timeout', '$document', 'uiGridConstants', 'gridUtil',
    function($log, $timeout, $document, uiGridConstants, GridUtil) {
    return {
      replace: true,
      transclude: true,
      templateUrl: 'ui-grid/uiGridRenderContainer',
      require: ['^uiGrid', 'uiGridRenderContainer'],
      scope: {
        containerId: '=',
        rowContainerName: '=',
        colContainerName: '=',
        bindScrollHorizontal: '=',
        bindScrollVertical: '=',
        enableScrollbars: '='
      },
      controller: 'uiGridRenderContainer as RenderContainer',
      compile: function () {
        return {
          pre: function prelink($scope, $elm, $attrs, controllers) {
            $log.debug('render container ' + $scope.containerId + ' pre-link');

            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];

            var grid = $scope.grid = uiGridCtrl.grid;

            // Verify that the render container for this element exists
            if (!$scope.rowContainerName) {
              throw "No row render container name specified";
            }
            if (!$scope.colContainerName) {
              throw "No column render container name specified";
            }

            if (!grid.renderContainers[$scope.rowContainerName]) {
              throw "Row render container '" + $scope.rowContainerName + "' is not registered.";
            }
            if (!grid.renderContainers[$scope.colContainerName]) {
              throw "Column render container '" + $scope.colContainerName + "' is not registered.";
            }

            var rowContainer = $scope.rowContainer = grid.renderContainers[$scope.rowContainerName];
            var colContainer = $scope.colContainer = grid.renderContainers[$scope.colContainerName];
            
            containerCtrl.containerId = $scope.containerId;
            containerCtrl.rowContainer = rowContainer;
            containerCtrl.colContainer = colContainer;
          },
          post: function postlink($scope, $elm, $attrs, controllers) {
            $log.debug('render container ' + $scope.containerId + ' post-link');

            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];

            var grid = uiGridCtrl.grid;
            var rowContainer = containerCtrl.rowContainer;
            var colContainer = containerCtrl.colContainer;

            // Put the container name on this element as a class
            $elm.addClass('ui-grid-render-container-' + $scope.containerId);

            // Bind to left/right-scroll events
            var scrollUnbinder;
            if ($scope.bindScrollHorizontal || $scope.bindScrollVertical) {
              scrollUnbinder = $scope.$on(uiGridConstants.events.GRID_SCROLL, scrollHandler);
            }

            function scrollHandler (evt, args) {
              // Vertical scroll
              if (args.y && $scope.bindScrollVertical) {
                containerCtrl.prevScrollArgs = args;

                var scrollLength = (rowContainer.getCanvasHeight() - rowContainer.getViewportHeight());

                // Add the height of the native horizontal scrollbar, if it's there. Otherwise it will mask over the final row
                if (grid.horizontalScrollbarHeight && grid.horizontalScrollbarHeight > 0) {
                  scrollLength = scrollLength + grid.horizontalScrollbarHeight;
                }

                var oldScrollTop = containerCtrl.viewport[0].scrollTop;
                
                var scrollYPercentage;
                if (typeof(args.y.percentage) !== 'undefined' && args.y.percentage !== undefined) {
                  scrollYPercentage = args.y.percentage;
                }
                else if (typeof(args.y.pixels) !== 'undefined' && args.y.pixels !== undefined) {
                  scrollYPercentage = args.y.percentage = (oldScrollTop + args.y.pixels) / scrollLength;
                  // $log.debug('y.percentage', args.y.percentage);
                }
                else {
                  throw new Error("No percentage or pixel value provided for scroll event Y axis");
                }

                var newScrollTop = Math.max(0, scrollYPercentage * scrollLength);

                containerCtrl.viewport[0].scrollTop = newScrollTop;
                
                // TOOD(c0bra): what's this for?
                // grid.options.offsetTop = newScrollTop;

                containerCtrl.prevScrollArgs.y.pixels = newScrollTop - oldScrollTop;
              }

              // Horizontal scroll
              if (args.x && $scope.bindScrollHorizontal) {
                containerCtrl.prevScrollArgs = args;

                var scrollWidth = (colContainer.getCanvasWidth() - colContainer.getViewportWidth());

                // var oldScrollLeft = containerCtrl.viewport[0].scrollLeft;
                var oldScrollLeft = GridUtil.normalizeScrollLeft(containerCtrl.viewport);

                var scrollXPercentage;
                if (typeof(args.x.percentage) !== 'undefined' && args.x.percentage !== undefined) {
                  scrollXPercentage = args.x.percentage;
                }
                else if (typeof(args.x.pixels) !== 'undefined' && args.x.pixels !== undefined) {
                  scrollXPercentage = args.x.percentage = (oldScrollLeft + args.x.pixels) / scrollWidth;
                }
                else {
                  throw new Error("No percentage or pixel value provided for scroll event X axis");
                }

                var newScrollLeft = Math.max(0, scrollXPercentage * scrollWidth);
                
                // uiGridCtrl.adjustScrollHorizontal(newScrollLeft, scrollXPercentage);

                // containerCtrl.viewport[0].scrollLeft = newScrollLeft;
                containerCtrl.viewport[0].scrollLeft = GridUtil.denormalizeScrollLeft(containerCtrl.viewport, newScrollLeft);

                containerCtrl.prevScrollLeft = newScrollLeft;

                if (containerCtrl.headerViewport) {
                  // containerCtrl.headerViewport.scrollLeft = newScrollLeft;
                  containerCtrl.headerViewport.scrollLeft = GridUtil.denormalizeScrollLeft(containerCtrl.headerViewport, newScrollLeft);
                }

                if (containerCtrl.footerViewport) {
                  // containerCtrl.footerViewport.scrollLeft = newScrollLeft;
                  containerCtrl.footerViewport.scrollLeft = GridUtil.denormalizeScrollLeft(containerCtrl.footerViewport, newScrollLeft);
                }

                // uiGridCtrl.grid.options.offsetLeft = newScrollLeft;

                containerCtrl.prevScrollArgs.x.pixels = newScrollLeft - oldScrollLeft;
              }
            }

            // Scroll the render container viewport when the mousewheel is used
            $elm.bind('wheel mousewheel DomMouseScroll MozMousePixelScroll', function(evt) {
              // use wheelDeltaY
              evt.preventDefault();

              var newEvent = GridUtil.normalizeWheelEvent(evt);

              var args = { target: $elm };
              if (newEvent.deltaY !== 0) {
                var scrollYAmount = newEvent.deltaY * -120;

                // Get the scroll percentage
                var scrollYPercentage = (containerCtrl.viewport[0].scrollTop + scrollYAmount) / (rowContainer.getCanvasHeight() - rowContainer.getViewportHeight());

                // Keep scrollPercentage within the range 0-1.
                if (scrollYPercentage < 0) { scrollYPercentage = 0; }
                else if (scrollYPercentage > 1) { scrollYPercentage = 1; }

                args.y = { percentage: scrollYPercentage, pixels: scrollYAmount };
              }
              if (newEvent.deltaX !== 0) {
                var scrollXAmount = newEvent.deltaX * -120;

                // Get the scroll percentage
                var scrollLeft = GridUtil.normalizeScrollLeft(containerCtrl.viewport);
                var scrollXPercentage = (scrollLeft + scrollXAmount) / (colContainer.getCanvasWidth() - colContainer.getViewportWidth());

                // Keep scrollPercentage within the range 0-1.
                if (scrollXPercentage < 0) { scrollXPercentage = 0; }
                else if (scrollXPercentage > 1) { scrollXPercentage = 1; }

                args.x = { percentage: scrollXPercentage, pixels: scrollXAmount };
              }
              
              uiGridCtrl.fireScrollingEvent(args);
            });
            

            var startY = 0,
            startX = 0,
            scrollTopStart = 0,
            scrollLeftStart = 0,
            directionY = 1,
            directionX = 1,
            moveStart;

            function touchmove(event) {
              if (event.originalEvent) {
                event = event.originalEvent;
              }

              event.preventDefault();

              var deltaX, deltaY, newX, newY;
              newX = event.targetTouches[0].screenX;
              newY = event.targetTouches[0].screenY;
              deltaX = -(newX - startX);
              deltaY = -(newY - startY);

              directionY = (deltaY < 1) ? -1 : 1;
              directionX = (deltaX < 1) ? -1 : 1;

              deltaY *= 2;
              deltaX *= 2;

              var args = { target: event.target };

              if (deltaY !== 0) {
                var scrollYPercentage = (scrollTopStart + deltaY) / (rowContainer.getCanvasHeight() - rowContainer.getViewportHeight());

                if (scrollYPercentage > 1) { scrollYPercentage = 1; }
                else if (scrollYPercentage < 0) { scrollYPercentage = 0; }

                args.y = { percentage: scrollYPercentage, pixels: deltaY };
              }
              if (deltaX !== 0) {
                var scrollXPercentage = (scrollLeftStart + deltaX) / (colContainer.getCanvasWidth() - colContainer.getViewportWidth());

                if (scrollXPercentage > 1) { scrollXPercentage = 1; }
                else if (scrollXPercentage < 0) { scrollXPercentage = 0; }

                args.x = { percentage: scrollXPercentage, pixels: deltaX };
              }

              uiGridCtrl.fireScrollingEvent(args);
            }
            
            function touchend(event) {
              if (event.originalEvent) {
                event = event.originalEvent;
              }

              event.preventDefault();

              $document.unbind('touchmove', touchmove);
              $document.unbind('touchend', touchend);
              $document.unbind('touchcancel', touchend);

              // Get the distance we moved on the Y axis
              var scrollTopEnd = containerCtrl.viewport[0].scrollTop;
              var scrollLeftEnd = containerCtrl.viewport[0].scrollTop;
              var deltaY = Math.abs(scrollTopEnd - scrollTopStart);
              var deltaX = Math.abs(scrollLeftEnd - scrollLeftStart);

              // Get the duration it took to move this far
              var moveDuration = (new Date()) - moveStart;

              // Scale the amount moved by the time it took to move it (i.e. quicker, longer moves == more scrolling after the move is over)
              var moveYScale = deltaY / moveDuration;
              var moveXScale = deltaX / moveDuration;

              var decelerateInterval = 63; // 1/16th second
              var decelerateCount = 8; // == 1/2 second
              var scrollYLength = 120 * directionY * moveYScale;
              var scrollXLength = 120 * directionX * moveXScale;

              function decelerate() {
                $timeout(function() {
                  var args = { target: event.target };

                  if (scrollYLength !== 0) {
                    var scrollYPercentage = (containerCtrl.viewport[0].scrollTop + scrollYLength) / (rowContainer.getCanvasHeight() - rowContainer.getViewportHeight());

                    args.y = { percentage: scrollYPercentage, pixels: scrollYLength };
                  }

                  if (scrollXLength !== 0) {
                    var scrollXPercentage = (containerCtrl.viewport[0].scrollLeft + scrollXLength) / (colContainer.getCanvasWidth() - colContainer.getViewportWidth());
                    args.x = { percentage: scrollXPercentage, pixels: scrollXLength };
                  }

                  uiGridCtrl.fireScrollingEvent(args);

                  decelerateCount = decelerateCount -1;
                  scrollYLength = scrollYLength / 2;
                  scrollXLength = scrollXLength / 2;

                  if (decelerateCount > 0) {
                    decelerate();
                  }
                  else {
                    uiGridCtrl.scrollbars.forEach(function (sbar) {
                      sbar.removeClass('ui-grid-scrollbar-visible');
                      sbar.removeClass('ui-grid-scrolling');
                    });
                  }
                }, decelerateInterval);
              }

              // decelerate();
            }

            if (GridUtil.isTouchEnabled()) {
              $elm.bind('touchstart', function (event) {
                if (event.originalEvent) {
                  event = event.originalEvent;
                }

                event.preventDefault();

                uiGridCtrl.scrollbars.forEach(function (sbar) {
                  sbar.addClass('ui-grid-scrollbar-visible');
                  sbar.addClass('ui-grid-scrolling');
                });

                moveStart = new Date();
                startY = event.targetTouches[0].screenY;
                startX = event.targetTouches[0].screenX;
                scrollTopStart = containerCtrl.viewport[0].scrollTop;
                scrollLeftStart = containerCtrl.viewport[0].scrollLeft;
                
                $document.on('touchmove', touchmove);
                $document.on('touchend touchcancel', touchend);
              });
            }

            $elm.bind('$destroy', function() {
              scrollUnbinder();
              $elm.unbind('keydown');

              ['touchstart', 'touchmove', 'touchend','keydown', 'wheel', 'mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'].forEach(function (eventName) {
                $elm.unbind(eventName);
              });
            });
            
            // TODO(c0bra): Handle resizing the inner canvas based on the number of elements
            function update() {
              var ret = '';

              var canvasWidth = colContainer.getCanvasWidth();
              var viewportWidth = colContainer.getViewportWidth();

              var canvasHeight = rowContainer.getCanvasHeight();
              var viewportHeight = rowContainer.getViewportHeight();

              var headerViewportWidth = colContainer.getHeaderViewportWidth();
              var footerViewportWidth = colContainer.getHeaderViewportWidth();
              
              // Set canvas dimensions
              ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-canvas { width: ' + canvasWidth + 'px; height: ' + canvasHeight + 'px; }';
              ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-header-canvas { width: ' + canvasWidth + 'px; }';
              
              ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-viewport { width: ' + viewportWidth + 'px; height: ' + viewportHeight + 'px; }';
              ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-header-viewport { width: ' + headerViewportWidth + 'px; }';

              ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-footer-canvas { width: ' + canvasWidth + 'px; }';
              ret += '\n .grid' + uiGridCtrl.grid.id + ' .ui-grid-render-container-' + $scope.containerId + ' .ui-grid-footer-viewport { width: ' + footerViewportWidth + 'px; }';
              // Update

              return ret;
            }
            
            uiGridCtrl.grid.registerStyleComputation({
              priority: 6,
              func: update
            });
          }
        };
      }
    };

  }]);

  module.controller('uiGridRenderContainer', ['$scope', '$log', function ($scope, $log) {
    var self = this;

    self.rowStyle = function (index) {
      var renderContainer = $scope.grid.renderContainers[$scope.containerId];

      var styles = {};
      
      if (!renderContainer.disableRowOffset) {
        if (index === 0 && self.currentTopRow !== 0) {
          // The row offset-top is just the height of the rows above the current top-most row, which are no longer rendered
          var hiddenRowWidth = ($scope.rowContainer.currentTopRow) *
            $scope.rowContainer.visibleRowCache[$scope.rowContainer.currentTopRow].height;

          // return { 'margin-top': hiddenRowWidth + 'px' };
          styles['margin-top'] = hiddenRowWidth + 'px';
        }
      }
      
      if (!renderContainer.disableColumnOffset && $scope.colContainer.currentFirstColumn !== 0) {
        if ($scope.grid.isRTL()) {
          styles['margin-right'] = $scope.colContainer.columnOffset + 'px';
        }
        else {
          styles['margin-left'] = $scope.colContainer.columnOffset + 'px';
        }
      }

      return styles;
    };

    self.columnStyle = function (index) {
      var renderContainer = $scope.grid.renderContainers[$scope.containerId];

      var self = this;

      if (!renderContainer.disableColumnOffset) {
        if (index === 0 && $scope.colContainer.currentFirstColumn !== 0) {
          var offset = $scope.colContainer.columnOffset;

          if ($scope.grid.isRTL()) {
            return { 'margin-right': offset + 'px' };
          }
          else {
            return { 'margin-left': offset + 'px' }; 
          }
        }
      }

      return null;
    };
  }]);

})();
(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridRow', ['$log', function($log) {
    return {
      replace: true,
      // priority: 2001,
      // templateUrl: 'ui-grid/ui-grid-row',
      require: ['^uiGrid', '^uiGridRenderContainer'],
      scope: {
         row: '=uiGridRow',
         //rowRenderIndex is added to scope to give the true visual index of the row to any directives that need it
         rowRenderIndex: '='
      },
      compile: function() {
        return {
          pre: function($scope, $elm, $attrs, controllers) {
            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];

            var grid = uiGridCtrl.grid;

            $scope.grid = uiGridCtrl.grid;
            $scope.colContainer = containerCtrl.colContainer;

            grid.getRowTemplateFn.then(function (templateFn) {
              templateFn($scope, function(clonedElement, scope) {
                $elm.replaceWith(clonedElement);
              });
            });
          },
          post: function($scope, $elm, $attrs, controllers) {
            var uiGridCtrl = controllers[0];
            var containerCtrl = controllers[1];

            //add optional reference to externalScopes function to scope
            //so it can be retrieved in lower elements
            $scope.getExternalScopes = uiGridCtrl.getExternalScopes;
          }
        };
      }
    };
  }]);

})();
(function(){
// 'use strict';

  /**
   * @ngdoc directive
   * @name ui.grid.directive:uiGridStyle
   * @element style
   * @restrict A
   *
   * @description
   * Allows us to interpolate expressions in `<style>` elements. Angular doesn't do this by default as it can/will/might? break in IE8.
   *
   * @example
   <doc:example module="app">
   <doc:source>
   <script>
   var app = angular.module('app', ['ui.grid']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
          $scope.myStyle = '.blah { border: 1px solid }';
        }]);
   </script>

   <div ng-controller="MainCtrl">
   <style ui-grid-style>{{ myStyle }}</style>
   <span class="blah">I am in a box.</span>
   </div>
   </doc:source>
   <doc:scenario>
   it('should apply the right class to the element', function () {
        element(by.css('.blah')).getCssValue('border')
          .then(function(c) {
            expect(c).toContain('1px solid');
          });
      });
   </doc:scenario>
   </doc:example>
   */


  angular.module('ui.grid').directive('uiGridStyle', ['$log', '$interpolate', function($log, $interpolate) {
    return {
      // restrict: 'A',
      // priority: 1000,
      // require: '?^uiGrid',
      link: function($scope, $elm, $attrs, uiGridCtrl) {
        $log.debug('ui-grid-style link');
        // if (uiGridCtrl === undefined) {
        //    $log.warn('[ui-grid-style link] uiGridCtrl is undefined!');
        // }

        var interpolateFn = $interpolate($elm.text(), true);

        if (interpolateFn) {
          $scope.$watch(interpolateFn, function(value) {
            $elm.text(value);
          });
        }

          // uiGridCtrl.recalcRowStyles = function() {
          //   var offset = (scope.options.offsetTop || 0) - (scope.options.excessRows * scope.options.rowHeight);
          //   var rowHeight = scope.options.rowHeight;

          //   var ret = '';
          //   var rowStyleCount = uiGridCtrl.minRowsToRender() + (scope.options.excessRows * 2);
          //   for (var i = 1; i <= rowStyleCount; i++) {
          //     ret = ret + ' .grid' + scope.gridId + ' .ui-grid-row:nth-child(' + i + ') { top: ' + offset + 'px; }';
          //     offset = offset + rowHeight;
          //   }

          //   scope.rowStyles = ret;
          // };

          // uiGridCtrl.styleComputions.push(uiGridCtrl.recalcRowStyles);

      }
    };
  }]);

})();
(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridViewport', ['$log', 'gridUtil',
    function($log, gridUtil) {
      return {
        replace: true,
        scope: {},
        templateUrl: 'ui-grid/uiGridViewport',
        require: ['^uiGrid', '^uiGridRenderContainer'],
        link: function($scope, $elm, $attrs, controllers) {
          $log.debug('viewport post-link');

          var uiGridCtrl = controllers[0];
          var containerCtrl = controllers[1];

          $scope.containerCtrl = containerCtrl;

          var rowContainer = containerCtrl.rowContainer;
          var colContainer = containerCtrl.colContainer;

          var grid = uiGridCtrl.grid;

          $scope.grid = uiGridCtrl.grid;

          // Put the containers in scope so we can get rows and columns from them
          $scope.rowContainer = containerCtrl.rowContainer;
          $scope.colContainer = containerCtrl.colContainer;

          // Register this viewport with its container 
          containerCtrl.viewport = $elm;

          $elm.on('scroll', function (evt) {
            var newScrollTop = $elm[0].scrollTop;
            // var newScrollLeft = $elm[0].scrollLeft;
            var newScrollLeft = gridUtil.normalizeScrollLeft($elm);

            // Handle RTL here

            if (newScrollLeft !== colContainer.prevScrollLeft) {
              var xDiff = newScrollLeft - colContainer.prevScrollLeft;

              var horizScrollLength = (colContainer.getCanvasWidth() - colContainer.getViewportWidth());
              var horizScrollPercentage = newScrollLeft / horizScrollLength;

              colContainer.adjustScrollHorizontal(newScrollLeft, horizScrollPercentage);
            }

            if (newScrollTop !== rowContainer.prevScrollTop) {
              var yDiff = newScrollTop - rowContainer.prevScrollTop;

              // uiGridCtrl.fireScrollingEvent({ y: { pixels: diff } });
              var vertScrollLength = (rowContainer.getCanvasHeight() - rowContainer.getViewportHeight());
              // var vertScrollPercentage = (uiGridCtrl.prevScrollTop + yDiff) / vertScrollLength;
              var vertScrollPercentage = newScrollTop / vertScrollLength;

              if (vertScrollPercentage > 1) { vertScrollPercentage = 1; }
              if (vertScrollPercentage < 0) { vertScrollPercentage = 0; }
              
              rowContainer.adjustScrollVertical(newScrollTop, vertScrollPercentage);
            }
          });
        }
      };
    }
  ]);

})();
(function() {

angular.module('ui.grid')
.directive('uiGridVisible', function uiGridVisibleAction() {
  return function ($scope, $elm, $attr) {
    $scope.$watch($attr.uiGridVisible, function (visible) {
        // $elm.css('visibility', visible ? 'visible' : 'hidden');
        $elm[visible ? 'removeClass' : 'addClass']('ui-grid-invisible');
    });
  };
});

})();
(function () {
  'use strict';

  angular.module('ui.grid').controller('uiGridController', ['$scope', '$element', '$attrs', '$log', 'gridUtil', '$q', 'uiGridConstants',
                    '$templateCache', 'gridClassFactory', '$timeout', '$parse', '$compile',
    function ($scope, $elm, $attrs, $log, gridUtil, $q, uiGridConstants,
              $templateCache, gridClassFactory, $timeout, $parse, $compile) {
      $log.debug('ui-grid controller');

      var self = this;

      // Extend options with ui-grid attribute reference
      self.grid = gridClassFactory.createGrid($scope.uiGrid);
      $elm.addClass('grid' + self.grid.id);
      self.grid.rtl = $elm.css('direction') === 'rtl';


      //add optional reference to externalScopes function to controller
      //so it can be retrieved in lower elements that have isolate scope
      self.getExternalScopes = $scope.getExternalScopes;

      // angular.extend(self.grid.options, );

      //all properties of grid are available on scope
      $scope.grid = self.grid;

      if ($attrs.uiGridColumns) {
        $attrs.$observe('uiGridColumns', function(value) {
          self.grid.options.columnDefs = value;
          self.grid.buildColumns()
            .then(function(){
              self.grid.preCompileCellTemplates();

              self.grid.refreshCanvas(true);
            });
        });
      }


      var dataWatchCollectionDereg;
      if (angular.isString($scope.uiGrid.data)) {
        dataWatchCollectionDereg = $scope.$parent.$watchCollection($scope.uiGrid.data, dataWatchFunction);
      }
      else {
        dataWatchCollectionDereg = $scope.$parent.$watchCollection(function() { return $scope.uiGrid.data; }, dataWatchFunction);
      }

      var columnDefWatchCollectionDereg = $scope.$parent.$watchCollection(function() { return $scope.uiGrid.columnDefs; }, columnDefsWatchFunction);

      function columnDefsWatchFunction(n, o) {
        if (n && n !== o) {
          self.grid.options.columnDefs = n;
          self.grid.buildColumns()
            .then(function(){

              self.grid.preCompileCellTemplates();

              self.grid.refreshCanvas(true);
            });
        }
      }

      function dataWatchFunction(n) {
        // $log.debug('dataWatch fired');
        var promises = [];

        if (n) {
          if (self.grid.columns.length === 0) {
            $log.debug('loading cols in dataWatchFunction');
            if (!$attrs.uiGridColumns && self.grid.options.columnDefs.length === 0) {
              self.grid.buildColumnDefsFromData(n);
            }
            promises.push(self.grid.buildColumns()
              .then(function() {
                self.grid.preCompileCellTemplates();}
            ));
          }
          $q.all(promises).then(function() {
            self.grid.modifyRows(n)
              .then(function () {
                // if (self.viewport) {
                  self.grid.redrawInPlace();
                // }

                $scope.$evalAsync(function() {
                  self.grid.refreshCanvas(true);
                });
              });
          });
        }
      }


      $scope.$on('$destroy', function() {
        dataWatchCollectionDereg();
        columnDefWatchCollectionDereg();
      });

      $scope.$watch(function () { return self.grid.styleComputations; }, function() {
        self.grid.refreshCanvas(true);
      });


      /* Event Methods */

      //todo: throttle this event?
      self.fireScrollingEvent = function(args) {
        $scope.$broadcast(uiGridConstants.events.GRID_SCROLL, args);
      };

      self.fireEvent = function(eventName, args) {
        // Add the grid to the event arguments if it's not there
        if (typeof(args) === 'undefined' || args === undefined) {
          args = {};
        }

        if (typeof(args.grid) === 'undefined' || args.grid === undefined) {
          args.grid = self.grid;
        }

        $scope.$broadcast(eventName, args);
      };

      self.innerCompile = function innerCompile(elm) {
        $compile(elm)($scope);
      };

    }]);

/**
 *  @ngdoc directive
 *  @name ui.grid.directive:uiGrid
 *  @element div
 *  @restrict EA
 *  @param {Object} uiGrid Options for the grid to use
 *  @param {Object=} external-scopes Add external-scopes='someScopeObjectYouNeed' attribute so you can access
 *            your scopes from within any custom templatedirective.  You access by $scope.getExternalScopes() function
 *
 *  @description Create a very basic grid.
 *
 *  @example
    <example module="app">
      <file name="app.js">
        var app = angular.module('app', ['ui.grid']);

        app.controller('MainCtrl', ['$scope', function ($scope) {
          $scope.data = [
            { name: 'Bob', title: 'CEO' },
            { name: 'Frank', title: 'Lowly Developer' }
          ];
        }]);
      </file>
      <file name="index.html">
        <div ng-controller="MainCtrl">
          <div ui-grid="{ data: data }"></div>
        </div>
      </file>
    </example>
 */
angular.module('ui.grid').directive('uiGrid',
  [
    '$log',
    '$compile',
    '$templateCache',
    'gridUtil',
    '$window',
    function(
      $log,
      $compile,
      $templateCache,
      gridUtil,
      $window
      ) {
      return {
        templateUrl: 'ui-grid/ui-grid',
        scope: {
          uiGrid: '=',
          getExternalScopes: '&?externalScopes' //optional functionwrapper around any needed external scope instances
        },
        replace: true,
        transclude: true,
        controller: 'uiGridController',
        compile: function () {
          return {
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
              $log.debug('ui-grid postlink');

              var grid = uiGridCtrl.grid;

              // Initialize scrollbars (TODO: move to controller??)
              uiGridCtrl.scrollbars = [];

              //todo: assume it is ok to communicate that rendering is complete??
              grid.renderingComplete();

              grid.element = $elm;

              grid.gridWidth = $scope.gridWidth = gridUtil.elementWidth($elm);

              // Default canvasWidth to the grid width, in case we don't get any column definitions to calculate it from
              grid.canvasWidth = uiGridCtrl.grid.gridWidth;

              grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);

              // If the grid isn't tall enough to fit a single row, it's kind of useless. Resize it to fit a minimum number of rows
              if (grid.gridHeight < grid.options.rowHeight) {
                // Figure out the new height
                var newHeight = grid.options.minRowsToShow * grid.options.rowHeight;

                $elm.css('height', newHeight + 'px');

                grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);
              }

              // Run initial canvas refresh
              grid.refreshCanvas();

              //add pinned containers for row headers support
              //moved from pinning feature
              var left = angular.element('<div ng-if="grid.hasLeftContainer()" style="width: 0" ui-grid-pinned-container="\'left\'"></div>');
              $elm.prepend(left);
              uiGridCtrl.innerCompile(left);

              var right = angular.element('<div  ng-if="grid.hasRightContainer()" style="width: 0" ui-grid-pinned-container="\'right\'"></div>');
              $elm.append(right);
              uiGridCtrl.innerCompile(right);


              //if we add a left container after render, we need to watch and react
              $scope.$watch(function () { return grid.hasLeftContainer();}, function (newValue, oldValue) {
                if (newValue === oldValue) {
                  return;
                }

                //todo: remove this code.  it was commented out after moving from pinning because body is already float:left
//                var bodyContainer = angular.element($elm[0].querySelectorAll('[container-id="body"]'));
//                if (newValue){
//                  bodyContainer.attr('style', 'float: left; position: inherit');
//                }
//                else {
//                  bodyContainer.attr('style', 'float: left; position: relative');
//                }

                grid.refreshCanvas(true);
              });

              //if we add a right container after render, we need to watch and react
              $scope.$watch(function () { return grid.hasRightContainer();}, function (newValue, oldValue) {
                if (newValue === oldValue) {
                  return;
                }
                grid.refreshCanvas(true);
              });


              // Resize the grid on window resize events
              function gridResize($event) {
                grid.gridWidth = $scope.gridWidth = gridUtil.elementWidth($elm);
                grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);

                grid.queueRefresh();
              }

              angular.element($window).on('resize', gridResize);

              // Unbind from window resize events when the grid is destroyed
              $elm.on('$destroy', function () {
                angular.element($window).off('resize', gridResize);
              });
            }
          };
        }
      };
    }
  ]);

})();

(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridPinnedContainer', ['$log', function ($log) {
    return {
      restrict: 'EA',
      replace: true,
      template: '<div class="ui-grid-pinned-container"><div ui-grid-render-container container-id="side" row-container-name="\'body\'" col-container-name="side" bind-scroll-vertical="true" class="{{ side }} ui-grid-render-container-{{ side }}"></div></div>',
      scope: {
        side: '=uiGridPinnedContainer'
      },
      require: '^uiGrid',
      compile: function compile() {
        return {
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
            $log.debug('ui-grid-pinned-container ' + $scope.side + ' link');

            var grid = uiGridCtrl.grid;

            var myWidth = 0;

            $elm.addClass('ui-grid-pinned-container-' + $scope.side);

            function updateContainerDimensions() {
              // $log.debug('update ' + $scope.side + ' dimensions');

              var ret = '';

              // Column containers
              if ($scope.side === 'left' || $scope.side === 'right') {
                var cols = grid.renderContainers[$scope.side].visibleColumnCache;
                var width = 0;
                for (var i = 0; i < cols.length; i++) {
                  var col = cols[i];
                  width += col.drawnWidth;
                }

                myWidth = width;

                // $log.debug('myWidth', myWidth);

                // TODO(c0bra): Subtract sum of col widths from grid viewport width and update it
                $elm.attr('style', null);

                var myHeight = grid.renderContainers.body.getViewportHeight(); // + grid.horizontalScrollbarHeight;

                ret += '.grid' + grid.id + ' .ui-grid-pinned-container-' + $scope.side + ', .grid' + grid.id + ' .ui-grid-pinned-container-' + $scope.side + ' .ui-grid-render-container-' + $scope.side + ' .ui-grid-viewport { width: ' + myWidth + 'px; height: ' + myHeight + 'px; } ';
              }

              return ret;
            }

            grid.renderContainers.body.registerViewportAdjuster(function (adjustment) {
              // Subtract our own width
              adjustment.width -= myWidth;

              return adjustment;
            });

            // Register style computation to adjust for columns in `side`'s render container
            grid.registerStyleComputation({
              priority: 15,
              func: updateContainerDimensions
            });
          }
        };
      }
    };
  }]);
})();
(function(){

angular.module('ui.grid')
.factory('Grid', ['$log', '$q', '$compile', '$parse', 'gridUtil', 'uiGridConstants', 'GridOptions', 'GridColumn', 'GridRow', 'GridApi', 'rowSorter', 'rowSearcher', 'GridRenderContainer', '$timeout',
    function($log, $q, $compile, $parse, gridUtil, uiGridConstants, GridOptions, GridColumn, GridRow, GridApi, rowSorter, rowSearcher, GridRenderContainer, $timeout) {

/**
 * @ngdoc object
 * @name ui.grid.core.api:PublicApi
 * @description Public Api for the core grid features
 *
 */


/**
   * @ngdoc function
   * @name ui.grid.class:Grid
   * @description Grid is the main viewModel.  Any properties or methods needed to maintain state are defined in
 * * this prototype.  One instance of Grid is created per Grid directive instance.
   * @param {object} options Object map of options to pass into the grid. An 'id' property is expected.
   */
  var Grid = function Grid(options) {
    var self = this;
  // Get the id out of the options, then remove it
  if (options !== undefined && typeof(options.id) !== 'undefined' && options.id) {
    if (!/^[_a-zA-Z0-9-]+$/.test(options.id)) {
      throw new Error("Grid id '" + options.id + '" is invalid. It must follow CSS selector syntax rules.');
    }
  }
  else {
    throw new Error('No ID provided. An ID must be given when creating a grid.');
  }

  self.id = options.id;
  delete options.id;

  // Get default options
  self.options = new GridOptions();

  // Extend the default options with what we were passed in
  angular.extend(self.options, options);

  self.headerHeight = self.options.headerRowHeight;
  self.footerHeight = self.options.showFooter === true ? self.options.footerRowHeight : 0;

  self.rtl = false;
  self.gridHeight = 0;
  self.gridWidth = 0;
  self.columnBuilders = [];
  self.rowBuilders = [];
  self.rowsProcessors = [];
  self.columnsProcessors = [];
  self.styleComputations = [];
  self.viewportAdjusters = [];
  self.rowHeaderColumns = [];

  // self.visibleRowCache = [];

  // Set of 'render' containers for self grid, which can render sets of rows
  self.renderContainers = {};

  // Create a
  self.renderContainers.body = new GridRenderContainer('body', self);

  self.cellValueGetterCache = {};

  // Cached function to use with custom row templates
  self.getRowTemplateFn = null;


  //representation of the rows on the grid.
  //these are wrapped references to the actual data rows (options.data)
  self.rows = [];

  //represents the columns on the grid
  self.columns = [];

  /**
   * @ngdoc boolean
   * @name isScrollingVertically
   * @propertyOf ui.grid.class:Grid
   * @description set to true when Grid is scrolling vertically. Set to false via debounced method
   */
  self.isScrollingVertically = false;

  /**
   * @ngdoc boolean
   * @name isScrollingHorizontally
   * @propertyOf ui.grid.class:Grid
   * @description set to true when Grid is scrolling horizontally. Set to false via debounced method
   */
  self.isScrollingHorizontally = false;

  var debouncedVertical = gridUtil.debounce(function () {
    self.isScrollingVertically = false;
  }, 300);

  var debouncedHorizontal = gridUtil.debounce(function () {
    self.isScrollingHorizontally = false;
  }, 300);


  /**
   * @ngdoc function
   * @name flagScrollingVertically
   * @methodOf ui.grid.class:Grid
   * @description sets isScrollingVertically to true and sets it to false in a debounced function
   */
  self.flagScrollingVertically = function() {
    self.isScrollingVertically = true;
    debouncedVertical();
  };

  /**
   * @ngdoc function
   * @name flagScrollingHorizontally
   * @methodOf ui.grid.class:Grid
   * @description sets isScrollingHorizontally to true and sets it to false in a debounced function
   */
  self.flagScrollingHorizontally = function() {
    self.isScrollingHorizontally = true;
    debouncedHorizontal();
  };



  self.api = new GridApi(self);

  /**
   * @ngdoc function
   * @name refresh
   * @methodOf ui.grid.core.api:PublicApi
   * @description Refresh the rendered grid on screen.
   * 
   */
  self.api.registerMethod( 'core', 'refresh', this.refresh );

  /**
   * @ngdoc function
   * @name refreshRows
   * @methodOf ui.grid.core.api:PublicApi
   * @description Refresh the rendered grid on screen?  Note: not functional at present
   * @returns {promise} promise that is resolved when render completes?
   * 
   */
  self.api.registerMethod( 'core', 'refreshRows', this.refreshRows );


  /**
   * @ngdoc function
   * @name sortChanged
   * @methodOf  ui.grid.core.api:PublicApi
   * @description The sort criteria on one or more columns has
   * changed.  Provides as parameters the grid and the output of
   * getColumnSorting, which is an array of gridColumns
   * that have sorting on them, sorted in priority order. 
   * 
   * @param {Grid} grid the grid
   * @param {array} sortColumns an array of columns with 
   * sorts on them, in priority order
   * 
   * @example
   * <pre>
   *      gridApi.core.on.sortChanged( grid, sortColumns );
   * </pre>
   */
  self.api.registerEvent( 'core', 'sortChanged' );
};

    /**
     * @ngdoc function
     * @name isRTL
     * @methodOf ui.grid.class:Grid
     * @description Returns true if grid is RightToLeft
     */
    Grid.prototype.isRTL = function () {
      return this.rtl;
    };


      /**
   * @ngdoc function
   * @name registerColumnBuilder
   * @methodOf ui.grid.class:Grid
   * @description When the build creates columns from column definitions, the columnbuilders will be called to add
   * additional properties to the column.
   * @param {function(colDef, col, gridOptions)} columnsProcessor function to be called
   */
  Grid.prototype.registerColumnBuilder = function registerColumnBuilder(columnBuilder) {
    this.columnBuilders.push(columnBuilder);
  };

  /**
   * @ngdoc function
   * @name buildColumnDefsFromData
   * @methodOf ui.grid.class:Grid
   * @description Populates columnDefs from the provided data
   * @param {function(colDef, col, gridOptions)} rowBuilder function to be called
   */
  Grid.prototype.buildColumnDefsFromData = function (dataRows){
    this.options.columnDefs =  gridUtil.getColumnsFromData(dataRows,  this.options.excludeProperties);
  };

  /**
   * @ngdoc function
   * @name registerRowBuilder
   * @methodOf ui.grid.class:Grid
   * @description When the build creates rows from gridOptions.data, the rowBuilders will be called to add
   * additional properties to the row.
   * @param {function(colDef, col, gridOptions)} rowBuilder function to be called
   */
  Grid.prototype.registerRowBuilder = function registerRowBuilder(rowBuilder) {
    this.rowBuilders.push(rowBuilder);
  };

  /**
   * @ngdoc function
   * @name getColumn
   * @methodOf ui.grid.class:Grid
   * @description returns a grid column for the column name
   * @param {string} name column name
   */
  Grid.prototype.getColumn = function getColumn(name) {
    var columns = this.columns.filter(function (column) {
      return column.colDef.name === name;
    });
    return columns.length > 0 ? columns[0] : null;
  };

  /**
   * @ngdoc function
   * @name getColDef
   * @methodOf ui.grid.class:Grid
   * @description returns a grid colDef for the column name
   * @param {string} name column.field
   */
  Grid.prototype.getColDef = function getColDef(name) {
    var colDefs = this.options.columnDefs.filter(function (colDef) {
      return colDef.name === name;
    });
    return colDefs.length > 0 ? colDefs[0] : null;
  };

  /**
   * @ngdoc function
   * @name assignTypes
   * @methodOf ui.grid.class:Grid
   * @description uses the first row of data to assign colDef.type for any types not defined.
   */
  /**
   * @ngdoc property
   * @name type
   * @propertyOf ui.grid.class:GridOptions.columnDef
   * @description the type of the column, used in sorting.  If not provided then the 
   * grid will guess the type.  Add this only if the grid guessing is not to your
   * satisfaction.  Refer to {@link ui.grid.service:GridUtil.guessType gridUtil.guessType} for
   * a list of values the grid knows about.
   *
   */
  Grid.prototype.assignTypes = function(){
    var self = this;
    self.options.columnDefs.forEach(function (colDef, index) {

      //Assign colDef type if not specified
      if (!colDef.type) {
        var col = new GridColumn(colDef, index, self);
        var firstRow = self.rows.length > 0 ? self.rows[0] : null;
        if (firstRow) {
          colDef.type = gridUtil.guessType(self.getCellValue(firstRow, col));
        }
        else {
          $log.log('Unable to assign type from data, so defaulting to string');
          colDef.type = 'string';
        }
      }
    });
  };

  /**
  * @ngdoc function
  * @name addRowHeaderColumn
  * @methodOf ui.grid.class:Grid
  * @description adds a row header column to the grid
  * @param {object} column def
  */
  Grid.prototype.addRowHeaderColumn = function addRowHeaderColumn(colDef) {
    var self = this;
    //self.createLeftContainer();
    var rowHeaderCol = new GridColumn(colDef, self.rowHeaderColumns.length + 1, self);
    rowHeaderCol.isRowHeader = true;
    if (self.isRTL()) {
      self.createRightContainer();
      rowHeaderCol.renderContainer = 'right';
    }
    else {
      self.createLeftContainer();
      rowHeaderCol.renderContainer = 'left';
    }

    self.columnBuilders[0](colDef,rowHeaderCol,self.gridOptions)
      .then(function(){
        rowHeaderCol.enableFiltering = false;
        rowHeaderCol.enableSorting = false;
        self.rowHeaderColumns.push(rowHeaderCol);
      });
  };

  /**
   * @ngdoc function
   * @name buildColumns
   * @methodOf ui.grid.class:Grid
   * @description creates GridColumn objects from the columnDefinition.  Calls each registered
   * columnBuilder to further process the column
   * @returns {Promise} a promise to load any needed column resources
   */
  Grid.prototype.buildColumns = function buildColumns() {
    $log.debug('buildColumns');
    var self = this;
    var builderPromises = [];
    var offset = self.rowHeaderColumns.length;

    //add row header columns to the grid columns array
    angular.forEach(self.rowHeaderColumns, function (rowHeaderColumn) {
      offset++;
      self.columns.push(rowHeaderColumn);
    });

    // Synchronize self.columns with self.options.columnDefs so that columns can also be removed.
    if (self.columns.length > self.options.columnDefs.length) {
      self.columns.forEach(function (column, index) {
        if (!self.getColDef(column.name)) {
          self.columns.splice(index, 1);
        }
      });
    }

    self.options.columnDefs.forEach(function (colDef, index) {
      self.preprocessColDef(colDef);
      var col = self.getColumn(colDef.name);

      if (!col) {
        col = new GridColumn(colDef, index + offset, self);
        self.columns.push(col);
      }
      else {
        col.updateColumnDef(colDef, col.index);
      }

      self.columnBuilders.forEach(function (builder) {
        builderPromises.push(builder.call(self, colDef, col, self.options));
      });
    });

    return $q.all(builderPromises);
  };

/**
 * @ngdoc function
 * @name preCompileCellTemplates
 * @methodOf ui.grid.class:Grid
 * @description precompiles all cell templates
 */
  Grid.prototype.preCompileCellTemplates = function() {
        this.columns.forEach(function (col) {
          var html = col.cellTemplate.replace(uiGridConstants.COL_FIELD, 'grid.getCellValue(row, col)');

          var compiledElementFn = $compile(html);
          col.compiledElementFn = compiledElementFn;
        });
  };

  /**
   * @ngdoc function
   * @name createLeftContainer
   * @methodOf ui.grid.class:Grid
   * @description creates the left render container if it doesn't already exist
   */
  Grid.prototype.createLeftContainer = function() {
    if (!this.hasLeftContainer()) {
      this.renderContainers.left = new GridRenderContainer('left', this, { disableColumnOffset: true });
    }
  };

  /**
   * @ngdoc function
   * @name createRightContainer
   * @methodOf ui.grid.class:Grid
   * @description creates the right render container if it doesn't already exist
   */
  Grid.prototype.createRightContainer = function() {
    if (!this.hasRightContainer()) {
      this.renderContainers.right = new GridRenderContainer('right', this, { disableColumnOffset: true });
    }
  };

  /**
   * @ngdoc function
   * @name hasLeftContainer
   * @methodOf ui.grid.class:Grid
   * @description returns true if leftContainer exists
   */
  Grid.prototype.hasLeftContainer = function() {
    return this.renderContainers.left !== undefined;
  };

  /**
   * @ngdoc function
   * @name hasLeftContainer
   * @methodOf ui.grid.class:Grid
   * @description returns true if rightContainer exists
   */
  Grid.prototype.hasRightContainer = function() {
    return this.renderContainers.right !== undefined;
  };


      /**
   * undocumented function
   * @name preprocessColDef
   * @methodOf ui.grid.class:Grid
   * @description defaults the name property from field to maintain backwards compatibility with 2.x
   * validates that name or field is present
   */
  Grid.prototype.preprocessColDef = function preprocessColDef(colDef) {
    if (!colDef.field && !colDef.name) {
      throw new Error('colDef.name or colDef.field property is required');
    }

    //maintain backwards compatibility with 2.x
    //field was required in 2.x.  now name is required
    if (colDef.name === undefined && colDef.field !== undefined) {
      colDef.name = colDef.field;
    }

  };

  // Return a list of items that exist in the `n` array but not the `o` array. Uses optional property accessors passed as third & fourth parameters
  Grid.prototype.newInN = function newInN(o, n, oAccessor, nAccessor) {
    var self = this;

    var t = [];
    for (var i=0; i<n.length; i++) {
      var nV = nAccessor ? n[i][nAccessor] : n[i];
      
      var found = false;
      for (var j=0; j<o.length; j++) {
        var oV = oAccessor ? o[j][oAccessor] : o[j];
        if (self.options.rowEquality(nV, oV)) {
          found = true;
          break;
        }
      }
      if (!found) {
        t.push(nV);
      }
    }
    
    return t;
  };

    /**
     * @ngdoc function
     * @name getRow
     * @methodOf ui.grid.class:Grid
     * @description returns the GridRow that contains the rowEntity
     * @param {object} rowEntity the gridOptions.data array element instance
     */
    Grid.prototype.getRow = function getRow(rowEntity) {
      var rows = this.rows.filter(function (row) {
        return row.entity === rowEntity;
      });
      return rows.length > 0 ? rows[0] : null;
    };


      /**
   * @ngdoc function
   * @name modifyRows
   * @methodOf ui.grid.class:Grid
   * @description creates or removes GridRow objects from the newRawData array.  Calls each registered
   * rowBuilder to further process the row
   *
   * Rows are identified using the gridOptions.rowEquality function
   */
  Grid.prototype.modifyRows = function modifyRows(newRawData) {
    var self = this,
        i,
        newRow;

    if (self.rows.length === 0 && newRawData.length > 0) {
      if (self.options.enableRowHashing) {
        if (!self.rowHashMap) {
          self.createRowHashMap();
        }

        for (i=0; i<newRawData.length; i++) {
          newRow = newRawData[i];

          self.rowHashMap.put(newRow, {
            i: i,
            entity: newRow
          });
        }
      }

      self.addRows(newRawData);
      //now that we have data, it is save to assign types to colDefs
      self.assignTypes();
    }
    else if (newRawData.length > 0) {
      var unfoundNewRows, unfoundOldRows, unfoundNewRowsToFind;

      // If row hashing is turned on
      if (self.options.enableRowHashing) {
        // Array of new rows that haven't been found in the old rowset
        unfoundNewRows = [];
        // Array of new rows that we explicitly HAVE to search for manually in the old row set. They cannot be looked up by their identity (because it doesn't exist).
        unfoundNewRowsToFind = [];
        // Map of rows that have been found in the new rowset
        var foundOldRows = {};
        // Array of old rows that have NOT been found in the new rowset
        unfoundOldRows = [];

        // Create the row HashMap if it doesn't exist already
        if (!self.rowHashMap) {
          self.createRowHashMap();
        }
        var rowhash = self.rowHashMap;
        
        // Make sure every new row has a hash
        for (i = 0; i < newRawData.length; i++) {
          newRow = newRawData[i];

          // Flag this row as needing to be manually found if it didn't come in with a $$hashKey
          var mustFind = false;
          if (!self.options.getRowIdentity(newRow)) {
            mustFind = true;
          }

          // See if the new row is already in the rowhash
          var found = rowhash.get(newRow);
          // If so...
          if (found) {
            // See if it's already being used by as GridRow
            if (found.row) {
              // If so, mark this new row as being found
              foundOldRows[self.options.rowIdentity(newRow)] = true;
            }
          }
          else {
            // Put the row in the hashmap with the index it corresponds to
            rowhash.put(newRow, {
              i: i,
              entity: newRow
            });
            
            // This row has to be searched for manually in the old row set
            if (mustFind) {
              unfoundNewRowsToFind.push(newRow);
            }
            else {
              unfoundNewRows.push(newRow);
            }
          }
        }

        // Build the list of unfound old rows
        for (i = 0; i < self.rows.length; i++) {
          var row = self.rows[i];
          var hash = self.options.rowIdentity(row.entity);
          if (!foundOldRows[hash]) {
            unfoundOldRows.push(row);
          }
        }
      }

      // Look for new rows
      var newRows = unfoundNewRows || [];

      // The unfound new rows is either `unfoundNewRowsToFind`, if row hashing is turned on, or straight `newRawData` if it isn't
      var unfoundNew = (unfoundNewRowsToFind || newRawData);

      // Search for real new rows in `unfoundNew` and concat them onto `newRows`
      newRows = newRows.concat(self.newInN(self.rows, unfoundNew, 'entity'));
      
      self.addRows(newRows); 
      
      var deletedRows = self.getDeletedRows((unfoundOldRows || self.rows), newRawData);

      for (i = 0; i < deletedRows.length; i++) {
        if (self.options.enableRowHashing) {
          self.rowHashMap.remove(deletedRows[i].entity);
        }

        self.rows.splice( self.rows.indexOf(deletedRows[i]), 1 );
      }
    }
    // Empty data set
    else {
      // Reset the row HashMap
      self.createRowHashMap();

      // Reset the rows length!
      self.rows.length = 0;
    }
    
    var p1 = $q.when(self.processRowsProcessors(self.rows))
      .then(function (renderableRows) {
        return self.setVisibleRows(renderableRows);
      });

    var p2 = $q.when(self.processColumnsProcessors(self.columns))
      .then(function (renderableColumns) {
        return self.setVisibleColumns(renderableColumns);
      });

    return $q.all([p1, p2]);
  };

  Grid.prototype.getDeletedRows = function(oldRows, newRows) {
    var self = this;

    var olds = oldRows.filter(function (oldRow) {
      return !newRows.some(function (newItem) {
        return self.options.rowEquality(newItem, oldRow.entity);
      });
    });
    // var olds = self.newInN(newRows, oldRows, null, 'entity');
    // dump('olds', olds);
    return olds;
  };

  /**
   * Private Undocumented Method
   * @name addRows
   * @methodOf ui.grid.class:Grid
   * @description adds the newRawData array of rows to the grid and calls all registered
   * rowBuilders. this keyword will reference the grid
   */
  Grid.prototype.addRows = function addRows(newRawData) {
    var self = this;

    var existingRowCount = self.rows.length;
    for (var i=0; i < newRawData.length; i++) {
      var newRow = self.processRowBuilders(new GridRow(newRawData[i], i + existingRowCount, self));

      if (self.options.enableRowHashing) {
        var found = self.rowHashMap.get(newRow.entity);
        if (found) {
          found.row = newRow;
        }
      }

      self.rows.push(newRow);
    }
  };

  /**
   * @ngdoc function
   * @name processRowBuilders
   * @methodOf ui.grid.class:Grid
   * @description processes all RowBuilders for the gridRow
   * @param {GridRow} gridRow reference to gridRow
   * @returns {GridRow} the gridRow with all additional behavior added
   */
  Grid.prototype.processRowBuilders = function processRowBuilders(gridRow) {
    var self = this;

    self.rowBuilders.forEach(function (builder) {
      builder.call(self, gridRow, self.gridOptions);
    });

    return gridRow;
  };

  /**
   * @ngdoc function
   * @name registerStyleComputation
   * @methodOf ui.grid.class:Grid
   * @description registered a styleComputation function
   * 
   * If the function returns a value it will be appended into the grid's `<style>` block
   * @param {function($scope)} styleComputation function
   */
  Grid.prototype.registerStyleComputation = function registerStyleComputation(styleComputationInfo) {
    this.styleComputations.push(styleComputationInfo);
  };


  // NOTE (c0bra): We already have rowBuilders. I think these do exactly the same thing...
  // Grid.prototype.registerRowFilter = function(filter) {
  //   // TODO(c0bra): validate filter?

  //   this.rowFilters.push(filter);
  // };

  // Grid.prototype.removeRowFilter = function(filter) {
  //   var idx = this.rowFilters.indexOf(filter);

  //   if (typeof(idx) !== 'undefined' && idx !== undefined) {
  //     this.rowFilters.slice(idx, 1);
  //   }
  // };
  
  // Grid.prototype.processRowFilters = function(rows) {
  //   var self = this;
  //   self.rowFilters.forEach(function (filter) {
  //     filter.call(self, rows);
  //   });
  // };


  /**
   * @ngdoc function
   * @name registerRowsProcessor
   * @methodOf ui.grid.class:Grid
   * @param {function(renderableRows)} rows processor function
   * @returns {Array[GridRow]} Updated renderable rows
   * @description

     Register a "rows processor" function. When the rows are updated,
     the grid calls each registered "rows processor", which has a chance
     to alter the set of rows (sorting, etc) as long as the count is not
     modified.
   */
  Grid.prototype.registerRowsProcessor = function registerRowsProcessor(processor) {
    if (!angular.isFunction(processor)) {
      throw 'Attempt to register non-function rows processor: ' + processor;
    }

    this.rowsProcessors.push(processor);
  };

  /**
   * @ngdoc function
   * @name removeRowsProcessor
   * @methodOf ui.grid.class:Grid
   * @param {function(renderableRows)} rows processor function
   * @description Remove a registered rows processor
   */
  Grid.prototype.removeRowsProcessor = function removeRowsProcessor(processor) {
    var idx = this.rowsProcessors.indexOf(processor);

    if (typeof(idx) !== 'undefined' && idx !== undefined) {
      this.rowsProcessors.splice(idx, 1);
    }
  };
  
  /**
   * Private Undocumented Method
   * @name processRowsProcessors
   * @methodOf ui.grid.class:Grid
   * @param {Array[GridRow]} The array of "renderable" rows
   * @param {Array[GridColumn]} The array of columns
   * @description Run all the registered rows processors on the array of renderable rows
   */
  Grid.prototype.processRowsProcessors = function processRowsProcessors(renderableRows) {
    var self = this;

    // Create a shallow copy of the rows so that we can safely sort them without altering the original grid.rows sort order
    var myRenderableRows = renderableRows.slice(0);
    
    // self.rowsProcessors.forEach(function (processor) {
    //   myRenderableRows = processor.call(self, myRenderableRows, self.columns);

    //   if (!renderableRows) {
    //     throw "Processor at index " + i + " did not return a set of renderable rows";
    //   }

    //   if (!angular.isArray(renderableRows)) {
    //     throw "Processor at index " + i + " did not return an array";
    //   }

    //   i++;
    // });

    // Return myRenderableRows with no processing if we have no rows processors 
    if (self.rowsProcessors.length === 0) {
      return $q.when(myRenderableRows);
    }
  
    // Counter for iterating through rows processors
    var i = 0;
    
    // Promise for when we're done with all the processors
    var finished = $q.defer();

    // This function will call the processor in self.rowsProcessors at index 'i', and then
    //   when done will call the next processor in the list, using the output from the processor
    //   at i as the argument for 'renderedRowsToProcess' on the next iteration.
    //  
    //   If we're at the end of the list of processors, we resolve our 'finished' callback with
    //   the result.
    function startProcessor(i, renderedRowsToProcess) {
      // Get the processor at 'i'
      var processor = self.rowsProcessors[i];

      // Call the processor, passing in the rows to process and the current columns
      //   (note: it's wrapped in $q.when() in case the processor does not return a promise)
      return $q.when( processor.call(self, renderedRowsToProcess, self.columns) )
        .then(function handleProcessedRows(processedRows) {
          // Check for errors
          if (!processedRows) {
            throw "Processor at index " + i + " did not return a set of renderable rows";
          }

          if (!angular.isArray(processedRows)) {
            throw "Processor at index " + i + " did not return an array";
          }

          // Processor is done, increment the counter
          i++;

          // If we're not done with the processors, call the next one
          if (i <= self.rowsProcessors.length - 1) {
            return startProcessor(i, processedRows);
          }
          // We're done! Resolve the 'finished' promise
          else {
            finished.resolve(processedRows);
          }
        });
    }

    // Start on the first processor
    startProcessor(0, myRenderableRows);
    
    return finished.promise;
  };

  Grid.prototype.setVisibleRows = function setVisibleRows(rows) {
    // $log.debug('setVisibleRows');

    var self = this;

    //var newVisibleRowCache = [];

    // Reset all the render container row caches
    for (var i in self.renderContainers) {
      var container = self.renderContainers[i];

      container.visibleRowCache.length = 0;
    }
    
    // rows.forEach(function (row) {
    for (var ri = 0; ri < rows.length; ri++) {
      var row = rows[ri];

      // If the row is visible
      if (row.visible) {
        // newVisibleRowCache.push(row);

        // If the row has a container specified
        if (typeof(row.renderContainer) !== 'undefined' && row.renderContainer) {
          self.renderContainers[row.renderContainer].visibleRowCache.push(row);
        }
        // If not, put it into the body container
        else {
          self.renderContainers.body.visibleRowCache.push(row);
        }
      }
    }
  };

  /**
   * @ngdoc function
   * @name registerColumnsProcessor
   * @methodOf ui.grid.class:Grid
   * @param {function(renderableColumns)} rows processor function
   * @returns {Array[GridColumn]} Updated renderable columns
   * @description

     Register a "columns processor" function. When the columns are updated,
     the grid calls each registered "columns processor", which has a chance
     to alter the set of columns, as long as the count is not modified.
   */
  Grid.prototype.registerColumnsProcessor = function registerColumnsProcessor(processor) {
    if (!angular.isFunction(processor)) {
      throw 'Attempt to register non-function rows processor: ' + processor;
    }

    this.columnsProcessors.push(processor);
  };

  Grid.prototype.removeColumnsProcessor = function removeColumnsProcessor(processor) {
    var idx = this.columnsProcessors.indexOf(processor);

    if (typeof(idx) !== 'undefined' && idx !== undefined) {
      this.columnsProcessors.splice(idx, 1);
    }
  };

  Grid.prototype.processColumnsProcessors = function processColumnsProcessors(renderableColumns) {
    var self = this;

    // Create a shallow copy of the rows so that we can safely sort them without altering the original grid.rows sort order
    var myRenderableColumns = renderableColumns.slice(0);

    // Return myRenderableRows with no processing if we have no rows processors 
    if (self.columnsProcessors.length === 0) {
      return $q.when(myRenderableColumns);
    }
  
    // Counter for iterating through rows processors
    var i = 0;
    
    // Promise for when we're done with all the processors
    var finished = $q.defer();

    // This function will call the processor in self.rowsProcessors at index 'i', and then
    //   when done will call the next processor in the list, using the output from the processor
    //   at i as the argument for 'renderedRowsToProcess' on the next iteration.
    //  
    //   If we're at the end of the list of processors, we resolve our 'finished' callback with
    //   the result.
    function startProcessor(i, renderedColumnsToProcess) {
      // Get the processor at 'i'
      var processor = self.columnsProcessors[i];

      // Call the processor, passing in the rows to process and the current columns
      //   (note: it's wrapped in $q.when() in case the processor does not return a promise)
      return $q.when( processor.call(self, renderedColumnsToProcess, self.rows) )
        .then(function handleProcessedRows(processedColumns) {
          // Check for errors
          if (!processedColumns) {
            throw "Processor at index " + i + " did not return a set of renderable rows";
          }

          if (!angular.isArray(processedColumns)) {
            throw "Processor at index " + i + " did not return an array";
          }

          // Processor is done, increment the counter
          i++;

          // If we're not done with the processors, call the next one
          if (i <= self.columnsProcessors.length - 1) {
            return startProcessor(i, myRenderableColumns);
          }
          // We're done! Resolve the 'finished' promise
          else {
            finished.resolve(myRenderableColumns);
          }
        });
    }

    // Start on the first processor
    startProcessor(0, myRenderableColumns);
    
    return finished.promise;
  };

  Grid.prototype.setVisibleColumns = function setVisibleColumns(columns) {
    // $log.debug('setVisibleColumns');

    var self = this;

    // Reset all the render container row caches
    for (var i in self.renderContainers) {
      var container = self.renderContainers[i];

      container.visibleColumnCache.length = 0;
    }

    for (var ci = 0; ci < columns.length; ci++) {
      var column = columns[ci];

      // If the column is visible
      if (column.visible) {
        // If the column has a container specified
        if (typeof(column.renderContainer) !== 'undefined' && column.renderContainer) {
          self.renderContainers[column.renderContainer].visibleColumnCache.push(column);
        }
        // If not, put it into the body container
        else {
          self.renderContainers.body.visibleColumnCache.push(column);
        }
      }
    }
  };

  /**
   * @ngdoc function
   * @name handleWindowResize
   * @methodOf ui.grid.class:Grid
   * @description Triggered when the browser window resizes; automatically resizes the grid
   */
  Grid.prototype.handleWindowResize = function handleWindowResize($event) {
    var self = this;

    self.gridWidth = gridUtil.elementWidth(self.element);
    self.gridHeight = gridUtil.elementHeight(self.element);

    self.queueRefresh();
  };

  /**
   * @ngdoc function
   * @name queueRefresh
   * @methodOf ui.grid.class:Grid
   * @description todo: @c0bra can you document this method?
   */
  Grid.prototype.queueRefresh = function queueRefresh() {
    var self = this;
    if (self.refreshCanceller) {
      $timeout.cancel(self.refreshCanceller);
    }

    self.refreshCanceller = $timeout(function () {
      self.refreshCanvas(true);
    });

    self.refreshCanceller.then(function () {
      self.refreshCanceller = null;
    });

    return self.refreshCanceller;
  };

  /**
   * @ngdoc function
   * @name buildStyles
   * @methodOf ui.grid.class:Grid
   * @description calls each styleComputation function
   */
  // TODO: this used to take $scope, but couldn't see that it was used
  Grid.prototype.buildStyles = function buildStyles() {
    // $log.debug('buildStyles');

    var self = this;
    
    self.customStyles = '';

    self.styleComputations
      .sort(function(a, b) {
        if (a.priority === null) { return 1; }
        if (b.priority === null) { return -1; }
        if (a.priority === null && b.priority === null) { return 0; }
        return a.priority - b.priority;
      })
      .forEach(function (compInfo) {
        // this used to provide $scope as a second parameter, but I couldn't find any 
        // style builders that used it, so removed it as part of moving to grid from controller
        var ret = compInfo.func.call(self);

        if (angular.isString(ret)) {
          self.customStyles += '\n' + ret;
        }
      });
  };


  Grid.prototype.minColumnsToRender = function minColumnsToRender() {
    var self = this;
    var viewport = this.getViewportWidth();

    var min = 0;
    var totalWidth = 0;
    self.columns.forEach(function(col, i) {
      if (totalWidth < viewport) {
        totalWidth += col.drawnWidth;
        min++;
      }
      else {
        var currWidth = 0;
        for (var j = i; j >= i - min; j--) {
          currWidth += self.columns[j].drawnWidth;
        }
        if (currWidth < viewport) {
          min++;
        }
      }
    });

    return min;
  };

  Grid.prototype.getBodyHeight = function getBodyHeight() {
    // Start with the viewportHeight
    var bodyHeight = this.getViewportHeight();

    // Add the horizontal scrollbar height if there is one
    if (typeof(this.horizontalScrollbarHeight) !== 'undefined' && this.horizontalScrollbarHeight !== undefined && this.horizontalScrollbarHeight > 0) {
      bodyHeight = bodyHeight + this.horizontalScrollbarHeight;
    }

    return bodyHeight;
  };

  // NOTE: viewport drawable height is the height of the grid minus the header row height (including any border)
  // TODO(c0bra): account for footer height
  Grid.prototype.getViewportHeight = function getViewportHeight() {
    var self = this;

    var viewPortHeight = this.gridHeight - this.headerHeight - this.footerHeight;

    // Account for native horizontal scrollbar, if present
    if (typeof(this.horizontalScrollbarHeight) !== 'undefined' && this.horizontalScrollbarHeight !== undefined && this.horizontalScrollbarHeight > 0) {
      viewPortHeight = viewPortHeight - this.horizontalScrollbarHeight;
    }

    var adjustment = self.getViewportAdjustment();
    
    viewPortHeight = viewPortHeight + adjustment.height;

    // $log.debug('viewPortHeight', viewPortHeight);

    return viewPortHeight;
  };

  Grid.prototype.getViewportWidth = function getViewportWidth() {
    var self = this;

    var viewPortWidth = this.gridWidth;

    if (typeof(this.verticalScrollbarWidth) !== 'undefined' && this.verticalScrollbarWidth !== undefined && this.verticalScrollbarWidth > 0) {
      viewPortWidth = viewPortWidth - this.verticalScrollbarWidth;
    }

    var adjustment = self.getViewportAdjustment();
    
    viewPortWidth = viewPortWidth + adjustment.width;

    // $log.debug('getviewPortWidth', viewPortWidth);

    return viewPortWidth;
  };

  Grid.prototype.getHeaderViewportWidth = function getHeaderViewportWidth() {
    var viewPortWidth = this.getViewportWidth();

    if (typeof(this.verticalScrollbarWidth) !== 'undefined' && this.verticalScrollbarWidth !== undefined && this.verticalScrollbarWidth > 0) {
      viewPortWidth = viewPortWidth + this.verticalScrollbarWidth;
    }

    return viewPortWidth;
  };

  Grid.prototype.registerViewportAdjuster = function registerViewportAdjuster(func) {
    this.viewportAdjusters.push(func);
  };

  Grid.prototype.removeViewportAdjuster = function registerViewportAdjuster(func) {
    var idx = this.viewportAdjusters.indexOf(func);

    if (typeof(idx) !== 'undefined' && idx !== undefined) {
      this.viewportAdjusters.splice(idx, 1);
    }
  };

  Grid.prototype.getViewportAdjustment = function getViewportAdjustment() {
    var self = this;

    var adjustment = { height: 0, width: 0 };

    self.viewportAdjusters.forEach(function (func) {
      adjustment = func.call(this, adjustment);
    });

    return adjustment;
  };

  Grid.prototype.getVisibleRowCount = function getVisibleRowCount() {
    // var count = 0;

    // this.rows.forEach(function (row) {
    //   if (row.visible) {
    //     count++;
    //   }
    // });

    // return this.visibleRowCache.length;
    return this.renderContainers.body.visibleRowCache.length;
  };

   Grid.prototype.getVisibleRows = function getVisibleRows() {
    return this.renderContainers.body.visibleRowCache;
   };

  Grid.prototype.getVisibleColumnCount = function getVisibleColumnCount() {
    // var count = 0;

    // this.rows.forEach(function (row) {
    //   if (row.visible) {
    //     count++;
    //   }
    // });

    // return this.visibleRowCache.length;
    return this.renderContainers.body.visibleColumnCache.length;
  };


  Grid.prototype.searchRows = function searchRows(renderableRows) {
    return rowSearcher.search(this, renderableRows, this.columns);
  };

  Grid.prototype.sortByColumn = function sortByColumn(renderableRows) {
    return rowSorter.sort(this, renderableRows, this.columns);
  };

  Grid.prototype.getCellValue = function getCellValue(row, col){
    var self = this;

    if (!self.cellValueGetterCache[col.colDef.name]) {
      self.cellValueGetterCache[col.colDef.name] = $parse(row.getEntityQualifiedColField(col));
    }

    return self.cellValueGetterCache[col.colDef.name](row);
  };

  
  Grid.prototype.getNextColumnSortPriority = function getNextColumnSortPriority() {
    var self = this,
        p = 0;

    self.columns.forEach(function (col) {
      if (col.sort && col.sort.priority && col.sort.priority > p) {
        p = col.sort.priority;
      }
    });

    return p + 1;
  };

  /**
   * @ngdoc function
   * @name resetColumnSorting
   * @methodOf ui.grid.class:Grid
   * @description Return the columns that the grid is currently being sorted by
   * @param {GridColumn} [excludedColumn] Optional GridColumn to exclude from having its sorting reset
   */
  Grid.prototype.resetColumnSorting = function resetColumnSorting(excludeCol) {
    var self = this;

    self.columns.forEach(function (col) {
      if (col !== excludeCol) {
        col.sort = {};
      }
    });
  };

  /**
   * @ngdoc function
   * @name getColumnSorting
   * @methodOf ui.grid.class:Grid
   * @description Return the columns that the grid is currently being sorted by
   * @returns {Array[GridColumn]} An array of GridColumn objects
   */
  Grid.prototype.getColumnSorting = function getColumnSorting() {
    var self = this;

    var sortedCols = [], myCols;

    // Iterate through all the columns, sorted by priority
    // Make local copy of column list, because sorting is in-place and we do not want to
    // change the original sequence of columns
    myCols = self.columns.slice(0);
    myCols.sort(rowSorter.prioritySort).forEach(function (col) {
      if (col.sort && typeof(col.sort.direction) !== 'undefined' && col.sort.direction && (col.sort.direction === uiGridConstants.ASC || col.sort.direction === uiGridConstants.DESC)) {
        sortedCols.push(col);
      }
    });

    return sortedCols;
  };

  /**
   * @ngdoc function
   * @name sortColumn
   * @methodOf ui.grid.class:Grid
   * @description Set the sorting on a given column, optionally resetting any existing sorting on the Grid.
   * Emits the sortChanged event whenever the sort criteria are changed.
   * @param {GridColumn} column Column to set the sorting on
   * @param {uiGridConstants.ASC|uiGridConstants.DESC} [direction] Direction to sort by, either descending or ascending.
   *   If not provided, the column will iterate through the sort directions: ascending, descending, unsorted.
   * @param {boolean} [add] Add this column to the sorting. If not provided or set to `false`, the Grid will reset any existing sorting and sort
   *   by this column only
   * @returns {Promise} A resolved promise that supplies the column.
   */
  
  Grid.prototype.sortColumn = function sortColumn(column, directionOrAdd, add) {
    var self = this,
        direction = null;

    if (typeof(column) === 'undefined' || !column) {
      throw new Error('No column parameter provided');
    }

    // Second argument can either be a direction or whether to add this column to the existing sort.
    //   If it's a boolean, it's an add, otherwise, it's a direction
    if (typeof(directionOrAdd) === 'boolean') {
      add = directionOrAdd;
    }
    else {
      direction = directionOrAdd;
    }
    
    if (!add) {
      self.resetColumnSorting(column);
      column.sort.priority = 0;
    }
    else {
      column.sort.priority = self.getNextColumnSortPriority();
    }

    if (!direction) {
      // Figure out the sort direction
      if (column.sort.direction && column.sort.direction === uiGridConstants.ASC) {
        column.sort.direction = uiGridConstants.DESC;
      }
      else if (column.sort.direction && column.sort.direction === uiGridConstants.DESC) {
        column.sort.direction = null;
      }
      else {
        column.sort.direction = uiGridConstants.ASC;
      }
    }
    else {
      column.sort.direction = direction;
    }
    
    self.api.core.raise.sortChanged( self, self.getColumnSorting() );

    return $q.when(column);
  };
  
  /**
   * communicate to outside world that we are done with initial rendering
   */
  Grid.prototype.renderingComplete = function(){
    if (angular.isFunction(this.options.onRegisterApi)) {
      this.options.onRegisterApi(this.api);
    }
    this.api.core.raise.renderingComplete( this.api );
  };

  Grid.prototype.createRowHashMap = function createRowHashMap() {
    var self = this;

    var hashMap = new RowHashMap();
    hashMap.grid = self;

    self.rowHashMap = hashMap;
  };
  
  
  /**
   * @ngdoc function
   * @name refresh
   * @methodOf ui.grid.class:Grid
   * @description Refresh the rendered grid on screen.
   * 
   */
  Grid.prototype.refresh = function refresh() {
    $log.debug('grid refresh');
    
    var self = this;
    
    var p1 = self.processRowsProcessors(self.rows).then(function (renderableRows) {
      self.setVisibleRows(renderableRows);
    });

    var p2 = self.processColumnsProcessors(self.columns).then(function (renderableColumns) {
      self.setVisibleColumns(renderableColumns);
    });

    return $q.all([p1, p2]).then(function () {
      self.redrawInPlace();

      self.refreshCanvas(true);
    });
  };  
  
  /**
   * @ngdoc function
   * @name refreshRows
   * @methodOf ui.grid.class:Grid
   * @description Refresh the rendered rows on screen?  Note: not functional at present 
   * @returns {promise} promise that is resolved when render completes?
   * 
   */
  Grid.prototype.refreshRows = function refreshRows() {
    var self = this;
    
    return self.processRowsProcessors(self.rows)
      .then(function (renderableRows) {
        self.setVisibleRows(renderableRows);

        // TODO: this method doesn't exist, so clearly refreshRows doesn't work.
        self.redrawRows();

        self.refreshCanvas();
      });
  };

  /**
   * @ngdoc function
   * @name redrawCanvas
   * @methodOf ui.grid.class:Grid
   * @description TBD
   * @params {object} buildStyles optional parameter.  Use TBD
   * @returns {promise} promise that is resolved when the canvas
   * has been refreshed
   * 
   */
  Grid.prototype.refreshCanvas = function(buildStyles) {
    var self = this;
    
    if (buildStyles) {
      self.buildStyles();
    }

    var p = $q.defer();

    // Get all the header heights
    var containerHeadersToRecalc = [];
    for (var containerId in self.renderContainers) {
      if (self.renderContainers.hasOwnProperty(containerId)) {
        var container = self.renderContainers[containerId];

        if (container.header) {
          containerHeadersToRecalc.push(container);
        }
      }
    }

    if (containerHeadersToRecalc.length > 0) {
      // Putting in a timeout as it's not calculating after the grid element is rendered and filled out
      $timeout(function() {
        // var oldHeaderHeight = self.grid.headerHeight;
        // self.grid.headerHeight = gridUtil.outerElementHeight(self.header);

        var rebuildStyles = false;

        // Get all the header heights
        for (var i = 0; i < containerHeadersToRecalc.length; i++) {
          var container = containerHeadersToRecalc[i];

          if (container.header) {
            var oldHeaderHeight = container.headerHeight;
            var headerHeight = gridUtil.outerElementHeight(container.header);
            container.headerHeight = headerHeight;

            if (oldHeaderHeight !== headerHeight) {
              rebuildStyles = true;
            }
          }
        }

        // Rebuild styles if the header height has changed
        //   The header height is used in body/viewport calculations and those are then used in other styles so we need it to be available
        if (buildStyles && rebuildStyles) {
          self.buildStyles();
        }

        p.resolve();
      });
    }
    else {
      // Timeout still needs to be here to trigger digest after styles have been rebuilt
      $timeout(function() {
        p.resolve();
      });
    }

    return p.promise;
  };


  /**
   * @ngdoc function
   * @name redrawCanvas
   * @methodOf ui.grid.class:Grid
   * @description Redraw the rows and columns based on our current scroll position
   * 
   */
  Grid.prototype.redrawInPlace = function redrawInPlace() {
    // $log.debug('redrawInPlace');
    
    var self = this;

    for (var i in self.renderContainers) {
      var container = self.renderContainers[i];

      // $log.debug('redrawing container', i);

      container.adjustRows(container.prevScrollTop, null);
      container.adjustColumns(container.prevScrollLeft, null);
    }
  };


  // Blatantly stolen from Angular as it isn't exposed (yet? 2.0?)
  function RowHashMap() {}

  RowHashMap.prototype = {
    /**
     * Store key value pair
     * @param key key to store can be any type
     * @param value value to store can be any type
     */
    put: function(key, value) {
      this[this.grid.options.rowIdentity(key)] = value;
    },

    /**
     * @param key
     * @returns {Object} the value for the key
     */
    get: function(key) {
      return this[this.grid.options.rowIdentity(key)];
    },

    /**
     * Remove the key/value pair
     * @param key
     */
    remove: function(key) {
      var value = this[key = this.grid.options.rowIdentity(key)];
      delete this[key];
      return value;
    }
  };



  return Grid;

}]);

})();

(function () {

  angular.module('ui.grid')
    .factory('GridApi', ['$log', '$q', '$rootScope', 'gridUtil', 'uiGridConstants',
      function ($log, $q, $rootScope, gridUtil, uiGridConstants) {
        /**
         * @ngdoc function
         * @name ui.grid.class:GridApi
         * @description GridApi provides the ability to register public methods events inside the grid and allow
         * for other components to use the api via featureName.methodName and featureName.on.eventName(function(args){}
         * @param {object} grid grid that owns api
         */
        var GridApi = function GridApi(grid) {
          this.grid = grid;
          this.listeners = [];
          
          /**
           * @ngdoc function
           * @name renderingComplete
           * @methodOf  ui.grid.core.api:PublicApi
           * @description Rendering is complete, called at the same
           * time as `onRegisterApi`, but provides a way to obtain
           * that same event within features without stopping end
           * users from getting at the onRegisterApi method.
           * 
           * Included in gridApi so that it's always there - otherwise
           * there is still a timing problem with when a feature can
           * call this. 
           * 
           * @param {GridApi} gridApi the grid api, as normally 
           * returned in the onRegisterApi method
           * 
           * @example
           * <pre>
           *      gridApi.core.on.renderingComplete( grid );
           * </pre>
           */
          this.registerEvent( 'core', 'renderingComplete' );
        };

        /**
         * @ngdoc function
         * @name ui.grid.class:suppressEvents
         * @methodOf ui.grid.class:GridApi
         * @description Used to execute a function while disabling the specified event listeners.
         * Disables the listenerFunctions, executes the callbackFn, and then enables
         * the listenerFunctions again
         * @param {object} listenerFuncs listenerFunc or array of listenerFuncs to suppress. These must be the same
         * functions that were used in the .on.eventName method
         * @param {object} callBackFn function to execute
         * @example
         * <pre>
         *    var navigate = function (newRowCol, oldRowCol){
         *       //do something on navigate
         *    }
         *
         *    gridApi.cellNav.on.navigate(scope,navigate);
         *
         *
         *    //call the scrollTo event and suppress our navigate listener
         *    //scrollTo will still raise the event for other listeners
         *    gridApi.suppressEvents(navigate, function(){
         *       gridApi.cellNav.scrollTo(aRow, aCol);
         *    });
         *
         * </pre>
         */
        GridApi.prototype.suppressEvents = function (listenerFuncs, callBackFn) {
          var self = this;
          var listeners = angular.isArray(listenerFuncs) ? listenerFuncs : [listenerFuncs];

          //find all registered listeners
          var foundListeners = [];
          listeners.forEach(function (l) {
            foundListeners = self.listeners.filter(function (lstnr) {
              return l === lstnr.handler;
            });
          });

          //deregister all the listeners
          foundListeners.forEach(function(l){
            l.dereg();
          });

          callBackFn();

          //reregister all the listeners
          foundListeners.forEach(function(l){
              l.dereg = registerEventWithAngular(l.scope, l.eventId, l.handler, self.grid);
          });

        };

        /**
         * @ngdoc function
         * @name registerEvent
         * @methodOf ui.grid.class:GridApi
         * @description Registers a new event for the given feature
         * @param {string} featureName name of the feature that raises the event
         * @param {string} eventName  name of the event
         */
        GridApi.prototype.registerEvent = function (featureName, eventName) {
          var self = this;
          if (!self[featureName]) {
            self[featureName] = {};
          }

          var feature = self[featureName];
          if (!feature.on) {
            feature.on = {};
            feature.raise = {};
          }

          var eventId = self.grid.id + featureName + eventName;

          $log.log('Creating raise event method ' + featureName + '.raise.' + eventName);
          feature.raise[eventName] = function () {
            $rootScope.$broadcast.apply($rootScope, [eventId].concat(Array.prototype.slice.call(arguments)));
          };

          $log.log('Creating on event method ' + featureName + '.on.' + eventName);
          feature.on[eventName] = function (scope, handler) {
            var dereg = registerEventWithAngular(scope, eventId, handler, self.grid);

            //track our listener so we can turn off and on
            var listener = {handler: handler, dereg: dereg, eventId: eventId, scope: scope};
            self.listeners.push(listener);

            //destroy tracking when scope is destroyed
            //wanted to remove the listener from the array but angular does
            //strange things in scope.$destroy so I could not access the listener array
            scope.$on('$destroy', function() {
              listener.dereg = null;
              listener.handler = null;
              listener.eventId = null;
              listener.scope = null;
            });
          };
        };

        function registerEventWithAngular(scope, eventId, handler, grid) {
          return scope.$on(eventId, function (event) {
            var args = Array.prototype.slice.call(arguments);
            args.splice(0, 1); //remove evt argument
            handler.apply(grid.api, args);
          });
        }

        /**
         * @ngdoc function
         * @name registerEventsFromObject
         * @methodOf ui.grid.class:GridApi
         * @description Registers features and events from a simple objectMap.
         * eventObjectMap must be in this format (multiple features allowed)
         * <pre>
         * {featureName:
         *        {
         *          eventNameOne:function(args){},
         *          eventNameTwo:function(args){}
         *        }
         *  }
         * </pre>
         * @param {object} eventObjectMap map of feature/event names
         */
        GridApi.prototype.registerEventsFromObject = function (eventObjectMap) {
          var self = this;
          var features = [];
          angular.forEach(eventObjectMap, function (featProp, featPropName) {
            var feature = {name: featPropName, events: []};
            angular.forEach(featProp, function (prop, propName) {
              feature.events.push(propName);
            });
            features.push(feature);
          });

          features.forEach(function (feature) {
            feature.events.forEach(function (event) {
              self.registerEvent(feature.name, event);
            });
          });

        };

        /**
         * @ngdoc function
         * @name registerMethod
         * @methodOf ui.grid.class:GridApi
         * @description Registers a new event for the given feature
         * @param {string} featureName name of the feature
         * @param {string} methodName  name of the method
         * @param {object} callBackFn function to execute
         * @param {object} thisArg binds callBackFn 'this' to thisArg.  Defaults to gridApi.grid
         */
        GridApi.prototype.registerMethod = function (featureName, methodName, callBackFn, thisArg) {
          if (!this[featureName]) {
            this[featureName] = {};
          }

          var feature = this[featureName];

          feature[methodName] = gridUtil.createBoundedWrapper(thisArg || this.grid, callBackFn);
        };

        /**
         * @ngdoc function
         * @name registerMethodsFromObject
         * @methodOf ui.grid.class:GridApi
         * @description Registers features and methods from a simple objectMap.
         * eventObjectMap must be in this format (multiple features allowed)
         * <br>
         * {featureName:
         *        {
         *          methodNameOne:function(args){},
         *          methodNameTwo:function(args){}
         *        }
         * @param {object} eventObjectMap map of feature/event names
         * @param {object} thisArg binds this to thisArg for all functions.  Defaults to gridApi.grid
         */
        GridApi.prototype.registerMethodsFromObject = function (methodMap, thisArg) {
          var self = this;
          var features = [];
          angular.forEach(methodMap, function (featProp, featPropName) {
            var feature = {name: featPropName, methods: []};
            angular.forEach(featProp, function (prop, propName) {
              feature.methods.push({name: propName, fn: prop});
            });
            features.push(feature);
          });

          features.forEach(function (feature) {
            feature.methods.forEach(function (method) {
              self.registerMethod(feature.name, method.name, method.fn, thisArg);
            });
          });

        };
        
        return GridApi;

      }]);

})();

(function(){

angular.module('ui.grid')
.factory('GridColumn', ['gridUtil', 'uiGridConstants', function(gridUtil, uiGridConstants) {

  /**
   * @ngdoc function
   * @name ui.grid.class:GridColumn
   * @description Represents the viewModel for each column.  Any state or methods needed for a Grid Column
   * are defined on this prototype
   * @param {ColDef} colDef Column definition.
   * @param {number} index the current position of the column in the array
   * @param {Grid} grid reference to the grid
   */
   
   /**
    * ******************************************************************************************
    * PaulL1: Ugly hack here in documentation.  These properties are clearly properties of GridColumn, 
    * and need to be noted as such for those extending and building ui-grid itself.
    * However, from an end-developer perspective, they interact with all these through columnDefs,
    * and they really need to be documented there.  I feel like they're relatively static, and
    * I can't find an elegant way for ngDoc to reference to both....so I've duplicated each
    * comment block.  Ugh.
    * 
    */

   /** 
    * @ngdoc property
    * @name name
    * @propertyOf ui.grid.class:GridColumn
    * @description (mandatory) each column should have a name, although for backward
    * compatibility with 2.x name can be omitted if field is present
    *
    */

   /** 
    * @ngdoc property
    * @name name
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description (mandatory) each column should have a name, although for backward
    * compatibility with 2.x name can be omitted if field is present
    *
    */
    
    /** 
    * @ngdoc property
    * @name displayName
    * @propertyOf ui.grid.class:GridColumn
    * @description Column name that will be shown in the header.  If displayName is not
    * provided then one is generated using the name.
    *
    */

    /** 
    * @ngdoc property
    * @name displayName
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description Column name that will be shown in the header.  If displayName is not
    * provided then one is generated using the name.
    *
    */
       
    /** 
    * @ngdoc property
    * @name field
    * @propertyOf ui.grid.class:GridColumn
    * @description field must be provided if you wish to bind to a 
    * property in the data source.  Should be an angular expression that evaluates against grid.options.data 
    * array element.  Can be a complex expression: <code>employee.address.city</code>, or can be a function: <code>employee.getFullAddress()</code>.
    * See the angular docs on binding expressions.
    *
    */
    
    /** 
    * @ngdoc property
    * @name field
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description field must be provided if you wish to bind to a 
    * property in the data source.  Should be an angular expression that evaluates against grid.options.data 
    * array element.  Can be a complex expression: <code>employee.address.city</code>, or can be a function: <code>employee.getFullAddress()</code>.
    * See the angular docs on binding expressions.
    *
    */
    
    /** 
    * @ngdoc property
    * @name filter
    * @propertyOf ui.grid.class:GridColumn
    * @description Filter on this column.  
    * @example
    * <pre>{ term: 'text', condition: uiGridConstants.filter.STARTS_WITH, placeholder: 'type to filter...' }</pre>
    *
    */

    /** 
    * @ngdoc property
    * @name filter
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description Specify a single filter field on this column.
    * @example
    * <pre>$scope.gridOptions.columnDefs = [ 
    *   {
    *     field: 'field1',
    *     filter: {
    *       condition: uiGridConstants.filter.STARTS_WITH,
    *       placeholder: 'starts with...'
    *     }
    *   }
    * ]; </pre>
    *
    */
    
   
  function GridColumn(colDef, index, grid) {
    var self = this;

    self.grid = grid;
    colDef.index = index;

    self.updateColumnDef(colDef);
  }

  GridColumn.prototype.setPropertyOrDefault = function (colDef, propName, defaultValue) {
    var self = this;

    // Use the column definition filter if we were passed it
    if (typeof(colDef[propName]) !== 'undefined' && colDef[propName]) {
      self[propName] = colDef[propName];
    }
    // Otherwise use our own if it's set
    else if (typeof(self[propName]) !== 'undefined') {
      self[propName] = self[propName];
    }
    // Default to empty object for the filter
    else {
      self[propName] = defaultValue ? defaultValue : {};
    }
  };

  
  
   /** 
    * @ngdoc property
    * @name width
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description sets the column width.  Can be either 
    * a number or a percentage, or an * for auto.
    * @example
    * <pre>  $scope.gridOptions.columnDefs = [ { field: 'field1', width: 100},
    *                                          { field: 'field2', width: '20%'},
    *                                          { field: 'field3', width: '*' }]; </pre>
    *
    */

   /** 
    * @ngdoc property
    * @name minWidth
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description sets the minimum column width.  Should be a number.
    * @example
    * <pre>  $scope.gridOptions.columnDefs = [ { field: 'field1', minWidth: 100}]; </pre>
    *
    */

   /** 
    * @ngdoc property
    * @name maxWidth
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description sets the maximum column width.  Should be a number.
    * @example
    * <pre>  $scope.gridOptions.columnDefs = [ { field: 'field1', maxWidth: 100}]; </pre>
    *
    */

   /** 
    * @ngdoc property
    * @name visible
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description sets whether or not the column is visible
    * </br>Default is true
    * @example
    * <pre>  $scope.gridOptions.columnDefs = [ 
    *     { field: 'field1', visible: true},
    *     { field: 'field2', visible: false }
    *   ]; </pre>
    *
    */
   
  /**
   * @ngdoc property
   * @name sort
   * @propertyOf ui.grid.class:GridOptions.columnDef
   * @description Can be used to set the sort direction for the column, values are
   * uiGridConstants.ASC or uiGridConstants.DESC
   * @example
   * <pre>  $scope.gridOptions.columnDefs = [ { field: 'field1', sort: { direction: uiGridConstants.ASC }}] </pre>
   */
  

    /** 
    * @ngdoc property
    * @name sortingAlgorithm
    * @propertyOf ui.grid.class:GridColumn
    * @description Algorithm to use for sorting this column. Takes 'a' and 'b' parameters 
    * like any normal sorting function.
    *
    */

    /** 
    * @ngdoc property
    * @name sortingAlgorithm
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description Algorithm to use for sorting this column. Takes 'a' and 'b' parameters 
    * like any normal sorting function.
    *
    */
      
   /** 
    * @ngdoc array
    * @name filters
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description Specify multiple filter fields.
    * @example
    * <pre>$scope.gridOptions.columnDefs = [ 
    *   {
    *     field: 'field1', filters: [
    *       {
    *         condition: uiGridConstants.filter.STARTS_WITH,
    *         placeholder: 'starts with...'
    *       },
    *       {
    *         condition: uiGridConstants.filter.ENDS_WITH,
    *         placeholder: 'ends with...'
    *       }
    *     ]
    *   }
    * ]; </pre>
    *
    * 
    */ 
   
   /** 
    * @ngdoc array
    * @name filters
    * @propertyOf ui.grid.class:GridColumn
    * @description Filters for this column. Includes 'term' property bound to filter input elements.
    * @example
    * <pre>[
    *   {
    *     term: 'foo', // ngModel for <input>
    *     condition: uiGridConstants.filter.STARTS_WITH,
    *     placeholder: 'starts with...'
    *   },
    *   {
    *     term: 'baz',
    *     condition: uiGridConstants.filter.ENDS_WITH,
    *     placeholder: 'ends with...'
    *   }
    * ] </pre>
    *
    * 
    */   

   /** 
    * @ngdoc array
    * @name menuItems
    * @propertyOf ui.grid.class:GridOptions.columnDef
    * @description used to add menu items to a column.  Refer to the tutorial on this 
    * functionality.
    * @example
    * <pre>  $scope.gridOptions.columnDefs = [ 
    *   { field: 'field1', menuItems: [
    *     {
    *       title: 'Outer Scope Alert',
    *       icon: 'ui-grid-icon-info-circled',
    *       action: function($event) {
    *         this.context.blargh(); // $scope.blargh() would work too, this is just an example
    *       },
    *       context: $scope
    *     },
    *     {
    *       title: 'Grid ID',
    *       action: function() {
    *         alert('Grid ID: ' + this.grid.id);
    *       }
    *     }
    *   ] }]; </pre>
    *
    */   
  GridColumn.prototype.updateColumnDef = function(colDef, index) {
    var self = this;

    self.colDef = colDef;

    //position of column
    self.index = (typeof(index) === 'undefined') ? colDef.index : index;

    if (colDef.name === undefined) {
      throw new Error('colDef.name is required for column at index ' + self.index);
    }

    var parseErrorMsg = "Cannot parse column width '" + colDef.width + "' for column named '" + colDef.name + "'";

    // If width is not defined, set it to a single star
    if (gridUtil.isNullOrUndefined(colDef.width)) {
      self.width = '*';
    }
    else {
      // If the width is not a number
      if (!angular.isNumber(colDef.width)) {
        // See if it ends with a percent
        if (gridUtil.endsWith(colDef.width, '%')) {
          // If so we should be able to parse the non-percent-sign part to a number
          var percentStr = colDef.width.replace(/%/g, '');
          var percent = parseInt(percentStr, 10);
          if (isNaN(percent)) {
            throw new Error(parseErrorMsg);
          }
          self.width = colDef.width;
        }
        // And see if it's a number string
        else if (colDef.width.match(/^(\d+)$/)) {
          self.width = parseInt(colDef.width.match(/^(\d+)$/)[1], 10);
        }
        // Otherwise it should be a string of asterisks
        else if (!colDef.width.match(/^\*+$/)) {
          throw new Error(parseErrorMsg);
        }
      }
      // Is a number, use it as the width
      else {
        self.width = colDef.width;
      }
    }

    // Remove this column from the grid sorting
    GridColumn.prototype.unsort = function () {
      this.sort = {};
    };

    self.minWidth = !colDef.minWidth ? 50 : colDef.minWidth;
    self.maxWidth = !colDef.maxWidth ? 9000 : colDef.maxWidth;

    //use field if it is defined; name if it is not
    self.field = (colDef.field === undefined) ? colDef.name : colDef.field;

    // Use colDef.displayName as long as it's not undefined, otherwise default to the field name
    self.displayName = (colDef.displayName === undefined) ? gridUtil.readableColumnName(colDef.name) : colDef.displayName;

    //self.originalIndex = index;

    self.aggregationType = angular.isDefined(colDef.aggregationType) ? colDef.aggregationType : null;
    self.footerCellTemplate = angular.isDefined(colDef.footerCellTemplate) ? colDef.footerCellTemplate : null;

    /**
     * @ngdoc property
     * @name cellClass
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description cellClass can be a string specifying the class to append to a cell
     * or it can be a function(row,rowRenderIndex, col, colRenderIndex) that returns a class name
     *
     */
    self.cellClass = colDef.cellClass;


    /**
     * @ngdoc property
     * @name cellFilter
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description cellFilter is a filter to apply to the content of each cell
     * @example
     * <pre>
     *   gridOptions.columnDefs[0].cellFilter = 'date'
     *
     */
    self.cellFilter = colDef.cellFilter ? colDef.cellFilter : "";

    /**
     * @ngdoc property
     * @name headerCellFilter
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description headerCellFilter is a filter to apply to the content of the column header
     * @example
     * <pre>
     *   gridOptions.columnDefs[0].headerCellFilter = 'translate'
     *
     */
    self.headerCellFilter = colDef.headerCellFilter ? colDef.headerCellFilter : "";

    self.visible = gridUtil.isNullOrUndefined(colDef.visible) || colDef.visible;

    self.headerClass = colDef.headerClass;
    //self.cursor = self.sortable ? 'pointer' : 'default';

    self.visible = true;

    // Turn on sorting by default
    self.enableSorting = typeof(colDef.enableSorting) !== 'undefined' ? colDef.enableSorting : true;
    self.sortingAlgorithm = colDef.sortingAlgorithm;

    // Turn on filtering by default (it's disabled by default at the Grid level)
    self.enableFiltering = typeof(colDef.enableFiltering) !== 'undefined' ? colDef.enableFiltering : true;

    // self.menuItems = colDef.menuItems;
    self.setPropertyOrDefault(colDef, 'menuItems', []);

    // Use the column definition sort if we were passed it
    self.setPropertyOrDefault(colDef, 'sort');

    // Set up default filters array for when one is not provided.
    //   In other words, this (in column def):
    //   
    //       filter: { term: 'something', flags: {}, condition: [CONDITION] }
    //       
    //   is just shorthand for this:
    //   
    //       filters: [{ term: 'something', flags: {}, condition: [CONDITION] }]
    //       
    var defaultFilters = [];
    if (colDef.filter) {
      defaultFilters.push(colDef.filter);
    }
    else if (self.enableFiltering && self.grid.options.enableFiltering) {
      // Add an empty filter definition object, which will
      // translate to a guessed condition and no pre-populated
      // value for the filter <input>.
      defaultFilters.push({});
    }

    /**
     * @ngdoc object
     * @name ui.grid.class:GridOptions.columnDef.filter
     * @propertyOf ui.grid.class:GridOptions.columnDef
     * @description An object defining filtering for a column.
     */    

    /**
     * @ngdoc property
     * @name condition
     * @propertyOf ui.grid.class:GridOptions.columnDef.filter
     * @description Defines how rows are chosen as matching the filter term. This can be set to
     * one of the constants in uiGridConstants.filter, or you can supply a custom filter function
     * that gets passed the following arguments: [searchTerm, cellValue, row, column].
     */
    
    /**
     * @ngdoc property
     * @name term
     * @propertyOf ui.grid.class:GridOptions.columnDef.filter
     * @description If set, the filter field will be pre-populated
     * with this value.
     */

    /**
     * @ngdoc property
     * @name placeholder
     * @propertyOf ui.grid.class:GridOptions.columnDef.filter
     * @description String that will be set to the <input>.placeholder attribute.
     */

    /*

      self.filters = [
        {
          term: 'search term'
          condition: uiGridConstants.filter.CONTAINS,
          placeholder: 'my placeholder',
          flags: {
            caseSensitive: true
          }
        }
      ]

    */

    self.setPropertyOrDefault(colDef, 'filter');
    self.setPropertyOrDefault(colDef, 'filters', defaultFilters);
  };




    /**
     * @ngdoc function
     * @name getColClass
     * @methodOf ui.grid.class:GridColumn
     * @description Returns the class name for the column
     * @param {bool} prefixDot  if true, will return .className instead of className
     */
    GridColumn.prototype.getColClass = function (prefixDot) {
      var cls = uiGridConstants.COL_CLASS_PREFIX + this.index;

      return prefixDot ? '.' + cls : cls;
    };

    /**
     * @ngdoc function
     * @name getColClassDefinition
     * @methodOf ui.grid.class:GridColumn
     * @description Returns the class definition for th column
     */
    GridColumn.prototype.getColClassDefinition = function () {
      return ' .grid' + this.grid.id + ' ' + this.getColClass(true) + ' { width: ' + this.drawnWidth + 'px; }';
    };

    /**
     * @ngdoc function
     * @name getRenderContainer
     * @methodOf ui.grid.class:GridColumn
     * @description Returns the render container object that this column belongs to.
     *
     * Columns will be default be in the `body` render container if they aren't allocated to one specifically.
     */
    GridColumn.prototype.getRenderContainer = function getRenderContainer() {
      var self = this;

      var containerId = self.renderContainer;

      if (containerId === null || containerId === '' || containerId === undefined) {
        containerId = 'body';
      }

      return self.grid.renderContainers[containerId];
    };

    /**
     * @ngdoc function
     * @name showColumn
     * @methodOf ui.grid.class:GridColumn
     * @description Makes the column visible by setting colDef.visible = true
     */
    GridColumn.prototype.showColumn = function() {
        this.colDef.visible = true;
    };

    /**
     * @ngdoc function
     * @name hideColumn
     * @methodOf ui.grid.class:GridColumn
     * @description Hides the column by setting colDef.visible = false
     */
    GridColumn.prototype.hideColumn = function() {
        this.colDef.visible = false;
    };

    /**
     * @ngdoc function
     * @name getAggregationValue
     * @methodOf ui.grid.class:GridColumn
     * @description gets the aggregation value based on the aggregation type for this column
     */
    GridColumn.prototype.getAggregationValue = function () {
      var self = this;
      var result = 0;
      var visibleRows = self.grid.getVisibleRows();
      var cellValues = [];
      angular.forEach(visibleRows, function (row) {
        var cellValue = self.grid.getCellValue(row, self);
        if (angular.isNumber(cellValue)) {
          cellValues.push(cellValue);
        }
      });
      if (angular.isFunction(self.aggregationType)) {
        return self.aggregationType(visibleRows, self);
      }
      else if (self.aggregationType === uiGridConstants.aggregationTypes.count) {
        //TODO: change to i18n
        return 'total rows: ' + self.grid.getVisibleRowCount();
      }
      else if (self.aggregationType === uiGridConstants.aggregationTypes.sum) {
        angular.forEach(cellValues, function (value) {
          result += value;
        });
        //TODO: change to i18n
        return 'total: ' + result;
      }
      else if (self.aggregationType === uiGridConstants.aggregationTypes.avg) {
        angular.forEach(cellValues, function (value) {
          result += value;
        });
        result = result / cellValues.length;
        //TODO: change to i18n
        return 'avg: ' + result;
      }
      else if (self.aggregationType === uiGridConstants.aggregationTypes.min) {
        return 'min: ' + Math.min.apply(null, cellValues);
      }
      else if (self.aggregationType === uiGridConstants.aggregationTypes.max) {
        return 'max: ' + Math.max.apply(null, cellValues);
      }
      else {
        return null;
      }
    };

    return GridColumn;
  }]);

})();

  (function(){

angular.module('ui.grid')
.factory('GridOptions', ['gridUtil', function(gridUtil) {

  /**
   * @ngdoc function
   * @name ui.grid.class:GridOptions
   * @description Default GridOptions class.  GridOptions are defined by the application developer and overlaid
   * over this object.  Setting gridOptions within your controller is the most common method for an application 
   * developer to configure the behaviour of their ui-grid
   * 
   * @example To define your gridOptions within your controller:
   * <pre>$scope.gridOptions = {
   *   data: $scope.myData,
   *   columnDefs: [ 
   *     { name: 'field1', displayName: 'pretty display name' },
   *     { name: 'field2', visible: false }
   *  ]
   * };</pre>
   * 
   * You can then use this within your html template, when you define your grid:
   * <pre>&lt;div ui-grid="gridOptions"&gt;&lt;/div&gt;</pre>
   *
   * To provide default options for all of the grids within your application, use an angular
   * decorator to modify the GridOptions factory.
   * <pre>app.config(function($provide){
   *    $provide.decorator('GridOptions',function($delegate){
   *      return function(){
   *        var defaultOptions = new $delegate();
   *        defaultOptions.excludeProperties = ['id' ,'$$hashKey'];
   *        return defaultOptions;
   *      };
   *    })
   *  })</pre>
   */
  function GridOptions() {

    this.onRegisterApi = angular.noop();

    /**
     * @ngdoc object
     * @name data
     * @propertyOf ui.grid.class:GridOptions
     * @description (mandatory) Array of data to be rendered into the grid, providing the data source or data binding for 
     * the grid.  The most common case is an array of objects, where each object has a number of attributes.
     * Each attribute automatically becomes a column in your grid.  This array could, for example, be sourced from
     * an angularJS $resource query request.  The array can also contain complex objects.
     * 
     */
    this.data = [];

    /**
     * @ngdoc array
     * @name columnDefs
     * @propertyOf  ui.grid.class:GridOptions
     * @description Array of columnDef objects.  Only required property is name.
     * The individual options available in columnDefs are documented in the
     * {@link ui.grid.class:GridOptions.columnDef columnDef} section
     * </br>_field property can be used in place of name for backwards compatibility with 2.x_
     *  @example
     *
     * <pre>var columnDefs = [{name:'field1'}, {name:'field2'}];</pre>
     *
     */
    this.columnDefs = [];

    /**
     * @ngdoc object
     * @name ui.grid.class:GridOptions.columnDef
     * @description Definition / configuration of an individual column, which would typically be
     * one of many column definitions within the gridOptions.columnDefs array
     * @example
     * <pre>{name:'field1', field: 'field1', filter: { term: 'xxx' }}</pre>
     *
     */

        
    /**
     * @ngdoc array
     * @name excludeProperties
     * @propertyOf  ui.grid.class:GridOptions
     * @description Array of property names in data to ignore when auto-generating column names.  Provides the
     * inverse of columnDefs - columnDefs is a list of columns to include, excludeProperties is a list of columns
     * to exclude. 
     * 
     * If columnDefs is defined, this will be ignored.
     * 
     * Defaults to ['$$hashKey']
     */
    
    this.excludeProperties = ['$$hashKey'];

    /**
     * @ngdoc boolean
     * @name enableRowHashing
     * @propertyOf ui.grid.class:GridOptions
     * @description True by default. When enabled, this setting allows uiGrid to add
     * `$$hashKey`-type properties (similar to Angular) to elements in the `data` array. This allows
     * the grid to maintain state while vastly speeding up the process of altering `data` by adding/moving/removing rows.
     * 
     * Note that this DOES add properties to your data that you may not want, but they are stripped out when using `angular.toJson()`. IF
     * you do not want this at all you can disable this setting but you will take a performance hit if you are using large numbers of rows
     * and are altering the data set often.
     */
    this.enableRowHashing = true;

    /**
     * @ngdoc function
     * @name rowIdentity
     * @methodOf ui.grid.class:GridOptions
     * @description This function is used to get and, if necessary, set the value uniquely identifying this row.
     * 
     * By default it returns the `$$hashKey` property if it exists. If it doesn't it uses gridUtil.nextUid() to generate one
     */
    this.rowIdentity = function rowIdentity(row) {
        return gridUtil.hashKey(row);
    };

    /**
     * @ngdoc function
     * @name getRowIdentity
     * @methodOf ui.grid.class:GridOptions
     * @description This function returns the identity value uniquely identifying this row.
     * 
     * By default it returns the `$$hashKey` property but can be overridden to use any property or set of properties you want.
     */
    this.getRowIdentity = function getRowIdentity(row) {
        return row.$$hashKey;
    };

    this.headerRowHeight = 30;
    this.rowHeight = 30;
    this.maxVisibleRowCount = 200;

    /**
     * @ngdoc integer
     * @name minRowsToShow
     * @propertyOf ui.grid.class:GridOptions
     * @description Minimum number of rows to show when the grid doesn't have a defined height. Defaults to "10".
     */
    this.minRowsToShow = 10;

    this.showFooter = false;
    this.footerRowHeight = 30;

    this.columnWidth = 50;
    this.maxVisibleColumnCount = 200;

    // Turn virtualization on when number of data elements goes over this number
    this.virtualizationThreshold = 20;

    this.columnVirtualizationThreshold = 10;

    // Extra rows to to render outside of the viewport
    this.excessRows = 4;
    this.scrollThreshold = 4;

    // Extra columns to to render outside of the viewport
    this.excessColumns = 4;
    this.horizontalScrollThreshold = 2;

    /**
     * @ngdoc boolean
     * @name enableSorting
     * @propertyOf ui.grid.class:GridOptions
     * @description True by default. When enabled, this setting adds sort
     * widgets to the column headers, allowing sorting of the data for the entire grid.
     * Sorting can then be disabled on individual columns using the columnDefs.
     */
    this.enableSorting = true;

    /**
     * @ngdoc boolean
     * @name enableFiltering
     * @propertyOf ui.grid.class:GridOptions
     * @description False by default. When enabled, this setting adds filter 
     * boxes to each column header, allowing filtering within the column for the entire grid.
     * Filtering can then be disabled on individual columns using the columnDefs. 
     */
    this.enableFiltering = false;

    /**
     * @ngdoc boolean
     * @name enableColumnMenu
     * @propertyOf ui.grid.class:GridOptions
     * @description True by default. When enabled, this setting displays a column
     * menu within each column.
     */
    this.enableColumnMenu = true;

    /**
     * @ngdoc boolean
     * @name enableScrollbars
     * @propertyOf ui.grid.class:GridOptions
     * @description True by default. When enabled, this settings enable vertical
     * and horizontal scrollbar for grid.
     */
    this.enableScrollbars = true;

    // Columns can't be smaller than 10 pixels
    this.minimumColumnSize = 10;

    /**
     * @ngdoc function
     * @name rowEquality
     * @methodOf ui.grid.class:GridOptions
     * @description By default, rows are compared using object equality.  This option can be overridden
     * to compare on any data item property or function
     * @param {object} entityA First Data Item to compare
     * @param {object} entityB Second Data Item to compare
     */
    this.rowEquality = function(entityA, entityB) {
      return entityA === entityB;
    };

    /**
     * @ngdoc string
     * @name headerTemplate
     * @propertyOf ui.grid.class:GridOptions
     * @description Null by default. When provided, this setting uses a custom header
     * template, rather than the default template. Can be set to either the name of a template file:
     * <pre>  $scope.gridOptions.headerTemplate = 'header_template.html';</pre>
     * inline html 
     * <pre>  $scope.gridOptions.headerTemplate = '<div class="ui-grid-top-panel" style="text-align: center">I am a Custom Grid Header</div>'</pre>
     * or the id of a precompiled template (TBD how to use this).  
     * </br>Refer to the custom header tutorial for more information.
     * If you want no header at all, you can set to an empty div:
     * <pre>  $scope.gridOptions.headerTemplate = '<div></div>';</pre>
     * 
     * If you want to only have a static header, then you can set to static content.  If
     * you want to tailor the existing column headers, then you should look at the
     * current 'ui-grid-header.html' template in github as your starting point.
     * 
     */
    this.headerTemplate = null;

    /**
     * @ngdoc string
     * @name footerTemplate
     * @propertyOf ui.grid.class:GridOptions
     * @description (optional) Null by default. When provided, this setting uses a custom footer
     * template. Can be set to either the name of a template file 'footer_template.html', inline html
     * <pre>'<div class="ui-grid-bottom-panel" style="text-align: center">I am a Custom Grid Footer</div>'</pre>, or the id
     * of a precompiled template (TBD how to use this).  Refer to the custom footer tutorial for more information.
     */
    this.footerTemplate = null;

    /**
     * @ngdoc string
     * @name rowTemplate
     * @propertyOf ui.grid.class:GridOptions
     * @description 'ui-grid/ui-grid-row' by default. When provided, this setting uses a 
     * custom row template.  Can be set to either the name of a template file:
     * <pre> $scope.gridOptions.rowTemplate = 'row_template.html';</pre>
     * inline html 
     * <pre>  $scope.gridOptions.rowTemplate = '<div style="background-color: aquamarine" ng-click="getExternalScopes().fnOne(row)" ng-repeat="col in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ui-grid-cell></div>';</pre>
     * or the id of a precompiled template (TBD how to use this) can be provided.  
     * </br>Refer to the custom row template tutorial for more information.
     */
    this.rowTemplate = 'ui-grid/ui-grid-row';
  }

  return GridOptions;

}]);

})();

(function(){

angular.module('ui.grid')
.factory('GridRenderContainer', ['$log', 'gridUtil', function($log, gridUtil) {
  function GridRenderContainer(name, grid, options) {
    var self = this;

    // if (gridUtil.type(grid) !== 'Grid') {
    //   throw new Error('Grid argument is not a Grid object');
    // }

    self.name = name;

    self.grid = grid;
    
    // self.rowCache = [];
    // self.columnCache = [];

    self.visibleRowCache = [];
    self.visibleColumnCache = [];

    self.renderedRows = [];
    self.renderedColumns = [];

    self.prevScrollTop = 0;
    self.prevScrolltopPercentage = 0;
    self.prevRowScrollIndex = 0;

    self.prevScrollLeft = 0;
    self.prevScrollleftPercentage = 0;
    self.prevColumnScrollIndex = 0;

    self.columnStyles = "";

    self.viewportAdjusters = [];

    if (options && angular.isObject(options)) {
      angular.extend(self, options);
    }

    grid.registerStyleComputation({
      priority: 5,
      func: function () {
        return self.columnStyles;
      }
    });
  }

  // GridRenderContainer.prototype.addRenderable = function addRenderable(renderable) {
  //   this.renderables.push(renderable);
  // };

  GridRenderContainer.prototype.reset = function reset() {
    // this.rowCache.length = 0;
    // this.columnCache.length = 0;

    this.visibleColumnCache.length = 0;
    this.visibleRowCache.length = 0;

    this.renderedRows.length = 0;
    this.renderedColumns.length = 0;
  };

  // TODO(c0bra): calculate size?? Should this be in a stackable directive?

  GridRenderContainer.prototype.minRowsToRender = function minRowsToRender() {
    var self = this;
    var minRows = 0;
    var rowAddedHeight = 0;
    var viewPortHeight = self.getViewportHeight();
    for (var i = self.visibleRowCache.length - 1; rowAddedHeight < viewPortHeight && i >= 0; i--) {
      rowAddedHeight += self.visibleRowCache[i].height;
      minRows++;
    }
    return minRows;
  };

  GridRenderContainer.prototype.minColumnsToRender = function minColumnsToRender() {
    var self = this;
    var viewportWidth = this.getViewportWidth();

    var min = 0;
    var totalWidth = 0;
    // self.columns.forEach(function(col, i) {
    for (var i = 0; i < self.visibleColumnCache.length; i++) {
      var col = self.visibleColumnCache[i];

      if (totalWidth < viewportWidth) {
        totalWidth += col.drawnWidth;
        min++;
      }
      else {
        var currWidth = 0;
        for (var j = i; j >= i - min; j--) {
          currWidth += self.visibleColumnCache[j].drawnWidth;
        }
        if (currWidth < viewportWidth) {
          min++;
        }
      }
    }

    return min;
  };

  GridRenderContainer.prototype.getVisibleRowCount = function getVisibleRowCount() {
    return this.visibleRowCache.length;
  };

  GridRenderContainer.prototype.registerViewportAdjuster = function registerViewportAdjuster(func) {
    this.viewportAdjusters.push(func);
  };

  GridRenderContainer.prototype.removeViewportAdjuster = function registerViewportAdjuster(func) {
    var idx = this.viewportAdjusters.indexOf(func);

    if (typeof(idx) !== 'undefined' && idx !== undefined) {
      this.viewportAdjusters.splice(idx, 1);
    }
  };

  GridRenderContainer.prototype.getViewportAdjustment = function getViewportAdjustment() {
    var self = this;

    var adjustment = { height: 0, width: 0 };

    self.viewportAdjusters.forEach(function (func) {
      adjustment = func.call(this, adjustment);
    });

    return adjustment;
  };

  GridRenderContainer.prototype.getViewportHeight = function getViewportHeight() {
    var self = this;

    var headerHeight = (self.headerHeight) ? self.headerHeight : self.grid.headerHeight;

    var viewPortHeight = self.grid.gridHeight - headerHeight - self.grid.footerHeight;

    // Account for native horizontal scrollbar, if present
    if (typeof(self.horizontalScrollbarHeight) !== 'undefined' && self.horizontalScrollbarHeight !== undefined && self.horizontalScrollbarHeight > 0) {
      viewPortHeight = viewPortHeight - self.horizontalScrollbarHeight;
    }

    var adjustment = self.getViewportAdjustment();
    
    viewPortHeight = viewPortHeight + adjustment.height;

    return viewPortHeight;
  };

  GridRenderContainer.prototype.getViewportWidth = function getViewportWidth() {
    var self = this;

    var viewPortWidth = self.grid.gridWidth;

    if (typeof(self.grid.verticalScrollbarWidth) !== 'undefined' && self.grid.verticalScrollbarWidth !== undefined && self.grid.verticalScrollbarWidth > 0) {
      viewPortWidth = viewPortWidth - self.grid.verticalScrollbarWidth;
    }

    var adjustment = self.getViewportAdjustment();
    
    viewPortWidth = viewPortWidth + adjustment.width;

    return viewPortWidth;
  };

  GridRenderContainer.prototype.getHeaderViewportWidth = function getHeaderViewportWidth() {
    var self = this;

    var viewPortWidth = this.getViewportWidth();

    if (typeof(self.grid.verticalScrollbarWidth) !== 'undefined' && self.grid.verticalScrollbarWidth !== undefined && self.grid.verticalScrollbarWidth > 0) {
      viewPortWidth = viewPortWidth + self.grid.verticalScrollbarWidth;
    }

    // var adjustment = self.getViewportAdjustment();
    // viewPortWidth = viewPortWidth + adjustment.width;

    return viewPortWidth;
  };

  GridRenderContainer.prototype.getCanvasHeight = function getCanvasHeight() {
    var self = this;

    var ret =  0;

    self.visibleRowCache.forEach(function(row){
      ret += row.height;
    });

    if (typeof(self.grid.horizontalScrollbarHeight) !== 'undefined' && self.grid.horizontalScrollbarHeight !== undefined && self.grid.horizontalScrollbarHeight > 0) {
      ret = ret - self.grid.horizontalScrollbarHeight;
    }

    return ret;
  };

  GridRenderContainer.prototype.getCanvasWidth = function getCanvasWidth() {
    var self = this;

    var ret = self.canvasWidth;

    if (typeof(self.verticalScrollbarWidth) !== 'undefined' && self.verticalScrollbarWidth !== undefined && self.verticalScrollbarWidth > 0) {
      ret = ret - self.verticalScrollbarWidth;
    }

    return ret;
  };

  GridRenderContainer.prototype.setRenderedRows = function setRenderedRows(newRows) {
    this.renderedRows.length = newRows.length;
    for (var i = 0; i < newRows.length; i++) {
      this.renderedRows[i] = newRows[i];
    }
  };

  GridRenderContainer.prototype.setRenderedColumns = function setRenderedColumns(newColumns) {
    var self = this;

    // OLD:
    this.renderedColumns.length = newColumns.length;
    for (var i = 0; i < newColumns.length; i++) {
      this.renderedColumns[i] = newColumns[i];
    }
    
    this.updateColumnOffset();
  };

  GridRenderContainer.prototype.updateColumnOffset = function updateColumnOffset() {
    // Calculate the width of the columns on the left side that are no longer rendered.
    //  That will be the offset for the columns as we scroll horizontally.
    var hiddenColumnsWidth = 0;
    for (var i = 0; i < this.currentFirstColumn; i++) {
      hiddenColumnsWidth += this.visibleColumnCache[i].drawnWidth;
    }

    this.columnOffset = hiddenColumnsWidth;
  };

  GridRenderContainer.prototype.adjustScrollVertical = function adjustScrollVertical(scrollTop, scrollPercentage, force) {
    if (this.prevScrollTop === scrollTop && !force) {
      return;
    }

    scrollTop = this.getCanvasHeight() * scrollPercentage;

    this.adjustRows(scrollTop, scrollPercentage);

    this.prevScrollTop = scrollTop;
    this.prevScrolltopPercentage = scrollPercentage;

    this.grid.queueRefresh();
  };

  GridRenderContainer.prototype.adjustScrollHorizontal = function adjustScrollHorizontal(scrollLeft, scrollPercentage, force) {
    if (this.prevScrollLeft === scrollLeft && !force) {
      return;
    }

    // scrollLeft = uiGridCtrl.canvas[0].scrollWidth * scrollPercentage;
    scrollLeft = this.getCanvasWidth() * scrollPercentage;

    //$log.debug('scrollPercentage', scrollPercentage);

    this.adjustColumns(scrollLeft, scrollPercentage);

    this.prevScrollLeft = scrollLeft;
    this.prevScrollleftPercentage = scrollPercentage;

    this.grid.queueRefresh();
  };

  GridRenderContainer.prototype.adjustRows = function adjustRows(scrollTop, scrollPercentage) {
    var self = this;

    var minRows = self.minRowsToRender();

    var rowCache = self.visibleRowCache;

    var maxRowIndex = rowCache.length - minRows;
    self.maxRowIndex = maxRowIndex;

    var curRowIndex = self.prevRowScrollIndex;

    // Calculate the scroll percentage according to the scrollTop location, if no percentage was provided
    if ((typeof(scrollPercentage) === 'undefined' || scrollPercentage === null) && scrollTop) {
      scrollPercentage = scrollTop / self.getCanvasHeight();
    }
    
    var rowIndex = Math.ceil(Math.min(maxRowIndex, maxRowIndex * scrollPercentage));

    // Define a max row index that we can't scroll past
    if (rowIndex > maxRowIndex) {
      rowIndex = maxRowIndex;
    }
    
    var newRange = [];
    if (rowCache.length > self.grid.options.virtualizationThreshold) {
      // Have we hit the threshold going down?
      if (self.prevScrollTop < scrollTop && rowIndex < self.prevRowScrollIndex + self.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
        return;
      }
      //Have we hit the threshold going up?
      if (self.prevScrollTop > scrollTop && rowIndex > self.prevRowScrollIndex - self.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
        return;
      }

      var rangeStart = Math.max(0, rowIndex - self.grid.options.excessRows);
      var rangeEnd = Math.min(rowCache.length, rowIndex + minRows + self.grid.options.excessRows);

      newRange = [rangeStart, rangeEnd];
    }
    else {
      var maxLen = self.visibleRowCache.length;
      newRange = [0, Math.max(maxLen, minRows + self.grid.options.excessRows)];
    }

    self.updateViewableRowRange(newRange);

    self.prevRowScrollIndex = rowIndex;
  };

  GridRenderContainer.prototype.adjustColumns = function adjustColumns(scrollLeft, scrollPercentage) {
    var self = this;

    var minCols = self.minColumnsToRender();

    var columnCache = self.visibleColumnCache;
    var maxColumnIndex = columnCache.length - minCols;

    // Calculate the scroll percentage according to the scrollTop location, if no percentage was provided
    if ((typeof(scrollPercentage) === 'undefined' || scrollPercentage === null) && scrollLeft) {
      scrollPercentage = scrollLeft / self.getCanvasWidth();
    }

    var colIndex = Math.ceil(Math.min(maxColumnIndex, maxColumnIndex * scrollPercentage));

    // Define a max row index that we can't scroll past
    if (colIndex > maxColumnIndex) {
      colIndex = maxColumnIndex;
    }
    
    var newRange = [];
    if (columnCache.length > self.grid.options.columnVirtualizationThreshold && self.getCanvasWidth() > self.getViewportWidth()) {
      // Have we hit the threshold going down?
      if (self.prevScrollLeft < scrollLeft && colIndex < self.prevColumnScrollIndex + self.grid.options.horizontalScrollThreshold && colIndex < maxColumnIndex) {
        return;
      }
      //Have we hit the threshold going up?
      if (self.prevScrollLeft > scrollLeft && colIndex > self.prevColumnScrollIndex - self.grid.options.horizontalScrollThreshold && colIndex < maxColumnIndex) {
        return;
      }

      var rangeStart = Math.max(0, colIndex - self.grid.options.excessColumns);
      var rangeEnd = Math.min(columnCache.length, colIndex + minCols + self.grid.options.excessColumns);

      newRange = [rangeStart, rangeEnd];
    }
    else {
      var maxLen = self.visibleColumnCache.length;

      newRange = [0, Math.max(maxLen, minCols + self.grid.options.excessColumns)];
    }
    
    self.updateViewableColumnRange(newRange);

    self.prevColumnScrollIndex = colIndex;
  };

  // Method for updating the visible rows
  GridRenderContainer.prototype.updateViewableRowRange = function updateViewableRowRange(renderedRange) {
    // Slice out the range of rows from the data
    // var rowArr = uiGridCtrl.grid.rows.slice(renderedRange[0], renderedRange[1]);
    var rowArr = this.visibleRowCache.slice(renderedRange[0], renderedRange[1]);

    // Define the top-most rendered row
    this.currentTopRow = renderedRange[0];

    // TODO(c0bra): make this method!
    this.setRenderedRows(rowArr);
  };

  // Method for updating the visible columns
  GridRenderContainer.prototype.updateViewableColumnRange = function updateViewableColumnRange(renderedRange) {
    // Slice out the range of rows from the data
    // var columnArr = uiGridCtrl.grid.columns.slice(renderedRange[0], renderedRange[1]);
    var columnArr = this.visibleColumnCache.slice(renderedRange[0], renderedRange[1]);

    // Define the left-most rendered columns
    this.currentFirstColumn = renderedRange[0];

    this.setRenderedColumns(columnArr);
  };

  GridRenderContainer.prototype.rowStyle = function (index) {
    var self = this;

    var styles = {};
    
    if (index === 0 && self.currentTopRow !== 0) {
      // The row offset-top is just the height of the rows above the current top-most row, which are no longer rendered
      var hiddenRowWidth = (self.currentTopRow) * self.grid.options.rowHeight;

      // return { 'margin-top': hiddenRowWidth + 'px' };
      styles['margin-top'] = hiddenRowWidth + 'px';
    }

    if (self.currentFirstColumn !== 0) {
      if (self.grid.isRTL()) {
        styles['margin-right'] = self.columnOffset + 'px';
      }
      else {
        styles['margin-left'] = self.columnOffset + 'px';
      }
    }

    return styles;
  };

  GridRenderContainer.prototype.columnStyle = function (index) {
    var self = this;
    
    if (index === 0 && self.currentFirstColumn !== 0) {
      var offset = self.columnOffset;

      if (self.grid.isRTL()) {
        return { 'margin-right': offset + 'px' };
      }
      else {
        return { 'margin-left': offset + 'px' };
      }
    }

    return null;
  };

  GridRenderContainer.prototype.updateColumnWidths = function () {
    var self = this;

    var asterisksArray = [],
        percentArray = [],
        manualArray = [],
        asteriskNum = 0,
        totalWidth = 0;

    // Get the width of the viewport
    var availableWidth = self.getViewportWidth();

    if (typeof(self.grid.verticalScrollbarWidth) !== 'undefined' && self.grid.verticalScrollbarWidth !== undefined && self.grid.verticalScrollbarWidth > 0) {
      availableWidth = availableWidth + self.grid.verticalScrollbarWidth;
    }

    // The total number of columns
    // var equalWidthColumnCount = columnCount = uiGridCtrl.grid.options.columnDefs.length;
    // var equalWidth = availableWidth / equalWidthColumnCount;

    // The last column we processed
    var lastColumn;

    var manualWidthSum = 0;

    var canvasWidth = 0;

    var ret = '';


    // uiGridCtrl.grid.columns.forEach(function(column, i) {

    var columnCache = self.visibleColumnCache;

    columnCache.forEach(function(column, i) {
      // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + i + ' { width: ' + equalWidth + 'px; left: ' + left + 'px; }';
      //var colWidth = (typeof(c.width) !== 'undefined' && c.width !== undefined) ? c.width : equalWidth;

      // Skip hidden columns
      if (!column.visible) { return; }

      var colWidth,
          isPercent = false;

      if (!angular.isNumber(column.width)) {
        isPercent = isNaN(column.width) ? gridUtil.endsWith(column.width, "%") : false;
      }

      if (angular.isString(column.width) && column.width.indexOf('*') !== -1) { //  we need to save it until the end to do the calulations on the remaining width.
        asteriskNum = parseInt(asteriskNum + column.width.length, 10);
        
        asterisksArray.push(column);
      }
      else if (isPercent) { // If the width is a percentage, save it until the very last.
        percentArray.push(column);
      }
      else if (angular.isNumber(column.width)) {
        manualWidthSum = parseInt(manualWidthSum + column.width, 10);
        
        canvasWidth = parseInt(canvasWidth, 10) + parseInt(column.width, 10);

        column.drawnWidth = column.width;

        // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + column.width + 'px; }';
      }
    });

    // Get the remaining width (available width subtracted by the manual widths sum)
    var remainingWidth = availableWidth - manualWidthSum;

    var i, column, colWidth;

    if (percentArray.length > 0) {
      // Pre-process to make sure they're all within any min/max values
      for (i = 0; i < percentArray.length; i++) {
        column = percentArray[i];

        var percent = parseInt(column.width.replace(/%/g, ''), 10) / 100;

        colWidth = parseInt(percent * remainingWidth, 10);

        if (column.colDef.minWidth && colWidth < column.colDef.minWidth) {
          colWidth = column.colDef.minWidth;

          remainingWidth = remainingWidth - colWidth;

          canvasWidth += colWidth;
          column.drawnWidth = colWidth;

          // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';

          // Remove this element from the percent array so it's not processed below
          percentArray.splice(i, 1);
        }
        else if (column.colDef.maxWidth && colWidth > column.colDef.maxWidth) {
          colWidth = column.colDef.maxWidth;

          remainingWidth = remainingWidth - colWidth;

          canvasWidth += colWidth;
          column.drawnWidth = colWidth;

          // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';

          // Remove this element from the percent array so it's not processed below
          percentArray.splice(i, 1);
        }
      }

      percentArray.forEach(function(column) {
        var percent = parseInt(column.width.replace(/%/g, ''), 10) / 100;
        var colWidth = parseInt(percent * remainingWidth, 10);

        canvasWidth += colWidth;

        column.drawnWidth = colWidth;

        // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';
      });
    }

    if (asterisksArray.length > 0) {
      var asteriskVal = parseInt(remainingWidth / asteriskNum, 10);

       // Pre-process to make sure they're all within any min/max values
      for (i = 0; i < asterisksArray.length; i++) {
        column = asterisksArray[i];

        colWidth = parseInt(asteriskVal * column.width.length, 10);

        if (column.colDef.minWidth && colWidth < column.colDef.minWidth) {
          colWidth = column.colDef.minWidth;

          remainingWidth = remainingWidth - colWidth;
          asteriskNum--;

          canvasWidth += colWidth;
          column.drawnWidth = colWidth;

          // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';

          lastColumn = column;

          // Remove this element from the percent array so it's not processed below
          asterisksArray.splice(i, 1);
        }
        else if (column.colDef.maxWidth && colWidth > column.colDef.maxWidth) {
          colWidth = column.colDef.maxWidth;

          remainingWidth = remainingWidth - colWidth;
          asteriskNum--;

          canvasWidth += colWidth;
          column.drawnWidth = colWidth;

          // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';

          // Remove this element from the percent array so it's not processed below
          asterisksArray.splice(i, 1);
        }
      }

      // Redo the asterisk value, as we may have removed columns due to width constraints
      asteriskVal = parseInt(remainingWidth / asteriskNum, 10);

      asterisksArray.forEach(function(column) {
        var colWidth = parseInt(asteriskVal * column.width.length, 10);

        canvasWidth += colWidth;

        column.drawnWidth = colWidth;

        // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + colWidth + 'px; }';
      });
    }

    // If the grid width didn't divide evenly into the column widths and we have pixels left over, dole them out to the columns one by one to make everything fit
    var leftoverWidth = availableWidth - parseInt(canvasWidth, 10);

    if (leftoverWidth > 0 && canvasWidth > 0 && canvasWidth < availableWidth) {
      var variableColumn = false;
      // uiGridCtrl.grid.columns.forEach(function(col) {
      columnCache.forEach(function(col) {
        if (col.width && !angular.isNumber(col.width)) {
          variableColumn = true;
        }
      });

      if (variableColumn) {
        var remFn = function (column) {
          if (leftoverWidth > 0) {
            column.drawnWidth = column.drawnWidth + 1;
            canvasWidth = canvasWidth + 1;
            leftoverWidth--;
          }
        };
        while (leftoverWidth > 0) {
          columnCache.forEach(remFn);
        }
      }
    }

    if (canvasWidth < availableWidth) {
      canvasWidth = availableWidth;
    }

    // Build the CSS
    columnCache.forEach(function (column) {
      ret = ret + column.getColClassDefinition();
    });

    // Add the vertical scrollbar width back in to the canvas width, it's taken out in getCanvasWidth
    if (self.grid.verticalScrollbarWidth) {
      canvasWidth = canvasWidth + self.grid.verticalScrollbarWidth;
    }
    // canvasWidth = canvasWidth + 1;

    self.canvasWidth = parseInt(canvasWidth, 10);

    // Return the styles back to buildStyles which pops them into the `customStyles` scope variable
    // return ret;

    // Set this render container's column styles so they can be used in style computation
    this.columnStyles = ret;
  };

  return GridRenderContainer;
}]);

})();
(function(){

angular.module('ui.grid')
.factory('GridRow', ['gridUtil', function(gridUtil) {

   /**
   * @ngdoc function
   * @name ui.grid.class:GridRow
   * @description GridRow is the viewModel for one logical row on the grid.  A grid Row is not necessarily a one-to-one
   * relation to gridOptions.data.
   * @param {object} entity the array item from GridOptions.data
   * @param {number} index the current position of the row in the array
   * @param {Grid} reference to the parent grid
   */
  function GridRow(entity, index, grid) {

     /**
      *  @ngdoc object
      *  @name grid
      *  @propertyOf  ui.grid.class:GridRow
      *  @description A reference back to the grid
      */
     this.grid = grid;

     /**
      *  @ngdoc object
      *  @name entity
      *  @propertyOf  ui.grid.class:GridRow
      *  @description A reference to an item in gridOptions.data[]
      */
    this.entity = entity;

     /**
      *  @ngdoc object
      *  @name index
      *  @propertyOf  ui.grid.class:GridRow
      *  @description the index of the GridRow. It should always be unique and immutable
      */
    this.index = index;


     /**
      *  @ngdoc object
      *  @name uid
      *  @propertyOf  ui.grid.class:GridRow
      *  @description  UniqueId of row
      */
     this.uid = gridUtil.nextUid();

     /**
      *  @ngdoc object
      *  @name visible
      *  @propertyOf  ui.grid.class:GridRow
      *  @description If true, the row will be rendered
      */
    // Default to true
    this.visible = true;

  /**
    *  @ngdoc object
    *  @name height
    *  @propertyOf  ui.grid.class:GridRow
    *  @description height of each individual row
    */
    this.height = grid.options.rowHeight;

    /**
     * @ngdoc function
     * @name setRowInvisible
     * @methodOf  ui.grid.core.api:PublicApi
     * @description Sets an override on the row to make it always invisible,
     * which will override any filtering or other visibility calculations.  
     * If the row is currently visible then sets it to invisible and calls
     * both grid refresh and emits the rowsVisibleChanged event
     * @param {object} rowEntity gridOptions.data[] array instance
     */
    if (!this.grid.api.core.setRowInvisible){
      this.grid.api.registerMethod( 'core', 'setRowInvisible', this.setRowInvisible );
    }

    /**
     * @ngdoc function
     * @name clearRowInvisible
     * @methodOf  ui.grid.core.api:PublicApi
     * @description Clears any override on visibility for the row so that it returns to 
     * using normal filtering and other visibility calculations.  
     * If the row is currently invisible then sets it to visible and calls
     * both grid refresh and emits the rowsVisibleChanged event
     * TODO: if a filter is active then we can't just set it to visible?
     * @param {object} rowEntity gridOptions.data[] array instance
     */
    if (!this.grid.api.core.clearRowInvisible){
      this.grid.api.registerMethod( 'core', 'clearRowInvisible', this.clearRowInvisible );
    }

    /**
     * @ngdoc function
     * @name getVisibleRows
     * @methodOf  ui.grid.core.api:PublicApi
     * @description Returns all visible rows
     * @param {Grid} grid the grid you want to get visible rows from
     * @returns {array} an array of gridRow 
     */
    if (!this.grid.api.core.getVisibleRows){
      this.grid.api.registerMethod( 'core', 'getVisibleRows', this.getVisibleRows );
    }
    
    /**
     * @ngdoc event
     * @name rowsVisibleChanged
     * @eventOf  ui.grid.core.api:PublicApi
     * @description  is raised after the rows that are visible
     * change.  The filtering is zero-based, so it isn't possible
     * to say which rows changed (unlike in the selection feature).
     * We can plausibly know which row was changed when setRowInvisible
     * is called, but in that situation the user already knows which row
     * they changed.  When a filter runs we don't know what changed, 
     * and that is the one that would have been useful.
     * 
     */
    if (!this.grid.api.core.raise.rowsVisibleChanged){
      this.grid.api.registerEvent( 'core', 'rowsVisibleChanged' );
    }
    
  }

  /**
   * @ngdoc function
   * @name getQualifiedColField
   * @methodOf ui.grid.class:GridRow
   * @description returns the qualified field name as it exists on scope
   * ie: row.entity.fieldA
   * @param {GridCol} col column instance
   * @returns {string} resulting name that can be evaluated on scope
   */
  GridRow.prototype.getQualifiedColField = function(col) {
    return 'row.' + this.getEntityQualifiedColField(col);
  };

    /**
     * @ngdoc function
     * @name getEntityQualifiedColField
     * @methodOf ui.grid.class:GridRow
     * @description returns the qualified field name minus the row path
     * ie: entity.fieldA
     * @param {GridCol} col column instance
     * @returns {string} resulting name that can be evaluated against a row
     */
  GridRow.prototype.getEntityQualifiedColField = function(col) {
    return gridUtil.preEval('entity.' + col.field);
  };
  
  
  /**
   * @ngdoc function
   * @name setRowInvisible
   * @methodOf  ui.grid.class:GridRow
   * @description Sets an override on the row that forces it to always
   * be invisible, and if the row is currently visible then marks it
   * as invisible and refreshes the grid.  Emits the rowsVisibleChanged
   * event if it changed the row visibility
   * @param {GridRow} row row to force invisible, needs to be a GridRow,
   * which can be found from your data entity using grid.findRow
   */
  GridRow.prototype.setRowInvisible = function (row) {
    if (row !== null) {
      row.forceInvisible = true;
      
      if ( row.visible ){
        row.visible = false;
        row.grid.refresh();
        row.grid.api.core.raise.rowsVisibleChanged();
      }
    }        
  };

  /**
   * @ngdoc function
   * @name clearRowInvisible
   * @methodOf ui.grid.class:GridRow
   * @description Clears any override on the row visibility, returning it 
   * to normal visibility calculations.  If the row is currently invisible
   * then sets it to visible and calls refresh and emits the rowsVisibleChanged
   * event
   * TODO: if filter in action, then is this right?
   * @param {GridRow} row row clear force invisible, needs to be a GridRow,
   * which can be found from your data entity using grid.findRow
   */
  GridRow.prototype.clearRowInvisible = function (row) {
    if (row !== null) {
      row.forceInvisible = false;
      
      if ( !row.visible ){
        row.visible = true;
        row.grid.refresh();
        row.grid.api.core.raise.rowsVisibleChanged();
      }
    }        
  };

  /**
   * @ngdoc function
   * @name getVisibleRows
   * @methodOf ui.grid.class:GridRow
   * @description Returns all the visible rows
   * @param {Grid} grid the grid to return rows from
   * @returns {array} rows that are currently visible, returns the
   * GridRows rather than gridRow.entity
   * TODO: should this come from visible row cache instead?
   */
  GridRow.prototype.getVisibleRows = function ( grid ) {
    return grid.rows.filter(function (row) {
      return row.visible;
    });
  };  

  return GridRow;
}]);

})();
(function () {
  'use strict';
  /**
   *  @ngdoc object
   *  @name ui.grid.service:gridClassFactory
   *
   *  @description factory to return dom specific instances of a grid
   *
   */
  angular.module('ui.grid').service('gridClassFactory', ['gridUtil', '$q', '$compile', '$templateCache', 'uiGridConstants', '$log', 'Grid', 'GridColumn', 'GridRow',
    function (gridUtil, $q, $compile, $templateCache, uiGridConstants, $log, Grid, GridColumn, GridRow) {

      var service = {
        /**
         * @ngdoc method
         * @name createGrid
         * @methodOf ui.grid.service:gridClassFactory
         * @description Creates a new grid instance. Each instance will have a unique id
         * @param {object} options An object map of options to pass into the created grid instance.
         * @returns {Grid} grid
         */
        createGrid : function(options) {
          options = (typeof(options) !== 'undefined') ? options: {};
          options.id = gridUtil.newId();
          var grid = new Grid(options);

          // NOTE/TODO: rowTemplate should always be defined...
          if (grid.options.rowTemplate) {
            var rowTemplateFnPromise = $q.defer();
            grid.getRowTemplateFn = rowTemplateFnPromise.promise;
            
            gridUtil.getTemplate(grid.options.rowTemplate)
              .then(
                function (template) {
                  var rowTemplateFn = $compile(template);
                  rowTemplateFnPromise.resolve(rowTemplateFn);
                },
                function (res) {
                  // Todo handle response error here?
                  throw new Error("Couldn't fetch/use row template '" + grid.options.rowTemplate + "'");
                });
          }

          grid.registerColumnBuilder(service.defaultColumnBuilder);

          // Reset all rows to visible initially
          grid.registerRowsProcessor(function allRowsVisible(rows) {
            rows.forEach(function (row) {
              row.visible = !row.forceInvisible;
            });

            return rows;
          });

          grid.registerColumnsProcessor(function allColumnsVisible(columns) {
            columns.forEach(function (column) {
              column.visible = true;
            });

            return columns;
          });

          grid.registerColumnsProcessor(function(renderableColumns) {
              renderableColumns.forEach(function (column) {
                  if (column.colDef.visible === false) {
                      column.visible = false;
                  }
              });

              return renderableColumns;
          });



          if (grid.options.enableFiltering) {
            grid.registerRowsProcessor(grid.searchRows);
          }

          // Register the default row processor, it sorts rows by selected columns
          if (grid.options.externalSort && angular.isFunction(grid.options.externalSort)) {
            grid.registerRowsProcessor(grid.options.externalSort);
          }
          else {
            grid.registerRowsProcessor(grid.sortByColumn);
          }

          return grid;
        },

        /**
         * @ngdoc function
         * @name defaultColumnBuilder
         * @methodOf ui.grid.service:gridClassFactory
         * @description Processes designTime column definitions and applies them to col for the
         *              core grid features
         * @param {object} colDef reference to column definition
         * @param {GridColumn} col reference to gridCol
         * @param {object} gridOptions reference to grid options
         */
        defaultColumnBuilder: function (colDef, col, gridOptions) {

          var templateGetPromises = [];

          /**
           * @ngdoc property
           * @name headerCellTemplate
           * @propertyOf ui.grid.class:GridOptions.columnDef
           * @description a custom template for the header for this column.  The default
           * is ui-grid/uiGridHeaderCell
           *
           */
          if (!colDef.headerCellTemplate) {
            colDef.headerCellTemplate = 'ui-grid/uiGridHeaderCell';
          }

          /**
           * @ngdoc property
           * @name cellTemplate
           * @propertyOf ui.grid.class:GridOptions.columnDef
           * @description a custom template for each cell in this column.  The default
           * is ui-grid/uiGridCell
           *
           */
          if (!colDef.cellTemplate) {
            colDef.cellTemplate = 'ui-grid/uiGridCell';
          }

          templateGetPromises.push(gridUtil.getTemplate(colDef.cellTemplate)
            .then(
              function (template) {
                col.cellTemplate = template.replace(uiGridConstants.CUSTOM_FILTERS, col.cellFilter ? "|" + col.cellFilter : "");
              },
              function (res) {
                throw new Error("Couldn't fetch/use colDef.cellTemplate '" + colDef.cellTemplate + "'");
              })
          );


          templateGetPromises.push(gridUtil.getTemplate(colDef.headerCellTemplate)
              .then(
              function (template) {
                col.headerCellTemplate = template.replace(uiGridConstants.CUSTOM_FILTERS, col.headerCellFilter ? "|" + col.headerCellFilter : "");
              },
              function (res) {
                throw new Error("Couldn't fetch/use colDef.headerCellTemplate '" + colDef.headerCellTemplate + "'");
              })
          );

          return $q.all(templateGetPromises);
        }

      };

      //class definitions (moved to separate factories)

      return service;
    }]);

})();
(function() {

var module = angular.module('ui.grid');

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function QuickCache() {
  var c = function(get, set) {
    // Return the cached value of 'get' if it's stored
    if (get && c.cache[get]) {
      return c.cache[get];
    }
    // Otherwise set it and return it
    else if (get && set) {
      c.cache[get] = set;
      return c.cache[get];
    }
    else {
      return undefined;
    }
  };

  c.cache = {};

  c.clear = function () {
    c.cache = {};
  };

  return c;
}

/**
 *  @ngdoc service
 *  @name ui.grid.service:rowSearcher
 *
 *  @description Service for searching/filtering rows based on column value conditions.
 */
module.service('rowSearcher', ['$log', 'uiGridConstants', function ($log, uiGridConstants) {
  var defaultCondition = uiGridConstants.filter.STARTS_WITH;

  var rowSearcher = {};

  // rowSearcher.searchColumn = function searchColumn(condition, item) {
  //   var result;

  //   var col = self.fieldMap[condition.columnDisplay];

  //   if (!col) {
  //       return false;
  //   }
  //   var sp = col.cellFilter.split(':');
  //   var filter = col.cellFilter ? $filter(sp[0]) : null;
  //   var value = item[condition.column] || item[col.field.split('.')[0]];
  //   if (value === null || value === undefined) {
  //       return false;
  //   }
  //   if (typeof filter === "function") {
  //       var filterResults = filter(typeof value === "object" ? evalObject(value, col.field) : value, sp[1]).toString();
  //       result = condition.regex.test(filterResults);
  //   }
  //   else {
  //       result = condition.regex.test(typeof value === "object" ? evalObject(value, col.field).toString() : value.toString());
  //   }
  //   if (result) {
  //       return true;
  //   }
  //   return false;
  // };

  /**
   * @ngdoc function
   * @name getTerm
   * @methodOf ui.grid.service:rowSearcher
   * @description Get the term from a filter
   * Trims leading and trailing whitespace
   * @param {object} filter object to use
   * @returns {object} Parsed term
   */
  rowSearcher.getTerm = function getTerm(filter) {
    if (typeof(filter.term) === 'undefined') { return filter.term; }
    
    var term = filter.term;

    // Strip leading and trailing whitespace if the term is a string
    if (typeof(term) === 'string') {
      term = term.trim();
    }

    return term;
  };

  /**
   * @ngdoc function
   * @name stripTerm
   * @methodOf ui.grid.service:rowSearcher
   * @description Remove leading and trailing asterisk (*) from the filter's term
   * @param {object} filter object to use
   * @returns {uiGridConstants.filter<int>} Value representing the condition constant value
   */
  rowSearcher.stripTerm = function stripTerm(filter) {
    var term = rowSearcher.getTerm(filter);

    if (typeof(term) === 'string') {
      return escapeRegExp(term.replace(/(^\*|\*$)/g, ''));
    }
    else {
      return term;
    }
  };

  /**
   * @ngdoc function
   * @name guessCondition
   * @methodOf ui.grid.service:rowSearcher
   * @description Guess the condition for a filter based on its term
   * <br>
   * Defaults to STARTS_WITH. Uses CONTAINS for strings beginning and ending with *s (*bob*).
   * Uses STARTS_WITH for strings ending with * (bo*). Uses ENDS_WITH for strings starting with * (*ob).
   * @param {object} filter object to use
   * @returns {uiGridConstants.filter<int>} Value representing the condition constant value
   */
  rowSearcher.guessCondition = function guessCondition(filter) {
    if (typeof(filter.term) === 'undefined' || !filter.term) {
      return defaultCondition;
    }

    var term = rowSearcher.getTerm(filter);
    
    // Term starts with and ends with a *, use 'contains' condition
    // if (/^\*[\s\S]+?\*$/.test(term)) {
    //   return uiGridConstants.filter.CONTAINS;
    // }
    // // Term starts with a *, use 'ends with' condition
    // else if (/^\*/.test(term)) {
    //   return uiGridConstants.filter.ENDS_WITH;
    // }
    // // Term ends with a *, use 'starts with' condition
    // else if (/\*$/.test(term)) {
    //   return uiGridConstants.filter.STARTS_WITH;
    // }
    // // Default to default condition
    // else {
    //   return defaultCondition;
    // }

    // If the term has *s then turn it into a regex
    if (/\*/.test(term)) {
      var regexpFlags = '';
      if (!filter.flags || !filter.flags.caseSensitive) {
        regexpFlags += 'i';
      }

      var reText = term.replace(/(\\)?\*/g, function ($0, $1) { return $1 ? $0 : '[\\s\\S]*?'; });
      return new RegExp('^' + reText + '$', regexpFlags);
    }
    // Otherwise default to default condition
    else {
      return defaultCondition;
    }
  };

  rowSearcher.runColumnFilter = function runColumnFilter(grid, row, column, termCache, i, filter) {
    // Cache typeof condition
    var conditionType = typeof(filter.condition);

    // Default to CONTAINS condition
    if (conditionType === 'undefined' || !filter.condition) {
      filter.condition = uiGridConstants.filter.CONTAINS;
    }

    // Term to search for.
    var term = rowSearcher.stripTerm(filter);

    if (term === null || term === undefined || term === '') {
      return true;
    }

    // Get the column value for this row
    var value = grid.getCellValue(row, column);

    var regexpFlags = '';
    if (!filter.flags || !filter.flags.caseSensitive) {
      regexpFlags += 'i';
    }

    var cacheId = column.field + i;

    // If the filter's condition is a RegExp, then use it
    if (filter.condition instanceof RegExp) {
      if (!filter.condition.test(value)) {
        return false;
      }
    }
    // If the filter's condition is a function, run it
    else if (conditionType === 'function') {
      return filter.condition(term, value, row, column);
    }
    else if (filter.condition === uiGridConstants.filter.STARTS_WITH) {
      var startswithRE = termCache(cacheId) ? termCache(cacheId) : termCache(cacheId, new RegExp('^' + term, regexpFlags));

      if (!startswithRE.test(value)) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.ENDS_WITH) {
      var endswithRE = termCache(cacheId) ? termCache(cacheId) : termCache(cacheId, new RegExp(term + '$', regexpFlags));

      if (!endswithRE.test(value)) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.CONTAINS) {
      var containsRE = termCache(cacheId) ? termCache(cacheId) : termCache(cacheId, new RegExp(term, regexpFlags));

      if (!containsRE.test(value)) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.EXACT) {
      var exactRE = termCache(cacheId) ? termCache(cacheId) : termCache(cacheId,  new RegExp('^' + term + '$', regexpFlags));

      if (!exactRE.test(value)) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.GREATER_THAN) {
      if (value <= term) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.GREATER_THAN_OR_EQUAL) {
      if (value < term) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.LESS_THAN) {
      if (value >= term) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.LESS_THAN_OR_EQUAL) {
      if (value > term) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.NOT_EQUAL) {
      if (!angular.equals(value, term)) {
        return false;
      }
    }

    return true;
  };

  /**
   * @ngdoc boolean
   * @name useExternalFiltering
   * @propertyOf ui.grid.class:GridOptions
   * @description False by default. When enabled, this setting suppresses the internal filtering.
   * All UI logic will still operate, allowing filter conditions to be set and modified.
   * 
   * The external filter logic can listen for the `filterChange` event, which fires whenever
   * a filter has been adjusted.
   */
  /**
   * @ngdoc function
   * @name searchColumn
   * @methodOf ui.grid.service:rowSearcher
   * @description Process filters on a given column against a given row. If the row meets the conditions on all the filters, return true.
   * @param {Grid} grid Grid to search in
   * @param {GridRow} row Row to search on
   * @param {GridCol} column Column with the filters to use
   * @returns {boolean} Whether the column matches or not.
   */
  rowSearcher.searchColumn = function searchColumn(grid, row, column, termCache) {
    var filters = [];

    if (grid.options.useExternalFiltering) {
      return true;
    }
    
    if (typeof(column.filters) !== 'undefined' && column.filters && column.filters.length > 0) {
      filters = column.filters;
    } else {
      // If filters array is not there, assume no filters for this column. 
      // This array should have been built in GridColumn::updateColumnDef.
      return true;
    }
    
    for (var i in filters) {
      var filter = filters[i];

      /*
        filter: {
          term: 'blah', // Search term to search for, could be a string, integer, etc.
          condition: uiGridConstants.filter.CONTAINS // Type of match to do. Defaults to CONTAINS (i.e. looking in a string), but could be EXACT, GREATER_THAN, etc.
          flags: { // Flags for the conditions
            caseSensitive: false // Case-sensitivity defaults to false
          }
        }
      */
     
      // Check for when no condition is supplied. In this case, guess the condition
      // to use based on the filter's term. Cache this result.
      if (!filter.condition) {
        // Cache custom conditions, building the RegExp takes time
        var conditionCacheId = 'cond-' + column.field + '-' + filter.term;
        var condition = termCache(conditionCacheId) ? termCache(conditionCacheId) : termCache(conditionCacheId, rowSearcher.guessCondition(filter));

        // Create a surrogate filter so as not to change
        // the actual columnDef.filters.
        filter = {
          // Copy over the search term
          term: filter.term,
          // Use the guessed condition
          condition: condition,
          // Set flags, using passed flags if present
          flags: angular.extend({
            caseSensitive: false
          }, filter.flags)
        };
      }

      var ret = rowSearcher.runColumnFilter(grid, row, column, termCache, i, filter);
      if (!ret) {
        return false;
      }
    }

    return true;
    // }
    // else {
    //   // No filter conditions, default to true
    //   return true;
    // }
  };

  /**
   * @ngdoc function
   * @name search
   * @methodOf ui.grid.service:rowSearcher
   * @description Run a search across
   * @param {Grid} grid Grid instance to search inside
   * @param {Array[GridRow]} rows GridRows to filter
   * @param {Array[GridColumn]} columns GridColumns with filters to process
   */
  rowSearcher.search = function search(grid, rows, columns) {
    // Don't do anything if we weren't passed any rows
    if (!rows) {
      return;
    }

    // Create a term cache
    var termCache = new QuickCache();

    // Build filtered column list
    var filterCols = [];
    columns.forEach(function (col) {
      if (typeof(col.filters) !== 'undefined' && col.filters.length > 0) {
        filterCols.push(col);
      }
      else if (typeof(col.filter) !== 'undefined' && col.filter && typeof(col.filter.term) !== 'undefined' && col.filter.term) {
        filterCols.push(col);
      }
    });
    
    if (filterCols.length > 0) {
      filterCols.forEach(function foreachFilterCol(col) {
        rows.forEach(function foreachRow(row) {
          if (row.forceInvisible || !rowSearcher.searchColumn(grid, row, col, termCache)) {
            row.visible = false;
          }
        });
      });
      
      grid.api.core.raise.rowsVisibleChanged();

      // rows.forEach(function (row) {
      //   var matchesAllColumns = true;

      //   for (var i in filterCols) {
      //     var col = filterCols[i];

      //     if (!rowSearcher.searchColumn(grid, row, col, termCache)) {
      //       matchesAllColumns = false;

      //       // Stop processing other terms
      //       break;
      //     }
      //   }

      //   // Row doesn't match all the terms, don't display it
      //   if (!matchesAllColumns) {
      //     row.visible = false;
      //   }
      //   else {
      //     row.visible = true;
      //   }
      // });
    }

    // Reset the term cache
    termCache.clear();

    return rows;
  };

  return rowSearcher;
}]);

})();
(function() {

var module = angular.module('ui.grid');

/**
 * @ngdoc object
 * @name ui.grid.class:RowSorter
 * @description RowSorter provides the default sorting mechanisms, 
 * including guessing column types and applying appropriate sort 
 * algorithms
 * 
 */ 

module.service('rowSorter', ['$parse', 'uiGridConstants', function ($parse, uiGridConstants) {
  var currencyRegexStr = 
    '(' +
    uiGridConstants.CURRENCY_SYMBOLS
      .map(function (a) { return '\\' + a; }) // Escape all the currency symbols ($ at least will jack up this regex)
      .join('|') + // Join all the symbols together with |s
    ')?';

  // /^[-+]?[£$¤¥]?[\d,.]+%?$/
  var numberStrRegex = new RegExp('^[-+]?' + currencyRegexStr + '[\\d,.]+' + currencyRegexStr + '%?$');

  var rowSorter = {
    // Cache of sorting functions. Once we create them, we don't want to keep re-doing it
    //   this takes a piece of data from the cell and tries to determine its type and what sorting
    //   function to use for it
    colSortFnCache: []
  };

  // Guess which sort function to use on this item
  rowSorter.guessSortFn = function guessSortFn(itemType) {

    // Check for numbers and booleans
    switch (itemType) {
      case "number":
        return rowSorter.sortNumber;
      case "boolean":
        return rowSorter.sortBool;
      case "string":
        return rowSorter.sortAlpha;
      case "date":
        return rowSorter.sortDate;
      case "object":
        return rowSorter.basicSort;
      default:
        throw new Error('No sorting function found for type:' + itemType);
    }
  };

  // Basic sorting function
  rowSorter.basicSort = function basicSort(a, b) {
      if (a === b) {
          return 0;
      }
      if (a < b) {
          return -1;
      }
      return 1;
  };

  // Number sorting function
  rowSorter.sortNumber = function sortNumber(a, b) {
      return a - b;
  };

  rowSorter.sortNumberStr = function sortNumberStr(a, b) {
    var numA, // The parsed number form of 'a'
        numB, // The parsed number form of 'b'
        badA = false,
        badB = false;

    // Try to parse 'a' to a float
    numA = parseFloat(a.replace(/[^0-9.-]/g, ''));

    // If 'a' couldn't be parsed to float, flag it as bad
    if (isNaN(numA)) {
        badA = true;
    }

    // Try to parse 'b' to a float
    numB = parseFloat(b.replace(/[^0-9.-]/g, ''));

    // If 'b' couldn't be parsed to float, flag it as bad
    if (isNaN(numB)) {
        badB = true;
    }

    // We want bad ones to get pushed to the bottom... which effectively is "greater than"
    if (badA && badB) {
        return 0;
    }

    if (badA) {
        return 1;
    }

    if (badB) {
        return -1;
    }

    return numA - numB;
  };

  // String sorting function
  rowSorter.sortAlpha = function sortAlpha(a, b) {
    var strA = a.toLowerCase(),
        strB = b.toLowerCase();

    return strA === strB ? 0 : (strA < strB ? -1 : 1);
  };

  // Date sorting function
  rowSorter.sortDate = function sortDate(a, b) {
    var timeA = a.getTime(),
        timeB = b.getTime();

    return timeA === timeB ? 0 : (timeA < timeB ? -1 : 1);
  };

  // Boolean sorting function
  rowSorter.sortBool = function sortBool(a, b) {
    if (a && b) {
      return 0;
    }

    if (!a && !b) {
      return 0;
    }
    else {
      return a ? 1 : -1;
    }
  };

  rowSorter.getSortFn = function getSortFn(grid, col, rows) {
    var sortFn, item;

    // See if we already figured out what to use to sort the column and have it in the cache
    if (rowSorter.colSortFnCache[col.colDef.name]) {
      sortFn = rowSorter.colSortFnCache[col.colDef.name];
    }
    // If the column has its OWN sorting algorithm, use that
    else if (col.sortingAlgorithm !== undefined) {
      sortFn = col.sortingAlgorithm;
      rowSorter.colSortFnCache[col.colDef.name] = col.sortingAlgorithm;
    }
    // Try and guess what sort function to use
    else {
      // Guess the sort function
      sortFn = rowSorter.guessSortFn(col.colDef.type);

      // If we found a sort function, cache it
      if (sortFn) {
        rowSorter.colSortFnCache[col.colDef.name] = sortFn;
      }
      else {
        // We assign the alpha sort because anything that is null/undefined will never get passed to
        // the actual sorting function. It will get caught in our null check and returned to be sorted
        // down to the bottom
        sortFn = rowSorter.sortAlpha;
      }
    }

    return sortFn;
  };

  rowSorter.prioritySort = function (a, b) {
    // Both columns have a sort priority
    if (a.sort.priority !== undefined && b.sort.priority !== undefined) {
      // A is higher priority
      if (a.sort.priority < b.sort.priority) {
        return -1;
      }
      // Equal
      else if (a.sort.priority === b.sort.priority) {
        return 0;
      }
      // B is higher
      else {
        return 1;
      }
    }
    // Only A has a priority
    else if (a.sort.priority) {
      return -1;
    }
    // Only B has a priority
    else if (b.sort.priority) {
      return 1;
    }
    // Neither has a priority
    else {
      return 0;
    }
  };

  /**
   * @ngdoc object
   * @name useExternalSorting
   * @propertyOf ui.grid.class:GridOptions
   * @description Prevents the internal sorting from executing.  Events will
   * still be fired when the sort changes, and the sort information on
   * the columns will be updated, allowing an external sorter (for example,
   * server sorting) to be implemented.  Defaults to false. 
   * 
   */
  /**
   * @ngdoc method
   * @methodOf ui.grid.class:RowSorter
   * @name sort
   * @description sorts the grid 
   * @param {Object} grid the grid itself
   * @param {Object} rows the rows to be sorted
   * @param {Object} columns the columns in which to look
   * for sort criteria
   */
  rowSorter.sort = function rowSorterSort(grid, rows, columns) {
    // first make sure we are even supposed to do work
    if (!rows) {
      return;
    }
    
    if (grid.options.useExternalSorting){
      return rows;
    }

    // Build the list of columns to sort by
    var sortCols = [];
    columns.forEach(function (col) {
      if (col.sort && col.sort.direction && (col.sort.direction === uiGridConstants.ASC || col.sort.direction === uiGridConstants.DESC)) {
        sortCols.push(col);
      }
    });

    // Sort the "sort columns" by their sort priority
    sortCols = sortCols.sort(rowSorter.prioritySort);

    // Now rows to sort by, maintain original order
    if (sortCols.length === 0) {
      return rows;
    }
    
    // Re-usable variables
    var col, direction;

    // IE9-11 HACK.... the 'rows' variable would be empty where we call rowSorter.getSortFn(...) below. We have to use a separate reference
    // var d = data.slice(0);
    var r = rows.slice(0);

    // Now actually sort the data
    return rows.sort(function rowSortFn(rowA, rowB) {
      var tem = 0,
          idx = 0,
          sortFn;

      while (tem === 0 && idx < sortCols.length) {
        // grab the metadata for the rest of the logic
        col = sortCols[idx];
        direction = sortCols[idx].sort.direction;

        sortFn = rowSorter.getSortFn(grid, col, r);
        
        var propA = grid.getCellValue(rowA, col);
        var propB = grid.getCellValue(rowB, col);

        // We want to allow zero values to be evaluated in the sort function
        if ((!propA && propA !== 0) || (!propB && propB !== 0)) {
          // We want to force nulls and such to the bottom when we sort... which effectively is "greater than"
          if (!propB && !propA) {
            tem = 0;
          }
          else if (!propA) {
            tem = 1;
          }
          else if (!propB) {
            tem = -1;
          }
        }
        else {
          tem = sortFn(propA, propB);
        }

        idx++;
      }

      // Made it this far, we don't have to worry about null & undefined
      if (direction === uiGridConstants.ASC) {
        return tem;
      } else {
        return 0 - tem;
      }
    });
  };

  return rowSorter;
}]);

})();
(function() {

var module = angular.module('ui.grid');

function getStyles (elem) {
  return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
}

var rnumnonpx = new RegExp( "^(" + (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source + ")(?!px)[a-z%]+$", "i" ),
    // swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
    // see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
    rdisplayswap = /^(block|none|table(?!-c[ea]).+)/,
    cssShow = { position: "absolute", visibility: "hidden", display: "block" };

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
  var i = extra === ( isBorderBox ? 'border' : 'content' ) ?
          // If we already have the right measurement, avoid augmentation
          4 :
          // Otherwise initialize for horizontal or vertical properties
          name === 'width' ? 1 : 0,

          val = 0;

  var sides = ['Top', 'Right', 'Bottom', 'Left'];
  
  for ( ; i < 4; i += 2 ) {
    var side = sides[i];
    // dump('side', side);

    // both box models exclude margin, so add it if we want it
    if ( extra === 'margin' ) {
      var marg = parseFloat(styles[extra + side]);
      if (!isNaN(marg)) {
        val += marg;
      }
    }
    // dump('val1', val);

    if ( isBorderBox ) {
      // border-box includes padding, so remove it if we want content
      if ( extra === 'content' ) {
        var padd = parseFloat(styles['padding' + side]);
        if (!isNaN(padd)) {
          val -= padd;
          // dump('val2', val);
        }
      }

      // at this point, extra isn't border nor margin, so remove border
      if ( extra !== 'margin' ) {
        var bordermarg = parseFloat(styles['border' + side + 'Width']);
        if (!isNaN(bordermarg)) {
          val -= bordermarg;
          // dump('val3', val);
        }
      }
    }
    else {
      // at this point, extra isn't content, so add padding
      var nocontentPad = parseFloat(styles['padding' + side]);
      if (!isNaN(nocontentPad)) {
        val += nocontentPad;
        // dump('val4', val);
      }

      // at this point, extra isn't content nor padding, so add border
      if ( extra !== 'padding') {
        var nocontentnopad = parseFloat(styles['border' + side + 'Width']);
        if (!isNaN(nocontentnopad)) {
          val += nocontentnopad;
          // dump('val5', val);
        }
      }
    }
  }

  // dump('augVal', val);

  return val;
}

function getWidthOrHeight( elem, name, extra ) {
  // Start with offset property, which is equivalent to the border-box value
  var valueIsBorderBox = true,
          val = name === 'width' ? elem.offsetWidth : elem.offsetHeight,
          styles = getStyles(elem),
          isBorderBox = styles['boxSizing'] === 'border-box';

  // some non-html elements return undefined for offsetWidth, so check for null/undefined
  // svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
  // MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
  if ( val <= 0 || val == null ) {
    // Fall back to computed then uncomputed css if necessary
    val = styles[name];
    if ( val < 0 || val == null ) {
      val = elem.style[ name ];
    }

    // Computed unit is not pixels. Stop here and return.
    if ( rnumnonpx.test(val) ) {
      return val;
    }

    // we need the check for style in case a browser which returns unreliable values
    // for getComputedStyle silently falls back to the reliable elem.style
    valueIsBorderBox = isBorderBox &&
            ( true || val === elem.style[ name ] ); // use 'true' instead of 'support.boxSizingReliable()'

    // Normalize "", auto, and prepare for extra
    val = parseFloat( val ) || 0;
  }

  // use the active box-sizing model to add/subtract irrelevant styles
  var ret = ( val +
    augmentWidthOrHeight(
      elem,
      name,
      extra || ( isBorderBox ? "border" : "content" ),
      valueIsBorderBox,
      styles
    )
  );

  // dump('ret', ret, val);
  return ret;
}

var uid = ['0', '0', '0'];
var uidPrefix = 'uiGrid-';

/**
 *  @ngdoc service
 *  @name ui.grid.service:GridUtil
 *  
 *  @description Grid utility functions
 */
module.service('gridUtil', ['$log', '$window', '$document', '$http', '$templateCache', '$timeout', '$injector', '$q', 'uiGridConstants',
  function ($log, $window, $document, $http, $templateCache, $timeout, $injector, $q, uiGridConstants) {
  var s = {

    getStyles: getStyles,

    /**
     * @ngdoc method
     * @name createBoundedWrapper
     * @methodOf ui.grid.service:GridUtil
     *
     * @param {object} Object to bind 'this' to
     * @param {method} Method to bind
     * @returns {Function} The wrapper that performs the binding
     *
     * @description
     * Binds given method to given object.
     *
     * By means of a wrapper, ensures that ``method`` is always bound to
     * ``object`` regardless of its calling environment.
     * Iow, inside ``method``, ``this`` always points to ``object``.
     *
     * See http://alistapart.com/article/getoutbindingsituations
     *
     */
    createBoundedWrapper: function(object, method) {
        return function() {
            return method.apply(object, arguments);
        };
    },


    /**
     * @ngdoc method
     * @name readableColumnName
     * @methodOf ui.grid.service:GridUtil
     *
     * @param {string} columnName Column name as a string
     * @returns {string} Column name appropriately capitalized and split apart
     *
       @example
       <example module="app">
        <file name="app.js">
          var app = angular.module('app', ['ui.grid']);

          app.controller('MainCtrl', ['$scope', 'gridUtil', function ($scope, gridUtil) {
            $scope.name = 'firstName';
            $scope.columnName = function(name) {
              return gridUtil.readableColumnName(name);
            };
          }]);
        </file>
        <file name="index.html">
          <div ng-controller="MainCtrl">
            <strong>Column name:</strong> <input ng-model="name" />
            <br>
            <strong>Output:</strong> <span ng-bind="columnName(name)"></span>
          </div>
        </file>
      </example>
     */
    readableColumnName: function (columnName) {
      // Convert underscores to spaces
      if (typeof(columnName) === 'undefined' || columnName === undefined || columnName === null) { return columnName; }

      if (typeof(columnName) !== 'string') {
        columnName = String(columnName);
      }

      return columnName.replace(/_+/g, ' ')
        // Replace a completely all-capsed word with a first-letter-capitalized version
        .replace(/^[A-Z]+$/, function (match) {
          return angular.lowercase(angular.uppercase(match.charAt(0)) + match.slice(1));
        })
        // Capitalize the first letter of words
        .replace(/(\w+)/g, function (match) {
          return angular.uppercase(match.charAt(0)) + match.slice(1);
        })
        // Put a space in between words that have partial capilizations (i.e. 'firstName' becomes 'First Name')
        // .replace(/([A-Z]|[A-Z]\w+)([A-Z])/g, "$1 $2");
        // .replace(/(\w+?|\w)([A-Z])/g, "$1 $2");
        .replace(/(\w+?(?=[A-Z]))/g, '$1 ');
    },

    /**
     * @ngdoc method
     * @name getColumnsFromData
     * @methodOf ui.grid.service:GridUtil
     * @description Return a list of column names, given a data set
     *
     * @param {string} data Data array for grid
     * @returns {Object} Column definitions with field accessor and column name
     *
     * @example
       <pre>
         var data = [
           { firstName: 'Bob', lastName: 'Jones' },
           { firstName: 'Frank', lastName: 'Smith' }
         ];

         var columnDefs = GridUtil.getColumnsFromData(data, excludeProperties);

         columnDefs == [
          {
            field: 'firstName',
            name: 'First Name'
          },
          {
            field: 'lastName',
            name: 'Last Name'
          }
         ];
       </pre>
     */
    getColumnsFromData: function (data, excludeProperties) {
      var columnDefs = [];

      if (!data || typeof(data[0]) === 'undefined' || data[0] === undefined) { return []; }
      if (angular.isUndefined(excludeProperties)) { excludeProperties = []; }

      var item = data[0];
      
      angular.forEach(item,function (prop, propName) {
        if ( excludeProperties.indexOf(propName) === -1){
          columnDefs.push({
            name: propName
          });
        }
      });

      return columnDefs;
    },

    /**
     * @ngdoc method
     * @name newId
     * @methodOf ui.grid.service:GridUtil
     * @description Return a unique ID string
     *
     * @returns {string} Unique string
     *
     * @example
       <pre>
        var id = GridUtil.newId();

        # 1387305700482;
       </pre>
     */
    newId: (function() {
      var seedId = new Date().getTime();
      return function() {
          return seedId += 1;
      };
    })(),


    /**
     * @ngdoc method
     * @name getTemplate
     * @methodOf ui.grid.service:GridUtil
     * @description Get's template from cache / element / url
     *
     * @param {string|element|promise} Either a string representing the template id, a string representing the template url,
     *   an jQuery/Angualr element, or a promise that returns the template contents to use.
     * @returns {object} a promise resolving to template contents
     *
     * @example
     <pre>
     GridUtil.getTemplate(url).then(function (contents) {
          alert(contents);
        })
     </pre>
     */
    getTemplate: function (template) {
      // Try to fetch the template out of the templateCache
      if ($templateCache.get(template)) {
        return $q.when($templateCache.get(template));
      }

      // See if the template is itself a promise
      if (template.hasOwnProperty('then')) {
        return template;
      }

      // If the template is an element, return the element
      try {
        if (angular.element(template).length > 0) {
          return $q.when(template);
        }
      }
      catch (err){
        //do nothing; not valid html
      }

      $log.debug('Fetching url', template);

      // Default to trying to fetch the template as a url with $http
      return $http({ method: 'GET', url: template})
        .then(
          function (result) {
            var templateHtml = result.data.trim();
            //put in templateCache for next call
            $templateCache.put(template, templateHtml);
            return templateHtml;
          },
          function (err) {
            throw new Error("Could not get template " + template + ": " + err);
          }
        );
    },

    /**
     * @ngdoc method
     * @name guessType
     * @methodOf ui.grid.service:GridUtil
     * @description guesses the type of an argument
     *
     * @param {string/number/bool/object} item variable to examine
     * @returns {string} one of the following
     * 'string'
     * 'boolean'
     * 'number'
     * 'date'
     * 'object'
     */
    guessType : function (item) {
      var itemType = typeof(item);

      // Check for numbers and booleans
      switch (itemType) {
        case "number":
        case "boolean":
        case "string":
          return itemType;
        default:
          if (angular.isDate(item)) {
            return "date";
          }
          return "object";
      }
    },


  /**
    * @ngdoc method
    * @name elementWidth
    * @methodOf ui.grid.service:GridUtil
    *
    * @param {element} element DOM element
    * @param {string} [extra] Optional modifier for calculation. Use 'margin' to account for margins on element
    *
    * @returns {number} Element width in pixels, accounting for any borders, etc.
    */
    elementWidth: function (elem) {
      
    },

    /**
    * @ngdoc method
    * @name elementHeight
    * @methodOf ui.grid.service:GridUtil
    *
    * @param {element} element DOM element
    * @param {string} [extra] Optional modifier for calculation. Use 'margin' to account for margins on element
    *
    * @returns {number} Element height in pixels, accounting for any borders, etc.
    */
    elementHeight: function (elem) {
      
    },

    // Thanks to http://stackoverflow.com/a/13382873/888165
    getScrollbarWidth: function() {
        var outer = document.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

        document.body.appendChild(outer);

        var widthNoScroll = outer.offsetWidth;
        // force scrollbars
        outer.style.overflow = "scroll";

        // add innerdiv
        var inner = document.createElement("div");
        inner.style.width = "100%";
        outer.appendChild(inner);        

        var widthWithScroll = inner.offsetWidth;

        // remove divs
        outer.parentNode.removeChild(outer);

        return widthNoScroll - widthWithScroll;
    },

    swap: function( elem, options, callback, args ) {
      var ret, name,
              old = {};

      // Remember the old values, and insert the new ones
      for ( name in options ) {
        old[ name ] = elem.style[ name ];
        elem.style[ name ] = options[ name ];
      }

      ret = callback.apply( elem, args || [] );

      // Revert the old values
      for ( name in options ) {
        elem.style[ name ] = old[ name ];
      }

      return ret;
    },

    fakeElement: function( elem, options, callback, args ) {
      var ret, name,
          newElement = angular.element(elem).clone()[0];

      for ( name in options ) {
        newElement.style[ name ] = options[ name ];
      }

      angular.element(document.body).append(newElement);

      ret = callback.call( newElement, newElement );

      angular.element(newElement).remove();

      return ret;
    },

    /**
    * @ngdoc method
    * @name normalizeWheelEvent
    * @methodOf ui.grid.service:GridUtil
    *
    * @param {event} event A mouse wheel event
    *
    * @returns {event} A normalized event
    *
    * @description
    * Given an event from this list:
    *
    * `wheel, mousewheel, DomMouseScroll, MozMousePixelScroll`
    *
    * "normalize" it
    * so that it stays consistent no matter what browser it comes from (i.e. scale it correctly and make sure the direction is right.)
    */
    normalizeWheelEvent: function (event) {
      // var toFix = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'];
      // var toBind = 'onwheel' in document || document.documentMode >= 9 ? ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'];
      var lowestDelta, lowestDeltaXY;
      
      var orgEvent   = event || window.event,
          args       = [].slice.call(arguments, 1),
          delta      = 0,
          deltaX     = 0,
          deltaY     = 0,
          absDelta   = 0,
          absDeltaXY = 0,
          fn;

      // event = $.event.fix(orgEvent);
      // event.type = 'mousewheel';

      // NOTE: jQuery masks the event and stores it in the event as originalEvent
      if (orgEvent.originalEvent) {
        orgEvent = orgEvent.originalEvent;
      }

      // Old school scrollwheel delta
      if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta; }
      if ( orgEvent.detail )     { delta = orgEvent.detail * -1; }

      // At a minimum, setup the deltaY to be delta
      deltaY = delta;

      // Firefox < 17 related to DOMMouseScroll event
      if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
          deltaY = 0;
          deltaX = delta * -1;
      }

      // New school wheel delta (wheel event)
      if ( orgEvent.deltaY ) {
          deltaY = orgEvent.deltaY * -1;
          delta  = deltaY;
      }
      if ( orgEvent.deltaX ) {
          deltaX = orgEvent.deltaX;
          delta  = deltaX * -1;
      }

      // Webkit
      if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY; }
      if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = orgEvent.wheelDeltaX; }

      // Look for lowest delta to normalize the delta values
      absDelta = Math.abs(delta);
      if ( !lowestDelta || absDelta < lowestDelta ) { lowestDelta = absDelta; }
      absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
      if ( !lowestDeltaXY || absDeltaXY < lowestDeltaXY ) { lowestDeltaXY = absDeltaXY; }

      // Get a whole value for the deltas
      fn     = delta > 0 ? 'floor' : 'ceil';
      delta  = Math[fn](delta  / lowestDelta);
      deltaX = Math[fn](deltaX / lowestDeltaXY);
      deltaY = Math[fn](deltaY / lowestDeltaXY);

      return {
        delta: delta,
        deltaX: deltaX,
        deltaY: deltaY
      };
    },

    // Stolen from Modernizr
    // TODO: make this, and everythign that flows from it, robust
    //http://www.stucox.com/blog/you-cant-detect-a-touchscreen/
    isTouchEnabled: function() {
      var bool;

      if (('ontouchstart' in $window) || $window.DocumentTouch && $document instanceof DocumentTouch) {
        bool = true;
      }

      return bool;
    },

    isNullOrUndefined: function(obj) {
      if (obj === undefined || obj === null) {
        return true;
      }
      return false;
    },

    endsWith: function(str, suffix) {
      if (!str || !suffix || typeof str !== "string") {
        return false;
      }
      return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },

    // Shim requestAnimationFrame
    requestAnimationFrame: $window.requestAnimationFrame && $window.requestAnimationFrame.bind($window) ||
                           $window.webkitRequestAnimationFrame && $window.webkitRequestAnimationFrame.bind($window) ||
                           function(fn) {
                             return $timeout(fn, 10, false);
                           },

    numericAndNullSort: function (a, b) {
      if (a === null) { return 1; }
      if (b === null) { return -1; }
      if (a === null && b === null) { return 0; }
      return a - b;
    },

    // Disable ngAnimate animations on an element
    disableAnimations: function (element) {
      var $animate;
      try {
        $animate = $injector.get('$animate');
        $animate.enabled(false, element);
      }
      catch (e) {}
    },

    enableAnimations: function (element) {
      var $animate;
      try {
        $animate = $injector.get('$animate');
        $animate.enabled(true, element);
      }
      catch (e) {}
    },

    // Blatantly stolen from Angular as it isn't exposed (yet. 2.0 maybe?)
    nextUid: function nextUid() {
      var index = uid.length;
      var digit;

      while (index) {
        index--;
        digit = uid[index].charCodeAt(0);
        if (digit === 57 /*'9'*/) {
          uid[index] = 'A';
          return uidPrefix + uid.join('');
        }
        if (digit === 90  /*'Z'*/) {
          uid[index] = '0';
        } else {
          uid[index] = String.fromCharCode(digit + 1);
          return uidPrefix + uid.join('');
        }
      }
      uid.unshift('0');

      return uidPrefix + uid.join('');
    },

    // Blatantly stolen from Angular as it isn't exposed (yet. 2.0 maybe?)
    hashKey: function hashKey(obj) {
      var objType = typeof obj,
          key;

      if (objType === 'object' && obj !== null) {
        if (typeof (key = obj.$$hashKey) === 'function') {
          // must invoke on object to keep the right this
          key = obj.$$hashKey();
        }
        else if (typeof(obj.$$hashKey) !== 'undefined' && obj.$$hashKey) {
          key = obj.$$hashKey;
        }
        else if (key === undefined) {
          key = obj.$$hashKey = s.nextUid();
        }
      }
      else {
        key = obj;
      }

      return objType + ':' + key;
    }

    // setHashKey: function setHashKey(obj, h) {
    //   if (h) {
    //     obj.$$hashKey = h;
    //   }
    //   else {
    //     delete obj.$$hashKey;
    //   }
    // }
  };

  ['width', 'height'].forEach(function (name) {
    var capsName = angular.uppercase(name.charAt(0)) + name.substr(1);
    s['element' + capsName] = function (elem, extra) {
      var e = elem;
      if (typeof(e.length) !== 'undefined' && e.length) {
        e = elem[0];
      }

      if (e) {
        var styles = getStyles(e);
        return e.offsetWidth === 0 && rdisplayswap.test(styles.display) ?
                  s.fakeElement(e, cssShow, function(newElm) {
                    return getWidthOrHeight( newElm, name, extra );
                  }) :
                  getWidthOrHeight( e, name, extra );
      }
      else {
        return null;
      }
    };

    s['outerElement' + capsName] = function (elem, margin) {
      return elem ? s['element' + capsName].call(this, elem, margin ? 'margin' : 'border') : null;
    };
  });

  // http://stackoverflow.com/a/24107550/888165
  s.closestElm = function closestElm(el, selector) {
    if (typeof(el.length) !== 'undefined' && el.length) {
      el = el[0];
    }

    var matchesFn;

    // find vendor prefix
    ['matches','webkitMatchesSelector','mozMatchesSelector','msMatchesSelector','oMatchesSelector'].some(function(fn) {
        if (typeof document.body[fn] === 'function') {
            matchesFn = fn;
            return true;
        }
        return false;
    });

    // traverse parents
    var parent;
    while (el !== null) {
      parent = el.parentElement;
      if (parent !== null && parent[matchesFn](selector)) {
          return parent;
      }
      el = parent;
    }

    return null;
  };

  s.type = function (obj) {
    var text = Function.prototype.toString.call(obj.constructor);
    return text.match(/function (.*?)\(/)[1];
  };

  s.getBorderSize = function getBorderSize(elem, borderType) {
    if (typeof(elem.length) !== 'undefined' && elem.length) {
      elem = elem[0];
    }

    var styles = getStyles(elem);

    if (borderType) {
      borderType = 'border-' + borderType;
    }
    else {
      borderType = 'border';
    }

    var val = parseInt(styles[borderType], 10);

    if (isNaN(val)) {
      return 0;
    }
    else {
      return val;
    }
  };

  // http://stackoverflow.com/a/22948274/888165
  // TODO: Opera? Mobile?
  s.detectBrowser = function detectBrowser() {
    var userAgent = $window.navigator.userAgent;

    var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer|trident\//i};

    for (var key in browsers) {
      if (browsers[key].test(userAgent)) {
        return key;
      }
    }

    return 'unknown';
  };

  /**
    * @ngdoc method
    * @name normalizeScrollLeft
    * @methodOf ui.grid.service:GridUtil
    *
    * @param {element} element The element to get the `scrollLeft` from.
    *
    * @returns {int} A normalized scrollLeft value for the current browser.
    *
    * @description
    * Browsers currently handle RTL in different ways, resulting in inconsistent scrollLeft values. This method normalizes them
    */
  s.normalizeScrollLeft = function normalizeScrollLeft(element) {
    if (typeof(element.length) !== 'undefined' && element.length) {
      element = element[0];
    }

    var browser = s.detectBrowser();

    var scrollLeft = element.scrollLeft;

    var dir = angular.element(element).css('direction');

    // IE stays normal in RTL
    if (browser === 'ie') {
      return scrollLeft;
    }
    // Chrome doesn't alter the scrollLeft value. So with RTL on a 400px-wide grid, the right-most position will still be 400 and the left-most will still be 0;
    else if (browser === 'chrome') {
      if (dir === 'rtl') {
        // Get the max scroll for the element
        var maxScrollLeft = element.scrollWidth - element.clientWidth;

        // Subtract the current scroll amount from the max scroll
        return maxScrollLeft - scrollLeft;
      }
      else {
        return scrollLeft;
      }
    }
    // Firefox goes negative!
    else if (browser === 'firefox') {
      return Math.abs(scrollLeft);
    }
    else {
      // TODO(c0bra): Handle other browsers? Android? iOS? Opera?
      return scrollLeft;
    }
  };

  /**
  * @ngdoc method
  * @name normalizeScrollLeft
  * @methodOf ui.grid.service:GridUtil
  *
  * @param {element} element The element to normalize the `scrollLeft` value for
  * @param {int} scrollLeft The `scrollLeft` value to denormalize.
  *
  * @returns {int} A normalized scrollLeft value for the current browser.
  *
  * @description
  * Browsers currently handle RTL in different ways, resulting in inconsistent scrollLeft values. This method denormalizes a value for the current browser.
  */
  s.denormalizeScrollLeft = function denormalizeScrollLeft(element, scrollLeft) {
    if (typeof(element.length) !== 'undefined' && element.length) {
      element = element[0];
    }

    var browser = s.detectBrowser();

    var dir = angular.element(element).css('direction');

    // IE stays normal in RTL
    if (browser === 'ie') {
      return scrollLeft;
    }
    // Chrome doesn't alter the scrollLeft value. So with RTL on a 400px-wide grid, the right-most position will still be 400 and the left-most will still be 0;
    else if (browser === 'chrome') {
      if (dir === 'rtl') {
        // Get the max scroll for the element
        var maxScrollLeft = element.scrollWidth - element.clientWidth;

        // Subtract the current scroll amount from the max scroll
        return maxScrollLeft - scrollLeft;
      }
      else {
        return scrollLeft;
      }
    }
    // Firefox goes negative!
    else if (browser === 'firefox') {
      if (dir === 'rtl') {
        return scrollLeft * -1;
      }
      else {
        return scrollLeft;
      }
    }
    else {
      // TODO(c0bra): Handle other browsers? Android? iOS? Opera?
      return scrollLeft;
    }
  };

    /**
     * @ngdoc method
     * @name preEval
     * @methodOf ui.grid.service:GridUtil
     *
     * @param {string} path Path to evaluate
     *
     * @returns {string} A path that is normalized.
     *
     * @description
     * Takes a field path and converts it to bracket notation to allow for special characters in path
     * @example
     * <pre>
     * gridUtil.preEval('property') == 'property'
     * gridUtil.preEval('nested.deep.prop-erty') = "nested['deep']['prop-erty']"
     * </pre>
     */
  s.preEval = function (path) {
    var m = uiGridConstants.BRACKET_REGEXP.exec(path);
    if (m) {
      return (m[1] ? s.preEval(m[1]) : m[1]) + m[2] + (m[3] ? s.preEval(m[3]) : m[3]);
    } else {
      path = path.replace(uiGridConstants.APOS_REGEXP, '\\\'');
      var parts = path.split(uiGridConstants.DOT_REGEXP);
      var preparsed = [parts.shift()];    // first item must be var notation, thus skip
      angular.forEach(parts, function (part) {
        preparsed.push(part.replace(uiGridConstants.FUNC_REGEXP, '\']$1'));
      });
      return preparsed.join('[\'');
    }
  };

  /**
   * @ngdoc method
   * @name debounce
   * @methodOf ui.grid.service:GridUtil
   *
   * @param {function} func function to debounce
   * @param {number} wait milliseconds to delay
   * @param {bool} immediate execute before delay
   *
   * @returns {function} A function that can be executed as debounced function
   *
   * @description
   * Copied from https://github.com/shahata/angular-debounce
   * Takes a function, decorates it to execute only 1 time after multiple calls, and returns the decorated function
   * @example
   * <pre>
   * var debouncedFunc =  gridUtil.debounce(function(){alert('debounced');}, 500);
   * debouncedFunc();
   * debouncedFunc();
   * debouncedFunc();
   * </pre>
   */
  s.debounce =  function (func, wait, immediate) {
    var timeout, args, context, result;
    function debounce() {
      /* jshint validthis:true */
      context = this;
      args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      if (timeout) {
        $timeout.cancel(timeout);
      }
      timeout = $timeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
      }
      return result;
    }
    debounce.cancel = function () {
      $timeout.cancel(timeout);
      timeout = null;
    };
    return debounce;
  };

  return s;
}]);

// Add 'px' to the end of a number string if it doesn't have it already
module.filter('px', function() {
  return function(str) {
    if (str.match(/^[\d\.]+$/)) {
      return str + 'px';
    }
    else {
      return str;
    }
  };
});

})();

(function(){
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('da', {
          aggregate:{
            label: 'artikler'
          },
          groupPanel:{
            description: 'Grupér rækker udfra en kolonne ved at trække dens overskift hertil.'
          },
          search:{
            placeholder: 'Søg...',
            showingItems: 'Viste rækker:',
            selectedItems: 'Valgte rækker:',
            totalItems: 'Rækker totalt:',
            size: 'Side størrelse:',
            first: 'Første side',
            next: 'Næste side',
            previous: 'Forrige side',
            last: 'Sidste side'
          },
          menu:{
            text: 'Vælg kolonner:',
          },
          column: {
            hide: 'Skjul kolonne'
          }
        });
      return $delegate;
    }]);
  }]);
})();
(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('de', {
        aggregate: {
          label: 'eintrag'
        },
        groupPanel: {
          description: 'Ziehen Sie eine Spaltenüberschrift hierhin um nach dieser Spalte zu gruppieren.'
        },
        search: {
          placeholder: 'Suche...',
          showingItems: 'Zeige Einträge:',
          selectedItems: 'Ausgewählte Einträge:',
          totalItems: 'Einträge gesamt:',
          size: 'Einträge pro Seite:',
          first: 'Erste Seite',
          next: 'Nächste Seite',
          previous: 'Vorherige Seite',
          last: 'Letzte Seite'
        },
        menu: {
          text: 'Spalten auswählen:'
        },
        column: {
          hide: 'Spalte ausblenden'
        }
      });
      return $delegate;
    }]);
}]);
})();
(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('en', {
        aggregate: {
          label: 'items'
        },
        groupPanel: {
          description: 'Drag a column header here and drop it to group by that column.'
        },
        search: {
          placeholder: 'Search...',
          showingItems: 'Showing Items:',
          selectedItems: 'Selected Items:',
          totalItems: 'Total Items:',
          size: 'Page Size:',
          first: 'First Page',
          next: 'Next Page',
          previous: 'Previous Page',
          last: 'Last Page'
        },
        menu: {
          text: 'Choose Columns:'
        },
        sort: {
          ascending: 'Sort Ascending',
          descending: 'Sort Descending',
          remove: 'Remove Sort'
        },
        column: {
          hide: 'Hide Column'
        }
      });
      return $delegate;
    }]);
  }]);
})();
(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('es', {
        aggregate: {
          label: 'Artículos'
        },
        groupPanel: {
          description: 'Arrastre un encabezado de columna aquí y soltarlo para agrupar por esa columna.'
        },
        search: {
          placeholder: 'Buscar...',
          showingItems: 'Artículos Mostrando:',
          selectedItems: 'Artículos Seleccionados:',
          totalItems: 'Artículos Totales:',
          size: 'Tamaño de Página:',
          first: 'Primera Página',
          next: 'Página Siguiente',
          previous: 'Página Anterior',
          last: 'Última Página'
        },
        menu: {
          text: 'Elegir columnas:'
        },
        column: {
          hide: 'Ocultar la columna'
        }
      });
      return $delegate;
    }]);
}]);
})();
(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('fa', {
        aggregate: {
          label: 'موردها'
        },
        groupPanel: {
          description: 'یک عنوان ستون اینجا را بردار و به گروهی از آن ستون بیانداز.'
        },
        search: {
          placeholder: 'جستجو...',
          showingItems: 'نمایش موردها:',
          selectedItems: 'موردهای انتخاب\u200cشده:',
          totalItems: 'همهٔ موردها:',
          size: 'اندازهٔ صفحه:',
          first: 'صفحهٔ اول',
          next: 'صفحهٔ بعد',
          previous: 'صفحهٔ قبل',
          last: 'آخرین صفحه'
        },
        menu: {
          text: 'انتخاب ستون\u200cها:'
        },
        column: {
          hide: 'ستون پنهان کن'
        }
      });
      return $delegate;
    }]);
}]);
})();
(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('fr', {
        aggregate: {
          label: 'articles'
        },
        groupPanel: {
          description: 'Faites glisser un en-tête de colonne ici et déposez-le vers un groupe par cette colonne.'
        },
        search: {
          placeholder: 'Recherche...',
          showingItems: 'Articles Affichage des:',
          selectedItems: 'Éléments Articles:',
          totalItems: 'Nombre total d\'articles:',
          size: 'Taille de page:',
          first: 'Première page',
          next: 'Page Suivante',
          previous: 'Page précédente',
          last: 'Dernière page'
        },
        menu: {
          text: 'Choisir des colonnes:'
        },
        column: {
          hide: 'Colonne de peau'
        }
      });
      return $delegate;
    }]);
}]);
})();
(function () {
    angular.module('ui.grid').config(['$provide', function ($provide) {
        $provide.decorator('i18nService', ['$delegate', function ($delegate) {
            $delegate.add('he', {
                aggregate: {
                    label: 'items'
                },
                groupPanel: {
                    description: 'גרור עמודה לכאן ושחרר בכדי לקבץ עמודה זו.'
                },
                search: {
                    placeholder: 'חפש...',
                    showingItems: 'מציג:',
                    selectedItems: 'סה"כ נבחרו:',
                    totalItems: 'סה"כ רשומות:',
                    size: 'תוצאות בדף:',
                    first: 'דף ראשון',
                    next: 'דף הבא',
                    previous: 'דף קודם',
                    last: 'דף אחרון'
                },
                menu: {
                    text: 'בחר עמודות:'
                },
                sort: {
                    ascending: 'סדר עולה',
                    descending: 'סדר יורד',
                    remove: 'בטל'
                },
                column: {
                  hide: 'טור הסתר'
                }
            });
            return $delegate;
        }]);
    }]);
})();
(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('nl', {
        aggregate: {
          label: 'items'
        },
        groupPanel: {
          description: 'Sleep hier een kolomnaam heen om op te groeperen.'
        },
        search: {
          placeholder: 'Zoeken...',
          showingItems: 'Getoonde items:',
          selectedItems: 'Geselecteerde items:',
          totalItems: 'Totaal aantal items:',
          size: 'Items per pagina:',
          first: 'Eerste pagina',
          next: 'Volgende pagina',
          previous: 'Vorige pagina',
          last: 'Laatste pagina'
        },
        menu: {
          text: 'Kies kolommen:'
        },
        sort: {
          ascending: 'Sorteer oplopend',
          descending: 'Sorteer aflopend',
          remove: 'Verwijder sortering'
        },
        column: {
          hide: 'Kolom te verbergen'
        }
      });
      return $delegate;
    }]);
  }]);
})();
(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('pt-br', {
        aggregate: {
          label: 'itens'
        },
        groupPanel: {
          description: 'Arraste e solte uma coluna aqui para agrupar por essa coluna'
        },
        search: {
          placeholder: 'Procurar...',
          showingItems: 'Mostrando os Itens:',
          selectedItems: 'Items Selecionados:',
          totalItems: 'Total de Itens:',
          size: 'Tamanho da Página:',
          first: 'Primeira Página',
          next: 'Próxima Página',
          previous: 'Página Anterior',
          last: 'Última Página'
        },
        menu: {
          text: 'Selecione as colunas:'
        },
        column: {
          hide: 'Esconder coluna'
        }
      });
      return $delegate;
    }]);
}]);
})();
(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('ru', {
        aggregate: {
          label: 'элементы'
        },
        groupPanel: {
          description: 'Для группировки по столбцу перетащите сюда его название.'
        },
        search: {
          placeholder: 'Поиск...',
          showingItems: 'Показать элементы:',
          selectedItems: 'Выбранные элементы:',
          totalItems: 'Всего элементов:',
          size: 'Размер страницы:',
          first: 'Первая страница',
          next: 'Следующая страница',
          previous: 'Предыдущая страница',
          last: 'Последняя страница'
        },
        menu: {
          text: 'Выбрать столбцы:'
        },
        sort: {
          ascending: 'По возрастанию',
          descending: 'По убыванию',
          remove: 'Убрать сортировку'
        },
        column: {
          hide: 'спрятать столбец'
        }
      });
      return $delegate;
    }]);
  }]);
})();
(function () {
angular.module('ui.grid').config(['$provide', function($provide) {
$provide.decorator('i18nService', ['$delegate', function($delegate) {
$delegate.add('sk', {
aggregate: {
label: 'items'
},
groupPanel: {
description: 'Pretiahni sem názov stĺpca pre zoskupenie podľa toho stĺpca.'
},
search: {
placeholder: 'Hľadaj...',
showingItems: 'Zobrazujem položky:',
selectedItems: 'Vybraté položky:',
totalItems: 'Počet položiek:',
size: 'Počet:',
first: 'Prvá strana',
next: 'Ďalšia strana',
previous: 'Predchádzajúca strana',
last: 'Posledná strana'
},
menu: {
text: 'Vyberte stĺpce:'
},
sort: {
ascending: 'Zotriediť vzostupne',
descending: 'Zotriediť zostupne',
remove: 'Vymazať triedenie'
}
});
return $delegate;
}]);
}]);
})();

/**
 * @ngdoc overview
 * @name ui.grid.i18n
 * @description
 *
 *  # ui.grid.i18n
 * This module provides i18n functions to ui.grid and any application that wants to use it

 *
 * <div doc-module-components="ui.grid.i18n"></div>
 */

(function () {
  var DIRECTIVE_ALIASES = ['uiT', 'uiTranslate'];
  var FILTER_ALIASES = ['t', 'uiTranslate'];

  var module = angular.module('ui.grid.i18n');


  /**
   *  @ngdoc object
   *  @name ui.grid.i18n.constant:i18nConstants
   *
   *  @description constants available in i18n module
   */
  module.constant('i18nConstants', {
    MISSING: '[MISSING]',
    UPDATE_EVENT: '$uiI18n',

    LOCALE_DIRECTIVE_ALIAS: 'uiI18n',
    // default to english
    DEFAULT_LANG: 'en'
  });

//    module.config(['$provide', function($provide) {
//        $provide.decorator('i18nService', ['$delegate', function($delegate) {}])}]);

  /**
   *  @ngdoc service
   *  @name ui.grid.i18n.service:i18nService
   *
   *  @description Services for i18n
   */
  module.service('i18nService', ['$log', 'i18nConstants', '$rootScope',
    function ($log, i18nConstants, $rootScope) {

      var langCache = {
        _langs: {},
        current: null,
        get: function (lang) {
          return this._langs[lang.toLowerCase()];
        },
        add: function (lang, strings) {
          var lower = lang.toLowerCase();
          if (!this._langs[lower]) {
            this._langs[lower] = {};
          }
          angular.extend(this._langs[lower], strings);
        },
        getAllLangs: function () {
          var langs = [];
          if (!this._langs) {
            return langs;
          }

          for (var key in this._langs) {
            langs.push(key);
          }

          return langs;
        },
        setCurrent: function (lang) {
          this.current = lang.toLowerCase();
        },
        getCurrentLang: function () {
          return this.current;
        }
      };

      var service = {

        /**
         * @ngdoc service
         * @name add
         * @methodOf ui.grid.i18n.service:i18nService
         * @description  Adds the languages and strings to the cache. Decorate this service to
         * add more translation strings
         * @param {string} lang language to add
         * @param {object} stringMaps of strings to add grouped by property names
         * @example
         * <pre>
         *      i18nService.add('en', {
         *         aggregate: {
         *                 label1: 'items',
         *                 label2: 'some more items'
         *                 }
         *         },
         *         groupPanel: {
         *              description: 'Drag a column header here and drop it to group by that column.'
         *           }
         *      }
         * </pre>
         */
        add: function (langs, stringMaps) {
          if (typeof(langs) === 'object') {
            angular.forEach(langs, function (lang) {
              if (lang) {
                langCache.add(lang, stringMaps);
              }
            });
          } else {
            langCache.add(langs, stringMaps);
          }
        },

        /**
         * @ngdoc service
         * @name getAllLangs
         * @methodOf ui.grid.i18n.service:i18nService
         * @description  return all currently loaded languages
         * @returns {array} string
         */
        getAllLangs: function () {
          return langCache.getAllLangs();
        },

        /**
         * @ngdoc service
         * @name get
         * @methodOf ui.grid.i18n.service:i18nService
         * @description  return all currently loaded languages
         * @param {string} lang to return.  If not specified, returns current language
         * @returns {object} the translation string maps for the language
         */
        get: function (lang) {
          var language = lang ? lang : service.getCurrentLang();
          return langCache.get(language);
        },

        /**
         * @ngdoc service
         * @name getSafeText
         * @methodOf ui.grid.i18n.service:i18nService
         * @description  returns the text specified in the path or a Missing text if text is not found
         * @param {string} path property path to use for retrieving text from string map
         * @param {string} lang to return.  If not specified, returns current language
         * @returns {object} the translation for the path
         * @example
         * <pre>
         * i18nService.getSafeText('sort.ascending')
         * </pre>
         */
        getSafeText: function (path, lang) {
          var language = lang ? lang : service.getCurrentLang();
          var trans = langCache.get(language);

          if (!trans) {
            return i18nConstants.MISSING;
          }

          var paths = path.split('.');
          var current = trans;

          for (var i = 0; i < paths.length; ++i) {
            if (current[paths[i]] === undefined || current[paths[i]] === null) {
              return i18nConstants.MISSING;
            } else {
              current = current[paths[i]];
            }
          }

          return current;

        },

        /**
         * @ngdoc service
         * @name setCurrentLang
         * @methodOf ui.grid.i18n.service:i18nService
         * @description sets the current language to use in the application
         * $broadcasts the Update_Event on the $rootScope
         * @param {string} lang to set
         * @example
         * <pre>
         * i18nService.setCurrentLang('fr');
         * </pre>
         */

        setCurrentLang: function (lang) {
          if (lang) {
            langCache.setCurrent(lang);
            $rootScope.$broadcast(i18nConstants.UPDATE_EVENT);
          }
        },

        /**
         * @ngdoc service
         * @name getCurrentLang
         * @methodOf ui.grid.i18n.service:i18nService
         * @description returns the current language used in the application
         */
        getCurrentLang: function () {
          var lang = langCache.getCurrentLang();
          if (!lang) {
            lang = i18nConstants.DEFAULT_LANG;
            langCache.setCurrent(lang);
          }
          return lang;
        }

      };

      return service;

    }]);

  var localeDirective = function (i18nService, i18nConstants) {
    return {
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs) {
            var alias = i18nConstants.LOCALE_DIRECTIVE_ALIAS;
            // check for watchable property
            var lang = $scope.$eval($attrs[alias]);
            if (lang) {
              $scope.$watch($attrs[alias], function () {
                i18nService.setCurrentLang(lang);
              });
            } else if ($attrs.$$observers) {
              $attrs.$observe(alias, function () {
                i18nService.setCurrentLang($attrs[alias] || i18nConstants.DEFAULT_LANG);
              });
            }
          }
        };
      }
    };
  };

  module.directive('uiI18n', ['i18nService', 'i18nConstants', localeDirective]);

  // directive syntax
  var uitDirective = function ($parse, i18nService, i18nConstants) {
    return {
      restrict: 'EA',
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs) {
            var alias1 = DIRECTIVE_ALIASES[0],
              alias2 = DIRECTIVE_ALIASES[1];
            var token = $attrs[alias1] || $attrs[alias2] || $elm.html();
            var missing = i18nConstants.MISSING + token;
            var observer;
            if ($attrs.$$observers) {
              var prop = $attrs[alias1] ? alias1 : alias2;
              observer = $attrs.$observe(prop, function (result) {
                if (result) {
                  $elm.html($parse(result)(i18nService.getCurrentLang()) || missing);
                }
              });
            }
            var getter = $parse(token);
            var listener = $scope.$on(i18nConstants.UPDATE_EVENT, function (evt) {
              if (observer) {
                observer($attrs[alias1] || $attrs[alias2]);
              } else {
                // set text based on i18n current language
                $elm.html(getter(i18nService.get()) || missing);
              }
            });
            $scope.$on('$destroy', listener);

            $elm.html(getter(i18nService.get()) || missing);
          }
        };
      }
    };
  };

  DIRECTIVE_ALIASES.forEach(function (alias) {
    module.directive(alias, ['$parse', 'i18nService', 'i18nConstants', uitDirective]);
  });

  // optional filter syntax
  var uitFilter = function ($parse, i18nService, i18nConstants) {
    return function (data) {
      var getter = $parse(data);
      // set text based on i18n current language
      return getter(i18nService.get()) || i18nConstants.MISSING + data;
    };
  };

  FILTER_ALIASES.forEach(function (alias) {
    module.filter(alias, ['$parse', 'i18nService', 'i18nConstants', uitFilter]);
  });

})();
(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('zh-cn', {
        aggregate: {
          label: '条目'
        },
        groupPanel: {
          description: '拖曳表头到此处以进行分组'
        },
        search: {
          placeholder: '搜索...',
          showingItems: '当前显示条目：',
          selectedItems: '选中条目：',
          totalItems: '条目总数：',
          size: '每页显示数：',
          first: '回到首页',
          next: '下一页',
          previous: '上一页',
          last: '前往尾页'
        },
        menu: {
          text: '数据分组与选择列：'
        },
        column: {
          hide: '隐藏列'
        }
      });
      return $delegate;
    }]);
}]);
})();

(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('zh-tw', {
        aggregate: {
          label: '筆'
        },
        groupPanel: {
          description: '拖拉表頭到此處以進行分組'
        },
        search: {
          placeholder: '搜尋...',
          showingItems: '目前顯示筆數：',
          selectedItems: '選取筆數：',
          totalItems: '總筆數：',
          size: '每頁顯示：',
          first: '第一頁',
          next: '下一頁',
          previous: '上一頁',
          last: '最後頁'
        },
        menu: {
          text: '選擇欄位：'
        },
        column: {
          hide: '隐藏列'
        }
      });
      return $delegate;
    }]);
}]);
})();
(function() {
  'use strict';
  /**
   *  @ngdoc overview
   *  @name ui.grid.autoResize
   *
   *  @description 
   *
   *  #ui.grid.autoResize
   *  This module provides auto-resizing functionality to ui-grid
   *
   */
  var module = angular.module('ui.grid.autoResize', ['ui.grid']);
  

  module.directive('uiGridAutoResize', ['$log', '$timeout', 'gridUtil', function ($log, $timeout, gridUtil) {
    return {
      require: 'uiGrid',
      scope: false,
      link: function ($scope, $elm, $attrs, uiGridCtrl) {
        var prevGridWidth, prevGridHeight;

        function getDimensions() {
          prevGridHeight = gridUtil.elementHeight($elm);
          prevGridWidth = gridUtil.elementWidth($elm);
        }

        // Initialize the dimensions
        getDimensions();

        var canceler;
        function startTimeout() {
          $timeout.cancel(canceler);

          canceler = $timeout(function () {
            var newGridHeight = gridUtil.elementHeight($elm);
            var newGridWidth = gridUtil.elementWidth($elm);

            if (newGridHeight !== prevGridHeight || newGridWidth !== prevGridWidth) {
              uiGridCtrl.grid.gridHeight = newGridHeight;
              uiGridCtrl.grid.gridWidth = newGridWidth;

              uiGridCtrl.grid.queueRefresh()
                .then(function () {
                  getDimensions();

                  startTimeout();
                });
            }
            else {
              startTimeout();
            }
          }, 250);
        }

        startTimeout();

        $scope.$on('$destroy', function() {
          $timeout.cancel(canceler);
        });
      }
    };
  }]);
})();
(function () {
  'use strict';
  var module = angular.module('ui.grid.cellNav', ['ui.grid']);

  function RowCol(row, col) {
    this.row = row;
    this.col = col;
  }

  /**
   *  @ngdoc object
   *  @name ui.grid.cellNav.constant:uiGridCellNavConstants
   *
   *  @description constants available in cellNav
   */
  module.constant('uiGridCellNavConstants', {
    FEATURE_NAME : 'gridCellNav',
    CELL_NAV_EVENT: 'cellNav',
    direction: {LEFT: 0, RIGHT: 1, UP: 2, DOWN: 3}
  });

  /**
   *  @ngdoc service
   *  @name ui.grid.cellNav.service:uiGridCellNavService
   *
   *  @description Services for cell navigation features. If you don't like the key maps we use,
   *  or the direction cells navigation, override with a service decorator (see angular docs)
   */
  module.service('uiGridCellNavService', ['$log', 'uiGridConstants', 'uiGridCellNavConstants', '$q',
    function ($log, uiGridConstants, uiGridCellNavConstants, $q) {

      var service = {

        initializeGrid: function (grid) {
          grid.registerColumnBuilder(service.cellNavColumnBuilder);

          //create variables for state
          grid.cellNav = {};
          grid.cellNav.lastRowCol = null;

          /**
           *  @ngdoc object
           *  @name ui.grid.cellNav.api:PublicApi
           *
           *  @description Public Api for cellNav feature
           */
          var publicApi = {
            events: {
              cellNav : {
                /**
                 * @ngdoc event
                 * @name navigate
                 * @eventOf  ui.grid.cellNav.api:PublicApi
                 * @description raised when the active cell is changed
                 * <pre>
                 *      gridApi.cellNav.on.navigate(scope,function(newRowcol, oldRowCol){})
                 * </pre>
                 * @param {object} newRowCol new position
                 * @param {object} oldRowCol old position
                 */
                navigate : function(newRowCol, oldRowCol){}
              }
            },
            methods: {
              cellNav: {
                /**
                 * @ngdoc function
                 * @name scrollTo
                 * @methodOf  ui.grid.cellNav.api:PublicApi
                 * @description brings the specified row and column into view
                 * @param {Grid} grid the grid you'd like to act upon, usually available
                 * from gridApi.grid
                 * @param {object} $scope a scope we can broadcast events from
                 * @param {object} rowEntity gridOptions.data[] array instance to make visible
                 * @param {object} colDef to make visible
                 */
                scrollTo: function (grid, $scope, rowEntity, colDef) {
                  service.scrollTo(grid, $scope, rowEntity, colDef);
                },
                /**
                 * @ngdoc function
                 * @name getFocusedCell
                 * @methodOf  ui.grid.cellNav.api:PublicApi
                 * @description returns the current (or last if Grid does not have focus) focused row and column
                 * <br> value is null if no selection has occurred
                 */
                getFocusedCell: function () {
                  return grid.cellNav.lastRowCol;
                }
              }
            }
          };

          grid.api.registerEventsFromObject(publicApi.events);

          grid.api.registerMethodsFromObject(publicApi.methods);

        },


        /**
         * @ngdoc service
         * @name getDirection
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @description  determines which direction to for a given keyDown event
         * @returns {uiGridCellNavConstants.direction} direction
         */
        getDirection: function (evt) {
          if (evt.keyCode === uiGridConstants.keymap.LEFT ||
            (evt.keyCode === uiGridConstants.keymap.TAB && evt.shiftKey)) {
            return uiGridCellNavConstants.direction.LEFT;
          }
          if (evt.keyCode === uiGridConstants.keymap.RIGHT ||
            evt.keyCode === uiGridConstants.keymap.TAB) {
            return uiGridCellNavConstants.direction.RIGHT;
          }

          if (evt.keyCode === uiGridConstants.keymap.UP ||
            (evt.keyCode === uiGridConstants.keymap.ENTER && evt.shiftKey)) {
            return uiGridCellNavConstants.direction.UP;
          }

          if (evt.keyCode === uiGridConstants.keymap.DOWN ||
            evt.keyCode === uiGridConstants.keymap.ENTER) {
            return uiGridCellNavConstants.direction.DOWN;
          }

          return null;
        },

        /**
         * @ngdoc service
         * @name getNextRowCol
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @description  returns the next row and column for a given direction
         * columns that are not focusable are skipped
         * @param {object} direction navigation direction
         * @param {Grid} grid current grid
         * @param {GridRow} curRow Gridrow
         * @param {GridCol} curCol Gridcol
         * @returns {uiGridCellNavConstants.direction} rowCol object
         */
        getNextRowCol: function (direction, grid, curRow, curCol) {
          switch (direction) {
            case uiGridCellNavConstants.direction.LEFT:
              return service.getRowColLeft(grid.rows, grid.columns, curRow, curCol);
            case uiGridCellNavConstants.direction.RIGHT:
              return service.getRowColRight(grid.rows, grid.columns, curRow, curCol);
            case uiGridCellNavConstants.direction.UP:
              return service.getRowColUp(grid.rows, grid.columns, curRow, curCol);
            case uiGridCellNavConstants.direction.DOWN:
              return service.getRowColDown(grid.rows, grid.columns, curRow, curCol);
          }
        },

        getRowColLeft: function (rows, cols, curRow, curCol) {
          var colIndex = service.getNextColIndexLeft(cols, curCol);

          if (colIndex > curCol.index) {
            if (curRow.index === 0) {
              return new RowCol(curRow, cols[colIndex]); //return same row
            }
            else {
              //up one row and far right column
              return new RowCol(rows[curRow.index - 1], cols[colIndex]);
            }
          }
          else {
            return new RowCol(curRow, cols[colIndex]);
          }
        },

        getRowColRight: function (rows, cols, curRow, curCol) {
          var colIndex = service.getNextColIndexRight(cols, curCol);

          if (colIndex < curCol.index) {
            if (curRow.index === rows.length - 1) {
              return new RowCol(curRow, cols[colIndex]); //return same row
            }
            else {
              //down one row and far left column
              return new RowCol(rows[curRow.index + 1], cols[colIndex]);
            }
          }
          else {
            return new RowCol(curRow, cols[colIndex]);
          }
        },

        getNextColIndexLeft: function (cols, curCol) {
          //start with next col to the left or the end of the array if curCol is the first col
          var i = curCol.index === 0 ? cols.length - 1 : curCol.index - 1;

          //find first focusable column to the left
          //circle around to the end of the array if no col is found
          while (i !== curCol.index) {
            if (cols[i].colDef.allowCellFocus) {
              break;
            }
            i--;
            //go to end of array if at the beginning
            if (i === -1) {
              i = cols.length - 1;
            }
          }

          return i;
        },

        getNextColIndexRight: function (cols, curCol) {
          //start with next col to the right or the beginning of the array if curCol is the last col
          var i = curCol.index === cols.length - 1 ? 0 : curCol.index + 1;

          //find first focusable column to the right
          //circle around to the beginning of the array if no col is found
          while (i !== curCol.index) {
            if (cols[i].colDef.allowCellFocus) {
              break;
            }
            i++;
            //go to end of array if at the beginning
            if (i > cols.length - 1) {
              i = 0;
            }
          }

          return i;
        },

        getRowColUp: function (rows, cols, curRow, curCol) {
          //if curCol is not focusable, then we need to find a focusable column to the right
          //this shouldn't ever happen in the grid, but we handle it anyway
          var colIndex = curCol.colDef.allowCellFocus ? curCol.index : service.getNextColIndexRight(cols, curCol);


          if (curRow.index === 0) {
            return new RowCol(curRow, cols[colIndex]); //return same row
          }
          else {
            //up one row
            return new RowCol(rows[curRow.index - 1], cols[colIndex]);
          }
        },

        getRowColDown: function (rows, cols, curRow, curCol) {
          //if curCol is not focusable, then we need to find a focusable column to the right
          //this shouldn't ever happen in the grid, but we handle it anyway
          var colIndex = curCol.colDef.allowCellFocus ? curCol.index : service.getNextColIndexRight(cols, curCol);


          if (curRow.index === rows.length - 1) {
            return new RowCol(curRow, cols[colIndex]); //return same row
          }
          else {
            //down one row
            return new RowCol(rows[curRow.index + 1], cols[colIndex]);
          }
        },

        /**
         * @ngdoc service
         * @name cellNavColumnBuilder
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @description columnBuilder function that adds cell navigation properties to grid column
         * @returns {promise} promise that will load any needed templates when resolved
         */
        cellNavColumnBuilder: function (colDef, col, gridOptions) {
          var promises = [];

          /**
           *  @ngdoc object
           *  @name ui.grid.cellNav.api:ColumnDef
           *
           *  @description Column Definitions for cellNav feature, these are available to be 
           *  set using the ui-grid {@link ui.grid.class:GridOptions.columnDef gridOptions.columnDefs}
           */

          /**
           *  @ngdoc object
           *  @name allowCellFocus
           *  @propertyOf  ui.grid.cellNav.api:ColumnDef
           *  @description Enable focus on a cell.  
           *  <br/>Defaults to true
           */
          colDef.allowCellFocus = colDef.allowCellFocus === undefined ? true : colDef.allowCellFocus ;

          return $q.all(promises);
        },
        
        /**
         * @ngdoc method
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @name scrollVerticallyTo
         * @description Scroll the grid vertically such that the specified
         * row is in view
         * @param {Grid} grid the grid you'd like to act upon, usually available
         * from gridApi.grid
         * @param {object} $scope a scope we can broadcast events from
         * @param {object} rowEntity gridOptions.data[] array instance to make visible
         * @param {object} colDef to make visible
         */
        scrollTo: function (grid, $scope, rowEntity, colDef) {
          var args = {};
          
          if ( rowEntity !== null ){
            var row = grid.getRow(rowEntity);
            if ( row ) { 
              args.y = { percentage: row.index / grid.renderContainers.body.visibleRowCache.length }; 
            }
          }
          
          if ( colDef !== null ){
            var col = grid.getColumn(colDef.name ? colDef.name : colDef.field);
            if ( col ) {
              args.x = { percentage: this.getLeftWidth(grid, col.index) / this.getLeftWidth(grid, grid.renderContainers.body.visibleColumnCache.length - 1) };              
            }
          }
          
          if ( args.y || args.x ){
            $scope.$broadcast(uiGridConstants.events.GRID_SCROLL, args);
          }
        },
        

        /**
         * @ngdoc method
         * @methodOf ui.grid.cellNav.service:uiGridCellNavService
         * @name getLeftWidth
         * @description Get the current drawn width of the columns in the 
         * grid up to and including the numbered column
         * @param {Grid} grid the grid you'd like to act upon, usually available
         * from gridApi.grid
         * @param {object} colIndex the column to total up to and including
         */
        getLeftWidth: function( grid, colIndex ){
          var width = 0;
          
          if ( !colIndex ){ return; }
          
          for ( var i=0; i <= colIndex; i++ ){
            if ( grid.renderContainers.body.visibleColumnCache[i].drawnWidth ){
              width += grid.renderContainers.body.visibleColumnCache[i].drawnWidth;
            } 
          }
          return width;
        }

      };

      return service;
    }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.cellNav.directive:uiCellNav
   *  @element div
   *  @restrict EA
   *
   *  @description Adds cell navigation features to the grid columns
   *
   *  @example
   <example module="app">
   <file name="app.js">
   var app = angular.module('app', ['ui.grid', 'ui.grid.cellNav']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
      $scope.data = [
        { name: 'Bob', title: 'CEO' },
            { name: 'Frank', title: 'Lowly Developer' }
      ];

      $scope.columnDefs = [
        {name: 'name'},
        {name: 'title'}
      ];
    }]);
   </file>
   <file name="index.html">
   <div ng-controller="MainCtrl">
   <div ui-grid="{ data: data, columnDefs: columnDefs }" ui-grid-cellnav></div>
   </div>
   </file>
   </example>
   */
  module.directive('uiGridCellnav', ['$log', 'uiGridCellNavService', 'uiGridCellNavConstants',
    function ($log, uiGridCellNavService, uiGridCellNavConstants) {
      return {
        replace: true,
        priority: -150,
        require: '^uiGrid',
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {

              var grid = uiGridCtrl.grid;
              uiGridCellNavService.initializeGrid(grid);

              uiGridCtrl.cellNav = {};

              //  $log.debug('uiGridEdit preLink');
              uiGridCtrl.cellNav.broadcastCellNav = function (newRowCol) {
                $scope.$broadcast(uiGridCellNavConstants.CELL_NAV_EVENT, newRowCol);
                uiGridCtrl.cellNav.broadcastFocus(newRowCol.row, newRowCol.col);
              };

              uiGridCtrl.cellNav.broadcastFocus = function (row, col) {
                if (grid.cellNav.lastRowCol === null || (grid.cellNav.lastRowCol.row !== row || grid.cellNav.lastRowCol.col !== col)) {
                  var newRowCol = new RowCol(row, col);
                  grid.api.cellNav.raise.navigate(newRowCol, grid.cellNav.lastRowCol);
                  grid.cellNav.lastRowCol = newRowCol;
                }
              };

            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
            }
          };
        }
      };
    }]);


  /**
   *  @ngdoc directive
   *  @name ui.grid.cellNav.directive:uiGridCell
   *  @element div
   *  @restrict A
   *  @description Stacks on top of ui.grid.uiGridCell to provide cell navigation
   */
  module.directive('uiGridCell', ['uiGridCellNavService', '$log', 'uiGridCellNavConstants',
    function (uiGridCellNavService, $log, uiGridCellNavConstants) {
      return {
        priority: -150, // run after default uiGridCell directive and ui.grid.edit uiGridCell
        restrict: 'A',
        require: '^uiGrid',
        scope: false,
        link: function ($scope, $elm, $attrs, uiGridCtrl) {
          if (!$scope.col.colDef.allowCellFocus) {
             return;
          }

          setTabEnabled();

          $elm.on('keydown', function (evt) {
            var direction = uiGridCellNavService.getDirection(evt);
            if (direction === null) {
              return true;
            }

            var rowCol = uiGridCellNavService.getNextRowCol(direction, $scope.grid, $scope.row, $scope.col);

            //$log.debug('next row ' + rowCol.row.index + ' next Col ' + rowCol.col.colDef.name);
            uiGridCtrl.cellNav.broadcastCellNav(rowCol);
            setTabEnabled();

            return false;
          });

          $elm.find('div').on('focus', function (evt) {
            uiGridCtrl.cellNav.broadcastFocus($scope.row, $scope.col);
          });

          $scope.$on(uiGridCellNavConstants.CELL_NAV_EVENT, function(evt,rowCol){
             if (rowCol.row === $scope.row &&
               rowCol.col === $scope.col){
               // $log.debug('Setting focus on Row ' + rowCol.row.index + ' Col ' + rowCol.col.colDef.name);
                setFocused();
             }
          });

          function setTabEnabled(){
            $elm.find('div').attr("tabindex", -1);
          }

          function setFocused(){
            var div = $elm.find('div');
            div[0].focus();
            div.attr("tabindex", 0);
          }

        }
      };
    }]);

})();
(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name ui.grid.edit
   * @description
   *
   *  # ui.grid.edit
   * This module provides cell editing capability to ui.grid. The goal was to emulate keying data in a spreadsheet via
   * a keyboard.
   * <br/>
   * <br/>
   * To really get the full spreadsheet-like data entry, the ui.grid.cellNav module should be used. This will allow the
   * user to key data and then tab, arrow, or enter to the cells beside or below.
   *
   * <div doc-module-components="ui.grid.edit"></div>
   */

  var module = angular.module('ui.grid.edit', ['ui.grid']);

  /**
   *  @ngdoc object
   *  @name ui.grid.edit.constant:uiGridEditConstants
   *
   *  @description constants available in edit module
   */
  module.constant('uiGridEditConstants', {
    EDITABLE_CELL_TEMPLATE: /EDITABLE_CELL_TEMPLATE/g,
    //must be lowercase because template bulder converts to lower
    EDITABLE_CELL_DIRECTIVE: /editable_cell_directive/g,
    events: {
      BEGIN_CELL_EDIT: 'uiGridEventBeginCellEdit',
      END_CELL_EDIT: 'uiGridEventEndCellEdit',
      CANCEL_CELL_EDIT: 'uiGridEventCancelCellEdit'
    }
  });

  /**
   *  @ngdoc service
   *  @name ui.grid.edit.service:uiGridEditService
   *
   *  @description Services for editing features
   */
  module.service('uiGridEditService', ['$log', '$q', '$templateCache', 'uiGridConstants', 'gridUtil',
    function ($log, $q, $templateCache, uiGridConstants, gridUtil) {

      var service = {

        initializeGrid: function (grid) {

          service.defaultGridOptions(grid.options);

          grid.registerColumnBuilder(service.editColumnBuilder);

          /**
           *  @ngdoc object
           *  @name ui.grid.edit.api:PublicApi
           *
           *  @description Public Api for edit feature
           */
          var publicApi = {
            events: {
              edit: {
                /**
                 * @ngdoc event
                 * @name afterCellEdit
                 * @eventOf  ui.grid.edit.api:PublicApi
                 * @description raised when cell editing is complete
                 * <pre>
                 *      gridApi.edit.on.afterCellEdit(scope,function(rowEntity, colDef){})
                 * </pre>
                 * @param {object} rowEntity the options.data element that was edited
                 * @param {object} colDef the column that was edited
                 * @param {object} newValue new value
                 * @param {object} oldValue old value
                 */
                afterCellEdit: function (rowEntity, colDef, newValue, oldValue) {
                },
                /**
                 * @ngdoc event
                 * @name beginCellEdit
                 * @eventOf  ui.grid.edit.api:PublicApi
                 * @description raised when cell editing starts on a cell
                 * <pre>
                 *      gridApi.edit.on.beginCellEdit(scope,function(rowEntity, colDef){})
                 * </pre>
                 * @param {object} rowEntity the options.data element that was edited
                 * @param {object} colDef the column that was edited
                 */
                beginCellEdit: function (rowEntity, colDef) {
                },
                /**
                 * @ngdoc event
                 * @name cancelCellEdit
                 * @eventOf  ui.grid.edit.api:PublicApi
                 * @description raised when cell editing is cancelled on a cell
                 * <pre>
                 *      gridApi.edit.on.cancelCellEdit(scope,function(rowEntity, colDef){})
                 * </pre>
                 * @param {object} rowEntity the options.data element that was edited
                 * @param {object} colDef the column that was edited
                 */
                cancelCellEdit: function (rowEntity, colDef) {
                }                
              }
            },
            methods: {
              edit: { }
            }
          };

          grid.api.registerEventsFromObject(publicApi.events);
          //grid.api.registerMethodsFromObject(publicApi.methods);

        },

        defaultGridOptions: function (gridOptions) {

          /**
           *  @ngdoc object
           *  @name ui.grid.edit.api:GridOptions
           *
           *  @description Options for configuring the edit feature, these are available to be  
           *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
           */

          /**
           *  @ngdoc object
           *  @name enableCellEdit
           *  @propertyOf  ui.grid.edit.api:GridOptions
           *  @description If defined, sets the default value for the editable flag on each individual colDefs 
           *  if their individual enableCellEdit configuration is not defined. Defaults to undefined.  
           */

          /**
           *  @ngdoc object
           *  @name cellEditableCondition
           *  @propertyOf  ui.grid.edit.api:GridOptions
           *  @description If specified, either a value or function to be used by all columns before editing.  
           *  If falsy, then editing of cell is not allowed.
           *  @example
           *  <pre>
           *  function($scope){
           *    //use $scope.row.entity and $scope.col.colDef to determine if editing is allowed
           *    return true;
           *  }
           *  </pre>
           */
          gridOptions.cellEditableCondition = gridOptions.cellEditableCondition === undefined ? true : gridOptions.cellEditableCondition;

          /**
           *  @ngdoc object
           *  @name editableCellTemplate
           *  @propertyOf  ui.grid.edit.api:GridOptions
           *  @description If specified, cellTemplate to use as the editor for all columns.  
           *  <br/> defaults to 'ui-grid/cellTextEditor'
           */

          /**
           *  @ngdoc object
           *  @name enableCellEditOnFocus
           *  @propertyOf  ui.grid.edit.api:GridOptions
           *  @description If true, then editor is invoked as soon as cell receives focus. Default false.
           *  <br/>_requires cellNav feature and the edit feature to be enabled_
           */
            //enableCellEditOnFocus can only be used if cellnav module is used
          gridOptions.enableCellEditOnFocus = gridOptions.enableCellEditOnFocus === undefined ?
            false: gridOptions.enableCellEditOnFocus;
        },

        /**
         * @ngdoc service
         * @name editColumnBuilder
         * @methodOf ui.grid.edit.service:uiGridEditService
         * @description columnBuilder function that adds edit properties to grid column
         * @returns {promise} promise that will load any needed templates when resolved
         */
        editColumnBuilder: function (colDef, col, gridOptions) {

          var promises = [];

          /**
           *  @ngdoc object
           *  @name ui.grid.edit.api:ColumnDef
           *
           *  @description Column Definition for edit feature, these are available to be 
           *  set using the ui-grid {@link ui.grid.class:GridOptions.columnDef gridOptions.columnDefs}
           */

          /**
           *  @ngdoc object
           *  @name enableCellEdit
           *  @propertyOf  ui.grid.edit.api:ColumnDef
           *  @description enable editing on column
           */
          colDef.enableCellEdit = colDef.enableCellEdit === undefined ? (gridOptions.enableCellEdit === undefined ?
            (colDef.type !== 'object'):gridOptions.enableCellEdit) : colDef.enableCellEdit;

          /**
           *  @ngdoc object
           *  @name cellEditableCondition
           *  @propertyOf  ui.grid.edit.api:ColumnDef
           *  @description If specified, either a value or function evaluated before editing cell.  If falsy, then editing of cell is not allowed.
           *  @example 
           *  <pre>
           *  function($scope){
           *    //use $scope.row.entity and $scope.col.colDef to determine if editing is allowed
           *    return true;
           *  }
           *  </pre>
           */
          colDef.cellEditableCondition = colDef.cellEditableCondition === undefined ? gridOptions.cellEditableCondition :  colDef.cellEditableCondition;

          /**
           *  @ngdoc object
           *  @name editableCellTemplate
           *  @propertyOf  ui.grid.edit.api:ColumnDef
           *  @description cell template to be used when editing this column. Can be Url or text template
           *  <br/>Defaults to gridOptions.editableCellTemplate
           */
          if (colDef.enableCellEdit) {
            colDef.editableCellTemplate = colDef.editableCellTemplate || gridOptions.editableCellTemplate || 'ui-grid/cellEditor';

            promises.push(gridUtil.getTemplate(colDef.editableCellTemplate)
              .then(
              function (template) {
                col.editableCellTemplate = template;
              },
              function (res) {
                // Todo handle response error here?
                throw new Error("Couldn't fetch/use colDef.editableCellTemplate '" + colDef.editableCellTemplate + "'");
              }));
          }

          /**
           *  @ngdoc object
           *  @name enableCellEditOnFocus
           *  @propertyOf  ui.grid.edit.api:ColumnDef
           *  @requires ui.grid.cellNav
           *  @description If true, then editor is invoked as soon as cell receives focus. Default false.
           *  <br>_requires both the cellNav feature and the edit feature to be enabled_
           */
            //enableCellEditOnFocus can only be used if cellnav module is used
          colDef.enableCellEditOnFocus = colDef.enableCellEditOnFocus === undefined ? gridOptions.enableCellEditOnFocus : colDef.enableCellEditOnFocus;

          return $q.all(promises);
        },

        /**
         * @ngdoc service
         * @name isStartEditKey
         * @methodOf ui.grid.edit.service:uiGridEditService
         * @description  Determines if a keypress should start editing.  Decorate this service to override with your
         * own key events.  See service decorator in angular docs.
         * @param {Event} evt keydown event
         * @returns {boolean} true if an edit should start
         */
        isStartEditKey: function (evt) {
          if (evt.keyCode === uiGridConstants.keymap.LEFT ||
            (evt.keyCode === uiGridConstants.keymap.TAB && evt.shiftKey) ||

            evt.keyCode === uiGridConstants.keymap.RIGHT ||
            evt.keyCode === uiGridConstants.keymap.TAB ||

            evt.keyCode === uiGridConstants.keymap.UP ||
            (evt.keyCode === uiGridConstants.keymap.ENTER && evt.shiftKey) ||

            evt.keyCode === uiGridConstants.keymap.DOWN ||
            evt.keyCode === uiGridConstants.keymap.ENTER) {
            return false;

          }
          return true;
        }


      };

      return service;

    }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.edit.directive:uiGridEdit
   *  @element div
   *  @restrict A
   *
   *  @description Adds editing features to the ui-grid directive.
   *
   *  @example
   <example module="app">
   <file name="app.js">
   var app = angular.module('app', ['ui.grid', 'ui.grid.edit']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
      $scope.data = [
        { name: 'Bob', title: 'CEO' },
            { name: 'Frank', title: 'Lowly Developer' }
      ];

      $scope.columnDefs = [
        {name: 'name', enableCellEdit: true},
        {name: 'title', enableCellEdit: true}
      ];
    }]);
   </file>
   <file name="index.html">
   <div ng-controller="MainCtrl">
   <div ui-grid="{ data: data, columnDefs: columnDefs }" ui-grid-edit></div>
   </div>
   </file>
   </example>
   */
  module.directive('uiGridEdit', ['$log', 'uiGridEditService', function ($log, uiGridEditService) {
    return {
      replace: true,
      priority: 0,
      require: '^uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            uiGridEditService.initializeGrid(uiGridCtrl.grid);
          },
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
          }
        };
      }
    };
  }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.edit.directive:uiGridCell
   *  @element div
   *  @restrict A
   *
   *  @description Stacks on top of ui.grid.uiGridCell to provide in-line editing capabilities to the cell
   *  Editing Actions.
   *
   *  Binds edit start events to the uiGridCell element.  When the events fire, the gridCell element is appended
   *  with the columnDef.editableCellTemplate element ('cellEditor.html' by default).
   *
   *  The editableCellTemplate should respond to uiGridEditConstants.events.BEGIN\_CELL\_EDIT angular event
   *  and do the initial steps needed to edit the cell (setfocus on input element, etc).
   *
   *  When the editableCellTemplate recognizes that the editing is ended (blur event, Enter key, etc.)
   *  it should emit the uiGridEditConstants.events.END\_CELL\_EDIT event.
   *
   *  If editableCellTemplate recognizes that the editing has been cancelled (esc key)
   *  it should emit the uiGridEditConstants.events.CANCEL\_CELL\_EDIT event.  The original value
   *  will be set back on the model by the uiGridCell directive.
   *
   *  Events that invoke editing:
   *    - dblclick
   *    - F2 keydown (when using cell selection)
   *
   *  Events that end editing:
   *    - Dependent on the specific editableCellTemplate
   *    - Standards should be blur and enter keydown
   *
   *  Events that cancel editing:
   *    - Dependent on the specific editableCellTemplate
   *    - Standards should be Esc keydown
   *
   *  Grid Events that end editing:
   *    - uiGridConstants.events.GRID_SCROLL
   *
   */
  module.directive('uiGridCell',
    ['$compile', 'uiGridConstants', 'uiGridEditConstants', '$log', '$parse', 'uiGridEditService',
      function ($compile, uiGridConstants, uiGridEditConstants, $log, $parse, uiGridEditService) {
        return {
          priority: -100, // run after default uiGridCell directive
          restrict: 'A',
          scope: false,
          link: function ($scope, $elm, $attrs) {
            if (!$scope.col.colDef.enableCellEdit) {
              return;
            }

            var html;
            var origCellValue;
            var inEdit = false;
            var isFocusedBeforeEdit = false;
            var cellModel;

            registerBeginEditEvents();

            function registerBeginEditEvents() {
              $elm.on('dblclick', beginEdit);
              $elm.on('keydown', beginEditKeyDown);
              if ($scope.col.colDef.enableCellEditOnFocus) {
                $elm.find('div').on('focus', beginEditFocus);
              }
            }

            function cancelBeginEditEvents() {
              $elm.off('dblclick', beginEdit);
              $elm.off('keydown', beginEditKeyDown);
              if ($scope.col.colDef.enableCellEditOnFocus) {
                $elm.find('div').off('focus', beginEditFocus);
              }
            }

            function beginEditFocus(evt) {
              evt.stopPropagation();
              beginEdit();
            }

            function beginEditKeyDown(evt) {
              if (uiGridEditService.isStartEditKey(evt)) {
                beginEdit();
              }
            }

            function shouldEdit(col, row) {
              return !row.isSaving && 
                ( angular.isFunction(col.colDef.cellEditableCondition) ?
                    col.colDef.cellEditableCondition($scope) :
                    col.colDef.cellEditableCondition );
            }


            /**
             *  @ngdoc property
             *  @name editDropdownOptionsArray
             *  @propertyOf ui.grid.edit.api:ColumnDef
             *  @description an array of values in the format
             *  [ {id: xxx, value: xxx} ], which is populated
             *  into the edit dropdown
             * 
             */
            /**
             *  @ngdoc property
             *  @name editDropdownIdLabel
             *  @propertyOf ui.grid.edit.api:ColumnDef
             *  @description the label for the "id" field
             *  in the editDropdownOptionsArray.  Defaults
             *  to 'id'
             *  @example
             *  <pre>
             *    $scope.gridOptions = { 
             *      columnDefs: [
             *        {name: 'status', editableCellTemplate: 'ui-grid/dropdownEditor', 
             *          editDropdownOptionsArray: [{code: 1, status: 'active'}, {code: 2, status: 'inactive'}],
             *          editDropdownIdLabel: 'code', editDropdownValueLabel: 'status' }
             *      ],
             *  </pre>
             * 
             */
            /**
             *  @ngdoc property
             *  @name editDropdownValueLabel
             *  @propertyOf ui.grid.edit.api:ColumnDef
             *  @description the label for the "value" field
             *  in the editDropdownOptionsArray.  Defaults
             *  to 'value'
             *  @example
             *  <pre>
             *    $scope.gridOptions = { 
             *      columnDefs: [
             *        {name: 'status', editableCellTemplate: 'ui-grid/dropdownEditor', 
             *          editDropdownOptionsArray: [{code: 1, status: 'active'}, {code: 2, status: 'inactive'}],
             *          editDropdownIdLabel: 'code', editDropdownValueLabel: 'status' }
             *      ],
             *  </pre>
             * 
             */
            /**
             *  @ngdoc property
             *  @name editDropdownFilter
             *  @propertyOf ui.grid.edit.api:ColumnDef
             *  @description A filter that you would like to apply to the values in the options list
             *  of the dropdown.  For example if you were using angular-translate you might set this
             *  to `'translate'`
             *  @example
             *  <pre>
             *    $scope.gridOptions = { 
             *      columnDefs: [
             *        {name: 'status', editableCellTemplate: 'ui-grid/dropdownEditor', 
             *          editDropdownOptionsArray: [{code: 1, status: 'active'}, {code: 2, status: 'inactive'}],
             *          editDropdownIdLabel: 'code', editDropdownValueLabel: 'status', editDropdownFilter: 'translate' }
             *      ],
             *  </pre>
             * 
             */
            function beginEdit() {
              if (!shouldEdit($scope.col, $scope.row)) {
                return;
              }

              cellModel = $parse($scope.row.getQualifiedColField($scope.col));
              //get original value from the cell
              origCellValue = cellModel($scope);

              html = $scope.col.editableCellTemplate;
              html = html.replace(uiGridConstants.COL_FIELD, $scope.row.getQualifiedColField($scope.col));
              
              var optionFilter = $scope.col.colDef.editDropdownFilter ? '|' + $scope.col.colDef.editDropdownFilter : ''; 
              html = html.replace(uiGridConstants.CUSTOM_FILTERS, optionFilter);

              $scope.inputType = 'text';
              switch ($scope.col.colDef.type){
                case 'boolean':
                  $scope.inputType = 'checkbox';
                  break;
                case 'number':
                  $scope.inputType = 'number';
                  break;
                case 'date':
                  $scope.inputType = 'date';
                  break;
              }
              
              $scope.editDropdownOptionsArray = $scope.col.colDef.editDropdownOptionsArray;
              $scope.editDropdownIdLabel = $scope.col.colDef.editDropdownIdLabel ? $scope.col.colDef.editDropdownIdLabel : 'id';  
              $scope.editDropdownValueLabel = $scope.col.colDef.editDropdownValueLabel ? $scope.col.colDef.editDropdownValueLabel : 'value';  

              var cellElement;
              $scope.$apply(function () {
                  inEdit = true;
                  cancelBeginEditEvents();
                  cellElement = $compile(html)($scope.$new());
                  var gridCellContentsEl = angular.element($elm.children()[0]);
                  isFocusedBeforeEdit = gridCellContentsEl.hasClass(':focus');
                  gridCellContentsEl.addClass('ui-grid-cell-contents-hidden');
                  $elm.append(cellElement);
                }
              );

              //stop editing when grid is scrolled
              var deregOnGridScroll = $scope.$on(uiGridConstants.events.GRID_SCROLL, function () {
                endEdit(true);
                $scope.grid.api.edit.raise.afterCellEdit($scope.row.entity, $scope.col.colDef, cellModel($scope), origCellValue);
                deregOnGridScroll();
              });

              //end editing
              var deregOnEndCellEdit = $scope.$on(uiGridEditConstants.events.END_CELL_EDIT, function (evt, retainFocus) {
                endEdit(retainFocus);
                $scope.grid.api.edit.raise.afterCellEdit($scope.row.entity, $scope.col.colDef, cellModel($scope), origCellValue);
                deregOnEndCellEdit();
              });

              //cancel editing
              var deregOnCancelCellEdit = $scope.$on(uiGridEditConstants.events.CANCEL_CELL_EDIT, function () {
                cancelEdit();
                deregOnCancelCellEdit();
              });

              $scope.$broadcast(uiGridEditConstants.events.BEGIN_CELL_EDIT);
              $scope.grid.api.edit.raise.beginCellEdit($scope.row.entity, $scope.col.colDef);
            }

            function endEdit(retainFocus) {
              if (!inEdit) {
                return;
              }
              var gridCellContentsEl = angular.element($elm.children()[0]);
              //remove edit element
              angular.element($elm.children()[1]).remove();
              gridCellContentsEl.removeClass('ui-grid-cell-contents-hidden');
              if (retainFocus && isFocusedBeforeEdit) {
                gridCellContentsEl.focus();
              }
              isFocusedBeforeEdit = false;
              inEdit = false;
              registerBeginEditEvents();
            }

            function cancelEdit() {
              if (!inEdit) {
                return;
              }
              cellModel.assign($scope, origCellValue);
              $scope.$apply();

              $scope.grid.api.edit.raise.cancelCellEdit($scope.row.entity, $scope.col.colDef);
              endEdit(true);
            }

          }
        };
      }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.edit.directive:uiGridEditor
   *  @element div
   *  @restrict A
   *
   *  @description input editor directive for editable fields.
   *  Provides EndEdit and CancelEdit events
   *
   *  Events that end editing:
   *     blur and enter keydown
   *
   *  Events that cancel editing:
   *    - Esc keydown
   *
   */
  module.directive('uiGridEditor',
    ['uiGridConstants', 'uiGridEditConstants',
      function (uiGridConstants, uiGridEditConstants) {
        return {
          scope: true,
          compile: function () {
            return {
              pre: function ($scope, $elm, $attrs) {

              },
              post: function ($scope, $elm, $attrs) {

                //set focus at start of edit
                $scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function () {
                  $elm[0].focus();
                  $elm[0].select();
                  $elm.on('blur', function (evt) {
                    $scope.stopEdit(evt);
                  });
                });

               
               $scope.deepEdit = false;
               
               $scope.stopEdit = function (evt) {
                  if ($scope.inputForm && !$scope.inputForm.$valid) {
                    evt.stopPropagation();
                    $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                  }
                  else {
                    $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                  }
                  $scope.deepEdit = false;
                };

                $elm.on('click', function (evt) {
                  $scope.deepEdit = true;
                });

                $elm.on('keydown', function (evt) {
                  switch (evt.keyCode) {
                    case uiGridConstants.keymap.ESC:
                      evt.stopPropagation();
                      $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                      break;
                    case uiGridConstants.keymap.ENTER: // Enter (Leave Field)
                      $scope.stopEdit(evt);
                      break;
                    case uiGridConstants.keymap.TAB:
                      $scope.stopEdit(evt);
                      break;
                  }

                  if ($scope.deepEdit) {
                    switch (evt.keyCode) {
                      case uiGridConstants.keymap.LEFT:
                        evt.stopPropagation();
                        break;
                      case uiGridConstants.keymap.RIGHT:
                        evt.stopPropagation();
                        break;
                      case uiGridConstants.keymap.UP:
                        evt.stopPropagation();
                        break;
                      case uiGridConstants.keymap.DOWN:
                        evt.stopPropagation();
                        break;
                    }
                  }

                  return true;
                });
              }
            };
          }
        };
      }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.edit.directive:input
   *  @element input
   *  @restrict E
   *
   *  @description directive to provide binding between input[date] value and ng-model for angular 1.2
   *  It is similar to input[date] directive of angular 1.3
   *
   *  Supported date format for input is 'yyyy-MM-dd'
   *  The directive will set the $valid property of input element and the enclosing form to false if
   *  model is invalid date or value of input is entered wrong.
   *
   */
    module.directive('input', ['$filter', function ($filter) {
      function parseDateString(dateString) {
        if ('undefined' === typeof dateString || '' === dateString) {
          return null;
        }
        var parts = dateString.split('-');
        if (3 !== parts.length) {
          return null;
        }
        var year = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10);
        var day = parseInt(parts[2], 10);

        if (month < 1 || year < 1 || day < 1) {
          return null;
        }
        return new Date(year, (month - 1), day);
      }
      return {
        restrict: 'E',
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {

          if (angular.version.minor === 2 && attrs.type && 'date' === attrs.type && ngModel) {

            ngModel.$formatters.push(function (modelValue) {
              ngModel.$setValidity(null,(!modelValue || !isNaN(modelValue.getTime())));
              return $filter('date')(modelValue, 'yyyy-MM-dd');
            });

            ngModel.$parsers.push(function (viewValue) {
              if (viewValue && viewValue.length > 0) {
                var dateValue = parseDateString(viewValue);
                ngModel.$setValidity(null, (dateValue && !isNaN(dateValue.getTime())));
                return dateValue;
              }
              else {
                ngModel.$setValidity(null, true);
                return null;
              }
            });
          }
        }
      };
    }]);
    
    
  /**
   *  @ngdoc directive
   *  @name ui.grid.edit.directive:uiGridEditDropdown
   *  @element div
   *  @restrict A
   *
   *  @description dropdown editor for editable fields.
   *  Provides EndEdit and CancelEdit events
   *
   *  Events that end editing:
   *     blur and enter keydown, and any left/right nav
   *
   *  Events that cancel editing:
   *    - Esc keydown
   *
   */
  module.directive('uiGridEditDropdown',
    ['uiGridConstants', 'uiGridEditConstants',
      function (uiGridConstants, uiGridEditConstants) {
        return {
          scope: true,
          compile: function () {
            return {
              pre: function ($scope, $elm, $attrs) {

              },
              post: function ($scope, $elm, $attrs) {

                //set focus at start of edit
                $scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function () {
                  $elm[0].focus();
                  $elm[0].style.width = ($elm[0].parentElement.offsetWidth - 1) + 'px';
                  $elm.on('blur', function (evt) {
                    $scope.stopEdit(evt);
                  });
                });

               
                $scope.stopEdit = function (evt) {
                  // no need to validate a dropdown - invalid values shouldn't be
                  // available in the list
                  $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                };

                $elm.on('keydown', function (evt) {
                  switch (evt.keyCode) {
                    case uiGridConstants.keymap.ESC:
                      evt.stopPropagation();
                      $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                      break;
                    case uiGridConstants.keymap.ENTER: // Enter (Leave Field)
                      $scope.stopEdit(evt);
                      break;
                    case uiGridConstants.keymap.LEFT:
                      $scope.stopEdit(evt);
                      break;
                    case uiGridConstants.keymap.RIGHT:
                      $scope.stopEdit(evt);
                      break;
                    case uiGridConstants.keymap.UP:
                      evt.stopPropagation();
                      break;
                    case uiGridConstants.keymap.DOWN:
                      evt.stopPropagation();
                      break;
                    case uiGridConstants.keymap.TAB:
                      $scope.stopEdit(evt);
                      break;
                  }
                  return true;
                });
              }
            };
          }
        };
      }]);    

})();

(function () {
  'use strict';

  var module = angular.module('ui.grid.expandable', ['ui.grid']);

  module.service('uiGridExpandableService', ['gridUtil', '$log', '$compile', function (gridUtil, $log, $compile) {
    var service = {
      initializeGrid: function (grid) {
        var publicApi = {
          events: {
            expandable: {
              rowExpandedStateChanged: function (scope, row) {
              }
            }
          },
          methods: {
            expandable: {
              toggleRowExpansion: function (rowEntity) {
                var row = grid.getRow(rowEntity);
                if (row !== null) {
                  service.toggleRowExpansion(grid, row);
                }
              },
              expandAllRows: function() {
                service.expandAllRows(grid);
              },
              collapseAllRows: function() {
                service.collapseAllRows(grid);
              }
            }
          }
        };
        grid.api.registerEventsFromObject(publicApi.events);
        grid.api.registerMethodsFromObject(publicApi.methods);
      },
      toggleRowExpansion: function (grid, row) {
        row.isExpanded = !row.isExpanded;

        if (row.isExpanded) {
          row.height = row.grid.options.rowHeight + grid.options.expandable.expandableRowHeight;
        }
        else {
          row.height = row.grid.options.rowHeight;
        }

        grid.api.expandable.raise.rowExpandedStateChanged(row);
      },
      expandAllRows: function(grid, $scope) {
        angular.forEach(grid.renderContainers.body.visibleRowCache, function(row) {
          if (!row.isExpanded) {
            service.toggleRowExpansion(grid, row);
          }
        });
        grid.refresh();
      },
      collapseAllRows: function(grid) {
        angular.forEach(grid.renderContainers.body.visibleRowCache, function(row) {
          if (row.isExpanded) {
            service.toggleRowExpansion(grid, row);
          }
        });
        grid.refresh();
      }
    };
    return service;
  }]);

  module.directive('uiGridExpandable', ['$log', 'uiGridExpandableService', '$templateCache',
    function ($log, uiGridExpandableService, $templateCache) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              var expandableRowHeaderColDef = {name: 'expandableButtons', width: 40};
              expandableRowHeaderColDef.cellTemplate = $templateCache.get('ui-grid/expandableRowHeader');
              uiGridCtrl.grid.addRowHeaderColumn(expandableRowHeaderColDef);
              uiGridExpandableService.initializeGrid(uiGridCtrl.grid);
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
            }
          };
        }
      };
    }]);

  module.directive('uiGridExpandableRow',
  ['uiGridExpandableService', '$timeout', '$log', '$compile', 'uiGridConstants','gridUtil','$interval',
    function (uiGridExpandableService, $timeout, $log, $compile, uiGridConstants, gridUtil, $interval) {

      return {
        replace: false,
        priority: 0,
        scope: false,

        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              gridUtil.getTemplate($scope.grid.options.expandable.rowExpandableTemplate).then(
                function (template) {
                  var expandedRowElement = $compile(template)($scope);
                  $elm.append(expandedRowElement);
                  $scope.row.expandedRendered = true;
              });
            },

            post: function ($scope, $elm, $attrs, uiGridCtrl) {
              $scope.$on('$destroy', function() {
                $scope.row.expandedRendered = false;
              });
            }
          };
        }
      };
    }]);

  module.directive('uiGridRow',
    ['$compile', '$log', '$templateCache',
      function ($compile, $log, $templateCache) {
        return {
          priority: -200,
          scope: false,
          compile: function ($elm, $attrs) {
            return {
              pre: function ($scope, $elm, $attrs, controllers) {

                $scope.expandableRow = {};

                $scope.expandableRow.shouldRenderExpand = function () {
                  var ret = $scope.colContainer.name === 'body' &&  $scope.row.isExpanded && (!$scope.grid.isScrollingVertically || $scope.row.expandedRendered);
                  return ret;
                };

                $scope.expandableRow.shouldRenderFiller = function () {
                  var ret = $scope.row.isExpanded && ( $scope.colContainer.name !== 'body' || ($scope.grid.isScrollingVertically && !$scope.row.expandedRendered));
                  return ret;
                };

              },
              post: function ($scope, $elm, $attrs, controllers) {
              }
            };
          }
        };
      }]);

  module.directive('uiGridViewport',
    ['$compile', '$log', '$templateCache',
      function ($compile, $log, $templateCache) {
        return {
          priority: -200,
          scope: false,
          compile: function ($elm, $attrs) {
            var rowRepeatDiv = angular.element($elm.children().children()[0]);
            var expandedRowFillerElement = $templateCache.get('ui-grid/expandableScrollFiller');
            var expandedRowElement = $templateCache.get('ui-grid/expandableRow');
            rowRepeatDiv.append(expandedRowElement);
            rowRepeatDiv.append(expandedRowFillerElement);
            return {
              pre: function ($scope, $elm, $attrs, controllers) {
              },
              post: function ($scope, $elm, $attrs, controllers) {
              }
            };
          }
        };
      }]);

})();

(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name ui.grid.exporter
   * @description
   *
   *  # ui.grid.exporter
   * This module provides the ability to exporter data from the grid.  
   * 
   * Data can be exported in a range of formats, and all data, visible 
   * data, or selected rows can be exported, with all columns or visible
   * columns.
   * 
   * No UI is provided, the caller should provide their own UI/buttons 
   * as appropriate.
   * 
   * <br/>
   * <br/>
   *
   * <div doc-module-components="ui.grid.exporter"></div>
   */

  var module = angular.module('ui.grid.exporter', ['ui.grid']);

  /**
   *  @ngdoc object
   *  @name ui.grid.exporter.constant:uiGridExporterConstants
   *
   *  @description constants available in exporter module
   */
  /**
   * @ngdoc property
   * @propertyOf ui.grid.exporter.constant:uiGridExporterConstants
   * @name ALL
   * @description export all data, including data not visible.  Can
   * be set for either rowTypes or colTypes
   */
  /**
   * @ngdoc property
   * @propertyOf ui.grid.exporter.constant:uiGridExporterConstants
   * @name VISIBLE
   * @description export only visible data, including data not visible.  Can
   * be set for either rowTypes or colTypes
   */
  /**
   * @ngdoc property
   * @propertyOf ui.grid.exporter.constant:uiGridExporterConstants
   * @name SELECTED
   * @description export all data, including data not visible.  Can
   * be set only for rowTypes, selection of only some columns is 
   * not supported
   */
  module.constant('uiGridExporterConstants', {
    featureName: 'exporter',
    ALL: 'all',
    VISIBLE: 'visible',
    SELECTED: 'selected',
    CSV_CONTENT: 'CSV_CONTENT',
    LINK_LABEL: 'LINK_LABEL',
    BUTTON_LABEL: 'BUTTON_LABEL'
  });

  /**
   *  @ngdoc service
   *  @name ui.grid.exporter.service:uiGridExporterService
   *
   *  @description Services for exporter feature
   */
  module.service('uiGridExporterService', ['$log', '$q', 'uiGridExporterConstants', 'gridUtil', '$compile',
    function ($log, $q, uiGridExporterConstants, gridUtil, $compile) {

      var service = {

        initializeGrid: function (grid) {

          //add feature namespace and any properties to grid for needed state
          grid.exporter = {};
          this.defaultGridOptions(grid.options);

          /**
           *  @ngdoc object
           *  @name ui.grid.exporter.api:PublicApi
           *
           *  @description Public Api for exporter feature
           */
          var publicApi = {
            events: {
              exporter: {
              }
            },
            methods: {
              exporter: {
                /**
                 * @ngdoc function
                 * @name csvExport
                 * @methodOf  ui.grid.exporter.api:PublicApi
                 * @description Exports rows from the grid in csv format, 
                 * the data exported is selected based on the provided options
                 * @param {string} rowTypes which rows to export, valid values are
                 * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
                 * uiGridExporterConstants.SELECTED
                 * @param {string} colTypes which columns to export, valid values are
                 * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE
                 * @param {element} $elm (Optional) A UI element into which the
                 * resulting download link will be placed. 
                 */
                csvExport: function (rowTypes, colTypes, $elm) {
                  service.csvExport(grid, rowTypes, colTypes, $elm);
                },
                /**
                 * @ngdoc function
                 * @name pdfExport
                 * @methodOf  ui.grid.exporter.api:PublicApi
                 * @description Exports rows from the grid in pdf format, 
                 * the data exported is selected based on the provided options
                 * Note that this function has a dependency on pdfMake, all
                 * going well this has been installed for you.
                 * The resulting pdf opens in a new browser window.
                 * @param {string} rowTypes which rows to export, valid values are
                 * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
                 * uiGridExporterConstants.SELECTED
                 * @param {string} colTypes which columns to export, valid values are
                 * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE
                 */
                pdfExport: function (rowTypes, colTypes) {
                  service.pdfExport(grid, rowTypes, colTypes);
                }
              }
            }
          };

          grid.api.registerEventsFromObject(publicApi.events);

          grid.api.registerMethodsFromObject(publicApi.methods);

        },

        defaultGridOptions: function (gridOptions) {
          //default option to true unless it was explicitly set to false
          /**
           * @ngdoc object
           * @name ui.grid.exporter.api:GridOptions
           *
           * @description GridOptions for selection feature, these are available to be  
           * set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
           */

          /**
           * @ngdoc object
           * @name exporterSuppressButton
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description Don't show the export menu button, implying the user
           * will roll their own UI for calling the exporter
           * <br/>Defaults to false
           */
          gridOptions.exporterSuppressButton = gridOptions.exporterSuppressButton === true;
          /**
           * @ngdoc object
           * @name exporterLinkTemplate
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description A custom template to use for the resulting
           * link (for csv export)
           * <br/>Defaults to ui-grid/csvLink
           */
          gridOptions.exporterLinkTemplate = gridOptions.exporterLinkTemplate ? gridOptions.exporterLinkTemplate : 'ui-grid/csvLink';
          /**
           * @ngdoc object
           * @name exporterHeaderTemplate
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description A custom template to use for the header
           * section, containing the button and csv download link.  Not
           * needed if you've set suppressButton and are providing a custom
           * $elm into which the download link will go.
           * <br/>Defaults to ui-grid/exporterHeader
           */
          gridOptions.exporterHeaderTemplate = gridOptions.exporterHeaderTemplate ? gridOptions.exporterHeaderTemplate : 'ui-grid/exporterHeader';
          /**
           * @ngdoc object
           * @name exporterLinkLabel
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The text to show on the CSV download
           * link
           * <br/>Defaults to 'Download CSV'
           */
          gridOptions.exporterLinkLabel = gridOptions.exporterLinkLabel ? gridOptions.exporterLinkLabel : 'Download CSV';
          /**
           * @ngdoc object
           * @name exporterButtonLabel
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The text to show on the exporter menu button
           * link
           * <br/>Defaults to 'Export'
           */
          gridOptions.exporterButtonLabel = gridOptions.exporterButtonLabel ? gridOptions.exporterButtonLabel : 'Export';
          /**
           * @ngdoc object
           * @name exporterPdfDefaultStyle
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The default style in pdfMake format
           * <br/>Defaults to:
           * <pre>
           *   {
           *     fontSize: 11
           *   }
           * </pre>
           */
          gridOptions.exporterPdfDefaultStyle = gridOptions.exporterPdfDefaultStyle ? gridOptions.exporterPdfDefaultStyle : { fontSize: 11 };
          /**
           * @ngdoc object
           * @name exporterPdfTableStyle
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The table style in pdfMake format
           * <br/>Defaults to:
           * <pre>
           *   {
           *     margin: [0, 5, 0, 15]
           *   }
           * </pre>
           */
          gridOptions.exporterPdfTableStyle = gridOptions.exporterPdfTableStyle ? gridOptions.exporterPdfTableStyle : { margin: [0, 5, 0, 15] };
          /**
           * @ngdoc object
           * @name exporterPdfTableHeaderStyle
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The tableHeader style in pdfMake format
           * <br/>Defaults to:
           * <pre>
           *   {
           *     bold: true,
           *     fontSize: 12,
           *     color: 'black'
           *   }
           * </pre>
           */
          gridOptions.exporterPdfTableHeaderStyle = gridOptions.exporterPdfTableHeaderStyle ? gridOptions.exporterPdfTableHeaderStyle : { bold: true, fontSize: 12, color: 'black' };
          /**
           * @ngdoc object
           * @name exporterPdfOrientation
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The orientation, should be a valid pdfMake value,
           * 'landscape' or 'portrait'
           * <br/>Defaults to landscape
           */
          gridOptions.exporterPdfOrientation = gridOptions.exporterPdfOrientation ? gridOptions.exporterPdfOrientation : 'landscape';
          /**
           * @ngdoc object
           * @name exporterPdfPageSize
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The orientation, should be a valid pdfMake
           * paper size, usually 'A4' or 'LETTER'
           * {@link https://github.com/bpampuch/pdfmake/blob/master/src/standardPageSizes.js pdfMake page sizes}
           * <br/>Defaults to A4
           */
          gridOptions.exporterPdfPageSize = gridOptions.exporterPdfPageSize ? gridOptions.exporterPdfPageSize : 'A4';
          /**
           * @ngdoc object
           * @name exporterPdfMaxGridWidth
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description The maxium grid width - the current grid width 
           * will be scaled to match this, with any fixed width columns
           * being adjusted accordingly.
           * <br/>Defaults to 720 (for A4 landscape), use 670 for LETTER 
           */
          gridOptions.exporterPdfMaxGridWidth = gridOptions.exporterPdfMaxGridWidth ? gridOptions.exporterPdfMaxGridWidth : 720;
          /**
           * @ngdoc object
           * @name exporterPdfTableLayout
           * @propertyOf  ui.grid.exporter.api:GridOptions
           * @description A tableLayout in pdfMake format, 
           * controls gridlines and the like.  We use the default
           * layout usually.
           * <br/>Defaults to null, which means no layout 
           */

        },


        /**
         * @ngdoc function
         * @name showMenu
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Shows the grid menu with exporter content,
         * allowing the user to select export options 
         * @param {Grid} grid the grid from which data should be exported
         */
        showMenu: function ( grid ) {
          grid.exporter.$scope.menuItems = [
            {
              title: 'Export all data as csv',
              action: function ($event) {
                this.grid.api.exporter.csvExport( uiGridExporterConstants.ALL, uiGridExporterConstants.ALL );
              }
            },
            {
              title: 'Export visible data as csv',
              action: function ($event) {
                this.grid.api.exporter.csvExport( uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE );
              }
            },
            {
              title: 'Export selected data as csv',
              action: function ($event) {
                this.grid.api.exporter.csvExport( uiGridExporterConstants.SELECTED, uiGridExporterConstants.VISIBLE );
              }
            },
            {
              title: 'Export all data as pdf',
              action: function ($event) {
                this.grid.api.exporter.pdfExport( uiGridExporterConstants.ALL, uiGridExporterConstants.ALL );
              }
            },
            {
              title: 'Export visible data as pdf',
              action: function ($event) {
                this.grid.api.exporter.pdfExport( uiGridExporterConstants.VISIBLE, uiGridExporterConstants.VISIBLE );
              }
            },
            {
              title: 'Export selected data as pdf',
              action: function ($event) {
                this.grid.api.exporter.pdfExport( uiGridExporterConstants.SELECTED, uiGridExporterConstants.VISIBLE );
              }
            }
          ];
          
          grid.exporter.$scope.$broadcast('toggleExporterMenu');          
        },
        

        /**
         * @ngdoc function
         * @name csvExport
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Exports rows from the grid in csv format, 
         * the data exported is selected based on the provided options
         * @param {Grid} grid the grid from which data should be exported
         * @param {string} rowTypes which rows to export, valid values are
         * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
         * uiGridExporterConstants.SELECTED
         * @param {string} colTypes which columns to export, valid values are
         * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
         * uiGridExporterConstants.SELECTED
         * @param {element} $elm (Optional) A UI element into which the
         * resulting download link will be placed. 
         */
        csvExport: function (grid, rowTypes, colTypes, $elm) {
          var exportColumnHeaders = this.getColumnHeaders(grid, colTypes);
          var exportData = this.getData(grid, rowTypes, colTypes);
          var csvContent = this.formatAsCsv(exportColumnHeaders, exportData);
          this.renderCsvLink(grid, csvContent, $elm);
          
          // this.grid.exporter.$scope.$broadcast('clearExporterMenu');
        },
        
        
        /**
         * @ngdoc function
         * @name getColumnHeaders
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Gets the column headers from the grid to use
         * as a title row for the exported file, all headers have 
         * headerCellFilters applied as appropriate.
         * 
         * TODO: filters
         * 
         * Column headers are an array of objects, each object has
         * name, displayName, width and align attributes.  Only name is
         * used for csv, all attributes are used for pdf.
         * 
         * @param {Grid} grid the grid from which data should be exported
         * @param {string} colTypes which columns to export, valid values are
         * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
         * uiGridExporterConstants.SELECTED
         */
        getColumnHeaders: function (grid, colTypes) {
          var headers = [];
          angular.forEach(grid.columns, function( gridCol, index ) {
            if (gridCol.visible || colTypes === uiGridExporterConstants.ALL){
              headers.push({
                name: gridCol.field,
                displayName: gridCol.displayName,
                // TODO: should we do something to normalise here if too wide?
                width: gridCol.drawnWidth ? gridCol.drawnWidth : gridCol.width,
                // TODO: if/when we have an alignment attribute, use it here
                align: gridCol.colDef.type === 'number' ? 'right' : 'left'
              });
            }
          });
          
          return headers;
        },
        
        
        /**
         * @ngdoc function
         * @name getData
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Gets data from the grid based on the provided options,
         * all cells have cellFilters applied as appropriate
         * @param {Grid} grid the grid from which data should be exported
         * @param {string} rowTypes which rows to export, valid values are
         * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
         * uiGridExporterConstants.SELECTED
         * @param {string} colTypes which columns to export, valid values are
         * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
         * uiGridExporterConstants.SELECTED
         */
        getData: function (grid, rowTypes, colTypes) {
          var data = [];
          
          var rows;
          
          switch ( rowTypes ) {
            case uiGridExporterConstants.ALL:
              rows = grid.rows; 
              break;
            case uiGridExporterConstants.VISIBLE:
              rows = grid.getVisibleRows();
              break;
            case uiGridExporterConstants.SELECTED:
              if ( grid.api.selection ){
                rows = grid.api.selection.getSelectedGridRows();
              } else {
                $log.error('selection feature must be enabled to allow selected rows to be exported');
              }
              break;
          }
          
          if ( uiGridExporterConstants.ALL ) {
            angular.forEach(rows, function( row, index ) {

              var extractedRow = [];
              angular.forEach(grid.columns, function( gridCol, index ) {
                if (gridCol.visible || colTypes === uiGridExporterConstants.ALL){
                  extractedRow.push(grid.getCellValue(row, gridCol));
                }
              });
              
              data.push(extractedRow);
            });
            
            return data;
          }
        },


        /**
         * @ngdoc function
         * @name formatAsCSV
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Formats the column headers and data as a CSV, 
         * and sends that data to the user
         * @param {array} exportColumnHeaders an array of column headers, 
         * where each header is an object with name, width and maybe alignment
         * @param {array} exportData an array of rows, where each row is
         * an array of column data
         * @returns {string} csv the formatted csv as a string
         */
        formatAsCsv: function (exportColumnHeaders, exportData) {
          var self = this;
          
          var bareHeaders = exportColumnHeaders.map(function(header){return header.displayName;});
          
          var csv = self.formatRowAsCsv(this)(bareHeaders) + '\n';
          
          csv += exportData.map(this.formatRowAsCsv(this)).join('\n');
          
          return csv;
        },

        /**
         * @ngdoc function
         * @name formatRowAsCsv
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Renders a single field as a csv field, including
         * quotes around the value
         * @param {exporterService} exporter pass in exporter 
         * @param {array} row the row to be turned into a csv string
         * @returns {string} a csv-ified version of the row
         */
        formatRowAsCsv: function ( exporter ) {
          return function( row ) {
            return row.map(exporter.formatFieldAsCsv).join(',');
          };
        },
        
        /**
         * @ngdoc function
         * @name formatFieldAsCsv
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Renders a single field as a csv field, including
         * quotes around the value
         * @param {field} field the field to be turned into a csv string,
         * may be of any type
         * @returns {string} a csv-ified version of the field
         */
        formatFieldAsCsv: function (field) {
          if (field == null) { // we want to catch anything null-ish, hence just == not ===
            return '';
          }
          if (typeof(field) === 'number') {
            return field;
          }
          if (typeof(field) === 'boolean') {
            return (field ? 'TRUE' : 'FALSE') ;
          }
          if (typeof(field) === 'string') {
            return '"' + field.replace(/"/g,'""') + '"';
          }

          return JSON.stringify(field);        
        },

        /**
         * @ngdoc function
         * @name renderCsvLink
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Creates a download link with the csv content, 
         * putting it into the default exporter element, or into the element
         * passed in if provided
         * @param {Grid} grid the grid from which data should be exported
         * @param {string} csvContent the csv content that we'd like to 
         * make available as a download link
         * @param {element} $elm (Optional) A UI element into which the
         * resulting download link will be placed.  If not provided, the
         * link is put into the default exporter element. 
         */
        renderCsvLink: function (grid, csvContent, $elm) {
          var targetElm = $elm ? $elm : angular.element( grid.exporter.gridElm[0].querySelectorAll('.ui-grid-exporter-csv-link') );
          if ( angular.element( targetElm[0].querySelectorAll('.ui-grid-exporter-csv-link-span')) ) {
            angular.element( targetElm[0].querySelectorAll('.ui-grid-exporter-csv-link-span')).remove();
          }
          
          var linkTemplate = gridUtil.getTemplate(grid.options.exporterLinkTemplate)
          .then(function (contents) {
            contents = contents.replace(uiGridExporterConstants.LINK_LABEL, grid.options.exporterLinkLabel);
            contents = contents.replace(uiGridExporterConstants.CSV_CONTENT, encodeURIComponent(csvContent));
          
            var template = angular.element(contents);
            
            var newElm = $compile(template)(grid.exporter.$scope);
            targetElm.append(newElm);
          });
          
        },
        
        /**
         * @ngdoc function
         * @name pdfExport
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Exports rows from the grid in pdf format, 
         * the data exported is selected based on the provided options.
         * Note that this function has a dependency on jsPDF, which must
         * be either included as a script on your page, or downloaded and
         * served as part of your site.  The resulting pdf opens in a new
         * browser window.
         * @param {Grid} grid the grid from which data should be exported
         * @param {string} rowTypes which rows to export, valid values are
         * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
         * uiGridExporterConstants.SELECTED
         * @param {string} colTypes which columns to export, valid values are
         * uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE,
         * uiGridExporterConstants.SELECTED
         */
        pdfExport: function (grid, rowTypes, colTypes) {
          var exportColumnHeaders = this.getColumnHeaders(grid, colTypes);
          var exportData = this.getData(grid, rowTypes, colTypes);
          var docDefinition = this.prepareAsPdf(grid, exportColumnHeaders, exportData);
          
          pdfMake.createPdf(docDefinition).open();
        },
        
        
        /**
         * @ngdoc function
         * @name renderAsPdf
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Renders the data into a pdf, and opens that pdf.
         * 
         * @param {Grid} grid the grid from which data should be exported
         * @param {array} exportColumnHeaders an array of column headers, 
         * where each header is an object with name, width and maybe alignment
         * @param {array} exportData an array of rows, where each row is
         * an array of column data
         * @returns {object} a pdfMake format document definition, ready 
         * for generation
         */        
        prepareAsPdf: function(grid, exportColumnHeaders, exportData) {
          var headerWidths = this.calculatePdfHeaderWidths( grid, exportColumnHeaders );
          
          var headerColumns = exportColumnHeaders.map( function( header ) {
            return { text: header.displayName, style: 'tableHeader' }; 
          });
          
          var stringData = exportData.map(this.formatRowAsPdf(this));
          
          var allData = [headerColumns].concat(stringData);
          
          var docDefinition = {
            pageOrientation: grid.options.exporterPdfOrientation,
            content: [{
              style: 'tableStyle',
              table: {
                headerRows: 1,
                widths: headerWidths,
                body: allData 
              }
            }],
            styles: {
              tableStyle: grid.options.exporterPdfTableStyle,
              tableHeader: grid.options.exporterPdfTableHeaderStyle,
            },
            defaultStyle: grid.options.exporterPdfDefaultStyle
          };
          
          if ( grid.options.exporterPdfLayout ){
            docDefinition.layout = grid.options.exporterPdfLayout;
          }
          
          return docDefinition;
          
        },
        
                
        /**
         * @ngdoc function
         * @name calculatePdfHeaderWidths
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Determines the column widths base on the 
         * widths we got from the grid.  If the column is drawn
         * then we have a drawnWidth.  If the column is not visible
         * then we have '*', 'x%' or a width.  When columns are
         * not visible they don't contribute to the overall gridWidth,
         * so we need to adjust to allow for extra columns
         * 
         * Our basic heuristic is to take the current gridWidth, plus 
         * numeric columns and call this the base gridwidth.
         * 
         * To that we add 100 for any '*' column, and x% of the base gridWidth
         * for any column that is a %
         *  
         * @param {Grid} grid the grid from which data should be exported
         * @param {object} exportHeaders array of header information 
         * @returns {object} an array of header widths
         */
        calculatePdfHeaderWidths: function ( grid, exportHeaders ) {
          var baseGridWidth = 0;
          angular.forEach(exportHeaders, function(value){
            if (typeof(value.width) === 'number'){
              baseGridWidth += value.width;
            }
          });
          
          var extraColumns = 0;
          angular.forEach(exportHeaders, function(value){
            if (value.width === '*'){
              extraColumns += 100;
            }
            if (typeof(value.width) === 'string' && value.width.match(/(\d)*%/)) {
              var percent = parseInt(value.width.match(/(\d)*%/)[0]);
              
              value.width = baseGridWidth * percent / 100;
              extraColumns += value.width;
            }
          });
          
          var gridWidth = baseGridWidth + extraColumns;
          
          return exportHeaders.map(function( header ) {
            return header.width === '*' ? header.width : header.width * grid.options.exporterPdfMaxGridWidth / gridWidth;
          });
          
        },
        
        /**
         * @ngdoc function
         * @name formatRowAsPdf
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Renders a row in a format consumable by PDF,
         * mainly meaning casting everything to a string
         * @param {exporterService} exporter pass in exporter 
         * @param {array} row the row to be turned into a csv string
         * @returns {string} a csv-ified version of the row
         */
        formatRowAsPdf: function ( exporter ) {
          return function( row ) {
            return row.map(exporter.formatFieldAsPdfString);
          };
        },
        
        
        /**
         * @ngdoc function
         * @name formatFieldAsCsv
         * @methodOf  ui.grid.exporter.service:uiGridExporterService
         * @description Renders a single field as a pdf-able field, which
         * is different from a csv field only in that strings don't have quotes
         * around them
         * @param {field} field the field to be turned into a pdf string,
         * may be of any type
         * @returns {string} a string-ified version of the field
         */
        formatFieldAsPdfString: function (field) {
          if (field == null) { // we want to catch anything null-ish, hence just == not ===
            return '';
          }
          if (typeof(field) === 'number') {
            return field.toString();
          }
          if (typeof(field) === 'boolean') {
            return (field ? 'TRUE' : 'FALSE') ;
          }
          if (typeof(field) === 'string') {
            return field.replace(/"/g,'""');
          }

          return JSON.stringify(field).replace(/^"/,'').replace(/"$/,'');        
        }
      };

      return service;

    }
  ]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.exporter.directive:uiGridExporter
   *  @element div
   *  @restrict A
   *
   *  @description Adds exporter features to grid
   *
   *  @example
   <example module="app">
   <file name="app.js">
   var app = angular.module('app', ['ui.grid', 'ui.grid.edit']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
      $scope.data = [
        { name: 'Bob', title: 'CEO' },
            { name: 'Frank', title: 'Lowly Developer' }
      ];

      $scope.gridOptions = {
        columnDefs: [
          {name: 'name', enableCellEdit: true},
          {name: 'title', enableCellEdit: true}
        ],
        data: $scope.data
      };
    }]);
   </file>
   <file name="index.html">
   <div ng-controller="MainCtrl">
   <div ui-grid="gridOptions" ui-grid-exporter></div>
   </div>
   </file>
   </example>
   */
  module.directive('uiGridExporter', ['$log', 'uiGridExporterConstants', 'uiGridExporterService', 'gridUtil', '$compile',
    function ($log, uiGridExporterConstants, uiGridExporterService, gridUtil, $compile) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              uiGridExporterService.initializeGrid(uiGridCtrl.grid);
              uiGridCtrl.grid.exporter.$scope = $scope;
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
            }
          };
        }
      };
    }
  ]);
})();
(function() {
  'use strict';
  /**
   *  @ngdoc overview
   *  @name ui.grid.infiniteScroll
   *
   *  @description 
   *
   *   #ui.grid.infiniteScroll
   * This module provides infinite scroll functionality to ui-grid
   *
   */
  var module = angular.module('ui.grid.infiniteScroll', ['ui.grid']);
  /**
   *  @ngdoc service
   *  @name ui.grid.infiniteScroll.service:uiGridInfiniteScrollService
   *
   *  @description Service for infinite scroll features
   */
  module.service('uiGridInfiniteScrollService', ['gridUtil', '$log', '$compile', '$timeout', function (gridUtil, $log, $compile, $timeout) {
    
    var service = {

      /**
       * @ngdoc function
       * @name initializeGrid
       * @methodOf ui.grid.infiniteScroll.service:uiGridInfiniteScrollService
       * @description This method register events and methods into grid public API
       */

      initializeGrid: function(grid) {
        /**
         *  @ngdoc object
         *  @name ui.grid.infiniteScroll.api:PublicAPI
         *
         *  @description Public API for infinite scroll feature
         */
        var publicApi = {
          events: {
            infiniteScroll: {

              /**
               * @ngdoc event
               * @name needLoadMoreData
               * @eventOf ui.grid.infiniteScroll.api:PublicAPI
               * @description This event fires when scroll reached bottom percentage of grid
               * and needs to load data
               */

              needLoadMoreData: function ($scope, fn) {
              }
            }
          },
          methods: {
            infiniteScroll: {

              /**
               * @ngdoc function
               * @name dataLoaded
               * @methodOf ui.grid.infiniteScroll.api:PublicAPI
               * @description This function is used as a promise when data finished loading.
               * See infinite_scroll ngdoc for example of usage
               */

              dataLoaded: function() {
                grid.options.loadTimout = false;
              }
            }
          }
        };
        grid.options.loadTimout = false;
        grid.api.registerEventsFromObject(publicApi.events);
        grid.api.registerMethodsFromObject(publicApi.methods);
      },

      /**
       * @ngdoc function
       * @name loadData
       * @methodOf ui.grid.infiniteScroll.service:uiGridInfiniteScrollService
       * @description This function fires 'needLoadMoreData' event
       */

      loadData: function (grid) {
          grid.api.infiniteScroll.raise.needLoadMoreData();
          grid.options.loadTimout = true;
      },

      /**
       * @ngdoc function
       * @name checkScroll
       * @methodOf ui.grid.infiniteScroll.service:uiGridInfiniteScrollService
       * @description This function checks scroll position inside grid and 
       * calls 'loadData' function when scroll reaches 'infiniteScrollPercentage'
       */

      checkScroll: function(grid, scrollTop) {

        /* Take infiniteScrollPercentage value or use 20% as default */
        var infiniteScrollPercentage = grid.options.infiniteScrollPercentage ? grid.options.infiniteScrollPercentage : 20; 

        if (!grid.options.loadTimout && scrollTop <= infiniteScrollPercentage) {
          this.loadData(grid);
          return true;
        }
        return false;
      }
      /**
      * @ngdoc property
      * @name infiniteScrollPercentage
      * @propertyOf ui.grid.class:GridOptions
      * @description This setting controls at what percentage of the scroll more data
      * is requested by the infinite scroll
      */
    };
    return service;
  }]);
  /**
   *  @ngdoc directive
   *  @name ui.grid.infiniteScroll.directive:uiGridInfiniteScroll
   *  @element div
   *  @restrict A
   *
   *  @description Adds infinite scroll features to grid
   *
   *  @example
   <example module="app">
   <file name="app.js">
   var app = angular.module('app', ['ui.grid', 'ui.grid.infiniteScroll']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
      $scope.data = [
        { name: 'Alex', car: 'Toyota' },
            { name: 'Sam', car: 'Lexus' }
      ];

      $scope.columnDefs = [
        {name: 'name'},
        {name: 'car'}
      ];
    }]);
   </file>
   <file name="index.html">
   <div ng-controller="MainCtrl">
   <div ui-grid="{ data: data, columnDefs: columnDefs }" ui-grid-infinite-scroll="20"></div>
   </div>
   </file>
   </example>
   */
  
  module.directive('uiGridInfiniteScroll', ['$log', 'uiGridInfiniteScrollService',
    function ($log, uiGridInfiniteScrollService) {
      return {
        priority: -200,
        scope: false,
        require: '^uiGrid',
        compile: function($scope, $elm, $attr){
          return { 
            pre: function($scope, $elm, $attr, uiGridCtrl) {
              uiGridInfiniteScrollService.initializeGrid(uiGridCtrl.grid);
            },
            post: function($scope, $elm, $attr) {
            }
          };
        }
      };
    }]);

  module.directive('uiGridViewport',
    ['$compile', '$log', 'uiGridInfiniteScrollService', 'uiGridConstants', 
      function ($compile, $log, uiGridInfiniteScrollService, uiGridConstants) {
        return {
          priority: -200,
          scope: false,
          link: function ($scope, $elm, $attr){
            $scope.$on(uiGridConstants.events.GRID_SCROLL, function(evt, args) {

              var percentage = 100 - (args.y.percentage * 100);
              uiGridInfiniteScrollService.checkScroll($scope.grid, percentage);
            });
          }
        };
      }]);
})();
(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name ui.grid.pinning
   * @description
   *
   *  # ui.grid.pinning
   * This module provides column pinning to the end user via menu options in the column header
   * <br/>
   * <br/>
   *
   * <div doc-module-components="ui.grid.pinning"></div>
   */

  var module = angular.module('ui.grid.pinning', ['ui.grid']);

  module.config(['$provide', function ($provide) {
    $provide.decorator('i18nService', ['$delegate', function ($delegate) {
      $delegate.add('en',
        { pinning: {
            pinLeft: 'Pin Left',
            pinRight: 'Pin Right',
            unpin: 'Unpin'
          }
        }
      );

      return $delegate;
    }]);
  }]);

  module.service('uiGridPinningService', ['$log', 'GridRenderContainer', 'i18nService', function ($log, GridRenderContainer, i18nService) {
    var service = {

      initializeGrid: function (grid) {
        service.defaultGridOptions(grid.options);

        // Register a column builder to add new menu items for pinning left and right
        grid.registerColumnBuilder(service.pinningColumnBuilder);
      },

      defaultGridOptions: function (gridOptions) {
        //default option to true unless it was explicitly set to false
        /**
         *  @ngdoc object
         *  @name ui.grid.pinning.api:GridOptions
         *
         *  @description GridOptions for pinning feature, these are available to be  
           *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
         */

        /**
         *  @ngdoc object
         *  @name enableRowSelection
         *  @propertyOf  ui.grid.pinning.api:GridOptions
         *  @description Enable pinning for the entire grid.  
         *  <br/>Defaults to true
         */
        gridOptions.enablePinning = gridOptions.enablePinning !== false;

      },

      pinningColumnBuilder: function (colDef, col, gridOptions) {
        //default to true unless gridOptions or colDef is explicitly false

        /**
         *  @ngdoc object
         *  @name ui.grid.pinning.api:ColumnDef
         *
         *  @description ColumnDef for pinning feature, these are available to be 
         *  set using the ui-grid {@link ui.grid.class:GridOptions.columnDef gridOptions.columnDefs}
         */

        /**
         *  @ngdoc object
         *  @name enablePinning
         *  @propertyOf  ui.grid.pinning.api:ColumnDef
         *  @description Enable pinning for the individual column.  
         *  <br/>Defaults to true
         */
        colDef.enablePinning = colDef.enablePinning === undefined ? gridOptions.enablePinning : colDef.enablePinning;


        /**
         *  @ngdoc object
         *  @name pinnedLeft
         *  @propertyOf  ui.grid.pinning.api:ColumnDef
         *  @description Column is pinned left when grid is rendered
         *  <br/>Defaults to false
         */

        /**
         *  @ngdoc object
         *  @name pinnedRight
         *  @propertyOf  ui.grid.pinning.api:ColumnDef
         *  @description Column is pinned right when grid is rendered
         *  <br/>Defaults to false
         */
        if (colDef.pinnedLeft) {
          col.renderContainer = 'left';
          col.grid.createLeftContainer();
        }
        else if (colDef.pinnedRight) {
          col.renderContainer = 'right';
          col.grid.createRightContainer();
        }

        if (!colDef.enablePinning) {
          return;
        }

        var pinColumnLeftAction = {
          title: i18nService.get().pinning.pinLeft,
          icon: 'ui-grid-icon-left-open',
          shown: function () {
            return typeof(this.context.col.renderContainer) === 'undefined' || !this.context.col.renderContainer || this.context.col.renderContainer !== 'left';
          },
          action: function () {
            this.context.col.renderContainer = 'left';
            this.context.col.grid.createLeftContainer();

            // Need to call refresh twice; once to move our column over to the new render container and then
            //   a second time to update the grid viewport dimensions with our adjustments
            col.grid.refresh()
              .then(function () {
                col.grid.refresh();
              });
          }
        };

        var pinColumnRightAction = {
          title: i18nService.get().pinning.pinRight,
          icon: 'ui-grid-icon-right-open',
          shown: function () {
            return typeof(this.context.col.renderContainer) === 'undefined' || !this.context.col.renderContainer || this.context.col.renderContainer !== 'right';
          },
          action: function () {
            this.context.col.renderContainer = 'right';
            this.context.col.grid.createRightContainer();


            // Need to call refresh twice; once to move our column over to the new render container and then
            //   a second time to update the grid viewport dimensions with our adjustments
            col.grid.refresh()
              .then(function () {
                col.grid.refresh();
              });
          }
        };

        var removePinAction = {
          title: i18nService.get().pinning.unpin,
          icon: 'ui-grid-icon-cancel',
          shown: function () {
            return typeof(this.context.col.renderContainer) !== 'undefined' && this.context.col.renderContainer !== null && this.context.col.renderContainer !== 'body';
          },
          action: function () {
            this.context.col.renderContainer = null;

            // Need to call refresh twice; once to move our column over to the new render container and then
            //   a second time to update the grid viewport dimensions with our adjustments
            col.grid.refresh()
              .then(function () {
                col.grid.refresh();
              });
          }
        };

        col.menuItems.push(pinColumnLeftAction);
        col.menuItems.push(pinColumnRightAction);
        col.menuItems.push(removePinAction);
      }
    };

    return service;
  }]);

  module.directive('uiGridPinning', ['$log', 'uiGridPinningService',
    function ($log, uiGridPinningService) {
      return {
        require: 'uiGrid',
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              uiGridPinningService.initializeGrid(uiGridCtrl.grid);
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
            }
          };
        }
      };
    }]);


})();
(function(){
  'use strict';

  var module = angular.module('ui.grid.resizeColumns', ['ui.grid']);

  module.constant('columnBounds', {
    minWidth: 35
  });


  module.service('uiGridResizeColumnsService', ['$log','$q',
    function ($log,$q) {

      var service = {
        defaultGridOptions: function(gridOptions){
          //default option to true unless it was explicitly set to false
          /**
           *  @ngdoc object
           *  @name ui.grid.resizeColumns.api:GridOptions
           *
           *  @description GridOptions for resizeColumns feature, these are available to be  
           *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
           */

          /**
           *  @ngdoc object
           *  @name enableColumnResizing
           *  @propertyOf  ui.grid.resizeColumns.api:GridOptions
           *  @description Enable column resizing on the entire grid 
           *  <br/>Defaults to true
           */
          gridOptions.enableColumnResizing = gridOptions.enableColumnResizing !== false;

          //legacy support
          //use old name if it is explicitly false
          if (gridOptions.enableColumnResize === false){
            gridOptions.enableColumnResizing = false;
          }
        },

        colResizerColumnBuilder: function (colDef, col, gridOptions) {

          var promises = [];
          /**
           *  @ngdoc object
           *  @name ui.grid.resizeColumns.api:ColumnDef
           *
           *  @description ColumnDef for resizeColumns feature, these are available to be 
           *  set using the ui-grid {@link ui.grid.class:GridOptions.columnDef gridOptions.columnDefs}
           */

          /**
           *  @ngdoc object
           *  @name enableColumnResizing
           *  @propertyOf  ui.grid.resizeColumns.api:ColumnDef
           *  @description Enable column resizing on an individual column
           *  <br/>Defaults to GridOptions.enableColumnResizing
           */
          //default to true unless gridOptions or colDef is explicitly false
          colDef.enableColumnResizing = colDef.enableColumnResizing === undefined ? gridOptions.enableColumnResizing : colDef.enableColumnResizing;


          //legacy support of old option name
          if (colDef.enableColumnResize === false){
            colDef.enableColumnResizing = false;
          }

          return $q.all(promises);
        }
      };

      return service;

    }]);


  /**
   * @ngdoc directive
   * @name ui.grid.resizeColumns.directive:uiGridResizeColumns
   * @element div
   * @restrict A
   * @description
   * Enables resizing for all columns on the grid. If, for some reason, you want to use the ui-grid-resize-columns directive, but not allow column resizing, you can explicitly set the
   * option to false. This prevents resizing for the entire grid, regardless of individual columnDef options.
   *
   * @example
   <doc:example module="app">
   <doc:source>
   <script>
   var app = angular.module('app', ['ui.grid', 'ui.grid.resizeColumns']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
          $scope.gridOpts = {
            data: [
              { "name": "Ethel Price", "gender": "female", "company": "Enersol" },
              { "name": "Claudine Neal", "gender": "female", "company": "Sealoud" },
              { "name": "Beryl Rice", "gender": "female", "company": "Velity" },
              { "name": "Wilder Gonzales", "gender": "male", "company": "Geekko" }
            ]
          };
        }]);
   </script>

   <div ng-controller="MainCtrl">
   <div class="testGrid" ui-grid="gridOpts" ui-grid-resize-columns ></div>
   </div>
   </doc:source>
   <doc:scenario>

   </doc:scenario>
   </doc:example>
   */
  module.directive('uiGridResizeColumns', ['$log', 'uiGridResizeColumnsService', function ($log, uiGridResizeColumnsService) {
    return {
      replace: true,
      priority: 0,
      require: '^uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {

            uiGridResizeColumnsService.defaultGridOptions(uiGridCtrl.grid.options);
            uiGridCtrl.grid.registerColumnBuilder( uiGridResizeColumnsService.colResizerColumnBuilder);

          },
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
          }
        };
      }
    };
  }]);

  // Extend the uiGridHeaderCell directive
  module.directive('uiGridHeaderCell', ['$log', '$templateCache', '$compile', '$q', function ($log, $templateCache, $compile, $q) {
    return {
      // Run after the original uiGridHeaderCell
      priority: -10,
      require: '^uiGrid',
      // scope: false,
      compile: function() {
        return {
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
           if (uiGridCtrl.grid.options.enableColumnResizing) {
              var renderIndexDefer = $q.defer();

              $attrs.$observe('renderIndex', function (n, o) {
                $scope.renderIndex = $scope.$eval(n);

                renderIndexDefer.resolve();
              });

              renderIndexDefer.promise.then(function() {
                var columnResizerElm = $templateCache.get('ui-grid/columnResizer');

                var resizerLeft = angular.element(columnResizerElm).clone();
                var resizerRight = angular.element(columnResizerElm).clone();

                resizerLeft.attr('position', 'left');
                resizerRight.attr('position', 'right');

                var col = $scope.col;
                var renderContainer = col.getRenderContainer();


                // Get the column to the left of this one
                var otherCol = renderContainer.renderedColumns[$scope.renderIndex - 1];

                // Don't append the left resizer if this is the first column or the column to the left of this one has resizing disabled
                if (otherCol && $scope.col.index !== 0 && otherCol.colDef.enableColumnResizing !== false) {
                  $elm.prepend(resizerLeft);
                }
                
                // Don't append the right resizer if this column has resizing disabled
                //if ($scope.col.index !== $scope.grid.renderedColumns.length - 1 && $scope.col.colDef.enableColumnResizing !== false) {
                if ($scope.col.colDef.enableColumnResizing !== false) {
                  $elm.append(resizerRight);
                }

                $compile(resizerLeft)($scope);
                $compile(resizerRight)($scope);
              });
            }
          }
        };
      }
    };
  }]);


  
  /**
   * @ngdoc directive
   * @name ui.grid.resizeColumns.directive:uiGridColumnResizer
   * @element div
   * @restrict A
   *
   * @description
   * Draggable handle that controls column resizing.
   * 
   * @example
   <doc:example module="app">
     <doc:source>
       <script>
        var app = angular.module('app', ['ui.grid', 'ui.grid.resizeColumns']);

        app.controller('MainCtrl', ['$scope', function ($scope) {
          $scope.gridOpts = {
            enableColumnResizing: true,
            data: [
              { "name": "Ethel Price", "gender": "female", "company": "Enersol" },
              { "name": "Claudine Neal", "gender": "female", "company": "Sealoud" },
              { "name": "Beryl Rice", "gender": "female", "company": "Velity" },
              { "name": "Wilder Gonzales", "gender": "male", "company": "Geekko" }
            ]
          };
        }]);
       </script>

       <div ng-controller="MainCtrl">
        <div class="testGrid" ui-grid="gridOpts"></div>
       </div>
     </doc:source>
     <doc:scenario>
      // TODO: e2e specs?
        // TODO: Obey minWidth and maxWIdth;

      // TODO: post-resize a horizontal scroll event should be fired
     </doc:scenario>
   </doc:example>
   */  
  module.directive('uiGridColumnResizer', ['$log', '$document', 'gridUtil', 'uiGridConstants', 'columnBounds', function ($log, $document, gridUtil, uiGridConstants, columnBounds) {
    var resizeOverlay = angular.element('<div class="ui-grid-resize-overlay"></div>');

    var resizer = {
      priority: 0,
      scope: {
        col: '=',
        position: '@',
        renderIndex: '='
      },
      require: '?^uiGrid',
      link: function ($scope, $elm, $attrs, uiGridCtrl) {
        var startX = 0,
            x = 0,
            gridLeft = 0;

        if ($scope.position === 'left') {
          $elm.addClass('left');
        }
        else if ($scope.position === 'right') {
          $elm.addClass('right');
        }

        // Resize all the other columns around col
        function resizeAroundColumn(col) {
          // Get this column's render container
          var renderContainer = col.getRenderContainer();

          renderContainer.visibleColumnCache.forEach(function (column) {
            // Skip the column we just resized
            if (column.index === col.index) { return; }
            
            var colDef = column.colDef;
            if (!colDef.width || (angular.isString(colDef.width) && (colDef.width.indexOf('*') !== -1 || colDef.width.indexOf('%') !== -1))) {
              colDef.width = column.drawnWidth;
            }
          });
        }

        // Build the columns then refresh the grid canvas
        //   takes an argument representing the diff along the X-axis that the resize had
        function buildColumnsAndRefresh(xDiff) {
          // Build the columns
          uiGridCtrl.grid.buildColumns()
            .then(function() {
              // Then refresh the grid canvas, rebuilding the styles so that the scrollbar updates its size
              uiGridCtrl.grid.refreshCanvas(true);
            });
        }

        function mousemove(event, args) {
          if (event.originalEvent) { event = event.originalEvent; }
          event.preventDefault();

          x = event.clientX - gridLeft;

          if (x < 0) { x = 0; }
          else if (x > uiGridCtrl.grid.gridWidth) { x = uiGridCtrl.grid.gridWidth; }

          // The other column to resize (the one next to this one)
          var col = $scope.col;
          var renderContainer = col.getRenderContainer();
          var otherCol;
          if ($scope.position === 'left') {
            // Get the column to the left of this one
            col = renderContainer.renderedColumns[$scope.renderIndex - 1];
            otherCol = $scope.col;
          }
          else if ($scope.position === 'right') {
            otherCol = renderContainer.renderedColumns[$scope.renderIndex + 1];
          }

          // Don't resize if it's disabled on this column
          if (col.colDef.enableColumnResizing === false) {
            return;
          }

          if (!uiGridCtrl.grid.element.hasClass('column-resizing')) {
            uiGridCtrl.grid.element.addClass('column-resizing');
          }

          // Get the diff along the X axis
          var xDiff = x - startX;

          // Get the width that this mouse would give the column
          var newWidth = col.drawnWidth + xDiff;

          // If the new width would be less than the column's allowably minimum width, don't allow it
          if (col.colDef.minWidth && newWidth < col.colDef.minWidth) {
            x = x + (col.colDef.minWidth - newWidth);
          }
          else if (!col.colDef.minWidth && columnBounds.minWidth && newWidth < columnBounds.minWidth) {
            x = x + (col.colDef.minWidth - newWidth);
          }
          else if (col.colDef.maxWidth && newWidth > col.colDef.maxWidth) {
            x = x + (col.colDef.maxWidth - newWidth);
          }
          
          resizeOverlay.css({ left: x + 'px' });

          uiGridCtrl.fireEvent(uiGridConstants.events.ITEM_DRAGGING);
        }

        function mouseup(event, args) {
          if (event.originalEvent) { event = event.originalEvent; }
          event.preventDefault();

          uiGridCtrl.grid.element.removeClass('column-resizing');

          resizeOverlay.remove();

          // Resize the column
          x = event.clientX - gridLeft;
          var xDiff = x - startX;

          if (xDiff === 0) {
            $document.off('mouseup', mouseup);
            $document.off('mousemove', mousemove);
            return;
          }

          // The other column to resize (the one next to this one)
          var col = $scope.col;
          var renderContainer = col.getRenderContainer();

          var otherCol;
          if ($scope.position === 'left') {
            // Get the column to the left of this one
            col = renderContainer.renderedColumns[$scope.renderIndex - 1];
            otherCol = $scope.col;
          }
          else if ($scope.position === 'right') {
            otherCol = renderContainer.renderedColumns[$scope.renderIndex + 1];
          }

          // Don't resize if it's disabled on this column
          if (col.colDef.enableColumnResizing === false) {
            return;
          }

          // Get the new width
          var newWidth = col.drawnWidth + xDiff;

          // If the new width is less than the minimum width, make it the minimum width
          if (col.colDef.minWidth && newWidth < col.colDef.minWidth) {
            newWidth = col.colDef.minWidth;
          }
          else if (!col.colDef.minWidth && columnBounds.minWidth && newWidth < columnBounds.minWidth) {
            newWidth = columnBounds.minWidth;
          }
          // 
          if (col.colDef.maxWidth && newWidth > col.colDef.maxWidth) {
            newWidth = col.colDef.maxWidth;
          }
          
          col.colDef.width = newWidth;

          // All other columns because fixed to their drawn width, if they aren't already
          resizeAroundColumn(col);

          buildColumnsAndRefresh(xDiff);

          $document.off('mouseup', mouseup);
          $document.off('mousemove', mousemove);
        }

        $elm.on('mousedown', function(event, args) {
          if (event.originalEvent) { event = event.originalEvent; }
          event.stopPropagation();

          // Get the left offset of the grid
          // gridLeft = uiGridCtrl.grid.element[0].offsetLeft;
          gridLeft = uiGridCtrl.grid.element[0].getBoundingClientRect().left;

          // Get the starting X position, which is the X coordinate of the click minus the grid's offset
          startX = event.clientX - gridLeft;

          // Append the resizer overlay
          uiGridCtrl.grid.element.append(resizeOverlay);

          // Place the resizer overlay at the start position
          resizeOverlay.css({ left: startX });

          // Add handlers for mouse move and up events
          $document.on('mouseup', mouseup);
          $document.on('mousemove', mousemove);
        });

        // On doubleclick, resize to fit all rendered cells
        $elm.on('dblclick', function(event, args) {
          event.stopPropagation();

          var col = $scope.col;
          var renderContainer = col.getRenderContainer();

          var otherCol, multiplier;

          // If we're the left-positioned resizer then we need to resize the column to the left of our column, and not our column itself
          if ($scope.position === 'left') {
            col = renderContainer.renderedColumns[$scope.renderIndex - 1];
            otherCol = $scope.col;
            multiplier = 1;
          }
          else if ($scope.position === 'right') {
            otherCol = renderContainer.renderedColumns[$scope.renderIndex + 1];
            otherCol = renderContainer.renderedColumns[$scope.renderIndex + 1];
            multiplier = -1;
          }

          // Go through the rendered rows and find out the max size for the data in this column
          var maxWidth = 0;
          var xDiff = 0;

          // Get the parent render container element
          var renderContainerElm = gridUtil.closestElm($elm, '.ui-grid-render-container');

          // Get the cell contents so we measure correctly. For the header cell we have to account for the sort icon and the menu buttons, if present
          var cells = renderContainerElm.querySelectorAll('.' + uiGridConstants.COL_CLASS_PREFIX + col.index + ' .ui-grid-cell-contents');
          Array.prototype.forEach.call(cells, function (cell) {
              // Get the cell width
              // $log.debug('width', gridUtil.elementWidth(cell));

              // Account for the menu button if it exists
              var menuButton;
              if (angular.element(cell).parent().hasClass('ui-grid-header-cell')) {
                menuButton = angular.element(cell).parent()[0].querySelectorAll('.ui-grid-column-menu-button');
              }

              gridUtil.fakeElement(cell, {}, function(newElm) {
                // Make the element float since it's a div and can expand to fill its container
                var e = angular.element(newElm);
                e.attr('style', 'float: left');

                var width = gridUtil.elementWidth(e);

                if (menuButton) {
                  var menuButtonWidth = gridUtil.elementWidth(menuButton);
                  width = width + menuButtonWidth;
                }

                if (width > maxWidth) {
                  maxWidth = width;
                  xDiff = maxWidth - width;
                }
              });
            });

          // If the new width is less than the minimum width, make it the minimum width
          if (col.colDef.minWidth && maxWidth < col.colDef.minWidth) {
            maxWidth = col.colDef.minWidth;
          }
          else if (!col.colDef.minWidth && columnBounds.minWidth && maxWidth < columnBounds.minWidth) {
            maxWidth = columnBounds.minWidth;
          }
          // 
          if (col.colDef.maxWidth && maxWidth > col.colDef.maxWidth) {
            maxWidth = col.colDef.maxWidth;
          }

          col.colDef.width = maxWidth;
          
          // All other columns because fixed to their drawn width, if they aren't already
          resizeAroundColumn(col);

          buildColumnsAndRefresh(xDiff);
        });

        $elm.on('$destroy', function() {
          $elm.off('mousedown');
          $elm.off('dblclick');
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        });
      }
    };

    return resizer;
  }]);

})();
(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name ui.grid.rowEdit
   * @description
   *
   *  # ui.grid.rowEdit
   * This module extends the edit feature to provide tracking and saving of rows
   * of data.  The tutorial provides more information on how this feature is best
   * used {@link tutorial/205_row_editable here}.
   * <br/>
   * This feature depends on usage of the ui-grid-edit feature, and also benefits
   * from use of ui-grid-cellNav to provide the full spreadsheet-like editing 
   * experience
   * 
   */

  var module = angular.module('ui.grid.rowEdit', ['ui.grid', 'ui.grid.edit', 'ui.grid.cellNav']);

  /**
   *  @ngdoc object
   *  @name ui.grid.rowEdit.constant:uiGridRowEditConstants
   *
   *  @description constants available in row edit module
   */
  module.constant('uiGridRowEditConstants', {
  });

  /**
   *  @ngdoc service
   *  @name ui.grid.rowEdit.service:uiGridRowEditService
   *
   *  @description Services for row editing features
   */
  module.service('uiGridRowEditService', ['$interval', '$log', '$q', 'uiGridConstants', 'uiGridRowEditConstants', 'gridUtil', 
    function ($interval, $log, $q, uiGridConstants, uiGridRowEditConstants, gridUtil) {

      var service = {

        initializeGrid: function (scope, grid) {
          /**
           *  @ngdoc object
           *  @name ui.grid.rowEdit.api:PublicApi
           *
           *  @description Public Api for rowEdit feature
           */
          var publicApi = {
            events: {
              rowEdit: {
                /**
                 * @ngdoc event
                 * @eventOf ui.grid.rowEdit.api:PublicApi
                 * @name saveRow
                 * @description raised when a row is ready for saving.  Once your
                 * row has saved you may need to use angular.extend to update the
                 * data entity with any changed data from your save (for example, 
                 * lock version information if you're using optimistic locking,
                 * or last update time/user information).
                 * 
                 * Your method should call setSavePromise somewhere in the body before
                 * returning control.  The feature will then wait, with the gridRow greyed out 
                 * whilst this promise is being resolved.
                 * 
                 * <pre>
                 *      gridApi.rowEdit.on.saveRow(scope,function(rowEntity){})
                 * </pre>
                 * and somewhere within the event handler:
                 * <pre>
                 *      gridApi.rowEdit.setSavePromise( grid, rowEntity, savePromise)
                 * </pre>
                 * @param {object} rowEntity the options.data element that was edited
                 * @returns {promise} Your saveRow method should return a promise, the
                 * promise should either be resolved (implying successful save), or 
                 * rejected (implying an error).
                 */
                saveRow: function (rowEntity) {
                }
              }
            },
            methods: {
              rowEdit: {
                /**
                 * @ngdoc method
                 * @methodOf ui.grid.rowEdit.api:PublicApi
                 * @name setSavePromise
                 * @description Sets the promise associated with the row save, mandatory that
                 * the saveRow event handler calls this method somewhere before returning.
                 * <pre>
                 *      gridApi.rowEdit.setSavePromise(grid, rowEntity)
                 * </pre>
                 * @param {object} grid the grid for which dirty rows should be returned
                 * @param {object} rowEntity a data row from the grid for which a save has
                 * been initiated
                 * @param {promise} savePromise the promise that will be resolved when the
                 * save is successful, or rejected if the save fails
                 * 
                 */
                setSavePromise: function (grid, rowEntity, savePromise) {
                  service.setSavePromise(grid, rowEntity, savePromise);
                },
                /**
                 * @ngdoc method
                 * @methodOf ui.grid.rowEdit.api:PublicApi
                 * @name getDirtyRows
                 * @description Returns all currently dirty rows
                 * <pre>
                 *      gridApi.rowEdit.getDirtyRows(grid)
                 * </pre>
                 * @param {object} grid the grid for which dirty rows should be returned
                 * @returns {array} An array of gridRows that are currently dirty
                 * 
                 */
                getDirtyRows: function (grid) {
                  return grid.rowEditDirtyRows;
                },
                /**
                 * @ngdoc method
                 * @methodOf ui.grid.rowEdit.api:PublicApi
                 * @name getErrorRows
                 * @description Returns all currently errored rows
                 * <pre>
                 *      gridApi.rowEdit.getErrorRows(grid)
                 * </pre>
                 * @param {object} grid the grid for which errored rows should be returned
                 * @returns {array} An array of gridRows that are currently in error
                 * 
                 */
                getErrorRows: function (grid) {
                  return grid.rowEditErrorRows;
                },
                /**
                 * @ngdoc method
                 * @methodOf ui.grid.rowEdit.api:PublicApi
                 * @name flushDirtyRows
                 * @description Triggers a save event for all currently dirty rows, could
                 * be used where user presses a save button or navigates away from the page
                 * <pre>
                 *      gridApi.rowEdit.flushDirtyRows(grid)
                 * </pre>
                 * @param {object} grid the grid for which dirty rows should be flushed
                 * @returns {promise} a promise that represents the aggregate of all
                 * of the individual save promises - i.e. it will be resolved when all
                 * the individual save promises have been resolved.
                 * 
                 */
                flushDirtyRows: function (grid) {
                  return service.flushDirtyRows(grid);
                }
              }
            }
          };

          grid.api.registerEventsFromObject(publicApi.events);
          grid.api.registerMethodsFromObject(publicApi.methods);
          
          grid.api.core.on.renderingComplete( scope, function ( gridApi ) {
            grid.api.edit.on.afterCellEdit( scope, service.endEditCell );
            grid.api.edit.on.beginCellEdit( scope, service.beginEditCell );
            grid.api.edit.on.cancelCellEdit( scope, service.cancelEditCell );
            
            if ( grid.api.cellNav ) {
              grid.api.cellNav.on.navigate( scope, service.navigate );
            }              
          });

        },

        defaultGridOptions: function (gridOptions) {

          /**
           *  @ngdoc object
           *  @name ui.grid.rowEdit.api:GridOptions
           *
           *  @description Options for configuring the rowEdit feature, these are available to be  
           *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
           */

        },


        /**
         * @ngdoc method
         * @methodOf ui.grid.rowEdit.service:uiGridRowEditService
         * @name saveRow
         * @description  Returns a function that saves the specified row from the grid,
         * and returns a promise
         * @param {object} grid the grid for which dirty rows should be flushed
         * @param {GridRow} gridRow the row that should be saved
         * @returns {function} the saveRow function returns a function.  That function
         * in turn, when called, returns a promise relating to the save callback
         */
        saveRow: function ( grid, gridRow ) {
          var self = this;

          return function() {
            gridRow.isSaving = true;

            var promise = grid.api.rowEdit.raise.saveRow( gridRow.entity );
            
            if ( gridRow.rowEditSavePromise ){
              gridRow.rowEditSavePromise.then( self.processSuccessPromise( grid, gridRow ), self.processErrorPromise( grid, gridRow ));
            } else {
              $log.log( 'A promise was not returned when saveRow event was raised, either nobody is listening to event, or event handler did not return a promise' );
            }
            return promise;
          };
        },
        

        /**
         * @ngdoc method
         * @methodOf  ui.grid.rowEdit.service:uiGridRowEditService
         * @name setSavePromise
         * @description Sets the promise associated with the row save, mandatory that
         * the saveRow event handler calls this method somewhere before returning.
         * <pre>
         *      gridApi.rowEdit.setSavePromise(grid, rowEntity)
         * </pre>
         * @param {object} grid the grid for which dirty rows should be returned
         * @param {object} rowEntity a data row from the grid for which a save has
         * been initiated
         * @param {promise} savePromise the promise that will be resolved when the
         * save is successful, or rejected if the save fails
         * 
         */
        setSavePromise: function (grid, rowEntity, savePromise) {
          var gridRow = grid.getRow( rowEntity );
          gridRow.rowEditSavePromise = savePromise;
        },


        /**
         * @ngdoc method
         * @methodOf ui.grid.rowEdit.service:uiGridRowEditService
         * @name processSuccessPromise
         * @description  Returns a function that processes the successful
         * resolution of a save promise  
         * @param {object} grid the grid for which the promise should be processed
         * @param {GridRow} gridRow the row that has been saved
         * @returns {function} the success handling function
         */
        processSuccessPromise: function ( grid, gridRow ) {
          var self = this;
          
          return function() {
            delete gridRow.isSaving;
            delete gridRow.isDirty;
            delete gridRow.isError;
            delete gridRow.rowEditSaveTimer;
            self.removeRow( grid.rowEditErrorRows, gridRow );
            self.removeRow( grid.rowEditDirtyRows, gridRow );
          };
        },
        

        /**
         * @ngdoc method
         * @methodOf ui.grid.rowEdit.service:uiGridRowEditService
         * @name processErrorPromise
         * @description  Returns a function that processes the failed
         * resolution of a save promise  
         * @param {object} grid the grid for which the promise should be processed
         * @param {GridRow} gridRow the row that is now in error
         * @returns {function} the error handling function
         */
        processErrorPromise: function ( grid, gridRow ) {
          return function() {
            delete gridRow.isSaving;
            delete gridRow.rowEditSaveTimer;

            gridRow.isError = true;
            
            if (!grid.rowEditErrorRows){
              grid.rowEditErrorRows = [];
            }
            grid.rowEditErrorRows.push( gridRow );
          };
        },
        
        
        /**
         * @ngdoc method
         * @methodOf ui.grid.rowEdit.service:uiGridRowEditService
         * @name removeRow
         * @description  Removes a row from a cache of rows - either
         * grid.rowEditErrorRows or grid.rowEditDirtyRows.  If the row
         * is not present silently does nothing. 
         * @param {array} rowArray the array from which to remove the row
         * @param {GridRow} gridRow the row that should be removed
         */
        removeRow: function( rowArray, removeGridRow ){
          angular.forEach( rowArray, function( gridRow, index ){
            if ( gridRow.uid === removeGridRow.uid ){
              rowArray.splice( index, 1);
            }
          });
        },
        
        
        /**
         * @ngdoc method
         * @methodOf ui.grid.rowEdit.service:uiGridRowEditService
         * @name flushDirtyRows
         * @description Triggers a save event for all currently dirty rows, could
         * be used where user presses a save button or navigates away from the page
         * <pre>
         *      gridApi.rowEdit.flushDirtyRows(grid)
         * </pre>
         * @param {object} grid the grid for which dirty rows should be flushed
         * @returns {promise} a promise that represents the aggregate of all
         * of the individual save promises - i.e. it will be resolved when all
         * the individual save promises have been resolved.
         * 
         */
        flushDirtyRows: function(grid){
          var promises = [];
          angular.forEach(grid.rowEditDirtyRows, function( gridRow ){
            service.saveRow( grid, gridRow )();
            promises.push( gridRow.rowEditSavePromise );
          });
          
          return $q.all( promises );
        },
        
        
        /**
         * @ngdoc property
         * @propertyOf ui.grid.rowEdit.api:GridOptions
         * @name rowEditWaitInterval
         * @description How long the grid should wait for another change on this row
         * before triggering a save (in milliseconds)
         * 
         * @example
         * Setting the wait interval to 4 seconds
         * <pre>
         *   $scope.gridOptions = { rowEditWaitInterval: 4000 }
         * </pre>
         * 
         */
        /**
         * @ngdoc method
         * @methodOf ui.grid.rowEdit.service:uiGridRowEditService
         * @name endEditCell
         * @description Receives an afterCellEdit event from the edit function,
         * and sets flags as appropriate.  Only the rowEntity parameter
         * is processed, although other params are available.  Grid
         * is automatically provided by the gridApi. 
         * @param {object} rowEntity the data entity for which the cell
         * was edited
         */        
        endEditCell: function( rowEntity, colDef, newValue, previousValue ){
          var grid = this.grid;
          var gridRow = grid.getRow( rowEntity );
          if ( !gridRow ){ $log.log( 'Unable to find rowEntity in grid data, dirty flag cannot be set' ); return; }

          if ( newValue !== previousValue || gridRow.isDirty ){
            if ( !grid.rowEditDirtyRows ){
              grid.rowEditDirtyRows = [];
            }
            
            if ( !gridRow.isDirty ){
              gridRow.isDirty = true;
              grid.rowEditDirtyRows.push( gridRow );
            }
            
            delete gridRow.isError;
            
            service.considerSetTimer( grid, gridRow );
          }
        },
        
        
        /**
         * @ngdoc method
         * @methodOf ui.grid.rowEdit.service:uiGridRowEditService
         * @name beginEditCell
         * @description Receives a beginCellEdit event from the edit function,
         * and cancels any rowEditSaveTimers if present, as the user is still editing
         * this row.  Only the rowEntity parameter
         * is processed, although other params are available.  Grid
         * is automatically provided by the gridApi. 
         * @param {object} rowEntity the data entity for which the cell
         * editing has commenced
         */
        beginEditCell: function( rowEntity, colDef ){
          var grid = this.grid;
          var gridRow = grid.getRow( rowEntity );
          if ( !gridRow ){ $log.log( 'Unable to find rowEntity in grid data, timer cannot be cancelled' ); return; }
          
          service.cancelTimer( grid, gridRow );
        },


        /**
         * @ngdoc method
         * @methodOf ui.grid.rowEdit.service:uiGridRowEditService
         * @name cancelEditCell
         * @description Receives a cancelCellEdit event from the edit function,
         * and if the row was already dirty, restarts the save timer.  If the row
         * was not already dirty, then it's not dirty now either and does nothing.
         * 
         * Only the rowEntity parameter
         * is processed, although other params are available.  Grid
         * is automatically provided by the gridApi.
         *  
         * @param {object} rowEntity the data entity for which the cell
         * editing was cancelled
         */        
        cancelEditCell: function( rowEntity, colDef ){
          var grid = this.grid;
          var gridRow = grid.getRow( rowEntity );
          if ( !gridRow ){ $log.log( 'Unable to find rowEntity in grid data, timer cannot be set' ); return; }
          
          service.considerSetTimer( grid, gridRow );
        },
        
        
        /**
         * @ngdoc method
         * @methodOf ui.grid.rowEdit.service:uiGridRowEditService
         * @name navigate
         * @description cellNav tells us that the selected cell has changed.  If
         * the new row had a timer running, then stop it similar to in a beginCellEdit
         * call.  If the old row is dirty and not the same as the new row, then 
         * start a timer on it.
         * @param {object} newRowCol the row and column that were selected
         * @param {object} oldRowCol the row and column that was left
         * 
         */
        navigate: function( newRowCol, oldRowCol ){
          var grid = this.grid;
          if ( newRowCol.row.rowEditSaveTimer ){
            service.cancelTimer( grid, newRowCol.row );
          }

          if ( oldRowCol && oldRowCol.row && oldRowCol.row !== newRowCol.row ){
            service.considerSetTimer( grid, oldRowCol.row );
          }
        },
        
        
        /**
         * @ngdoc method
         * @methodOf ui.grid.rowEdit.service:uiGridRowEditService
         * @name considerSetTimer
         * @description Consider setting a timer on this row (if it is dirty).  if there is a timer running 
         * on the row and the row isn't currently saving, cancel it, using cancelTimer, then if the row is 
         * dirty and not currently saving then set a new timer
         * @param {object} grid the grid for which we are processing
         * @param {GridRow} gridRow the row for which the timer should be adjusted
         * 
         */
        considerSetTimer: function( grid, gridRow ){
          service.cancelTimer( grid, gridRow );
          
          if ( gridRow.isDirty && !gridRow.isSaving ){
            var waitTime = grid.options.rowEditWaitInterval ? grid.options.rowEditWaitInterval : 2000;
            gridRow.rowEditSaveTimer = $interval( service.saveRow( grid, gridRow ), waitTime, 1);
          }
        },
        

        /**
         * @ngdoc method
         * @methodOf ui.grid.rowEdit.service:uiGridRowEditService
         * @name cancelTimer
         * @description cancel the $interval for any timer running on this row
         * then delete the timer itself
         * @param {object} grid the grid for which we are processing
         * @param {GridRow} gridRow the row for which the timer should be adjusted
         * 
         */
        cancelTimer: function( grid, gridRow ){
          if ( gridRow.rowEditSaveTimer && !gridRow.isSaving ){
            $interval.cancel(gridRow.rowEditSaveTimer);
            delete gridRow.rowEditSaveTimer;
          }
        }
      };

      return service;

    }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.rowEdit.directive:uiGridEdit
   *  @element div
   *  @restrict A
   *
   *  @description Adds row editing features to the ui-grid-edit directive.
   *
   */
  module.directive('uiGridRowEdit', ['$log', 'uiGridRowEditService', 'uiGridEditConstants', 
  function ($log, uiGridRowEditService, uiGridEditConstants) {
    return {
      replace: true,
      priority: 0,
      require: '^uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            uiGridRowEditService.initializeGrid($scope, uiGridCtrl.grid);
          },
          post: function ($scope, $elm, $attrs, uiGridCtrl) {            
          }
        };
      }
    };
  }]);


  /**
   *  @ngdoc directive
   *  @name ui.grid.rowEdit.directive:uiGridViewport
   *  @element div
   *
   *  @description Stacks on top of ui.grid.uiGridViewport to alter the attributes used
   *  for the grid row to allow coloring of saving and error rows
   */
  module.directive('uiGridViewport',
    ['$compile', 'uiGridConstants', '$log', '$parse',
      function ($compile, uiGridConstants, $log, $parse) {
        return {
          priority: -200, // run after default  directive
          scope: false,
          compile: function ($elm, $attrs) {
            var rowRepeatDiv = angular.element($elm.children().children()[0]);
            rowRepeatDiv.attr("ng-class", "{'ui-grid-row-saving': row.isSaving, 'ui-grid-row-error': row.isError}");
            return {
              pre: function ($scope, $elm, $attrs, controllers) {

              },
              post: function ($scope, $elm, $attrs, controllers) {
              }
            };
          }
        };
      }]);

})();

(function () {
  'use strict';

  /**
   * @ngdoc overview
   * @name ui.grid.selection
   * @description
   *
   *  # ui.grid.selection
   * This module provides row selection
   * <br/>
   * <br/>
   *
   * <div doc-module-components="ui.grid.selection"></div>
   */

  var module = angular.module('ui.grid.selection', ['ui.grid']);

  /**
   *  @ngdoc object
   *  @name ui.grid.selection.constant:uiGridSelectionConstants
   *
   *  @description constants available in selection module
   */
  module.constant('uiGridSelectionConstants', {
    featureName: "selection"
  });

  /**
   *  @ngdoc service
   *  @name ui.grid.selection.service:uiGridSelectionService
   *
   *  @description Services for selection features
   */
  module.service('uiGridSelectionService', ['$log', '$q', '$templateCache', 'uiGridSelectionConstants', 'gridUtil',
    function ($log, $q, $templateCache, uiGridSelectionConstants, gridUtil) {

      var service = {

        initializeGrid: function (grid) {

          //add feature namespace and any properties to grid for needed state
          grid.selection = {};
          grid.selection.lastSelectedRow = null;

          service.defaultGridOptions(grid.options);

          /**
           *  @ngdoc object
           *  @name ui.grid.selection.api:PublicApi
           *
           *  @description Public Api for selection feature
           */
          var publicApi = {
            events: {
              selection: {
                /**
                 * @ngdoc event
                 * @name rowSelectionChanged
                 * @eventOf  ui.grid.selection.api:PublicApi
                 * @description  is raised after the row.isSelected state is changed
                 * @param {GridRow} row the row that was selected/deselected
                 */
                rowSelectionChanged: function (scope, row) {
                }
              }
            },
            methods: {
              selection: {
                /**
                 * @ngdoc function
                 * @name toggleRowSelection
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description Toggles data row as selected or unselected
                 * @param {object} rowEntity gridOptions.data[] array instance
                 */
                toggleRowSelection: function (rowEntity) {
                  var row = grid.getRow(rowEntity);
                  if (row !== null) {
                    service.toggleRowSelection(grid, row, grid.options.multiSelect);
                  }
                },
                /**
                 * @ngdoc function
                 * @name selectRow
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description Select the data row
                 * @param {object} rowEntity gridOptions.data[] array instance
                 */
                selectRow: function (rowEntity) {
                  var row = grid.getRow(rowEntity);
                  if (row !== null && !row.isSelected) {
                    service.toggleRowSelection(grid, row, grid.options.multiSelect);
                  }
                },
                /**
                 * @ngdoc function
                 * @name unSelectRow
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description UnSelect the data row
                 * @param {object} rowEntity gridOptions.data[] array instance
                 */
                unSelectRow: function (rowEntity) {
                  var row = grid.getRow(rowEntity);
                  if (row !== null && row.isSelected) {
                    service.toggleRowSelection(grid, row, grid.options.multiSelect);
                  }
                },
                /**
                 * @ngdoc function
                 * @name selectAllRows
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description Selects all rows.  Does nothing if multiSelect = false
                 */
                selectAllRows: function () {
                  if (grid.options.multiSelect === false) {
                    return;
                  }

                  grid.rows.forEach(function (row) {
                    row.isSelected = true;
                  });
                },
                /**
                 * @ngdoc function
                 * @name selectAllVisibleRows
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description Selects all visible rows.  Does nothing if multiSelect = false
                 */
                selectAllVisibleRows: function () {
                  if (grid.options.multiSelect === false) {
                    return;
                  }

                  grid.rows.forEach(function (row) {
                    if (row.visible) {
                      row.isSelected = true;
                    } else {
                      row.isSelected = false;
                    }
                  });
                },
                /**
                 * @ngdoc function
                 * @name clearSelectedRows
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description Unselects all rows
                 */
                clearSelectedRows: function () {
                  service.clearSelectedRows(grid);
                },
                /**
                 * @ngdoc function
                 * @name getSelectedRows
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description returns all selectedRow's entity references
                 */
                getSelectedRows: function () {
                  return service.getSelectedRows(grid).map(function (gridRow) {
                    return gridRow.entity;
                  });
                },
                /**
                 * @ngdoc function
                 * @name getSelectedGridRows
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description returns all selectedRow's as gridRows
                 */
                getSelectedGridRows: function () {
                  return service.getSelectedRows(grid);
                },
                /**
                 * @ngdoc function
                 * @name setMultiSelect
                 * @methodOf  ui.grid.selection.api:PublicApi
                 * @description Sets the current gridOption.multiSelect to true or false
                 * @param {bool} multiSelect true to allow multiple rows
                 */
                setMultiSelect: function (multiSelect) {
                  grid.options.multiSelect = multiSelect;
                }
              }
            }
          };

          grid.api.registerEventsFromObject(publicApi.events);

          grid.api.registerMethodsFromObject(publicApi.methods);

        },

        defaultGridOptions: function (gridOptions) {
          //default option to true unless it was explicitly set to false
          /**
           *  @ngdoc object
           *  @name ui.grid.selection.api:GridOptions
           *
           *  @description GridOptions for selection feature, these are available to be  
           *  set using the ui-grid {@link ui.grid.class:GridOptions gridOptions}
           */

          /**
           *  @ngdoc object
           *  @name enableRowSelection
           *  @propertyOf  ui.grid.selection.api:GridOptions
           *  @description Enable row selection for entire grid.
           *  <br/>Defaults to true
           */
          gridOptions.enableRowSelection = gridOptions.enableRowSelection !== false;
          /**
           *  @ngdoc object
           *  @name multiSelect
           *  @propertyOf  ui.grid.selection.api:GridOptions
           *  @description Enable multiple row selection for entire grid
           *  <br/>Defaults to true
           */
          gridOptions.multiSelect = gridOptions.multiSelect !== false;
          /**
           *  @ngdoc object
           *  @name enableRowHeaderSelection
           *  @propertyOf  ui.grid.selection.api:GridOptions
           *  @description Enable a row header to be used for selection
           *  <br/>Defaults to true
           */
          gridOptions.enableRowHeaderSelection = gridOptions.enableRowHeaderSelection !== false;
        },

        /**
         * @ngdoc function
         * @name toggleRowSelection
         * @methodOf  ui.grid.selection.service:uiGridSelectionService
         * @description Toggles row as selected or unselected
         * @param {Grid} grid grid object
         * @param {GridRow} row row to select or deselect
         * @param {bool} multiSelect if false, only one row at time can be selected
         */
        toggleRowSelection: function (grid, row, multiSelect) {
          var selected = row.isSelected;
          if (!multiSelect && !selected) {
            service.clearSelectedRows(grid);
          }
          row.isSelected = !selected;
          if (row.isSelected === true) {
            grid.selection.lastSelectedRow = row;
          }
          grid.api.selection.raise.rowSelectionChanged(row);
        },
        /**
         * @ngdoc function
         * @name shiftSelect
         * @methodOf  ui.grid.selection.service:uiGridSelectionService
         * @description selects a group of rows from the last selected row using the shift key
         * @param {Grid} grid grid object
         * @param {GridRow} clicked row
         * @param {bool} multiSelect if false, does nothing this is for multiSelect only
         */
        shiftSelect: function (grid, row, multiSelect) {
          if (!multiSelect) {
            return;
          }
          var selectedRows = service.getSelectedRows(grid);
          var fromRow = selectedRows.length > 0 ? grid.renderContainers.body.visibleRowCache.indexOf(grid.selection.lastSelectedRow) : 0;
          var toRow = grid.renderContainers.body.visibleRowCache.indexOf(row);
          //reverse select direction
          if (fromRow > toRow) {
            var tmp = fromRow;
            fromRow = toRow;
            toRow = tmp;
          }
          for (var i = fromRow; i <= toRow; i++) {
            var rowToSelect = grid.renderContainers.body.visibleRowCache[i];
            if (rowToSelect) {
              rowToSelect.isSelected = true;
              grid.selection.lastSelectedRow = rowToSelect;
              grid.api.selection.raise.rowSelectionChanged(rowToSelect);
            }
          }
        },
        /**
         * @ngdoc function
         * @name getSelectedRows
         * @methodOf  ui.grid.selection.service:uiGridSelectionService
         * @description Returns all the selected rows
         * @param {Grid} grid grid object
         */
        getSelectedRows: function (grid) {
          return grid.rows.filter(function (row) {
            return row.isSelected;
          });
        },

        /**
         * @ngdoc function
         * @name clearSelectedRows
         * @methodOf  ui.grid.selection.service:uiGridSelectionService
         * @description Clears all selected rows
         * @param {Grid} grid grid object
         */
        clearSelectedRows: function (grid) {
          service.getSelectedRows(grid).forEach(function (row) {
            row.isSelected = false;
            grid.api.selection.raise.rowSelectionChanged(row);
          });
        }


      };

      return service;

    }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.selection.directive:uiGridSelection
   *  @element div
   *  @restrict A
   *
   *  @description Adds selection features to grid
   *
   *  @example
   <example module="app">
   <file name="app.js">
   var app = angular.module('app', ['ui.grid', 'ui.grid.edit']);

   app.controller('MainCtrl', ['$scope', function ($scope) {
      $scope.data = [
        { name: 'Bob', title: 'CEO' },
            { name: 'Frank', title: 'Lowly Developer' }
      ];

      $scope.columnDefs = [
        {name: 'name', enableCellEdit: true},
        {name: 'title', enableCellEdit: true}
      ];
    }]);
   </file>
   <file name="index.html">
   <div ng-controller="MainCtrl">
   <div ui-grid="{ data: data, columnDefs: columnDefs }" ui-grid-selection></div>
   </div>
   </file>
   </example>
   */
  module.directive('uiGridSelection', ['$log', 'uiGridSelectionConstants', 'uiGridSelectionService', '$templateCache',
    function ($log, uiGridSelectionConstants, uiGridSelectionService, $templateCache) {
      return {
        replace: true,
        priority: 0,
        require: '^uiGrid',
        scope: false,
        compile: function () {
          return {
            pre: function ($scope, $elm, $attrs, uiGridCtrl) {
              uiGridSelectionService.initializeGrid(uiGridCtrl.grid);
              if (uiGridCtrl.grid.options.enableRowHeaderSelection) {
                var cellTemplate = 'ui-grid/selectionRowHeader';
                var selectionRowHeaderDef = { name: 'selectionRowHeaderCol', displayName: '', width: 30, cellTemplate: cellTemplate};
                uiGridCtrl.grid.addRowHeaderColumn(selectionRowHeaderDef);
              }
            },
            post: function ($scope, $elm, $attrs, uiGridCtrl) {

            }
          };
        }
      };
    }]);

  module.directive('uiGridSelectionRowHeaderButtons', ['$log', '$templateCache', 'uiGridSelectionService',
    function ($log, $templateCache, uiGridSelectionService) {
      return {
        replace: true,
        restrict: 'E',
        template: $templateCache.get('ui-grid/selectionRowHeaderButtons'),
        scope: true,
        require: '^uiGrid',
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          var self = uiGridCtrl.grid;
          $scope.selectButtonClick = function(row, evt) {
            if (evt.shiftKey) {
              uiGridSelectionService.shiftSelect(self, row, self.options.multiSelect);

            }
            else {
              uiGridSelectionService.toggleRowSelection(self, row, self.options.multiSelect);
            }
          };
        }
      };
    }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.selection.directive:uiGridViewport
   *  @element div
   *
   *  @description Stacks on top of ui.grid.uiGridViewport to alter the attributes used
   *  for the grid row
   */
  module.directive('uiGridViewport',
    ['$compile', 'uiGridConstants', 'uiGridSelectionConstants', '$log', '$parse', 'uiGridSelectionService',
      function ($compile, uiGridConstants, uiGridSelectionConstants, $log, $parse, uiGridSelectionService) {
        return {
          priority: -200, // run after default  directive
          scope: false,
          compile: function ($elm, $attrs) {
            var rowRepeatDiv = angular.element($elm.children().children()[0]);
            rowRepeatDiv.attr("ng-class", "{'ui-grid-row-selected': row.isSelected}");
            return {
              pre: function ($scope, $elm, $attrs, controllers) {

              },
              post: function ($scope, $elm, $attrs, controllers) {
              }
            };
          }
        };
      }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.selection.directive:uiGridCell
   *  @element div
   *  @restrict A
   *
   *  @description Stacks on top of ui.grid.uiGridCell to provide selection feature
   */
  module.directive('uiGridCell',
    ['$compile', 'uiGridConstants', 'uiGridSelectionConstants', '$log', '$parse', 'uiGridSelectionService',
      function ($compile, uiGridConstants, uiGridSelectionConstants, $log, $parse, uiGridSelectionService) {
        return {
          priority: -200, // run after default uiGridCell directive
          restrict: 'A',
          scope: false,
          link: function ($scope, $elm, $attrs) {

            if ($scope.grid.options.enableRowSelection && !$scope.grid.options.enableRowHeaderSelection) {
              $elm.addClass('ui-grid-disable-selection');
              registerRowSelectionEvents();
            }

            function registerRowSelectionEvents() {
              $elm.on('click', function (evt) {
                if (evt.shiftKey) {
                  uiGridSelectionService.shiftSelect($scope.grid, $scope.row, $scope.grid.options.multiSelect);

                }
                else {
                  uiGridSelectionService.toggleRowSelection($scope.grid, $scope.row, $scope.grid.options.multiSelect);
                }
                $scope.$apply();
              });
            }
          }
        };
      }]);

})();
angular.module('ui.grid').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ui-grid/ui-grid-footer',
    "<div class=\"ui-grid-footer-panel\"><div ui-grid-group-panel ng-show=\"grid.options.showGroupPanel\"></div><div class=\"ui-grid-footer ui-grid-footer-viewport\"><div class=\"ui-grid-footer-canvas\"><div ng-repeat=\"col in colContainer.renderedColumns track by col.colDef.name\" ui-grid-footer-cell col=\"col\" render-index=\"$index\" class=\"ui-grid-footer-cell clearfix\" ng-style=\"$index === 0 && colContainer.columnStyle($index)\"></div></div></div></div>"
  );


  $templateCache.put('ui-grid/ui-grid-group-panel',
    "<div class=\"ui-grid-group-panel\"><div ui-t=\"groupPanel.description\" class=\"description\" ng-show=\"groupings.length == 0\"></div><ul ng-show=\"groupings.length > 0\" class=\"ngGroupList\"><li class=\"ngGroupItem\" ng-repeat=\"group in configGroups\"><span class=\"ngGroupElement\"><span class=\"ngGroupName\">{{group.displayName}} <span ng-click=\"removeGroup($index)\" class=\"ngRemoveGroup\">x</span></span> <span ng-hide=\"$last\" class=\"ngGroupArrow\"></span></span></li></ul></div>"
  );


  $templateCache.put('ui-grid/ui-grid-header',
    "<div class=\"ui-grid-top-panel\"><div ui-grid-group-panel ng-show=\"grid.options.showGroupPanel\"></div><div class=\"ui-grid-header ui-grid-header-viewport\"><div class=\"ui-grid-header-canvas\"><div class=\"ui-grid-header-cell clearfix\" ng-repeat=\"col in colContainer.renderedColumns track by col.colDef.name\" ui-grid-header-cell col=\"col\" render-index=\"$index\" ng-style=\"$index === 0 && colContainer.columnStyle($index)\"></div></div></div><div ui-grid-menu></div></div>"
  );


  $templateCache.put('ui-grid/ui-grid-no-header',
    "<div class=\"ui-grid-top-panel\"></div>"
  );


  $templateCache.put('ui-grid/ui-grid-row',
    "<div ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>"
  );


  $templateCache.put('ui-grid/ui-grid',
    "<div ui-i18n=\"en\" class=\"ui-grid\"><!-- TODO (c0bra): add \"scoped\" attr here, eventually? --><style ui-grid-style>.grid{{ grid.id }} {\n" +
    "      /* Styles for the grid */\n" +
    "    }\n" +
    "\n" +
    "    .grid{{ grid.id }} .ui-grid-row, .grid{{ grid.id }} .ui-grid-cell, .grid{{ grid.id }} .ui-grid-cell .ui-grid-vertical-bar {\n" +
    "      height: {{ grid.options.rowHeight }}px;\n" +
    "    }\n" +
    "\n" +
    "    .grid{{ grid.id }} .ui-grid-row:last-child .ui-grid-cell {\n" +
    "      border-bottom-width: {{ ((grid.getTotalRowHeight() < grid.getViewportHeight()) && '1') || '0' }}px;\n" +
    "    }\n" +
    "\n" +
    "    {{ grid.verticalScrollbarStyles }}\n" +
    "    {{ grid.horizontalScrollbarStyles }}\n" +
    "\n" +
    "    .ui-grid[dir=rtl] .ui-grid-viewport {\n" +
    "      padding-left: {{ grid.verticalScrollbarWidth }}px;\n" +
    "    }\n" +
    "\n" +
    "    {{ grid.customStyles }}</style><div ui-grid-render-container container-id=\"'body'\" col-container-name=\"'body'\" row-container-name=\"'body'\" bind-scroll-horizontal=\"true\" bind-scroll-vertical=\"true\" enable-scrollbars=\"grid.options.enableScrollbars\"></div><div ui-grid-column-menu ng-if=\"grid.options.enableColumnMenu\"></div><div ng-transclude></div></div>"
  );


  $templateCache.put('ui-grid/uiGridCell',
    "<div class=\"ui-grid-cell-contents\">{{COL_FIELD CUSTOM_FILTERS}}</div>"
  );


  $templateCache.put('ui-grid/uiGridColumnFilter',
    "<li class=\"ui-grid-menu-item ui-grid-clearfix ui-grid-column-filter\" ng-show=\"itemShown()\" ng-click=\"$event.stopPropagation();\"><div class=\"input-container\"><input class=\"column-filter-input\" type=\"text\" ng-model=\"item.model\" placeholder=\"{{ i18n.search.placeholder }}\"><div class=\"column-filter-cancel-icon-container\"><i class=\"ui-grid-filter-cancel ui-grid-icon-cancel column-filter-cancel-icon\">&nbsp;</i></div></div><div style=\"button-container\" ng-click=\"item.action($event)\"><div class=\"ui-grid-button\"><i class=\"ui-grid-icon-search\">&nbsp;</i></div></div></li>"
  );


  $templateCache.put('ui-grid/uiGridColumnMenu',
    "<div class=\"ui-grid-column-menu\"><div ui-grid-menu menu-items=\"menuItems\"><!-- <div class=\"ui-grid-column-menu\">\n" +
    "    <div class=\"inner\" ng-show=\"menuShown\">\n" +
    "      <ul>\n" +
    "        <div ng-show=\"grid.options.enableSorting\">\n" +
    "          <li ng-click=\"sortColumn($event, asc)\" ng-class=\"{ 'selected' : col.sort.direction == asc }\"><i class=\"ui-grid-icon-sort-alt-up\"></i> Sort Ascending</li>\n" +
    "          <li ng-click=\"sortColumn($event, desc)\" ng-class=\"{ 'selected' : col.sort.direction == desc }\"><i class=\"ui-grid-icon-sort-alt-down\"></i> Sort Descending</li>\n" +
    "          <li ng-show=\"col.sort.direction\" ng-click=\"unsortColumn()\"><i class=\"ui-grid-icon-cancel\"></i> Remove Sort</li>\n" +
    "        </div>\n" +
    "      </ul>\n" +
    "    </div>\n" +
    "  </div> --></div></div>"
  );


  $templateCache.put('ui-grid/uiGridFooterCell',
    "<div class=\"ui-grid-cell-contents\" col-index=\"renderIndex\"><div>{{ col.getAggregationValue() }}</div></div>"
  );


  $templateCache.put('ui-grid/uiGridHeaderCell',
    "<div ng-class=\"{ 'sortable': sortable }\"><div class=\"ui-grid-vertical-bar\">&nbsp;</div><div class=\"ui-grid-cell-contents\" col-index=\"renderIndex\">{{ col.displayName CUSTOM_FILTERS }} <span ui-grid-visible=\"col.sort.direction\" ng-class=\"{ 'ui-grid-icon-up-dir': col.sort.direction == asc, 'ui-grid-icon-down-dir': col.sort.direction == desc, 'ui-grid-icon-blank': !col.sort.direction }\">&nbsp;</span></div><div ng-if=\"grid.options.enableColumnMenu && !col.isRowHeader\" class=\"ui-grid-column-menu-button\" ng-click=\"toggleMenu($event)\"><i class=\"ui-grid-icon-angle-down\">&nbsp;<i></i></i></div><div ng-if=\"filterable\" class=\"ui-grid-filter-container\" ng-repeat=\"colFilter in col.filters\"><input type=\"text\" class=\"ui-grid-filter-input\" ng-model=\"colFilter.term\" ng-click=\"$event.stopPropagation()\" ng-attr-placeholder=\"{{colFilter.placeholder || ''}}\"><div class=\"ui-grid-filter-button\" ng-click=\"colFilter.term = null\"><i class=\"ui-grid-icon-cancel right\" ng-show=\"!!colFilter.term\">&nbsp;</i> <!-- use !! because angular interprets 'f' as false --></div></div></div>"
  );


  $templateCache.put('ui-grid/uiGridMenu',
    "<div class=\"ui-grid-menu\"><div class=\"ui-grid-menu-inner\" ng-show=\"shown\"><ul class=\"ui-grid-menu-items\"><li ng-repeat=\"item in menuItems\" ui-grid-menu-item action=\"item.action\" title=\"item.title\" active=\"item.active\" icon=\"item.icon\" shown=\"item.shown\" context=\"item.context\" template-url=\"item.templateUrl\"></li></ul></div></div>"
  );


  $templateCache.put('ui-grid/uiGridMenuItem',
    "<li class=\"ui-grid-menu-item\" ng-click=\"itemAction($event, title)\" ng-show=\"itemShown()\" ng-class=\"{ 'ui-grid-menu-item-active' : active() }\"><i ng-class=\"icon\"></i> {{ title }}</li>"
  );


  $templateCache.put('ui-grid/uiGridRenderContainer',
    "<div class=\"ui-grid-render-container\"><div ui-grid-header></div><div ui-grid-viewport></div><div ui-grid-footer ng-if=\"grid.options.showFooter\"></div><!-- native scrolling --><div ui-grid-native-scrollbar ng-if=\"enableScrollbars\" type=\"vertical\"></div><div ui-grid-native-scrollbar ng-if=\"enableScrollbars\" type=\"horizontal\"></div></div>"
  );


  $templateCache.put('ui-grid/uiGridViewport',
    "<div class=\"ui-grid-viewport\"><div class=\"ui-grid-canvas\"><div ng-repeat=\"(rowRenderIndex, row) in rowContainer.renderedRows track by row.uid\" class=\"ui-grid-row\" ng-style=\"containerCtrl.rowStyle(rowRenderIndex)\"><div ui-grid-row=\"row\" row-render-index=\"rowRenderIndex\"></div></div></div></div>"
  );


  $templateCache.put('ui-grid/cellEditor',
    "<div><form name=\"inputForm\"><input type=\"{{inputType}}\" ng-class=\"'colt' + col.index\" ui-grid-editor ng-model=\"COL_FIELD\"></form></div>"
  );


  $templateCache.put('ui-grid/dropdownEditor',
    "<div><form name=\"inputForm\"><select ng-class=\"'colt' + col.index\" ui-grid-edit-dropdown ng-model=\"COL_FIELD\" ng-options=\"field[editDropdownIdLabel] as field[editDropdownValueLabel] CUSTOM_FILTERS for field in editDropdownOptionsArray\"></select></form></div>"
  );


  $templateCache.put('ui-grid/expandableRow',
    "<div ui-grid-expandable-row ng-if=\"expandableRow.shouldRenderExpand()\" class=\"expandableRow\" style=\"float:left;margin-top: 1px;margin-bottom: 1px\" ng-style=\"{width: (grid.renderContainers.body.getCanvasWidth() - grid.verticalScrollbarWidth)\n" +
    "     ,height: grid.options.expandable.expandableRowHeight}\"></div>"
  );


  $templateCache.put('ui-grid/expandableRowHeader',
    "<div class=\"ui-grid-row-header-cell uiGridExpandableButtonsCell\"><div class=\"ui-grid-cell-contents\"><i ng-class=\"{'ui-grid-icon-plus-squared':!row.isExpanded, 'ui-grid-icon-minus-squared':row.isExpanded}\" ng-click=\"grid.api.expandable.toggleRowExpansion(row.entity)\"></i></div></div>"
  );


  $templateCache.put('ui-grid/expandableScrollFiller',
    "<div ng-if=\"expandableRow.shouldRenderFiller()\" style=\"float:left;margin-top: 2px;margin-bottom: 2px\" ng-style=\"{width: (grid.getViewportWidth())\n" +
    "     ,height: grid.options.expandable.expandableRowHeight, 'margin-left': grid.options.rowHeader.rowHeaderWidth}\"><i class=\"ui-grid-icon-spin5 ui-grid-animate-spin\" ng-style=\"{'margin-top': ( grid.options.expandable.expandableRowHeight/2 - 5),\n" +
    "            'margin-left':((grid.getViewportWidth() - grid.options.rowHeader.rowHeaderWidth)/2 - 5)}\"></i></div>"
  );


  $templateCache.put('ui-grid/csvLink',
    "<span class=\"ui-grid-exporter-csv-link-span\"><a href=\"data:text/csv;charset=UTF-8,CSV_CONTENT\">LINK_LABEL</a></span>"
  );


  $templateCache.put('ui-grid/columnResizer',
    "<div ui-grid-column-resizer ng-if=\"grid.options.enableColumnResizing\" class=\"ui-grid-column-resizer\" col=\"col\" position=\"right\" render-index=\"renderIndex\"></div>"
  );


  $templateCache.put('ui-grid/selectionRowHeader',
    "<div class=\"ui-grid-row-header-cell ui-grid-disable-selection\"><div class=\"ui-grid-cell-contents\"><ui-grid-selection-row-header-buttons></ui-grid-selection-row-header-buttons></div></div>"
  );


  $templateCache.put('ui-grid/selectionRowHeaderButtons',
    "<div class=\"ui-grid-selection-row-header-buttons ui-grid-icon-ok\" ng-class=\"{'ui-grid-row-selected': row.isSelected}\" ng-click=\"selectButtonClick(row, $event)\">&nbsp;</div>"
  );

}]);

/*! ui-grid - v2.0.10-7485e6e - 2014-04-28
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
    events: {
      GRID_SCROLL: 'uiGridScroll',
      GRID_SCROLLING: 'uiGridScrolling',
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

    // TODO(c0bra): Create full list of these somehow. NOTE: do any allow a space before or after them?
    CURRENCY_SYMBOLS: ['ƒ', '$', '£', '$', '¤', '¥', '៛', '₩', '₱', '฿', '₫']
  });

})();
(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridBody', ['$log', '$document', '$timeout', 'uiGridConstants', 'gridUtil',
    function($log, $document, $timeout, uiGridConstants, GridUtil) {
    return {
      replace: true,
      // priority: 1000,
      templateUrl: 'ui-grid/ui-grid-body',
      require: '?^uiGrid',
      scope: false,
      link: function($scope, $elm, $attrs, uiGridCtrl) {
        if (uiGridCtrl === undefined) {
          throw new Error('[ui-grid-body] uiGridCtrl is undefined!');
        }

        $log.debug('ui-grid-body link');

        // Disable animations on the grid body so ngAnimate, if present, doesn't ruin performance by toggling classes on all the elements
        GridUtil.disableAnimations($elm);

        // Stick the canvas in the controller
        uiGridCtrl.canvas = angular.element( $elm[0].getElementsByClassName('ui-grid-canvas')[0] );
        // uiGridCtrl.viewport = elm; //angular.element( elm[0].getElementsByClassName('ui-grid-viewport')[0] );
        uiGridCtrl.viewport = angular.element( $elm[0].getElementsByClassName('ui-grid-viewport')[0] );

        uiGridCtrl.viewportOuterHeight = GridUtil.outerElementHeight(uiGridCtrl.viewport[0]);
        uiGridCtrl.viewportOuterWidth = GridUtil.outerElementWidth(uiGridCtrl.viewport[0]);

        // Explicitly set the viewport scrollTop to 0; Firefox apparently caches it
        uiGridCtrl.viewport[0].scrollTop = 0;
        uiGridCtrl.viewport[0].scrollLeft = 0;

        uiGridCtrl.prevScrollTop = 0;
        uiGridCtrl.prevScrolltopPercentage = 0;
        uiGridCtrl.prevScrollLeft = 0;
        uiGridCtrl.prevRowScrollIndex = 0;
        uiGridCtrl.prevColumnScrollIndex = 0;
        uiGridCtrl.currentTopRow = 0;
        uiGridCtrl.currentFirstColumn = 0;

        uiGridCtrl.adjustScrollVertical = function (scrollTop, scrollPercentage, force) {
          if (uiGridCtrl.prevScrollTop === scrollTop && !force) {
            return;
          }

          // scrollTop = uiGridCtrl.canvas[0].scrollHeight * scrollPercentage;
          scrollTop = uiGridCtrl.grid.getCanvasHeight() * scrollPercentage;

          uiGridCtrl.adjustRows(scrollTop, scrollPercentage);

          uiGridCtrl.prevScrollTop = scrollTop;
          uiGridCtrl.prevScrolltopPercentage = scrollPercentage;
        };

        uiGridCtrl.adjustRows = function(scrollTop, scrollPercentage) {
          var minRows = uiGridCtrl.grid.minRowsToRender();
          // var maxRowIndex = uiGridCtrl.grid.rows.length - minRows;
          var maxRowIndex = uiGridCtrl.grid.visibleRowCache.length - minRows;
          uiGridCtrl.maxRowIndex = maxRowIndex;

          var curRowIndex = uiGridCtrl.prevRowScrollIndex;
          
          var rowIndex = Math.ceil(Math.min(maxRowIndex, maxRowIndex * scrollPercentage));

          // Define a max row index that we can't scroll past
          if (rowIndex > maxRowIndex) {
            rowIndex = maxRowIndex;
          }
          
          var newRange = [];
          if (uiGridCtrl.grid.visibleRowCache.length > uiGridCtrl.grid.options.virtualizationThreshold) {
            // Have we hit the threshold going down?
            if (uiGridCtrl.prevScrollTop < scrollTop && rowIndex < uiGridCtrl.prevRowScrollIndex + uiGridCtrl.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
              return;
            }
            //Have we hit the threshold going up?
            if (uiGridCtrl.prevScrollTop > scrollTop && rowIndex > uiGridCtrl.prevRowScrollIndex - uiGridCtrl.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
              return;
            }

            var rangeStart = Math.max(0, rowIndex - uiGridCtrl.grid.options.excessRows);
            var rangeEnd = Math.min(uiGridCtrl.grid.visibleRowCache.length, rowIndex + minRows + uiGridCtrl.grid.options.excessRows);

            newRange = [rangeStart, rangeEnd];
          }
          else {
            var maxLen = uiGridCtrl.grid.visibleRowCache.length;
            newRange = [0, Math.max(maxLen, minRows + uiGridCtrl.grid.options.excessRows)];
          }
          
          updateViewableRowRange(newRange);
          uiGridCtrl.prevRowScrollIndex = rowIndex;

          // uiGridCtrl.firePostScrollEvent({
          //   rows: {
          //     prevIndex: curRowIndex,
          //     curIndex: uiGridCtrl.prevRowScrollIndex
          //   }
          // });
        };

        uiGridCtrl.redrawRows = function() {
          uiGridCtrl.adjustRows(uiGridCtrl.prevScrollTop, uiGridCtrl.prevScrolltopPercentage);
        };

        // Virtualization for horizontal scrolling
        uiGridCtrl.adjustScrollHorizontal = function (scrollLeft, scrollPercentage, force) {
          if (uiGridCtrl.prevScrollLeft === scrollLeft && !force) {
            return;
          }

          // scrollLeft = uiGridCtrl.canvas[0].scrollWidth * scrollPercentage;
          scrollLeft = uiGridCtrl.grid.getCanvasWidth() * scrollPercentage;

          uiGridCtrl.adjustColumns(scrollLeft, scrollPercentage);

          uiGridCtrl.prevScrollLeft = scrollLeft;
        };

        uiGridCtrl.adjustColumns = function(scrollLeft, scrollPercentage) {
          var minCols = uiGridCtrl.grid.minColumnsToRender();
          var maxColumnIndex = uiGridCtrl.grid.columns.length - minCols;
          uiGridCtrl.maxColumnIndex = maxColumnIndex;
          
          var colIndex = Math.ceil(Math.min(maxColumnIndex, maxColumnIndex * scrollPercentage));

          // Define a max row index that we can't scroll past
          if (colIndex > maxColumnIndex) {
            colIndex = maxColumnIndex;
          }
          
          var newRange = [];
          if (uiGridCtrl.grid.columns.length > uiGridCtrl.grid.options.columnVirtualizationThreshold && uiGridCtrl.grid.getCanvasWidth() > uiGridCtrl.grid.getViewportWidth()) {
            // Have we hit the threshold going down?
            if (uiGridCtrl.prevScrollLeft < scrollLeft && colIndex < uiGridCtrl.prevColumnScrollIndex + uiGridCtrl.grid.options.horizontalScrollThreshold && colIndex < maxColumnIndex) {
              return;
            }
            //Have we hit the threshold going up?
            if (uiGridCtrl.prevScrollLeft > scrollLeft && colIndex > uiGridCtrl.prevColumnScrollIndex - uiGridCtrl.grid.options.horizontalScrollThreshold && colIndex < maxColumnIndex) {
              return;
            }

            var rangeStart = Math.max(0, colIndex - uiGridCtrl.grid.options.excessColumns);
            var rangeEnd = Math.min(uiGridCtrl.grid.columns.length, colIndex + minCols + uiGridCtrl.grid.options.excessColumns);

            newRange = [rangeStart, rangeEnd];
          }
          else {
            var maxLen = uiGridCtrl.grid.columns.length;
            newRange = [0, Math.max(maxLen, minCols + uiGridCtrl.grid.options.excessColumns)];
          }
          
          updateViewableColumnRange(newRange);
          uiGridCtrl.prevColumnScrollIndex = colIndex;
        };

        // Listen for scroll events
        var scrollUnbinder = $scope.$on(uiGridConstants.events.GRID_SCROLL, function(evt, args) {
          // GridUtil.requestAnimationFrame(function() {
            uiGridCtrl.prevScrollArgs = args;

            // Vertical scroll
            if (args.y) {
              var scrollLength = (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

              // Add the height of the native horizontal scrollbar, if it's there. Otherwise it will mask over the final row
              if (uiGridCtrl.grid.horizontalScrollbarHeight && uiGridCtrl.grid.horizontalScrollbarHeight > 0) {
                scrollLength = scrollLength + uiGridCtrl.grid.horizontalScrollbarHeight;
              }

              var oldScrollTop = uiGridCtrl.viewport[0].scrollTop;
              
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
              
              // NOTE: uiGridBody catches this in its 'scroll' event handler. setting scrollTop fires a scroll event
              // uiGridCtrl.adjustScrollVertical(newScrollTop, scrollYPercentage);

              uiGridCtrl.viewport[0].scrollTop = newScrollTop;
              
              uiGridCtrl.grid.options.offsetTop = newScrollTop;

              uiGridCtrl.prevScrollArgs.y.pixels = newScrollTop - oldScrollTop;
            }

            // Horizontal scroll
            if (args.x) {
              var scrollWidth = (uiGridCtrl.grid.getCanvasWidth() - uiGridCtrl.grid.getViewportWidth());

              var oldScrollLeft = uiGridCtrl.viewport[0].scrollLeft;

              var scrollXPercentage;
              if (typeof(args.x.percentage) !== 'undefined' && args.x.percentage !== undefined) {
                scrollXPercentage = args.x.percentage;
              }
              else if (typeof(args.x.pixels) !== 'undefined' && args.x.pixels !== undefined) {
                scrollXPercentage = args.x.percentage = (oldScrollLeft + args.x.pixels) / scrollWidth;
                // $log.debug('x.percentage', args.x.percentage);
              }
              else {
                throw new Error("No percentage or pixel value provided for scroll event X axis");
              }

              var newScrollLeft = Math.max(0, scrollXPercentage * scrollWidth);
              
              // uiGridCtrl.adjustScrollHorizontal(newScrollLeft, scrollXPercentage);

              uiGridCtrl.viewport[0].scrollLeft = newScrollLeft;

              if (uiGridCtrl.headerViewport) {
                uiGridCtrl.headerViewport.scrollLeft = newScrollLeft;
              }

              uiGridCtrl.grid.options.offsetLeft = newScrollLeft;

              uiGridCtrl.prevScrollArgs.x.pixels = newScrollLeft - oldScrollLeft;
            }
          // });
        });

        // Scroll the viewport when the mousewheel is used
        $elm.bind('wheel mousewheel DomMouseScroll MozMousePixelScroll', function(evt) {
          // use wheelDeltaY
          evt.preventDefault();

          var newEvent = GridUtil.normalizeWheelEvent(evt);

          var args = { target: $elm };
          if (newEvent.deltaY !== 0) {
            var scrollYAmount = newEvent.deltaY * -120;

            // Get the scroll percentage
            var scrollYPercentage = (uiGridCtrl.viewport[0].scrollTop + scrollYAmount) / (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

            // Keep scrollPercentage within the range 0-1.
            if (scrollYPercentage < 0) { scrollYPercentage = 0; }
            else if (scrollYPercentage > 1) { scrollYPercentage = 1; }

            args.y = { percentage: scrollYPercentage, pixels: scrollYAmount };
          }
          if (newEvent.deltaX !== 0) {
            var scrollXAmount = newEvent.deltaX * -120;

            // Get the scroll percentage
            var scrollXPercentage = (uiGridCtrl.viewport[0].scrollLeft + scrollXAmount) / (uiGridCtrl.grid.getCanvasWidth() - uiGridCtrl.grid.getViewportWidth());

            // Keep scrollPercentage within the range 0-1.
            if (scrollXPercentage < 0) { scrollXPercentage = 0; }
            else if (scrollXPercentage > 1) { scrollXPercentage = 1; }

            args.x = { percentage: scrollXPercentage, pixels: scrollXAmount };
          }

          // $scope.$broadcast(uiGridConstants.events.GRID_SCROLL, args);

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
            var scrollYPercentage = (scrollTopStart + deltaY) / (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

            if (scrollYPercentage > 1) { scrollYPercentage = 1; }
            else if (scrollYPercentage < 0) { scrollYPercentage = 0; }

            args.y = { percentage: scrollYPercentage, pixels: deltaY };
          }
          if (deltaX !== 0) {
            var scrollXPercentage = (scrollLeftStart + deltaX) / (uiGridCtrl.grid.getCanvasWidth() - uiGridCtrl.grid.getViewportWidth());

            if (scrollXPercentage > 1) { scrollXPercentage = 1; }
            else if (scrollXPercentage < 0) { scrollXPercentage = 0; }

            args.x = { percentage: scrollXPercentage, pixels: deltaX };
          }

          $scope.$broadcast(uiGridConstants.events.GRID_SCROLL, args);
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
          var scrollTopEnd = uiGridCtrl.viewport[0].scrollTop;
          var scrollLeftEnd = uiGridCtrl.viewport[0].scrollTop;
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
                var scrollYPercentage = (uiGridCtrl.viewport[0].scrollTop + scrollYLength) / (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

                args.y = { percentage: scrollYPercentage, pixels: scrollYLength };
              }

              if (scrollXLength !== 0) {
                var scrollXPercentage = (uiGridCtrl.viewport[0].scrollLeft + scrollXLength) / (uiGridCtrl.grid.getCanvasWidth() - uiGridCtrl.grid.getViewportWidth());
                args.x = { percentage: scrollXPercentage, pixels: scrollXLength };
              }

              $scope.$broadcast(uiGridConstants.events.GRID_SCROLL, args);

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

          decelerate();
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
            scrollTopStart = uiGridCtrl.viewport[0].scrollTop;
            scrollLeftStart = uiGridCtrl.viewport[0].scrollLeft;
            
            $document.on('touchmove', touchmove);
            $document.on('touchend touchcancel', touchend);
          });
        }

        // TODO(c0bra): Scroll the viewport when the up and down arrow keys are used? This would interfere with cell navigation
        $elm.bind('keydown', function(evt, args) {

        });

        // Unbind all $watches and events on $destroy
        $elm.bind('$destroy', function() {
          scrollUnbinder();
          $elm.unbind('keydown');

          ['touchstart', 'touchmove', 'touchend','keydown', 'wheel', 'mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'].forEach(function (eventName) {
            $elm.unbind(eventName);
          });
        });



        var setRenderedRows = function (newRows) {
          // NOTE: without the $evalAsync the new rows don't show up
          // $scope.$evalAsync(function() {
            uiGridCtrl.grid.setRenderedRows(newRows);
            $scope.grid.refreshCanvas();
          // });
        };

        var setRenderedColumns = function (newColumns) {
          // NOTE: without the $evalAsync the new rows don't show up
          // $timeout(function() {
            uiGridCtrl.grid.setRenderedColumns(newColumns);
            updateColumnOffset();
            $scope.grid.refreshCanvas();
          // });
        };

        // Method for updating the visible rows
        var updateViewableRowRange = function(renderedRange) {
          // Slice out the range of rows from the data
          // var rowArr = uiGridCtrl.grid.rows.slice(renderedRange[0], renderedRange[1]);
          var rowArr = uiGridCtrl.grid.visibleRowCache.slice(renderedRange[0], renderedRange[1]);

          // Define the top-most rendered row
          uiGridCtrl.currentTopRow = renderedRange[0];

          setRenderedRows(rowArr);
        };

        // Method for updating the visible columns
        var updateViewableColumnRange = function(renderedRange) {
          // Slice out the range of rows from the data
          var columnArr = uiGridCtrl.grid.columns.slice(renderedRange[0], renderedRange[1]);

          // Define the left-most rendered columns
          uiGridCtrl.currentFirstColumn = renderedRange[0];

          setRenderedColumns(columnArr);
        };

        $scope.rowStyle = function (index) {
          var styles = {};

          if (index === 0 && uiGridCtrl.currentTopRow !== 0) {
            // The row offset-top is just the height of the rows above the current top-most row, which are no longer rendered
            var hiddenRowWidth = (uiGridCtrl.currentTopRow) * uiGridCtrl.grid.options.rowHeight;

            // return { 'margin-top': hiddenRowWidth + 'px' };
            styles['margin-top'] = hiddenRowWidth + 'px';
          }

          if (uiGridCtrl.currentFirstColumn !== 0) {
            styles['margin-left'] = uiGridCtrl.columnOffset + 'px';
          }

          return styles;
        };
        
        var updateColumnOffset = function() {
          // Calculate the width of the columns on the left side that are no longer rendered.
          //  That will be the offset for the columns as we scroll horizontally.
          var hiddenColumnsWidth = 0;
          for (var i = 0; i < uiGridCtrl.currentFirstColumn; i++) {
            hiddenColumnsWidth += $scope.grid.columns[i].drawnWidth;
          }

          uiGridCtrl.columnOffset = hiddenColumnsWidth;
        };

        $scope.columnStyle = function (index) {
          if (index === 0 && uiGridCtrl.currentFirstColumn !== 0) {
            var offset = uiGridCtrl.columnOffset;

            return { 'margin-left': offset + 'px' };
          }

          return null;
        };
      }
    };
  }]);

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
              $elm.empty().append(clonedElement);
            });
          }

          // If the grid controller is present, use it to get the compiled cell template function
          if (uiGridCtrl) {
            $scope.getCellValue = uiGridCtrl.getCellValue;

            compileTemplate();

            $scope.$watch('col.cellTemplate', function (n, o) {
              if (n !== o) {
                compileTemplate();
              }
            });
          }
          // No controller, compile the element manually
          else {
            var html = $scope.col.cellTemplate
              .replace(uiGridConstants.COL_FIELD, 'getCellValue(row, col)');
            var cellElement = $compile(html)($scope);
            $elm.append(cellElement);
          }
        }
        //post: function($scope, $elm, $attrs) {}
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
      uiGridCtrl.columnMenuCtrl = self;

      // Save whether we're shown or not so the columns can check
      self.shown = $scope.menuShown = false;

      // Put asc and desc sort directions in scope
      $scope.asc = uiGridConstants.ASC;
      $scope.desc = uiGridConstants.DESC;

      // $scope.i18n = i18nService;

      // Get the grid menu element. We'll use it to calculate positioning
      var menu = $elm[0].querySelectorAll('.ui-grid-menu');

      // Get the inner menu part. It's what slides up/down
      var inner = $elm[0].querySelectorAll('.ui-grid-menu-inner');

      function sortable() {
        if (uiGridCtrl.grid.options.enableSorting && typeof($scope.col) !== 'undefined' && $scope.col && $scope.col.enableSorting) {
          return true;
        }
        else {
          return false;
        }
      }

      function filterable() {
        if (uiGridCtrl.grid.options.enableFiltering && typeof($scope.col) !== 'undefined' && $scope.col && $scope.col.enableFiltering) {
          return true;
        }
        else {
          return false;
        }
      }
      
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
          title: i18nService.get().sort.ascending,
          icon: 'ui-grid-icon-sort-alt-up',
          action: function($event) {
            $event.stopPropagation();
            $scope.sortColumn($event, uiGridConstants.ASC);
          },
          shown: function () {
            return sortable();
          },
          active: function() {
            return (typeof($scope.col) !== 'undefined' && typeof($scope.col.sort) !== 'undefined' && typeof($scope.col.sort.direction) !== 'undefined' && $scope.col.sort.direction === uiGridConstants.ASC);
          }
        },
        {
          title: i18nService.get().sort.descending,
          icon: 'ui-grid-icon-sort-alt-down',
          action: function($event) {
            $event.stopPropagation();
            $scope.sortColumn($event, uiGridConstants.DESC);
          },
          shown: function() {
            return sortable();
          },
          active: function() {
            return (typeof($scope.col) !== 'undefined' && typeof($scope.col.sort) !== 'undefined' && typeof($scope.col.sort.direction) !== 'undefined' && $scope.col.sort.direction === uiGridConstants.DESC);
          }
        },
        {
          title: i18nService.get().sort.remove,
          icon: 'ui-grid-icon-cancel',
          action: function ($event) {
            $event.stopPropagation();
            $scope.unsortColumn();
          },
          shown: function() {
            return (sortable() && typeof($scope.col) !== 'undefined' && (typeof($scope.col.sort) !== 'undefined' && typeof($scope.col.sort.direction) !== 'undefined') && $scope.col.sort.direction !== null);
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
      self.showMenu = function(column, $columnElement) {
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
        if (uiGridCtrl.grid.options.offsetLeft) {
          offset = uiGridCtrl.grid.options.offsetLeft;
        }

        var height = gridUtil.elementHeight($columnElement, true);
        var width = gridUtil.elementWidth($columnElement, true);

        // Flag for whether we're hidden for showing via $animate
        var hidden = false;

        // Re-position the menu AFTER it's been shown, so we can calculate the width correctly.
        function reposition() {
          $timeout(function() {
            if (hidden && $animate) {
              $animate.removeClass(inner, 'ng-hide');
              self.shown = $scope.menuShown = true;
              $scope.$broadcast('show-menu');
            }
            else if (angular.element(inner).hasClass('ng-hide')) {
              angular.element(inner).removeClass('ng-hide');
            }

            var myWidth = gridUtil.elementWidth(menu, true);

            // TODO(c0bra): use padding-left/padding-right based on document direction (ltr/rtl), place menu on proper side
            // Get the column menu right padding
            var paddingRight = parseInt(angular.element(menu).css('padding-right'), 10);

            // $log.debug('position', left + ' - ' + offset + ' + ' + width + ' - ' + myWidth + ' + ' + paddingRight);

            $elm.css('left', (left - offset + width - myWidth + paddingRight) + 'px');
            $elm.css('top', (top + height) + 'px');

            // Hide the menu on a click on the document
            $document.on('click', documentClick);
          });
        }

        if ($scope.menuShown && $animate) {
          // Animate closing the menu on the current column, then animate it opening on the other column
          $animate.addClass(inner, 'ng-hide', reposition);
          hidden = true;
        }
        else {
          self.shown = $scope.menuShown = true;
          $scope.$broadcast('show-menu');
          reposition();
        }
      };

      // Hide the menu
      self.hideMenu = function() {
        self.col = null;
        self.shown = $scope.menuShown = false;
        $scope.$broadcast('hide-menu');
      };

      // Prevent clicks on the menu from bubbling up to the document and making it hide prematurely
      // $elm.on('click', function (event) {
      //   event.stopPropagation();
      // });

      function documentClick() {
        $scope.$apply(self.hideMenu);
        $document.off('click', documentClick);
      }
      
      function resizeHandler() {
        $scope.$apply(self.hideMenu);
      }
      angular.element($window).bind('resize', resizeHandler);

      $scope.$on('$destroy', $scope.$on(uiGridConstants.events.GRID_SCROLL, function(evt, args) {
        self.hideMenu();
        // if (! $scope.$$phase) { $scope.$apply(); }
      }));

      $scope.$on('$destroy', $scope.$on(uiGridConstants.events.ITEM_DRAGGING, function(evt, args) {
        self.hideMenu();
        // if (! $scope.$$phase) { $scope.$apply(); }
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
            uiGridCtrl.refreshRows();
            self.hideMenu();
          });
      };

      $scope.unsortColumn = function () {
        $scope.col.unsort();

        uiGridCtrl.refreshRows();
        self.hideMenu();
      };
    }
  };

  return uiGridColumnMenu;

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

angular.module('ui.grid').directive('uiGridHeaderCell', ['$log', '$timeout', '$window', '$document', 'gridUtil', 'uiGridConstants', function ($log, $timeout, $window, $document, gridUtil, uiGridConstants) {
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
    templateUrl: 'ui-grid/uiGridHeaderCell',
    replace: true,
    link: function ($scope, $elm, $attrs, uiGridCtrl) {
      $scope.grid = uiGridCtrl.grid;

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
            uiGridCtrl.columnMenuCtrl.hideMenu();
            uiGridCtrl.refreshRows();
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
          uiGridCtrl.columnMenuCtrl.showMenu($scope.col, $elm);
        });
      });

      $contentsElm.on('mouseup', function () {
        $timeout.cancel(cancelMousedownTimeout);
      });

      $scope.toggleMenu = function($event) {
        $event.stopPropagation();

        // If the menu is already showing...
        if (uiGridCtrl.columnMenuCtrl.shown) {
          // ... and we're the column the menu is on...
          if (uiGridCtrl.columnMenuCtrl.col === $scope.col) {
            // ... hide it
            uiGridCtrl.columnMenuCtrl.hideMenu();
          }
          // ... and we're NOT the column the menu is on
          else {
            // ... move the menu to our column
            uiGridCtrl.columnMenuCtrl.showMenu($scope.col, $elm);
          }
        }
        // If the menu is NOT showing
        else {
          // ... show it on our column
          uiGridCtrl.columnMenuCtrl.showMenu($scope.col, $elm);
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
        $scope.$on('$destroy', $scope.$watch('col.filter.term', function(n, o) {
          uiGridCtrl.refreshRows()
            .then(function () {
              if (uiGridCtrl.prevScrollArgs && uiGridCtrl.prevScrollArgs.y && uiGridCtrl.prevScrollArgs.y.percentage) {
                 uiGridCtrl.fireScrollingEvent({ y: { percentage: uiGridCtrl.prevScrollArgs.y.percentage } });
              }
              // uiGridCtrl.fireEvent('force-vertical-scroll');
            });
        }));
      }
    }
  };

  return uiGridHeaderCell;
}]);

})();
(function(){
  'use strict';

  angular.module('ui.grid').directive('uiGridHeader', ['$log', '$templateCache', '$compile', 'uiGridConstants', 'gridUtil', '$timeout', function($log, $templateCache, $compile, uiGridConstants, gridUtil, $timeout) {
    var defaultTemplate = 'ui-grid/ui-grid-header';

    return {
      restrict: 'EA',
      // templateUrl: 'ui-grid/ui-grid-header',
      replace: true,
      // priority: 1000,
      require: '?^uiGrid',
      scope: false,
      compile: function($elm, $attrs) {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            var headerTemplate = ($scope.grid.options.headerTemplate) ? $scope.grid.options.headerTemplate : defaultTemplate;

             gridUtil.getTemplate(headerTemplate)
              .then(function (contents) {
                var template = angular.element(contents);
                
                var newElm = $compile(template)($scope);
                $elm.append(newElm);

                if (uiGridCtrl) {
                  // Inject a reference to the header viewport (if it exists) into the grid controller for use in the horizontal scroll handler below
                  var headerViewport = $elm[0].getElementsByClassName('ui-grid-header-viewport')[0];

                  if (headerViewport) {
                    uiGridCtrl.headerViewport = headerViewport;
                  }
                }
              });
          },

          post: function ($scope, $elm, $attrs, uiGridCtrl) {
            if (uiGridCtrl === undefined) {
              throw new Error('[ui-grid-header] uiGridCtrl is undefined!');
            }

            $log.debug('ui-grid-header link');

            // Don't animate header cells
            gridUtil.disableAnimations($elm);

            function updateColumnWidths() {
              var asterisksArray = [],
                  percentArray = [],
                  manualArray = [],
                  asteriskNum = 0,
                  totalWidth = 0;

              // Get the width of the viewport
              var availableWidth = uiGridCtrl.grid.getViewportWidth();

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

              uiGridCtrl.grid.columns.forEach(function(column, i) {
                // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + i + ' { width: ' + equalWidth + 'px; left: ' + left + 'px; }';
                //var colWidth = (typeof(c.width) !== 'undefined' && c.width !== undefined) ? c.width : equalWidth;

                // Skip hidden columns
                if (! column.visible) { return; }

                var colWidth,
                    isPercent = false;

                if (! angular.isNumber(column.width)) {
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
                  else  if (column.colDef.maxWidth && colWidth > column.colDef.maxWidth) {
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
                uiGridCtrl.grid.columns.forEach(function(col) {
                  if (col.width && ! angular.isNumber(col.width)) {
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
                    uiGridCtrl.grid.columns.forEach(remFn);
                  }
                }
              }

              if (canvasWidth < availableWidth) {
                canvasWidth = availableWidth;
              }

              // Build the CSS
              uiGridCtrl.grid.columns.forEach(function (column) {
                ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + column.index + ' { width: ' + column.drawnWidth + 'px; }';
              });

              $scope.columnStyles = ret;

              // Add the vertical scrollbar width back in to the canvas width, it's taken out in getCanvasWidth
              if (uiGridCtrl.grid.verticalScrollbarWidth) {
                canvasWidth = canvasWidth + uiGridCtrl.grid.verticalScrollbarWidth;
              }
              // canvasWidth = canvasWidth + 1;

              uiGridCtrl.grid.canvasWidth = parseInt(canvasWidth, 10);
            }

            if (uiGridCtrl) {
              uiGridCtrl.header = $elm;
              
              var headerViewport = $elm[0].getElementsByClassName('ui-grid-header-viewport')[0];
              if (headerViewport) {
                uiGridCtrl.headerViewport = headerViewport;
              }
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
 it('should apply the right class to the element', function () {
      element(by.css('.blah')).getCssValue('border')
        .then(function(c) {
          expect(c).toContain('1px solid');
        });
    });
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
    controller: function ($scope, $element, $attrs) {
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
    }
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

          $scope.itemAction = function($event) {
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

              $scope.action.call(context, $event);

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
(function(){
// 'use strict';

  angular.module('ui.grid').directive('uiGridNativeScrollbar', ['$log', '$timeout', '$document', 'uiGridConstants', 'gridUtil', function($log, $timeout, $document, uiGridConstants, gridUtil) {
    var scrollBarWidth = gridUtil.getScrollbarWidth();
    scrollBarWidth = scrollBarWidth > 0 ? scrollBarWidth : 17;

    return {
      scope: {
        type: '@'
      },
      require: '?^uiGrid',
      link: function ($scope, $elm, $attrs, uiGridCtrl) {
        var contents = angular.element('<div class="contents">&nbsp;</div>');

        $elm.addClass('ui-grid-native-scrollbar');

        var previousScrollPosition;

        var elmMaxScroll = 0;

        if ($scope.type === 'vertical') {
          // Update the width based on native scrollbar width
          $elm.css('width', scrollBarWidth + 'px');

          $elm.addClass('vertical');

          uiGridCtrl.grid.verticalScrollbarWidth = scrollBarWidth;

          // Save the initial scroll position for use in scroll events
          previousScrollPosition = $elm[0].scrollTop;
        }
        else if ($scope.type === 'horizontal') {
          // Update the height based on native scrollbar height
          $elm.css('height', scrollBarWidth + 'px');

          $elm.addClass('horizontal');

          // Save this scrollbar's dimension in the grid properties
          uiGridCtrl.grid.horizontalScrollbarHeight = scrollBarWidth;

          // Save the initial scroll position for use in scroll events
          previousScrollPosition = $elm[0].scrollLeft;
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
          // Update the vertical scrollbar's content height so it's the same as the canvas
          var h = uiGridCtrl.grid.getCanvasHeight();
          uiGridCtrl.grid.nativeVerticalScrollbarStyles = '.grid' + uiGridCtrl.grid.id + ' .ui-grid-native-scrollbar.vertical .contents { height: ' + h + 'px; }';

          elmMaxScroll = h;
        }

        function updateNativeHorizontalScrollbar() {
          var w = uiGridCtrl.grid.getCanvasWidth();
          uiGridCtrl.grid.nativeHorizontalScrollbarStyles = '.grid' + uiGridCtrl.grid.id + ' .ui-grid-native-scrollbar.horizontal .contents { width: ' + w + 'px; }';

          elmMaxScroll = w;
        }

        // NOTE: priority 6 so they run after the column widths update, which in turn update the canvas width
        if (uiGridCtrl.grid.options.enableNativeScrolling) {
          if ($scope.type === 'vertical') {
            uiGridCtrl.grid.registerStyleComputation({
              priority: 6,
              func: updateNativeVerticalScrollbar
            });
          }
          else if ($scope.type === 'horizontal') {
            uiGridCtrl.grid.registerStyleComputation({
              priority: 6,
              func: updateNativeHorizontalScrollbar
            });
          }
        }

        $scope.scrollSource = null;

        function scrollEvent(evt) {
          if ($scope.type === 'vertical') {
            var newScrollTop = $elm[0].scrollTop;

            var yDiff = previousScrollPosition - newScrollTop;

            var vertScrollLength = (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

            // Subtract the h. scrollbar height from the vertical length if it's present
            if (uiGridCtrl.grid.horizontalScrollbarHeight && uiGridCtrl.grid.horizontalScrollbarHeight > 0) {
              vertScrollLength = vertScrollLength - uiGridCtrl.grid.horizontalScrollbarHeight;
            }

            var vertScrollPercentage = newScrollTop / vertScrollLength;

            if (vertScrollPercentage > 1) { vertScrollPercentage = 1; }
            if (vertScrollPercentage < 0) { vertScrollPercentage = 0; }

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
            var newScrollLeft = $elm[0].scrollLeft;

            var xDiff = previousScrollPosition - newScrollLeft;

            var horizScrollLength = (uiGridCtrl.grid.getCanvasWidth() - uiGridCtrl.grid.getViewportWidth());
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

        $elm.on('$destroy', function() {
          $elm.off('scroll');
        });

        function gridScroll(evt, args) {
          // Don't listen to our own scroll event!
          if (args.target && (args.target === $elm || args.target.hasClass('ui-grid-native-scrollbar'))) {
            return;
          }

          // Set the source of the scroll event in our scope so it's available in our 'scroll' event handler
          $scope.scrollSource = args.target;

          if ($scope.type === 'vertical') {
            if (args.y && typeof(args.y.percentage) !== 'undefined' && args.y.percentage !== undefined) {
              var vertScrollLength = (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

              var newScrollTop = Math.max(0, args.y.percentage * vertScrollLength);
              
              $elm[0].scrollTop = newScrollTop;
            }
          }
          else if ($scope.type === 'horizontal') {
            if (args.x && typeof(args.x.percentage) !== 'undefined' && args.x.percentage !== undefined) {
              var horizScrollLength = (uiGridCtrl.grid.getCanvasWidth() - uiGridCtrl.grid.getViewportWidth());

              var newScrollLeft = Math.max(0, args.x.percentage * horizScrollLength);
              
              $elm[0].scrollLeft = newScrollLeft;
            }
          }
        }

        var gridScrollDereg = $scope.$on(uiGridConstants.events.GRID_SCROLL, gridScroll);
        $scope.$on('$destroy', gridScrollDereg);
      }
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
      require: '^uiGrid',
      scope: {
         row: '=uiGridRow',
         rowIndex: '='
      },
      compile: function() {
        return {
          pre: function($scope, $elm, $attrs, uiGridCtrl) {
            var grid = uiGridCtrl.grid;

            grid.getRowTemplateFn.then(function (templateFn) {
              templateFn($scope, function(clonedElement, scope) {
                $elm.replaceWith(clonedElement);
              });
            });
          },
          post: function($scope, $elm, $attrs, uiGridCtrl) {
            $scope.grid = uiGridCtrl.grid;

            //add optional reference to externalScopes function to scope
            //so it can be retrieved in lower elements
            $scope.getExternalScopes = uiGridCtrl.getExternalScopes;
            $scope.getCellValue = uiGridCtrl.getCellValue;
          }
        };
      }
    };
  }]);

})();
(function(){
// 'use strict';

  angular.module('ui.grid').directive('uiGridScrollbar', ['$log', '$document', 'uiGridConstants', 'gridUtil', function($log, $document, uiGridConstants, gridUtil) {
    return {
      replace: true,
      // priority: 1000,
      templateUrl: 'ui-grid/ui-grid-scrollbar',
      require: '?^uiGrid',
      scope: {
        'type': '@'
      },
      link: function($scope, $elm, $attrs, uiGridCtrl) {
        var self = this;

        if (uiGridCtrl === undefined) {
          throw new Error('[ui-grid-scrollbar] uiGridCtrl is undefined!');
        }

        $log.debug('ui-grid-scrollbar link', $scope.type);

        uiGridCtrl.scrollbars.push($elm);

        /**
         * Link stuff
         */

        if ($scope.type === 'vertical') {
          $elm.addClass('ui-grid-scrollbar-vertical');
        }
        else if ($scope.type === 'horizontal') {
          uiGridCtrl.horizontalScrollbar = self;

          $elm.addClass('ui-grid-scrollbar-horizontal');
        }

        // Get the scrolling class from the "scrolling-class" attribute
        var scrollingClass;
        $attrs.$observe('scrollingClass', function(n, o) {
          if (n) {
            scrollingClass = n;
          }
        });

        // Show the scrollbar when the mouse hovers the grid, hide it when it leaves UNLESS we're currently scrolling.
        //   record when we're in or outside the grid for the mouseup event handler
        var mouseInGrid;
        function gridMouseEnter() {
          mouseInGrid = true;
          $elm.addClass('ui-grid-scrollbar-visible');

          $document.on('mouseup', mouseup);
        }
        uiGridCtrl.grid.element.on('mouseenter', gridMouseEnter);

        function gridMouseLeave() {
          mouseInGrid = false;
          if (! uiGridCtrl.grid.isScrolling()) {
            $elm.removeClass('ui-grid-scrollbar-visible');
          }
        }
        uiGridCtrl.grid.element.on('mouseleave', gridMouseLeave);

        /**
         *
         * Scrollbar sizing
         *
         */

        // Size the scrollbar according to the amount of data. 35px high minimum, otherwise scale inversely proportinal to canvas vs viewport height
        function updateVerticalScrollbar(gridScope) {
          var scrollbarHeight = Math.floor(Math.max(35, uiGridCtrl.grid.getViewportHeight() / uiGridCtrl.grid.getCanvasHeight() * uiGridCtrl.grid.getViewportHeight()));
          uiGridCtrl.grid.verticalScrollbarStyles = '.grid' + uiGridCtrl.grid.id + ' .ui-grid-scrollbar-vertical { height: ' + scrollbarHeight + 'px; }';
        }

        function updateHorizontalScrollbar(gridScope) {
          var minWidth = 35;
          var scrollbarWidth = Math.floor(
                                 Math.max(
                                   minWidth,
                                   uiGridCtrl.grid.getViewportWidth() / uiGridCtrl.grid.getCanvasWidth() * uiGridCtrl.grid.getViewportWidth()
                                 )
                               );

          scrollbarWidth = isNaN(scrollbarWidth) ? minWidth : scrollbarWidth;

          uiGridCtrl.grid.horizontalScrollbarStyles = '.grid' + uiGridCtrl.grid.id + ' .ui-grid-scrollbar-horizontal { width: ' + scrollbarWidth + 'px; }';
        }

        if ($scope.type === 'vertical') {
          uiGridCtrl.grid.registerStyleComputation({
            priority: 10,
            func: updateVerticalScrollbar
          });
        }
        else if ($scope.type === 'horizontal') {
          uiGridCtrl.grid.registerStyleComputation({
            priority: 10,
            func: updateHorizontalScrollbar
          });
        }

        // Only show the scrollbar when the canvas height is less than the viewport height
        $scope.showScrollbar = function() {
          if ($scope.type === 'vertical') {
            return uiGridCtrl.grid.getCanvasHeight() > uiGridCtrl.grid.getViewportHeight();
          }
          else if ($scope.type === 'horizontal') {
            return uiGridCtrl.grid.getCanvasWidth() > uiGridCtrl.grid.getViewportWidth(); 
          }
        };

        var getElmSize = function() {
          if ($scope.type === 'vertical') {
            return gridUtil.elementHeight($elm, 'margin');
          }
          else if ($scope.type === 'horizontal') {
            return gridUtil.elementWidth($elm, 'margin');
          }
        };

        var getElmMaxBound = function() {
          if ($scope.type === 'vertical') {
            return uiGridCtrl.grid.getViewportHeight() - getElmSize();
          }
          else if ($scope.type === 'horizontal') {
            return uiGridCtrl.grid.getViewportWidth() - getElmSize();
          }
        };


        /**
         *
         * Scrollbar movement and grid scrolling
         *
         */

        var startY = 0,
            startX = 0,
            y = 0,
            x = 0;

        // Get the height of the scrollbar, including its margins
        // var elmHeight = gridUtil.elementHeight($elm, 'margin');
        

        // Get the "bottom boundary" which the scrollbar cannot scroll past (which is the viewport height minus the height of the scrollbar)
        // var elmBottomBound = uiGridCtrl.grid.getViewportHeight() - elmHeight;
        // var elmSize = getElmSize();
        var elmMaxBound = getElmMaxBound();
        

        // On mousedown on the scrollbar, listen for mousemove events to scroll and mouseup events to unbind the move and mouseup event
        function mousedown(event) {
          // Prevent default dragging of selected content
          event.preventDefault();

          uiGridCtrl.grid.setScrolling(true);

          $elm.addClass(scrollingClass);

          // Get the height of the element in case it changed (due to canvas/viewport resizing)
          // elmHeight = gridUtil.elementHeight($elm, 'margin');
          // elmSize = getElmSize();

          // Get the bottom boundary again
          // elmBottomBound = uiGridCtrl.grid.getViewportHeight() - elmHeight;
          elmMaxBound = getElmMaxBound();

          // Store the Y value of where we're starting
          startY = event.screenY - y;
          startX = event.screenX - x;

          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        }

        // Bind to the mousedown event
        $elm.on('mousedown', mousedown);

        // Emit a scroll event when we move the mouse while scrolling
        function mousemove(event) {
          // The delta along the Y axis
          y = event.screenY - startY;
          x = event.screenX - startX;

          // Make sure the value does not go above the grid or below the bottom boundary

          var scrollArgs = { target: $elm };
          if ($scope.type === 'vertical') {
            if (y < 0) { y = 0; }
            if (y > elmMaxBound) { y = elmMaxBound; }
            
            var scrollPercentageY = y / elmMaxBound;

            scrollArgs.y = { percentage: scrollPercentageY, pixels: y };
          }
          else if ($scope.type === 'horizontal') {
            if (x < 0) { x = 0; }
            if (x > elmMaxBound) { x = elmMaxBound; }
            
            var scrollPercentageX = x / elmMaxBound;

            scrollArgs.x = { percentage: scrollPercentageX, pixels: x };
          }

          // The percentage that we've scrolled is the y axis delta divided by the total scrollable distance (which is the same as the bottom boundary)
          
          $scope.$emit(uiGridConstants.events.GRID_SCROLL, scrollArgs);
        }

        // Bind to the scroll event which can come from the body (mouse wheel/touch events), or other places
        var scrollDereg = $scope.$on(uiGridConstants.events.GRID_SCROLL, function(evt, args) {
          // Make sure the percentage is normalized within the range 0-1

          var scrollPercentage;
          if ($scope.type === 'vertical') {
            // Skip if no scroll on Y axis
            if (! args.y) {
              return;
            }
            scrollPercentage = args.y.percentage;
          }
          else if ($scope.type === 'horizontal') {
            // Skip if no scroll on X axis
            if (! args.x) {
              return;
            }
            scrollPercentage = args.x.percentage;
          }

          if (scrollPercentage < 0) { scrollPercentage = 0; }
          if (scrollPercentage > 1) { scrollPercentage = 1; }

          // Get the height of the element in case it changed (due to canvas/viewport resizing)
          // elmSize = getElmSize();

          // Get the bottom bound again
          elmMaxBound = getElmMaxBound();

          // The new top value for the scrollbar is the percentage of scroll multiplied by the bottom boundary
          var newScrollPosition = scrollPercentage * elmMaxBound;

          // Prevent scrollbar from going beyond container
          // if (newTop > uiGridCtrl.grid.getCanvasHeight() - elmHeight) {
          //   newTop = uiGridCtrl.grid.getCanvasHeight() - elmHeight;
          // }

          // Store the new top in the y value
          if ($scope.type === 'vertical') {
            y = newScrollPosition;

            // Set the css for top
            $elm.css({
              top: y + 'px'
            });
          }
          else {
            x = newScrollPosition;
            $elm.css({
              left: x + 'px'
            });
          }
        });
  
        // When the user lets go of the mouse...
        function mouseup() {
          // Remove the "scrolling" class, if any
          $elm.removeClass(scrollingClass);

          if (! mouseInGrid) {
            $elm.removeClass('ui-grid-scrollbar-visible');
          }

          uiGridCtrl.grid.setScrolling(false);

          // Unbind the events we bound to the document
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        }


        /**
         *
         * For slide-in effect
         *
         */
        
        // if (! gridUtil.isTouchEnabled()) {
        //   $scope.grid.element.on('mouseenter mouseleave', function() {
        //     $elm.toggleClass('in');
        //   });
        // }
        // else {
        //   $elm.addClass('in');
        // }

        // $scope.grid.element.on('mouseout', function() {
        //   $log.debug('mouseout!');
        //   $elm.removeClass('in');
        // });

        
        /**
         *
         * Remove all 
         *
         */

        $elm.on('$destroy', function() {
          scrollDereg();
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
          $elm.unbind('mousedown');
          uiGridCtrl.grid.element.off('mouseenter', gridMouseEnter);
          uiGridCtrl.grid.element.off('mouseleave', gridMouseLeave);

          // For fancy slide-in effect above
          // $scope.grid.element.unbind('mouseenter');
          // $scope.grid.element.unbind('mouseleave');
        });
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

  angular.module('ui.grid').directive('uiGridViewport', ['$log', '$document', '$timeout', 'uiGridConstants', 'gridUtil',
    function($log, $document, $timeout, uiGridConstants, GridUtil) {
      return {
        // priority: 1000,
        require: '^uiGrid',
        scope: false,
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          // if (uiGridCtrl === undefined) {
          //   throw new Error('[ui-grid-body] uiGridCtrl is undefined!');
          // }

          $elm.on('scroll', function (evt) {
            var newScrollTop = $elm[0].scrollTop;
            var newScrollLeft = $elm[0].scrollLeft;

            if (newScrollLeft !== uiGridCtrl.prevScrollLeft) {
              var xDiff = newScrollLeft - uiGridCtrl.prevScrollLeft;

              var horizScrollLength = (uiGridCtrl.grid.getCanvasWidth() - uiGridCtrl.grid.getViewportWidth());
              var horizScrollPercentage = newScrollLeft / horizScrollLength;

              uiGridCtrl.adjustScrollHorizontal(newScrollLeft, horizScrollPercentage);
            }

            if (newScrollTop !== uiGridCtrl.prevScrollTop) {
              var yDiff = newScrollTop - uiGridCtrl.prevScrollTop;

              // uiGridCtrl.fireScrollingEvent({ y: { pixels: diff } });
              var vertScrollLength = (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());
              // var vertScrollPercentage = (uiGridCtrl.prevScrollTop + yDiff) / vertScrollLength;
              var vertScrollPercentage = newScrollTop / vertScrollLength;

              if (vertScrollPercentage > 1) { vertScrollPercentage = 1; }
              if (vertScrollPercentage < 0) { vertScrollPercentage = 0; }
              
              uiGridCtrl.adjustScrollVertical(newScrollTop, vertScrollPercentage);
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


      //add optional reference to externalScopes function to controller
      //so it can be retrieved in lower elements that have isolate scope
      self.getExternalScopes = $scope.getExternalScopes;
      
      // angular.extend(self.grid.options, );

      //all properties of grid are available on scope
      $scope.grid = self.grid;

      // Function to pre-compile all the cell templates when the column definitions change
      function preCompileCellTemplates(columns) {
        $log.info('pre-compiling cell templates');
        columns.forEach(function (col) {
          var html = col.cellTemplate.replace(uiGridConstants.COL_FIELD, 'getCellValue(row, col)');
          
          var compiledElementFn = $compile(html);
          col.compiledElementFn = compiledElementFn;
        });
      }

      //TODO: Move this.
      $scope.groupings = [];


      if ($attrs.uiGridColumns) {
        $attrs.$observe('uiGridColumns', function(value) {
          self.grid.options.columnDefs = value;
          self.grid.buildColumns()
            .then(function(){
              // self.columnSizeCalculated = false;
              // self.renderedColumns = self.grid.columns;

              preCompileCellTemplates($scope.grid.columns);

              self.refreshCanvas(true);
            });
        });
      }
      else {
        if (self.grid.options.columnDefs.length > 0) {
        //   self.grid.buildColumns();
        }
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
              // self.columnSizeCalculated = false;
              // self.renderedColumns = self.grid.columns;

              preCompileCellTemplates($scope.grid.columns);

              self.refreshCanvas(true);
            });
        }
      }

      function dataWatchFunction(n) {
        $log.debug('dataWatch fired');
        var promises = [];

        if (n) {
          if(self.grid.columns.length === 0){
            $log.debug('loading cols in dataWatchFunction');
            if (!$attrs.uiGridColumns && self.grid.options.columnDefs.length === 0) {
              self.grid.options.columnDefs =  gridUtil.getColumnsFromData(n);
            }
            promises.push(self.grid.buildColumns()
              .then(function() {
                preCompileCellTemplates($scope.grid.columns);}
            ));
          }
          $q.all(promises).then(function() {
            //wrap data in a gridRow
            $log.debug('Modifying rows');
            self.grid.modifyRows(n)
              .then(function () {
                //todo: move this to the ui-body-directive and define how we handle ordered event registration
                if (self.viewport) {
                  var scrollTop = self.viewport[0].scrollTop;
                  var scrollLeft = self.viewport[0].scrollLeft;
                  self.adjustScrollVertical(scrollTop, 0, true);
                  self.adjustScrollHorizontal(scrollLeft, 0, true);
                }

                $scope.$evalAsync(function() {
                  self.refreshCanvas(true);
                });
              });
          });
        }
      }


      $scope.$on('$destroy', function() {
        dataWatchCollectionDereg();
        columnDefWatchCollectionDereg();
      });

      // TODO(c0bra): Do we need to destroy this watch on $destroy?
      $scope.$watch(function () { return self.grid.styleComputations; }, function() {
        self.refreshCanvas(true);
      });

      // Refresh the canvas drawable size
      $scope.grid.refreshCanvas = self.refreshCanvas = function(buildStyles) {
        if (buildStyles) {
          self.grid.buildStyles($scope);
        }

        var p = $q.defer();

        if (self.header) {
          // Putting in a timeout as it's not calculating after the grid element is rendered and filled out
          $timeout(function() {
            self.grid.headerHeight = gridUtil.outerElementHeight(self.header);
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

      self.getCellValue = function(row, col) {
        return $scope.grid.getCellValue(row, col);
      };

      $scope.grid.refreshRows = self.refreshRows = function () {
        return self.grid.processRowsProcessors(self.grid.rows)
          .then(function (renderableRows) {
            self.grid.setVisibleRows(renderableRows);

            self.redrawRows();

            self.refreshCanvas();
          });
      };

      /* Sorting Methods */
      

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
    function(
      $log,
      $compile,
      $templateCache,
      gridUtil
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

              //todo: assume it is ok to communicate that rendering is complete??
              uiGridCtrl.grid.renderingComplete();

              uiGridCtrl.grid.element = $elm;

              uiGridCtrl.grid.gridWidth = $scope.gridWidth = gridUtil.elementWidth($elm);

              // Default canvasWidth to the grid width, in case we don't get any column definitions to calculate it from
              uiGridCtrl.grid.canvasWidth = uiGridCtrl.grid.gridWidth;

              uiGridCtrl.grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);

              uiGridCtrl.scrollbars = [];

              uiGridCtrl.refreshCanvas();
            }
          };
        }
      };
    }
  ]);

})();
(function(){

angular.module('ui.grid')
.factory('Grid', ['$log', '$q', '$parse', 'gridUtil', 'uiGridConstants', 'GridOptions', 'GridColumn', 'GridRow', 'GridEvents', 'rowSorter', 'rowSearcher',
    function($log, $q, $parse, gridUtil, uiGridConstants, GridOptions, GridColumn, GridRow, GridEvents, rowSorter, rowSearcher) {

/**
   * @ngdoc function
   * @name ui.grid.class:Grid
   * @description Grid defines a logical grid.  Any non-dom properties and elements needed by the grid should
   *              be defined in this class
   * @param {object} options Object map of options to pass into the grid. An 'id' property is expected.
   */
  var Grid = function Grid(options) {
    // Get the id out of the options, then remove it
    if (typeof(options.id) !== 'undefined' && options.id) {
      if (! /^[_a-zA-Z0-9-]+$/.test(options.id)) {
        throw new Error("Grid id '" + options.id + '" is invalid. It must follow CSS selector syntax rules.');
      }
    }

    this.id = options.id;
    delete options.id;

    // Get default options
    this.options = new GridOptions();

    // Extend the default options with what we were passed in
    angular.extend(this.options, options);

    this.headerHeight = this.options.headerRowHeight;
    this.gridHeight = 0;
    this.gridWidth = 0;
    this.columnBuilders = [];
    this.rowBuilders = [];
    this.rowsProcessors = [];
    this.styleComputations = [];
    this.visibleRowCache = [];

    this.cellValueGetterCache = {};

    // Cached function to use with custom row templates
    this.getRowTemplateFn = null;

    // Validate options
    if (!this.options.enableNativeScrolling && !this.options.enableVirtualScrolling) {
      throw "Either native or virtual scrolling must be enabled.";
    }


    //representation of the rows on the grid.
    //these are wrapped references to the actual data rows (options.data)
    this.rows = [];

    //represents the columns on the grid
    this.columns = [];

    //current rows that are rendered on the DOM
    this.renderedRows = [];
    this.renderedColumns = [];

    this.events = new GridEvents(this);
  };

  /**
   * @ngdoc function
   * @name registerColumnBuilder
   * @methodOf ui.grid.class:Grid
   * @description When the build creates columns from column definitions, the columnbuilders will be called to add
   * additional properties to the column.
   * @param {function(colDef, col, gridOptions)} columnsProcessor function to be called
   */
  Grid.prototype.registerColumnBuilder = function registerColumnBuilder(columnsProcessor) {
    this.columnBuilders.push(columnsProcessor);
  };

  /**
   * @ngdoc function
   * @name registerRowBuilder
   * @methodOf ui.grid.class:Grid
   * @description When the build creates rows from gridOptions.data, the rowBuilders will be called to add
   * additional properties to the row.
   * @param {function(colDef, col, gridOptions)} columnsProcessor function to be called
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

    self.options.columnDefs.forEach(function (colDef, index) {
      self.preprocessColDef(colDef);
      var col = self.getColumn(colDef.name);

      if (!col) {
        col = new GridColumn(colDef, index);
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
    var self = this;

    if (self.rows.length === 0 && newRawData.length > 0) {
      self.addRows(newRawData);
    }
    else {
      //look for new rows
      var newRows = newRawData.filter(function (newItem) {
        return !self.rows.some(function(oldRow) {
          return self.options.rowEquality(oldRow.entity, newItem);
        });
      });

      for (i = 0; i < newRows.length; i++) {
        self.addRows([newRows[i]]);
      }

      //look for deleted rows
      var deletedRows = self.rows.filter(function (oldRow) {
        return !newRawData.some(function (newItem) {
          return self.options.rowEquality(newItem, oldRow.entity);
        });
      });

      for (var i = 0; i < deletedRows.length; i++) {
        self.rows.splice( self.rows.indexOf(deletedRows[i] ), 1 );
      }
    }
    
    return $q.when(self.processRowsProcessors(self.rows))
      .then(function (renderableRows) {
        return self.setVisibleRows(renderableRows);
      });
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

    for (var i=0; i < newRawData.length; i++) {
      self.rows.push( self.processRowBuilders(new GridRow(newRawData[i], i)) );
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
     the grid calls eached registered "rows processor", which has a chance
     to alter the set of rows (sorting, etc) as long as the count is not
     modified.
   */
  Grid.prototype.registerRowsProcessor = function registerRowsProcessor(processor) {
    if (! angular.isFunction(processor)) {
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

    //   if (! renderableRows) {
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
          if (! processedRows) {
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
    var newVisibleRowCache = [];
    
    rows.forEach(function (row) {
      if (row.visible) {
        newVisibleRowCache.push(row);
      }
    });

    this.visibleRowCache = newVisibleRowCache;
  };


  Grid.prototype.setRenderedRows = function setRenderedRows(newRows) {
    this.renderedRows.length = newRows.length;
    for (var i = 0; i < newRows.length; i++) {
      this.renderedRows[i] = newRows[i];
    }
  };

  Grid.prototype.setRenderedColumns = function setRenderedColumns(newColumns) {
    this.renderedColumns.length = newColumns.length;
    for (var i = 0; i < newColumns.length; i++) {
      this.renderedColumns[i] = newColumns[i];
    }
  };

  /**
   * @ngdoc function
   * @name buildStyles
   * @methodOf ui.grid.class:Grid
   * @description calls each styleComputation function
   */
  Grid.prototype.buildStyles = function buildStyles($scope) {
    var self = this;
    self.styleComputations
      .sort(function(a, b) {
        if (a.priority === null) { return 1; }
        if (b.priority === null) { return -1; }
        if (a.priority === null && b.priority === null) { return 0; }
        return a.priority - b.priority;
      })
      .forEach(function (compInfo) {
        compInfo.func.call(self, $scope);
      });
  };

  Grid.prototype.minRowsToRender = function minRowsToRender() {
    return Math.ceil(this.getViewportHeight() / this.options.rowHeight);
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
    var viewPortHeight = this.gridHeight - this.headerHeight;

    // Account for native horizontal scrollbar, if present
    if (typeof(this.horizontalScrollbarHeight) !== 'undefined' && this.horizontalScrollbarHeight !== undefined && this.horizontalScrollbarHeight > 0) {
      viewPortHeight = viewPortHeight - this.horizontalScrollbarHeight;
    }

    return viewPortHeight;
  };

  Grid.prototype.getViewportWidth = function getViewportWidth() {
    var viewPortWidth = this.gridWidth;

    if (typeof(this.verticalScrollbarWidth) !== 'undefined' && this.verticalScrollbarWidth !== undefined && this.verticalScrollbarWidth > 0) {
      viewPortWidth = viewPortWidth - this.verticalScrollbarWidth;
    }

    return viewPortWidth;
  };

  Grid.prototype.getHeaderViewportWidth = function getHeaderViewportWidth() {
    var viewPortWidth = this.getViewportWidth();

    if (typeof(this.verticalScrollbarWidth) !== 'undefined' && this.verticalScrollbarWidth !== undefined && this.verticalScrollbarWidth > 0) {
      viewPortWidth = viewPortWidth + this.verticalScrollbarWidth;
    }

    return viewPortWidth;
  };

  Grid.prototype.getVisibleRowCount = function getVisibleRowCount() {
    // var count = 0;

    // this.rows.forEach(function (row) {
    //   if (row.visible) {
    //     count++;
    //   }
    // });

    return this.visibleRowCache.length;
  };

  Grid.prototype.getCanvasHeight = function getCanvasHeight() {
    var ret =  this.options.rowHeight * this.getVisibleRowCount();

    if (typeof(this.horizontalScrollbarHeight) !== 'undefined' && this.horizontalScrollbarHeight !== undefined && this.horizontalScrollbarHeight > 0) {
      ret = ret - this.horizontalScrollbarHeight;
    }

    return ret;
  };

  Grid.prototype.getCanvasWidth = function getCanvasWidth() {
    var ret = this.canvasWidth;

    if (typeof(this.verticalScrollbarWidth) !== 'undefined' && this.verticalScrollbarWidth !== undefined && this.verticalScrollbarWidth > 0) {
      ret = ret - this.verticalScrollbarWidth;
    }

    return ret;
  };

  Grid.prototype.getTotalRowHeight = function getTotalRowHeight() {
    return this.options.rowHeight * this.getVisibleRowCount();
  };

  // Is the grid currently scrolling?
  Grid.prototype.isScrolling = function isScrolling() {
    return this.scrolling ? true : false;
  };

  Grid.prototype.setScrolling = function setScrolling(scrolling) {
    this.scrolling = scrolling;
  };

  Grid.prototype.searchRows = function searchRows(renderableRows) {
    return rowSearcher.search(this, renderableRows, this.columns);
  };

  Grid.prototype.sortByColumn = function sortByColumn(renderableRows) {
    return rowSorter.sort(this, renderableRows, this.columns);
  };

  Grid.prototype.getCellValue = function getCellValue(row, col){
    var self = this;

    if (! self.cellValueGetterCache[col.colDef.name]) {
      self.cellValueGetterCache[col.colDef.name] = $parse(row.getEntityQualifiedColField(col));
    }

    return self.cellValueGetterCache[col.colDef.name](row);
  };

  // Reset all sorting on the grid
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

    var sortedCols = [];

    // Iterate through all the columns, sorted by priority
    self.columns.sort(rowSorter.prioritySort).forEach(function (col) {
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

    return $q.when(column);
  };

      /**
       * communicate to outside world that we are done with initial rendering
       */
  Grid.prototype.renderingComplete = function(){
    if(angular.isFunction(this.options.onRegisterEvents)){
      this.options.onRegisterEvents(this.events);
    }
  };

  return Grid;

}]);

})();
(function(){

angular.module('ui.grid')
.factory('GridColumn', ['gridUtil', function(gridUtil) {

  /**
   * @ngdoc function
   * @name ui.grid.class:GridColumn
   * @description Wrapper for the GridOptions.colDefs items.  Allows for needed properties and functions
   * to be assigned to a grid column
   * @param {ColDef} colDef Column definition.
   <br/>Required properties
   <ul>
   <li>
   name - name of field
   </li>
   </ul>

   <br/>Optional properties
   <ul>
   <li>
   field - angular expression that evaluates against grid.options.data array element.
   <br/>can be complex - employee.address.city
   <br/>Can also be a function - employee.getFullAddress()
   <br/>see angular docs on binding expressions
   </li>
   <li>displayName - column name when displayed on screen.  defaults to name</li>
   <li>sortingAlgorithm - Algorithm to use for sorting this column. Takes 'a' and 'b' parameters like any normal sorting function.</li>
   <li>todo: add other optional fields as implementation matures</li>
   </ul>
   *
   * @param {number} index the current position of the column in the array
   */
  function GridColumn(colDef, index) {
    var self = this;

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
      if (! angular.isNumber(colDef.width)) {
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
        else if (! colDef.width.match(/^\*+$/)) {
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

    self.cellClass = colDef.cellClass;
    self.cellFilter = colDef.cellFilter ? colDef.cellFilter : "";

    self.visible = gridUtil.isNullOrUndefined(colDef.visible) || colDef.visible;

    self.headerClass = colDef.headerClass;
    //self.cursor = self.sortable ? 'pointer' : 'default';

    self.visible = true;

    // Turn on sorting by default
    self.enableSorting = typeof(colDef.enableSorting) !== 'undefined' ? colDef.enableSorting : true;
    self.sortingAlgorithm = colDef.sortingAlgorithm;

    // Turn on filtering by default (it's disabled by default at the Grid level)
    self.enableFiltering = typeof(colDef.enableFiltering) !== 'undefined' ? colDef.enableFiltering : true;

    self.menuItems = colDef.menuItems;

    // Use the column definition sort if we were passed it
    self.setPropertyOrDefault(colDef, 'sort');

    /*

      self.filters = [
        {
          term: 'search term'
          condition: uiGridContants.filter.CONTAINS
        }
      ]

    */

    self.setPropertyOrDefault(colDef, 'filter');
    self.setPropertyOrDefault(colDef, 'filters', []);
  };

  return GridColumn;
}]);

})();
(function () {

  angular.module('ui.grid')
    .factory('GridEvents', ['$log', '$q', '$rootScope', 'gridUtil', 'uiGridConstants',
      function ($log, $q, $rootScope, gridUtil, uiGridConstants) {

        /**
         * @ngdoc function
         * @name ui.grid.class:GridEvents
         * @description GridEvents provides the ability to register public events inside the grid and allow
         * for other components to subscribe to these events via featureName.on.eventName(function(args){}
         * @param {object} grid grid that owns these events
         */
        var GridEvents = function GridEvents(grid) {
          this.grid = grid;
        };

        /**
         * @ngdoc function
         * @name registerEvent
         * @methodOf ui.grid.class:GridEvents
         * @description Registers a new event for the given feature
         * @param {string} featureName name of the feature that raises the event
         * @param {string} eventName  name of the event
         */
        GridEvents.prototype.registerEvent = function (featureName, eventName) {
          if (!this[featureName]) {
            this[featureName] = {};
          }

          var feature = this[featureName];
          if (!feature.on) {
            feature.on = {};
          }

          var eventId = this.grid.id + featureName + eventName;

          $log.log('Creating raise event method ' + featureName + '.' + eventName);
          feature[eventName] = function () {
            $rootScope.$broadcast.apply($rootScope, [eventId].concat(Array.prototype.slice.call(arguments)));
          };

          $log.log('Creating on event method ' + featureName + '.on.' + eventName);
          feature.on[eventName] = function (scope, handler) {
            scope.$on(eventId, function (event) {
              var args = Array.prototype.slice.call(arguments);
              args.splice(0, 1); //remove evt argument
              handler.apply(this.grid, args);
            });
          };
        };

        /**
         * @ngdoc function
         * @name registerEventsFromObject
         * @methodOf ui.grid.class:GridEvents
         * @description Registers features and events from a simple objectMap.
         * eventObjectMap must be in this format (multiple features allowed)
         * <br>
         * {featureName:
         *        {
         *          eventNameOne:function(args){},
         *          eventNameTwo:function(args){}
         *        }
         * @param {object} eventObjectMap map of feature/event names
         */
        GridEvents.prototype.registerEventsFromObject = function (eventObjectMap) {
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

        return GridEvents;

      }]);

})();
(function(){

angular.module('ui.grid')
.factory('GridOptions', [function() {

  /**
   * @ngdoc function
   * @name ui.grid.class:GridOptions
   * @description Default GridOptions class.  GridOptions are defined by the application developer and overlaid
   * over this object.
   */
  function GridOptions() {
    /**
     * @ngdoc object
     * @name data
     * @propertyOf  ui.grid.class:GridOptions
     * @description Array of data to be rendered to grid.  Array can contain complex objects
     */
    this.data = [];

    /**
     * @ngdoc object
     * @name columnDefs
     * @propertyOf  ui.grid.class:GridOptions
     * @description (optional) Array of columnDef objects.  Only required property is name.
     * _field property can be used in place of name for backwards compatibilty with 2.x_
     *  @example

     var columnDefs = [{name:'field1'}, {name:'field2'}];

     */
    this.columnDefs = [];

    this.headerRowHeight = 30;
    this.rowHeight = 30;
    this.maxVisibleRowCount = 200;

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

    // Sorting on by default
    this.enableSorting = true;

    // Filtering off by default
    this.enableFiltering = false;

    // Column menu can be used by default
    this.enableColumnMenu = true;

    // Native scrolling on by default
    this.enableNativeScrolling = true;

    // Virtual scrolling off by default, overrides enableNativeScrolling if set
    this.enableVirtualScrolling = false;

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

    // Custom template for header row
    this.headerTemplate = null;

    // Template for rows
    this.rowTemplate = 'ui-grid/ui-grid-row';
  }

  return GridOptions;

}]);

})();
(function(){

angular.module('ui.grid')
.factory('GridRow', ['gridUtil', function(gridUtil) {

   /**
   * @ngdoc function
   * @name ui.grid.class:GridRow
   * @description Wrapper for the GridOptions.data rows.  Allows for needed properties and functions
   * to be assigned to a grid row
   * @param {object} entity the array item from GridOptions.data
   * @param {number} index the current position of the row in the array
   */
  function GridRow(entity, index) {
    this.entity = entity;
    this.index = index;

    // Default to true
    this.visible = true;
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
    return 'row.entity.' + col.field;
  };

  GridRow.prototype.getEntityQualifiedColField = function(col) {
    return 'entity.' + col.field;
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
              row.visible = true;
            });

            return rows;
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

          if (!colDef.headerCellTemplate) {
            colDef.headerCellTemplate = 'ui-grid/uiGridHeaderCell';
          }

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
                col.headerCellTemplate = template;
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
    // Default to CONTAINS condition
    if (typeof(filter.condition) === 'undefined' || !filter.condition) {
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
      if (! filter.condition.test(value)) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.STARTS_WITH) {
      var startswithRE = termCache(cacheId) ? termCache(cacheId) : termCache(cacheId, new RegExp('^' + term, regexpFlags));

      if (! startswithRE.test(value)) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.ENDS_WITH) {
      var endswithRE = termCache(cacheId) ? termCache(cacheId) : termCache(cacheId, new RegExp(term + '$', regexpFlags));

      if (! endswithRE.test(value)) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.CONTAINS) {
      var containsRE = termCache(cacheId) ? termCache(cacheId) : termCache(cacheId, new RegExp(term, regexpFlags));

      if (! containsRE.test(value)) {
        return false;
      }
    }
    else if (filter.condition === uiGridConstants.filter.EXACT) {
      var exactRE = termCache(cacheId) ? termCache(cacheId) : termCache(cacheId,  new RegExp('^' + term + '$', regexpFlags));

      if (! exactRE.test(value)) {
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
      if (! angular.equals(value, term)) {
        return false;
      }
    }

    return true;
  };

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

    if (typeof(column.filters) !== 'undefined' && column.filters && column.filters.length > 0) {
      filters = column.filters;
    }
    else if (typeof(column.filter) !== 'undefined' && column.filter) {
      // Cache custom conditions, building the RegExp takes time
      var conditionCacheId = 'cond-' + column.field + '-' + column.filter.term;
      var condition = termCache(conditionCacheId) ? termCache(conditionCacheId) : termCache(conditionCacheId, rowSearcher.guessCondition(column.filter));

      filters[0] = {
        term: column.filter.term,
        condition: condition,
        flags: {
          caseSensitive: false
        }
      };
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

      var ret = rowSearcher.runColumnFilter(grid, row, column, termCache, i, filter);
      if (! ret) {
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
          if (! rowSearcher.searchColumn(grid, row, col, termCache)) {
            row.visible = false;
          }
        });
      });

      // rows.forEach(function (row) {
      //   var matchesAllColumns = true;

      //   for (var i in filterCols) {
      //     var col = filterCols[i];

      //     if (! rowSearcher.searchColumn(grid, row, col, termCache)) {
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
  rowSorter.guessSortFn = function guessSortFn(item) {
    var itemType = typeof(item);

    // Check for numbers and booleans
    switch (itemType) {
      case "number":
        return rowSorter.sortNumber;
      case "boolean":
        return rowSorter.sortBool;
      case "string":
        // if number string return number string sort fn. else return the str
        return item.match(numberStrRegex) ? rowSorter.sortNumberStr : rowSorter.sortAlpha;
      default:
        // Check if the item is a valid Date TODO(c0bra): Can we use angular.isDate() ?
        if (Object.prototype.toString.call(item) === '[object Date]') {
          return rowSorter.sortDate;
        }
        else {
          //finally just sort the basic sort...
          return rowSorter.basicSort;
        }
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
    if (rowSorter.colSortFnCache[col.field]) {
      sortFn = rowSorter.colSortFnCache[col.field];
    }
    // If the column has its OWN sorting algorithm, use that
    else if (col.sortingAlgorithm !== undefined) {
      sortFn = col.sortingAlgorithm;
      rowSorter.colSortFnCache[col.field] = col.sortingAlgorithm;
    }
    // Try and guess what sort function to use
    else {
      // Get the first row
      var row = rows[0];

      // No first row, can't guess so return null
      if (!row) {
        return null;
      }

      // TODO(c0bra): need to use that function from the grid class here
      // Get the value of this column for the row
      var fieldValue = grid.getCellValue(row, col); // $parse(col.field)(row);

      // Guess the sort function
      sortFn = rowSorter.guessSortFn(fieldValue);

      // If we found a sort function, cache it
      if (sortFn) {
        rowSorter.colSortFnCache[col.field] = sortFn;
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

  rowSorter.sort = function rowSorterSort(grid, rows, columns) {
    // first make sure we are even supposed to do work
    if (!rows) {
      return;
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
        
        var propA = grid.getCellValue(rowA, col); // $parse(col.field)(rowA);
        var propB = grid.getCellValue(rowB, col); // $parse(col.field)(rowB);

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

/**
 *  @ngdoc service
 *  @name ui.grid.service:GridUtil
 *  
 *  @description Grid utility functions
 */
module.service('gridUtil', ['$log', '$window', '$document', '$http', '$templateCache', '$timeout', '$injector', '$q', function ($log, $window, $document, $http, $templateCache, $timeout, $injector, $q) {
  var s = {

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

         var columnDefs = GridUtil.getColumnsFromData(data);

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
    getColumnsFromData: function (data) {
      var columnDefs = [];

      if (! data || typeof(data[0]) === 'undefined' || data[0] === undefined) { return []; }

      var item = data[0];
      
      angular.forEach(item,function (prop, propName) {
        columnDefs.push({
          name: propName
        });
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
      try{
        if (angular.element(template).length > 0) {
          return $q.when(template);
        }
      }
      catch(err){
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
      if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = orgEvent.wheelDeltaX * -1; }

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
    }
  };

  ['width', 'height'].forEach(function (name) {
    var capsName = angular.uppercase(name.charAt(0)) + name.substr(1);
    s['element' + capsName] = function (elem, extra) {
      var e = elem;
      if (typeof(e.length) !== 'undefined' && e.length) {
        e = elem[0];
      }

      if (e) {
        // debugger;
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
          text: 'Elegir columnas:',
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
          label: 'itens',
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
        }
      });
      return $delegate;
    }]);
}]);
})();
(function () {
  var DIRECTIVE_ALIASES = ['uiT', 'uiTranslate'];
  var FILTER_ALIASES = ['t', 'uiTranslate'];

  var module = angular.module('ui.grid.i18n');

  module.constant('i18nConstants', {
    MISSING: '[MISSING]: ',
    UPDATE_EVENT: '$uiI18n',

    LOCALE_DIRECTIVE_ALIAS: 'uiI18n',
    // default to english
    DEFAULT_LANG: 'en'
  });


//    module.config(['$provide', function($provide) {
//        $provide.decorator('i18nService', ['$delegate', function($delegate) {}])}]);

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
          var cache = this._langs;
          cache[lower] = angular.copy(strings);
        },
        getAllLangs: function () {
          var langs = [];
          if(!this._langs){
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

//      function deepCopy(destination, source) {
//        'use strict';
//        // adding deep copy method until angularjs supports deep copy like everyone else.
//        // https://github.com/angular/angular.js/pull/5059
//        for (var property in source) {
//          if (source[property] && source[property].constructor &&
//            source[property].constructor === Object) {
//            destination[property] = destination[property] || {};
//            arguments.callee(destination[property], source[property]);
//          } else {
//            destination[property] = source[property];
//          }
//        }
//
//        return destination;
//      }

      var service = {
        add: function (langs, strings) {
          if (typeof(langs) === 'object') {
            angular.forEach(langs, function (lang) {
              if (lang) {
                langCache.add(lang, strings);
              }
            });
          } else {
            langCache.add(langs, strings);
          }
        },

        getAllLangs: function () {
          return langCache.getAllLangs();
        },

        get: function (lang) {
          var language = lang ? lang : service.getCurrentLang();
          return langCache.get(language);
        },

        setCurrentLang: function (lang) {
          if (lang) {
            langCache.setCurrent(lang);
            $rootScope.$broadcast(i18nConstants.UPDATE_EVENT);
          }
        },

        getCurrentLang: function () {
          var lang = langCache.getCurrentLang();
          if(!lang){
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
               $scope.$watch($attrs[alias], function(){
                 i18nService.setCurrentLang(lang);
               });
            } else if ($attrs.$$observers) {
               $attrs.$observe(alias, function(){
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
        }
      });
      return $delegate;
    }]);
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
    direction: {LEFT: 0, RIGHT: 1, UP: 2, DOWN: 3},
    //available public events; listed here for convenience and IDE's use it for smart completion
    publicEvents: {
      gridCellNav : {
        cellNav : function(scope, newRowCol, oldRowCol){}
      }
    }
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
            return  uiGridCellNavConstants.direction.UP;
          }

          if (evt.keyCode === uiGridConstants.keymap.DOWN ||
            evt.keyCode === uiGridConstants.keymap.ENTER) {
            return  uiGridCellNavConstants.direction.DOWN;
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
            if (cols[i].allowCellFocus) {
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
            if (cols[i].allowCellFocus) {
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
          var colIndex = curCol.allowCellFocus ? curCol.index : service.getNextColIndexRight(cols, curCol);


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
          var colIndex = curCol.allowCellFocus ? curCol.index : service.getNextColIndexRight(cols, curCol);


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

          col.allowCellFocus = colDef.allowCellFocus !== undefined ?
            colDef.allowCellFocus : true;

          return $q.all(promises);
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
              //  $log.debug('uiGridEdit preLink');
              uiGridCtrl.grid.registerColumnBuilder(uiGridCellNavService.cellNavColumnBuilder);

              uiGridCtrl.grid.events.registerEventsFromObject(uiGridCellNavConstants.publicEvents);

              var oldRowCol = null;
              uiGridCtrl.broadcastCellNav = function (newRowCol) {
                $scope.$broadcast(uiGridCellNavConstants.CELL_NAV_EVENT, newRowCol);
                uiGridCtrl.broadcastFocus(newRowCol.row, newRowCol.col);
              };

              uiGridCtrl.broadcastFocus = function (row, col) {
                if (oldRowCol === null || (oldRowCol.row !== row || oldRowCol.col !== col)) {
                  var newRowCol = new RowCol(row, col);
                  uiGridCtrl.grid.events.gridCellNav.cellNav(newRowCol, oldRowCol);
                  oldRowCol = newRowCol;
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
          if (!$scope.col.allowCellFocus) {
             return;
          }

          setTabEnabled();

          $elm.on('keydown', function (evt) {
            var direction = uiGridCellNavService.getDirection(evt);
            if (direction === null) {
              return true;
            }

            var rowCol = uiGridCellNavService.getNextRowCol(direction, $scope.grid, $scope.row, $scope.col);

            $log.debug('next row ' + rowCol.row.index + ' next Col ' + rowCol.col.colDef.name);
            uiGridCtrl.broadcastCellNav(rowCol);
            setTabEnabled();

            return false;
          });

          $elm.find('div').on('focus', function (evt) {
            uiGridCtrl.broadcastFocus($scope.row, $scope.col);
          });

          $scope.$on(uiGridCellNavConstants.CELL_NAV_EVENT, function(evt,rowCol){
             if(rowCol.row === $scope.row &&
               rowCol.col === $scope.col){
                $log.debug('Setting focus on Row ' + rowCol.row.index + ' Col ' + rowCol.col.colDef.name);
                setFocused();
             }
          });

          function setTabEnabled(){
            $elm.find('div').attr("tabindex", -1);
          }

          function setFocused(){
            var div = $elm.find('div');
            div.focus();
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

        /**
         * @ngdoc service
         * @name isStartEditKey
         * @methodOf ui.grid.edit.service:uiGridEditService
         * @description  Determines if a keypress should start editing.  Decorate this service to override with your
         * own key events.  See service decorator in angular docs.
         * @parm {Event} evt keydown event
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

          col.enableCellEdit = colDef.enableCellEdit !== undefined ?
            colDef.enableCellEdit : gridOptions.enableCellEdit; 

          col.cellEditableCondition = colDef.cellEditableCondition || gridOptions.cellEditableCondition || 'true';

          // allow for editableCellTemplate html or editableCellTemplateUrl
          if (col.enableCellEdit) {
            if (!colDef.editableCellTemplate) {
              colDef.editableCellTemplate = 'ui-grid/cellTextEditor';
            }

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

          //enableCellEditOnFocus can only be used if cellnav module is used
          col.enableCellEditOnFocus = colDef.enableCellEditOnFocus !== undefined ?
            colDef.enableCellEditOnFocus : gridOptions.enableCellEditOnFocus;

          return $q.all(promises);
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
            uiGridCtrl.grid.registerColumnBuilder(uiGridEditService.editColumnBuilder);
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
   *  with the columnDef.editableCellTemplate element ('cellTextEditor.html' by default).
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
              if ($scope.col.enableCellEditOnFocus) {
                $elm.find('div').on('focus', beginEditFocus);
              }
            }

            function cancelBeginEditEvents() {
              $elm.off('dblclick', beginEdit);
              $elm.off('keydown', beginEditKeyDown);
              if ($scope.col.enableCellEditOnFocus) {
                $elm.find('div').off('focus', beginEditFocus);
              }
            }

            function beginEditFocus(evt){
              evt.stopPropagation();
              beginEdit();
            }


            function beginEditKeyDown(evt){
              if (uiGridEditService.isStartEditKey(evt)) {
                beginEdit();
              }
            }

            function shouldEdit(col) {
              return angular.isFunction(col.cellEditableCondition) ?
                  col.cellEditableCondition($scope) :
                  col.cellEditableCondition;
            }

            function beginEdit() {
              if(!shouldEdit($scope.col)){
                return;
              }

              cellModel = $parse($scope.row.getQualifiedColField($scope.col));
              //get original value from the cell
              origCellValue = cellModel($scope);

              html = $scope.col.editableCellTemplate;
              html = html.replace(uiGridConstants.COL_FIELD, $scope.row.getQualifiedColField($scope.col));

              var cellElement;
              $scope.$apply(function () {
                  inEdit = true;
                  cancelBeginEditEvents();
                  cellElement = $compile(html)($scope.$new());
                  var gridCellContentsEl = angular.element($elm.children()[0]);
                  isFocusedBeforeEdit = gridCellContentsEl.is(':focus');
                  gridCellContentsEl.addClass('ui-grid-cell-contents-hidden');
                  $elm.append(cellElement);
                }
              );

              //stop editing when grid is scrolled
              var deregOnGridScroll = $scope.$on(uiGridConstants.events.GRID_SCROLL, function () {
                endEdit(true);
                deregOnGridScroll();
              });

              //end editing
              var deregOnEndCellEdit = $scope.$on(uiGridEditConstants.events.END_CELL_EDIT, function (evt,retainFocus) {
                endEdit(retainFocus);
                deregOnEndCellEdit();
              });

              //cancel editing
              var deregOnCancelCellEdit = $scope.$on(uiGridEditConstants.events.CANCEL_CELL_EDIT, function () {
                cancelEdit();
                deregOnCancelCellEdit();
              });

              $scope.$broadcast(uiGridEditConstants.events.BEGIN_CELL_EDIT);
            }

            function endEdit(retainFocus) {
              if (!inEdit) {
                return;
              }
              var gridCellContentsEl = angular.element($elm.children()[0]);
              //remove edit element
              angular.element($elm.children()[1]).remove();
              gridCellContentsEl.removeClass('ui-grid-cell-contents-hidden');
              if(retainFocus && isFocusedBeforeEdit){
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

              endEdit(true);
            }

          }
        };
      }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.edit.directive:uiGridTextEditor
   *  @element div
   *  @restrict A
   *
   *  @description input editor directive for text fields.
   *  Provides EndEdit and CancelEdit events
   *  Can be used as a template to develop other editors
   *
   *  Events that end editing:
   *     blur and enter keydown
   *
   *  Events that cancel editing:
   *    - Esc keydown
   *
   */
  module.directive('uiGridTextEditor',
    ['uiGridConstants', 'uiGridEditConstants',
      function (uiGridConstants, uiGridEditConstants) {
        return{
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
                    $scope.stopEdit();
                  });
                });

                $scope.stopEdit = function() {
                  $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                };

                $elm.on('keydown', function (evt) {
                  switch (evt.keyCode) {
                    case uiGridConstants.keymap.ESC:
                      evt.stopPropagation();
                      $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                      break;
                    case uiGridConstants.keymap.ENTER: // Enter (Leave Field)
                      $scope.stopEdit();
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
          gridOptions.enableColumnResizing = gridOptions.enableColumnResizing !== false;

          //legacy support
          //use old name if it is explicitly false
          if(gridOptions.enableColumnResize === false){
            gridOptions.enableColumnResizing = false;
          }
        },

        colResizerColumnBuilder: function (colDef, col, gridOptions) {

          var promises = [];

          //default to true unless gridOptions or colDef is explicitly false
          colDef.enableColumnResizing = gridOptions.enableColumnResizing && colDef.enableColumnResizing !== false;


          //legacy support of old option name
          if(colDef.enableColumnResize === false){
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
   * option to false. This prevents resizing for the entire grid, regardless of individual colDef options.
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
                
                // Get the column to the left of this one
                var otherCol = uiGridCtrl.grid.renderedColumns[$scope.renderIndex - 1];

                // Don't append the left resizer if this is the first column or the column to the left of this one has resizing disabled
                if ($scope.col.index !== 0 && otherCol.colDef.enableColumnResizing !== false) {
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
        renderIndex: '=',
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
          uiGridCtrl.grid.columns.forEach(function (column) {
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
              uiGridCtrl.refreshCanvas(true)
                .then(function() {
                  // If virtual scrolling is turned on we need to update the scrollbar and stuff. The native scrollbars update automatically, of course
                  if (uiGridCtrl.grid.options.enableVirtualScrolling) {
                    // Then fire a scroll event to put the scrollbar in the right place, so it doesn't end up too far ahead or behind
                    var args = uiGridCtrl.prevScrollArgs ? uiGridCtrl.prevScrollArgs : { x: { percentage: 0 } };

                    args.target = $elm;
                      
                    // Add an extra bit of percentage to the scroll event based on the xDiff we were passed
                    if (xDiff && args.x && args.x.pixels) {
                      var extraPercent = xDiff / uiGridCtrl.grid.getHeaderViewportWidth();

                      args.x.percentage = args.x.percentage - extraPercent;

                      // Can't be less than 0% or more than 100%
                      if (args.x.percentage > 1) { args.x.percentage = 1; }
                      else if (args.x.percentage < 0) { args.x.percentage = 0; }
                    }
                    
                    // Fire the scroll event
                    uiGridCtrl.fireScrollingEvent(args);
                  }
                });
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
          var otherCol;
          if ($scope.position === 'left') {
            // Get the column to the left of this one
            col = uiGridCtrl.grid.renderedColumns[$scope.renderIndex - 1];
            otherCol = $scope.col;
          }
          else if ($scope.position === 'right') {
            otherCol = uiGridCtrl.grid.renderedColumns[$scope.renderIndex + 1];
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
          else if (! col.colDef.minWidth && columnBounds.minWidth && newWidth < columnBounds.minWidth) {
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
          var otherCol;
          if ($scope.position === 'left') {
            // Get the column to the left of this one
            col = uiGridCtrl.grid.renderedColumns[$scope.renderIndex - 1];
            otherCol = $scope.col;
          }
          else if ($scope.position === 'right') {
            otherCol = uiGridCtrl.grid.renderedColumns[$scope.renderIndex + 1];
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
          else if (! col.colDef.minWidth && columnBounds.minWidth && newWidth < columnBounds.minWidth) {
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
          gridLeft = uiGridCtrl.grid.element[0].offsetLeft;

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
          var otherCol, multiplier;

          // If we're the left-positioned resizer then we need to resize the column to the left of our column, and not our column itself
          if ($scope.position === 'left') {
            col = uiGridCtrl.grid.renderedColumns[$scope.renderIndex - 1];
            otherCol = $scope.col;
            multiplier = 1;
          }
          else if ($scope.position === 'right') {
            otherCol = uiGridCtrl.grid.renderedColumns[$scope.renderIndex + 1];
            multiplier = -1;
          }

          // Go through the rendered rows and find out the max size for the data in this column
          var maxWidth = 0;
          var xDiff = 0;
          // Get the cell contents so we measure correctly. For the header cell we have to account for the sort icon and the menu buttons, if present
          var cells = uiGridCtrl.grid.element[0].querySelectorAll('.col' + col.index + ' .ui-grid-cell-contents');
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
          else if (! col.colDef.minWidth && columnBounds.minWidth && maxWidth < columnBounds.minWidth) {
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
angular.module('ui.grid').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ui-grid/ui-grid-body',
    "<div class=\"ui-grid-body\"><div class=\"ui-grid-scrollbar-box\"><div ui-grid-viewport=\"\" class=\"ui-grid-viewport\"><div class=\"ui-grid-canvas\"><div ng-repeat=\"row in grid.renderedRows track by $index\" class=\"ui-grid-row\" ng-style=\"rowStyle($index)\"><div ui-grid-row=\"row\" row-index=\"row.index\"></div></div></div></div></div><!-- native scrolling --><div ui-grid-native-scrollbar=\"\" ng-if=\"!grid.options.enableVirtualScrolling && grid.options.enableNativeScrolling\" type=\"vertical\"></div><div ui-grid-native-scrollbar=\"\" ng-if=\"!grid.options.enableVirtualScrolling && grid.options.enableNativeScrolling\" type=\"horizontal\"></div><!-- virtual scrolling --><div ui-grid-scrollbar=\"\" ng-if=\"grid.options.enableVirtualScrolling\" type=\"vertical\" scrolling-class=\"ui-grid-scrolling\"></div><div ui-grid-scrollbar=\"\" ng-if=\"grid.options.enableVirtualScrolling\" type=\"horizontal\" scrolling-class=\"ui-grid-scrolling\"></div><div class=\"ui-grid-no-row-overlay\" ng-show=\"!grid.renderedRows.length\"><span>No Rows</span></div></div>"
  );


  $templateCache.put('ui-grid/ui-grid-group-panel',
    "<div class=\"ui-grid-group-panel\"><div ui-t=\"groupPanel.description\" class=\"description\" ng-show=\"groupings.length == 0\"></div><ul ng-show=\"groupings.length > 0\" class=\"ngGroupList\"><li class=\"ngGroupItem\" ng-repeat=\"group in configGroups\"><span class=\"ngGroupElement\"><span class=\"ngGroupName\">{{group.displayName}} <span ng-click=\"removeGroup($index)\" class=\"ngRemoveGroup\">x</span></span> <span ng-hide=\"$last\" class=\"ngGroupArrow\"></span></span></li></ul></div>"
  );


  $templateCache.put('ui-grid/ui-grid-header',
    "<div class=\"ui-grid-top-panel\"><div ui-grid-group-panel=\"\" ng-show=\"grid.options.showGroupPanel\"></div><div class=\"ui-grid-header ui-grid-header-viewport\"><div class=\"ui-grid-header-canvas\"><div ng-repeat=\"col in grid.renderedColumns track by $index\" ui-grid-header-cell=\"\" col=\"col\" render-index=\"$index\" ng-style=\"$index === 0 && columnStyle($index)\"><!-- class=\"ui-grid-header-cell col{{ col.index }}\" ng-style=\"$index === 0 && columnStyle($index)\" --><!-- <div ng-if=\"grid.options.enableColumnResizing && col.index != 0\" class=\"ui-grid-column-resizer\" ui-grid-column-resizer col=\"col\" position=\"left\" render-index=\"$index\">&nbsp;</div>\n" +
    "\n" +
    "          <div class=\"ui-grid-vertical-bar\">&nbsp;</div>\n" +
    "          <div class=\"ui-grid-cell-contents\" col-index=\"$index\">{{ col.displayName }}</span></div>\n" +
    "\n" +
    "          <div ng-if=\"grid.options.enableColumnResizing && col.index != grid.renderedColumns.length - 1\" class=\"ui-grid-column-resizer\" ui-grid-column-resizer col=\"col\" position=\"right\"  render-index=\"$index\">&nbsp;</div> --></div></div></div><div ui-grid-menu=\"\"></div></div>"
  );


  $templateCache.put('ui-grid/ui-grid-row',
    "<div><div ng-repeat=\"col in grid.renderedColumns track by $index\" class=\"ui-grid-cell col{{ col.index }}\"><div class=\"ui-grid-vertical-bar\">&nbsp;</div><div class=\"ui-grid-inner-cell-contents\" ui-grid-cell=\"\" col=\"col\" row=\"row\" row-index=\"row.index\" col-index=\"col.colDef.index\"></div></div>"
  );


  $templateCache.put('ui-grid/ui-grid-scrollbar',
    "<div class=\"ui-grid-scrollbar\" ng-show=\"showScrollbar()\"></div>"
  );


  $templateCache.put('ui-grid/ui-grid',
    "<div ui-i18n=\"en\" class=\"ui-grid grid{{ grid.id }}\"><!-- TODO (c0bra): add \"scoped\" attr here, eventually? --><style ui-grid-style=\"\">.grid{{ grid.id }} {\n" +
    "      /* Styles for the grid */\n" +
    "    }\n" +
    "\n" +
    "    .grid{{ grid.id }} .ui-grid-header {\n" +
    "      width: {{ grid.getHeaderViewportWidth() }}px;\n" +
    "    }\n" +
    "\n" +
    "    .grid{{ grid.id }} .ui-grid-header-canvas {\n" +
    "      width: {{ grid.getCanvasWidth() }}px;\n" +
    "    }\n" +
    "\n" +
    "    .grid{{ grid.id }} .ui-grid-body {\n" +
    "      height: {{ grid.getBodyHeight() }}px;\n" +
    "    }\n" +
    "\n" +
    "    .grid{{ grid.id }} .ui-grid-viewport {\n" +
    "      height: {{ grid.getViewportHeight() }}px;\n" +
    "      width: {{ grid.getViewportWidth() }}px;\n" +
    "    }\n" +
    "\n" +
    "    .grid{{ grid.id }} .ui-grid-canvas {\n" +
    "      height: {{ grid.getCanvasHeight() }}px;\n" +
    "      width: {{ grid.getCanvasWidth() }}px;\n" +
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
    "    {{ rowStyles }}\n" +
    "\n" +
    "    {{ columnStyles }}\n" +
    "\n" +
    "    /*.grid{{ grid.id }} .ui-grid-body .ui-grid-cell:first-child, .grid{{ grid.id }} .ui-grid-header .ui-grid-header-cell:first-child {\n" +
    "      margin-left: {{ grid.columnOffset || 0 }}px;\n" +
    "    }*/\n" +
    "\n" +
    "    {{ grid.verticalScrollbarStyles }}\n" +
    "    {{ grid.horizontalScrollbarStyles }}\n" +
    "\n" +
    "    {{ grid.nativeVerticalScrollbarStyles }}\n" +
    "    {{ grid.nativeHorizontalScrollbarStyles }}\n" +
    "\n" +
    "    .grid{{ grid.id }} .ui-grid-native-scrollbar.vertical {\n" +
    "      height: {{ grid.getViewportHeight() }}px;\n" +
    "    }</style><div ui-grid-header=\"\"></div><div ui-grid-body=\"\"></div><div ui-grid-footer=\"\"></div><div ui-grid-column-menu=\"\" ng-if=\"grid.options.enableColumnMenu\"></div><div ng-transclude=\"\"></div></div>"
  );


  $templateCache.put('ui-grid/uiGridCell',
    "<div class=\"ui-grid-cell-contents\">{{COL_FIELD CUSTOM_FILTERS}}</div>"
  );


  $templateCache.put('ui-grid/uiGridColumnFilter',
    "<li class=\"ui-grid-menu-item ui-grid-clearfix ui-grid-column-filter\" ng-show=\"itemShown()\" ng-click=\"$event.stopPropagation();\"><div class=\"input-container\"><input class=\"column-filter-input\" type=\"text\" ng-model=\"item.model\" placeholder=\"{{ i18n.search.placeholder }}\"><div class=\"column-filter-cancel-icon-container\"><i class=\"ui-grid-filter-cancel ui-grid-icon-cancel column-filter-cancel-icon\">&nbsp;</i></div></div><div style=\"button-container\" ng-click=\"item.action($event)\"><div class=\"ui-grid-button\"><i class=\"ui-grid-icon-search\">&nbsp;</i></div></div></li>"
  );


  $templateCache.put('ui-grid/uiGridColumnMenu',
    "<div class=\"ui-grid-column-menu\"><div ui-grid-menu=\"\" menu-items=\"menuItems\"><!-- <div class=\"ui-grid-column-menu\">\n" +
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


  $templateCache.put('ui-grid/uiGridHeaderCell',
    "<div class=\"ui-grid-header-cell col{{ col.index }} clearfix\" ng-class=\"{ 'sortable': sortable }\"><div class=\"ui-grid-vertical-bar\">&nbsp;</div><div class=\"ui-grid-cell-contents\" col-index=\"renderIndex\">{{ col.displayName }} <span ui-grid-visible=\"col.sort.direction\" ng-class=\"{ 'ui-grid-icon-up-dir': col.sort.direction == asc, 'ui-grid-icon-down-dir': col.sort.direction == desc, 'ui-grid-icon-blank': !col.sort.direction }\">&nbsp;</span></div><div ng-if=\"grid.options.enableColumnMenu\" class=\"ui-grid-column-menu-button\" ng-click=\"toggleMenu($event)\"><i class=\"ui-grid-icon-angle-down\">&nbsp;<i></i></i></div><div ng-if=\"filterable\" class=\"ui-grid-filter-container\"><input type=\"text\" class=\"ui-grid-filter-input\" ng-model=\"col.filter.term\" ng-click=\"$event.stopPropagation()\"><div class=\"ui-grid-filter-button\" ng-click=\"col.filter.term = null\"><i class=\"ui-grid-icon-cancel right\" ng-show=\"!!col.filter.term\">&nbsp;</i> <!-- use !! because angular interprets 'f' as false --></div></div></div>"
  );


  $templateCache.put('ui-grid/uiGridMenu',
    "<div class=\"ui-grid-menu\"><div class=\"ui-grid-menu-inner\" ng-show=\"shown\"><ul class=\"ui-grid-menu-items\"><li ng-repeat=\"item in menuItems\" ui-grid-menu-item=\"\" action=\"item.action\" title=\"item.title\" active=\"item.active\" icon=\"item.icon\" shown=\"item.shown\" context=\"item.context\" template-url=\"item.templateUrl\"></li></ul></div></div>"
  );


  $templateCache.put('ui-grid/uiGridMenuItem',
    "<li class=\"ui-grid-menu-item\" ng-click=\"itemAction($event)\" ng-show=\"itemShown()\" ng-class=\"{ 'ui-grid-menu-item-active' : active() }\"><i ng-class=\"icon\"></i> {{ title }}</li>"
  );


  $templateCache.put('ui-grid/cellTextEditor',
    "<div><input ng-class=\"'colt' + col.index\" ui-grid-text-editor=\"\" ng-model=\"COL_FIELD\"></div>"
  );


  $templateCache.put('ui-grid/columnResizer',
    "<div ui-grid-column-resizer=\"\" ng-if=\"grid.options.enableColumnResizing\" class=\"ui-grid-column-resizer\" col=\"col\" position=\"right\" render-index=\"renderIndex\"></div>"
  );

}]);

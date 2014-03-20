/*! ui-grid - v2.0.7-e85e532 - 2014-03-20
* Copyright (c) 2014 ; Licensed MIT */
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
      GRID_SCROLLING: 'uiGridScrolling'
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
    }
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
        };

        uiGridCtrl.adjustRows = function(scrollTop, scrollPercentage) {
          var minRows = uiGridCtrl.grid.minRowsToRender();
          var maxRowIndex = uiGridCtrl.grid.rows.length - minRows;
          uiGridCtrl.maxRowIndex = maxRowIndex;

          var curRowIndex = uiGridCtrl.prevRowScrollIndex;
          
          var rowIndex = Math.ceil(Math.min(maxRowIndex, maxRowIndex * scrollPercentage));

          // Define a max row index that we can't scroll past
          if (rowIndex > maxRowIndex) {
            rowIndex = maxRowIndex;
          }
          
          var newRange = [];
          if (uiGridCtrl.grid.rows.length > uiGridCtrl.grid.options.virtualizationThreshold) {
            // Have we hit the threshold going down?
            if (uiGridCtrl.prevScrollTop < scrollTop && rowIndex < uiGridCtrl.prevRowScrollIndex + uiGridCtrl.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
              return;
            }
            //Have we hit the threshold going up?
            if (uiGridCtrl.prevScrollTop > scrollTop && rowIndex > uiGridCtrl.prevRowScrollIndex - uiGridCtrl.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
              return;
            }

            var rangeStart = Math.max(0, rowIndex - uiGridCtrl.grid.options.excessRows);
            var rangeEnd = Math.min(uiGridCtrl.grid.rows.length, rowIndex + minRows + uiGridCtrl.grid.options.excessRows);

            newRange = [rangeStart, rangeEnd];
          }
          else {
            var maxLen = uiGridCtrl.grid.rows.length;
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
          var rowArr = uiGridCtrl.grid.rows.slice(renderedRange[0], renderedRange[1]);

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

angular.module('ui.grid').directive('uiGridHeaderCell', ['$log', '$parse', function ($log, $parse) {
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
      templateUrl: 'ui-grid/ui-grid-row',
      require: '?^uiGrid',
      scope: {
         row: '=uiGridRow',
         rowIndex: '='
      },
      compile: function() {
        return {
          pre: function($scope, $elm, $attrs) {
            // Bring the columnstyle function down into our isolate scope
            // $scope.columnStyle = $scope.$parent.columnStyle;
          },
          post: function($scope, $elm, $attrs, uiGridCtrl) {
            if (uiGridCtrl === undefined) {
              throw new Error('[ui-grid-row] uiGridCtrl is undefined!');
            }

            $scope.grid = uiGridCtrl.grid;
            $scope.getCellValue = uiGridCtrl.getCellValue;

            // $attrs.$observe('rowIndex', function(n, o) {
            //   if (n) {
            //     $scope.rowIndex = $scope.$eval(n);
            //   }
            // });
          }
        };
      }
    };
  }]);

// app.directive('rowStyler', function($log, $compile) {
//   return {
//     scope: {
//       rowIndex: '='
//     },
//     link: function(scope, elm, attrs) {
//       // $log.debug('scope.rowIndex', scope.rowIndex);

//       if (scope.rowIndex === 0) {
//         elm.attr('ng-style', "rowStyle($index)");
//         $log.debug(elm[0].outerHTML);
//         // $compile(elm)(scope);
//       }
//     }
//   };
// });

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
          // TODO: handle type
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
        require: '?^uiGrid',
        scope: false,
        link: function($scope, $elm, $attrs, uiGridCtrl) {
          if (uiGridCtrl === undefined) {
            throw new Error('[ui-grid-body] uiGridCtrl is undefined!');
          }

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
(function () {
  'use strict';

  angular.module('ui.grid').controller('uiGridController', ['$scope', '$element', '$attrs', '$log', 'gridUtil', '$q', 'uiGridConstants',
                    '$templateCache', 'gridClassFactory', '$timeout', '$parse', '$compile',
    function ($scope, $elm, $attrs, $log, gridUtil, $q, uiGridConstants,
              $templateCache, gridClassFactory, $timeout, $parse, $compile) {
      $log.debug('ui-grid controller');

      var self = this;

      self.grid = gridClassFactory.createGrid();

      // Extend options with ui-grid attribute reference
      angular.extend(self.grid.options, $scope.uiGrid);

      //all properties of grid are available on scope
      $scope.grid = self.grid;

      // Function to pre-compile all the cell templates when the column definitions change
      function preCompileCellTemplates(columns) {
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

      var columnDefWatchDereg = $scope.$parent.$watchCollection(function() { return $scope.uiGrid.columnDefs; }, function(n, o) {
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
      });

      function dataWatchFunction(n) {
        $log.debug('dataWatch fired');
        var promises = [];

        if (n) {
          //load columns if needed
          if (!$attrs.uiGridColumns && self.grid.options.columnDefs.length === 0) {
              self.grid.options.columnDefs =  gridUtil.getColumnsFromData(n);
          }
          promises.push(self.grid.buildColumns());

          $q.all(promises).then(function() {
            preCompileCellTemplates($scope.grid.columns);

            //wrap data in a gridRow
            $log.debug('Modifying rows');
            self.grid.modifyRows(n);

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
        }
      }


      $scope.$on('$destroy', function() {
        dataWatchCollectionDereg();
        columnDefWatchDereg();
      });


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

      var cellValueGetterCache = {};
      self.getCellValue = function(row,col){
        if(!cellValueGetterCache[col.colDef.name]){
          cellValueGetterCache[col.colDef.name] = $parse(row.getEntityQualifiedColField(col));
        }
        return cellValueGetterCache[col.colDef.name](row);
      };

      //todo: throttle this event?
      self.fireScrollingEvent = function(args) {
        $scope.$broadcast(uiGridConstants.events.GRID_SCROLL, args);
      };

    }]);

/**
 *  @ngdoc directive
 *  @name ui.grid.directive:uiGrid
 *  @element div
 *  @restrict EA
 *  @param {Object} uiGrid Options for the grid to use
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
          uiGrid: '='
        },
        replace: true,
        controller: 'uiGridController',
        compile: function () {
          return {
            post: function ($scope, $elm, $attrs, uiGridCtrl) {
              $log.debug('ui-grid postlink');

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

  //todo: move to separate file once Brian has finished committed work in progress
  angular.module('ui.grid').directive('uiGridCell', ['$compile', 'uiGridConstants', '$log', '$parse', function ($compile, uiGridConstants, $log, $parse) {
    var uiGridCell = {
      priority: 0,
      scope: false,
      require: '?^uiGrid',
      compile: function() {
        return {
          pre: function($scope, $elm, $attrs, uiGridCtrl) {
            // If the grid controller is present, use it to get the compiled cell template function
            if (uiGridCtrl) {
              var compiledElementFn = $scope.col.compiledElementFn;

              $scope.getCellValue = uiGridCtrl.getCellValue;
              
              compiledElementFn($scope, function(clonedElement, scope) {
                $elm.append(clonedElement);
              });
            }
            // No controller, compile the element manually
            else {
              var html = $scope.col.cellTemplate
                .replace(uiGridConstants.COL_FIELD, 'getCellValue(row,col)');
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
  };

  return GridColumn;
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
  angular.module('ui.grid').service('gridClassFactory', ['gridUtil', '$q', '$templateCache', 'uiGridConstants', '$log', 'GridColumn',
    function (gridUtil, $q, $templateCache, uiGridConstants, $log, GridColumn) {

      var service = {
        /**
         * @ngdoc method
         * @name createGrid
         * @methodOf ui.grid.service:gridClassFactory
         * @description Creates a new grid instance. Each instance will have a unique id
         * @returns {Grid} grid
         */
        createGrid : function() {
          var grid = new Grid(gridUtil.newId());
          grid.registerColumnBuilder(service.defaultColumnBuilder);
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

          col.headerCellTemplate = colDef.headerCellTemplate || $templateCache.get('ui-grid/uiGridHeaderCell');

          col.cellTemplate = colDef.cellTemplate ||
            $templateCache.get('ui-grid/uiGridCell')
              .replace(uiGridConstants.CUSTOM_FILTERS, col.cellFilter ? "|" + col.cellFilter : "");

          if (colDef.cellTemplate && !uiGridConstants.TEMPLATE_REGEXP.test(colDef.cellTemplate)) {
            templateGetPromises.push(
              gridUtil.getTemplate(colDef.cellTemplate)
                .then(function (contents) {
                  col.cellTemplate = contents;
                })
            );
          }

          if (colDef.headerCellTemplate && !uiGridConstants.TEMPLATE_REGEXP.test(colDef.headerCellTemplate)) {
            templateGetPromises.push(
              gridUtil.getTemplate(colDef.headerCellTemplate)
                .then(function (contents) {
                  col.headerCellTemplate = contents;
                })
            );
          }

          return $q.all(templateGetPromises);
        }

      };

      //class definitions


      /**
       * @ngdoc function
       * @name ui.grid.class:Grid
       * @description Grid defines a logical grid.  Any non-dom properties and elements needed by the grid should
       *              be defined in this class
       * @param {string} id id to assign to grid
       */
      var Grid = function (id) {
        this.id = id;
        this.options = new GridOptions();
        this.headerHeight = this.options.headerRowHeight;
        this.gridHeight = 0;
        this.gridWidth = 0;
        this.columnBuilders = [];
        this.rowBuilders = [];
        this.styleComputations = [];

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
      };

      /**
       * @ngdoc function
       * @name registerColumnBuilder
       * @methodOf ui.grid.class:Grid
       * @description When the build creates columns from column definitions, the columnbuilders will be called to add
       * additional properties to the column.
       * @param {function(colDef, col, gridOptions)} columnsProcessor function to be called
       */
      Grid.prototype.registerColumnBuilder = function (columnsProcessor) {
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
      Grid.prototype.registerRowBuilder = function (rowBuilder) {
        this.rowBuilders.push(rowBuilder);
      };

      /**
       * @ngdoc function
       * @name getColumn
       * @methodOf ui.grid.class:Grid
       * @description returns a grid column for the column name
       * @param {string} name column name
       */
      Grid.prototype.getColumn = function (name) {
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
      Grid.prototype.buildColumns = function () {
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
      Grid.prototype.preprocessColDef = function (colDef) {
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
      Grid.prototype.modifyRows = function(newRawData) {
        var self = this;

        if (self.rows.length === 0 && newRawData.length > 0) {
          self.addRows(newRawData);
          return;
        }

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

      };

      /**
       * Private Undocumented Method
       * @name addRows
       * @methodOf ui.grid.class:Grid
       * @description adds the newRawData array of rows to the grid and calls all registered
       * rowBuilders. this keyword will reference the grid
       */
      Grid.prototype.addRows = function(newRawData) {
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
      Grid.prototype.processRowBuilders = function(gridRow) {
        var self = this;

        self.rowBuilders.forEach(function (builder) {
          builder.call(self,gridRow, self.gridOptions);
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
      Grid.prototype.registerStyleComputation = function (styleComputationInfo) {
        this.styleComputations.push(styleComputationInfo);
      };

      Grid.prototype.setRenderedRows = function (newRows) {
        this.renderedRows.length = newRows.length;
        for (var i = 0; i < newRows.length; i++) {
          this.renderedRows[i] = newRows[i];
        }
      };

      Grid.prototype.setRenderedColumns = function (newColumns) {
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
      Grid.prototype.buildStyles = function ($scope) {
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

      Grid.prototype.minRowsToRender = function () {
        return Math.ceil(this.getViewportHeight() / this.options.rowHeight);
      };

      Grid.prototype.minColumnsToRender = function () {
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

      Grid.prototype.getBodyHeight = function () {
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
      Grid.prototype.getViewportHeight = function () {
        var viewPortHeight = this.gridHeight - this.headerHeight;

        // Account for native horizontal scrollbar, if present
        if (typeof(this.horizontalScrollbarHeight) !== 'undefined' && this.horizontalScrollbarHeight !== undefined && this.horizontalScrollbarHeight > 0) {
          viewPortHeight = viewPortHeight - this.horizontalScrollbarHeight;
        }

        return viewPortHeight;
      };

      Grid.prototype.getViewportWidth = function () {
        var viewPortWidth = this.gridWidth;

        if (typeof(this.verticalScrollbarWidth) !== 'undefined' && this.verticalScrollbarWidth !== undefined && this.verticalScrollbarWidth > 0) {
          viewPortWidth = viewPortWidth - this.verticalScrollbarWidth;
        }

        return viewPortWidth;
      };

      Grid.prototype.getHeaderViewportWidth = function () {
        var viewPortWidth = this.getViewportWidth();

        if (typeof(this.verticalScrollbarWidth) !== 'undefined' && this.verticalScrollbarWidth !== undefined && this.verticalScrollbarWidth > 0) {
          viewPortWidth = viewPortWidth + this.verticalScrollbarWidth;
        }

        return viewPortWidth;
      };

      Grid.prototype.getCanvasHeight = function () {
        var ret =  this.options.rowHeight * this.rows.length;

        if (typeof(this.horizontalScrollbarHeight) !== 'undefined' && this.horizontalScrollbarHeight !== undefined && this.horizontalScrollbarHeight > 0) {
          ret = ret - this.horizontalScrollbarHeight;
        }

        return ret;
      };

      Grid.prototype.getCanvasWidth = function () {
        var ret = this.canvasWidth;

        if (typeof(this.verticalScrollbarWidth) !== 'undefined' && this.verticalScrollbarWidth !== undefined && this.verticalScrollbarWidth > 0) {
          ret = ret - this.verticalScrollbarWidth;
        }

        return ret;
      };

      Grid.prototype.getTotalRowHeight = function () {
        return this.options.rowHeight * this.rows.length;
      };

      // Is the grid currently scrolling?
      Grid.prototype.isScrolling = function() {
        return this.scrolling ? true : false;
      };

      Grid.prototype.setScrolling = function(scrolling) {
        this.scrolling = scrolling;
      };


      /**
       * @ngdoc function
       * @name ui.grid.class:GridOptions
       * @description Default GridOptions class.  GridOptions are defined by the application developer and overlaid
       * over this object.
       * @param {string} id id to assign to grid
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

        // Native scrolling on by default
        this.enableNativeScrolling = true;

        // Virtual scrolling off by default, overrides enableNativeScrolling if set
        this.enableVirtualScrolling = false;

        // Resizing columns, off by default
        this.enableColumnResizing = false;

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
      }

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

      return service;
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
module.service('gridUtil', ['$window', '$document', '$http', '$templateCache', '$timeout', function ($window, $document, $http, $templateCache, $timeout) {
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

          app.controller('MainCtrl', ['$scope', 'GridUtil', function ($scope, GridUtil) {
            $scope.name = 'firstName';
            $scope.columnName = function(name) {
              return GridUtil.readableColumnName(name);
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
     * @description Get's template from Url
     *
     * @returns {object} a promise resolving to template contents
     *
     * @example
     <pre>
     GridUtil.getTemplate(url).then(function (contents) {
          alert(contents);
        })
     </pre>
     */
    getTemplate: function (url) {
      return $http({ method: 'GET', url: url, cache: $templateCache })
        .then(
          function (result) {
            return result.data.trim();
          },
          function (err) {
            throw "Could not get template " + url + ": " + err;
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
    * so that it stays consistent no matter what browser it comes from (i.e. scale it correctl and make sure the direction is right.)
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
    CELL_NAV_EVENT: 'uiGridCellNav',
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

              uiGridCtrl.broadcastCellNav = function(rowCol){
                 $scope.$broadcast(uiGridCellNavConstants.CELL_NAV_EVENT, rowCol);
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
  module.service('uiGridEditService', ['$log', '$q', '$templateCache', 'uiGridConstants',
    function ($log, $q, $templateCache, uiGridConstants) {

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

          if (col.enableCellEdit) {
            col.editableCellTemplate = colDef.editableCellTemplate || $templateCache.get('ui-grid/editableCell');
            col.editableCellDirective = colDef.editableCellDirective || 'ui-grid-text-editor';
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
   *  @restrict EA
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
   *  Binds edit start events to the uiGridCell element.  When the events fire, the gridCell element is replaced
   *  with the columnDef.editableCellDirective directive ('ui-grid-text-editor' by default).
   *
   *  The editableCellDirective should respond to uiGridEditConstants.events.BEGIN\_CELL\_EDIT angular event
   *  and do the initial steps needed to edit the cell (setfocus on input element, etc).
   *
   *  When the editableCellDirective recognizes that the editing is ended (blur event, Enter key, etc.)
   *  it should emit the uiGridEditConstants.events.END\_CELL\_EDIT event.
   *
   *  If editableCellDirective recognizes that the editing has been cancelled (esc key)
   *  it should emit the uiGridEditConstants.events.CANCEL\_CELL\_EDIT event.  The original value
   *  will be set back on the model by the uiGridCell directive.
   *
   *  Events that invoke editing:
   *    - dblclick
   *    - F2 keydown (when using cell selection)
   *
   *  Events that end editing:
   *    - Dependent on the specific editableCellDirective
   *    - Standards should be blur and enter keydown
   *
   *  Events that cancel editing:
   *    - Dependent on the specific editableCellDirective
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

            function beginEdit() {
              cellModel = $parse($scope.row.getQualifiedColField($scope.col));
              //get original value from the cell
              origCellValue = cellModel($scope);

              html = $scope.col.editableCellTemplate;
              html = html.replace(uiGridEditConstants.EDITABLE_CELL_DIRECTIVE, $scope.col.editableCellDirective);

              var cellElement;
              $scope.$apply(function () {
                  inEdit = true;
                  cancelBeginEditEvents();
                  cellElement = $compile(html)($scope.$new());
                  angular.element($elm.children()[0]).addClass('ui-grid-cell-contents-hidden');
                  $elm.append(cellElement);
                }
              );

              //stop editing when grid is scrolled
              var deregOnGridScroll = $scope.$on(uiGridConstants.events.GRID_SCROLL, function () {
                endEdit();
                deregOnGridScroll();
              });

              //end editing
              var deregOnEndCellEdit = $scope.$on(uiGridEditConstants.events.END_CELL_EDIT, function () {
                endEdit();
                deregOnEndCellEdit();
              });

              //cancel editing
              var deregOnCancelCellEdit = $scope.$on(uiGridEditConstants.events.CANCEL_CELL_EDIT, function () {
                cancelEdit();
                deregOnCancelCellEdit();
              });

              $scope.$broadcast(uiGridEditConstants.events.BEGIN_CELL_EDIT);
            }

            function endEdit() {
              if (!inEdit) {
                return;
              }
              angular.element($elm.children()[1]).remove();
              angular.element($elm.children()[0]).removeClass('ui-grid-cell-contents-hidden');
              inEdit = false;
              registerBeginEditEvents();
            }

            function cancelEdit() {
              if (!inEdit) {
                return;
              }
              cellModel.assign($scope, origCellValue);
              $scope.$apply();

              endEdit();
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
   *  @description input editor component for text fields.  Can be used as a template to develop other editors
   *
   *  Events that end editing:
   *     blur and enter keydown
   *
   *  Events that cancel editing:
   *    - Esc keydown
   *
   */
  module.directive('uiGridTextEditor',
    ['uiGridConstants', 'uiGridEditConstants', '$log', '$templateCache', '$compile',
      function (uiGridConstants, uiGridEditConstants, $log, $templateCache, $compile) {
        return{
          scope: true,
          compile: function () {
            return {
              pre: function ($scope, $elm, $attrs) {

              },
              post: function ($scope, $elm, $attrs) {

                var html = $templateCache.get('ui-grid/cellTextEditor');
                html = html.replace(uiGridConstants.COL_FIELD, $scope.row.getQualifiedColField($scope.col));
                var cellElement = $compile(html)($scope);
                $elm.append(cellElement);

                var inputElm = $elm.find('input');

                //set focus at start of edit
                $scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function () {
                  inputElm[0].focus();
                  inputElm[0].select();
                  inputElm.on('blur', function (evt) {
                    $scope.stopEdit();
                  });
                });

                $scope.stopEdit = function () {
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

  // Extend the uiGridHeaderCell directive
  angular.module('ui.grid').directive('uiGridHeaderCell', ['$log', '$templateCache', '$compile', '$q', function ($log, $templateCache, $compile, $q) {
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

  var module = angular.module('ui.grid.resizeColumns', ['ui.grid']);

  module.constant('columnBounds', {
    minWidth: 35
  });
  
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
          event.preventDefault();

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
        $elm.on('dblclick', function() {
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
          var cells = uiGridCtrl.grid.element[0].querySelectorAll('.col' + col.index);
          Array.prototype.forEach.call(cells, function (cell) {
              // Get the cell width
              // $log.debug('width', gridUtil.elementWidth(cell));

              gridUtil.fakeElement(cell, {}, function(newElm) {
                // Make the element float since it's a div and can expand to fill its container
                angular.element(newElm).attr('style', 'float: left');

                var width = gridUtil.elementWidth(newElm);

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
    "<div class=\"ui-grid-body\"><div class=\"ui-grid-scrollbar-box\"><div ui-grid-viewport=\"\" class=\"ui-grid-viewport\"><div class=\"ui-grid-canvas\"><div ng-repeat=\"row in grid.renderedRows track by $index\" class=\"ui-grid-row\" ng-style=\"rowStyle($index)\"><div ui-grid-row=\"row\" row-index=\"row.index\"></div></div></div></div></div><!-- native scrolling --><div ui-grid-native-scrollbar=\"\" ng-if=\"!grid.options.enableVirtualScrolling && grid.options.enableNativeScrolling\" type=\"vertical\"></div><div ui-grid-native-scrollbar=\"\" ng-if=\"!grid.options.enableVirtualScrolling && grid.options.enableNativeScrolling\" type=\"horizontal\"></div><!-- virtual scrolling --><div ui-grid-scrollbar=\"\" ng-if=\"grid.options.enableVirtualScrolling\" type=\"vertical\" scrolling-class=\"ui-grid-scrolling\"></div><div ui-grid-scrollbar=\"\" ng-if=\"grid.options.enableVirtualScrolling\" type=\"horizontal\" scrolling-class=\"ui-grid-scrolling\"></div></div>"
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
    "<div><div ng-repeat=\"col in grid.renderedColumns track by $index\" class=\"ui-grid-cell col{{ col.index }}\"><div class=\"ui-grid-vertical-bar\">&nbsp;</div><div ui-grid-cell=\"\" col=\"col\" row=\"row\" row-index=\"row.index\" col-index=\"col.colDef.index\"></div></div>"
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
    "    }</style><div ui-grid-header=\"\"></div><div ui-grid-body=\"\"></div><div ui-grid-footer=\"\"></div></div>"
  );


  $templateCache.put('ui-grid/uiGridCell',
    "<div class=\"ui-grid-cell-contents\">{{COL_FIELD CUSTOM_FILTERS}}</div>"
  );


  $templateCache.put('ui-grid/uiGridHeaderCell',
    "<div class=\"ui-grid-header-cell col{{ col.index }}\"><div class=\"ui-grid-vertical-bar\">&nbsp;</div><div class=\"ui-grid-cell-contents\" col-index=\"renderIndex\">{{ col.displayName }}</div></div>"
  );


  $templateCache.put('ui-grid/cellTextEditor',
    "<input ng-class=\"'colt' + col.index\" ng-input=\"COL_FIELD\" ng-model=\"COL_FIELD\">"
  );


  $templateCache.put('ui-grid/editableCell',
    "<div editable_cell_directive=\"\"></div>"
  );


  $templateCache.put('ui-grid/columnResizer',
    "<div ui-grid-column-resizer=\"\" ng-if=\"grid.options.enableColumnResizing\" class=\"ui-grid-column-resizer\" col=\"col\" position=\"right\" render-index=\"renderIndex\"></div>"
  );

}]);

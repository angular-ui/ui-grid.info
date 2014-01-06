/*! ui-grid - v2.0.7-1fe7f81 - 2014-01-06
* Copyright (c) 2014 ; Licensed MIT */
(function(){
'use strict';

var app = angular.module('ui.grid.body', []);

app.directive('uiGridBody', ['$log', 'GridUtil', function($log, GridUtil) {
  return {
    replace: true,
    // priority: 1000,
    templateUrl: 'ui-grid/ui-grid-body',
    require: '?^uiGrid',
    scope: false,
    link: function(scope, elm, attrs, uiGridCtrl) {
      if (uiGridCtrl === undefined) {
        $log.warn('[ui-grid-body] uiGridCtrl is undefined!');
      }

      $log.debug('ui-grid-body link');

      // Stick the canvas in the controller
      uiGridCtrl.canvas = angular.element( elm[0].getElementsByClassName('ui-grid-canvas')[0] );
      // uiGridCtrl.viewport = elm; //angular.element( elm[0].getElementsByClassName('ui-grid-viewport')[0] );
      uiGridCtrl.viewport = angular.element( elm[0].getElementsByClassName('ui-grid-viewport')[0] );
      uiGridCtrl.viewportOuterHeight = GridUtil.outerElementHeight(uiGridCtrl.viewport[0]);

      uiGridCtrl.prevScrollTop = 0;
      uiGridCtrl.currentTopRow = 0;

      uiGridCtrl.adjustScrollVertical = function (scrollTop, scrollPercentage, force) {
        if (uiGridCtrl.prevScrollTop === scrollTop && !force) {
          return;
        }

        if (scrollTop > 0 && uiGridCtrl.canvas[0].scrollHeight - scrollTop <= uiGridCtrl.viewportOuterHeight) {
          // $scope.$emit('ngGridEventScroll');
        }

        // $log.debug('scrollPercentage', scrollPercentage);

        // var rowIndex = Math.floor(scrollTop / scope.options.rowHeight);
        // $log.debug(scope.options.data.length + ' * (' + scrollTop + ' / ' + scope.options.canvasHeight + ')');
        // var rowIndex = Math.floor(scope.options.data.length * scrollTop / scope.options.canvasHeight);
        // scrollTop = Math.floor(uiGridCtrl.canvas[0].scrollHeight * scrollPercentage);
        scrollTop = uiGridCtrl.canvas[0].scrollHeight * scrollPercentage;

        var minRows = uiGridCtrl.minRowsToRender();
        var maxRowIndex = scope.options.data.length - minRows;
        uiGridCtrl.maxRowIndex = maxRowIndex;

        // var rowIndex = Math.ceil(Math.min(scope.options.data.length, scope.options.data.length * scrollPercentage));
        var rowIndex = Math.ceil(Math.min(maxRowIndex, maxRowIndex * scrollPercentage));
        // $log.debug('rowIndex', rowIndex);

        // Define a max row index that we can't scroll past
        if (rowIndex > maxRowIndex) {
          rowIndex = maxRowIndex;
        }

        // $log.debug('newScrollTop', scrollTop);
        // $log.debug('rowIndex', rowIndex);
        // $log.debug('data.length', scope.options.data.length);
        var newRange = [];
        if (scope.options.data.length > scope.options.virtualizationThreshold) {
            // Have we hit the threshold going down?
            if (uiGridCtrl.prevScrollTop < scrollTop && rowIndex < uiGridCtrl.prevScrollIndex + scope.options.scrollThreshold && rowIndex < maxRowIndex) {
              return;
            }
            //Have we hit the threshold going up?
            if (uiGridCtrl.prevScrollTop > scrollTop && rowIndex > uiGridCtrl.prevScrollIndex - scope.options.scrollThreshold && rowIndex < maxRowIndex) {
              return;
            }

            // $log.debug('rowIndex | maxRowIndex | minRows', rowIndex, maxRowIndex, minRows);

            var rangeStart = Math.max(0, rowIndex - scope.options.excessRows);
            var rangeEnd = Math.min(scope.options.data.length, rowIndex + minRows + scope.options.excessRows);

            // if (rangeEnd - rangeStart < minRows) {
            //   $log.debug('range too small', rangeStart);
            //   rangeStart = rangeEnd - minRows - scope.options.excessRows; //rangeStart - (minRows - (rangeEnd - rangeStart));
            //   $log.debug('new start of range', rangeStart);
            // }

            // Check to make sure the range isn't too long
            // var rangeLength = rangeEnd - rangeStart;
            // if (rowIndex === maxRowIndex && (scope.options.offsetTop + (scope.options.rowHeight * rangeLength) > scope.options.canvasHeight)) {
            //   $log.debug('range too big!', scope.options.offsetTop, scope.options.rowHeight * rangeLength, scope.options.canvasHeight);

            //   var removeRange = Math.floor( (scope.options.offsetTop + (scope.options.rowHeight * rangeLength) - scope.options.canvasHeight) / scope.options.rowHeight);
            //   $log.debug('remove range', removeRange);

            //   rangeStart = rangeStart + removeRange;
            // }

            newRange = [rangeStart, rangeEnd];
        }
        else {
          var maxLen = scope.options.data.length;
          newRange = [0, Math.max(maxLen, minRows + scope.options.excessRows)];
        }

        uiGridCtrl.prevScrollTop = scrollTop;
        uiGridCtrl.updateViewableRange(newRange);
        uiGridCtrl.prevScrollIndex = rowIndex;
      };

      // Listen for scroll events
      var scrollUnbinder = scope.$on('uiGridScrollVertical', function(evt, args) {
        // $log.debug('scroll', args.scrollPercentage, scope.options.canvasHeight, args.scrollPercentage * scope.options.canvasHeight);

        var scrollLength = (scope.options.canvasHeight - scope.options.viewportHeight);

        // $log.debug('scrollLength', scrollLength, scrollLength % scope.options.rowHeight);
        var newScrollTop = Math.max(0, args.scrollPercentage * scrollLength);
        // $log.debug('mod', (scrollLength % scope.options.rowHeight));
        // newScrollTop = newScrollTop + (scrollLength % scope.options.rowHeight);

        // $log.debug('uiGridCtrl.canvas[0].scrollHeight', uiGridCtrl.canvas[0].scrollHeight);

        // var scrollMultiplier = (scope.options.canvasHeight / (scope.options.rowHeight * scope.options.data.length)) * 100;
        var scrollMultiplier = 1; // (scope.options.rowHeight * scope.options.data.length) / scope.options.canvasHeight;
        // $log.debug('scrollMultiplier', scrollMultiplier);
        // newScrollTop = newScrollTop * scrollMultiplier;

        var scrollPercentage = args.scrollPercentage * scrollMultiplier;

        // $log.debug('newScrollTop', newScrollTop);
        // $log.debug('scrollPercentage - newScrollTop', scrollPercentage, newScrollTop);

        // Prevent scroll top from going over the maximum (canvas height - viewport height)
        // if (newScrollTop > scope.options.canvasHeight - scope.options.viewportHeight) {
        //   $log.debug('too high!');
        //   newScrollTop = scope.options.canvasHeight - scope.options.viewportHeight;
        // }
        
        uiGridCtrl.adjustScrollVertical(newScrollTop, scrollPercentage);
        uiGridCtrl.viewport[0].scrollTop = newScrollTop;
        scope.options.offsetTop = newScrollTop;

        // scope.$evalAsync(function() {
          
        // });
      });
      
      // Scroll the viewport when the mousewheel is used
      elm.bind('mousewheel', function(evt) {
        // use wheelDeltaY
        evt.preventDefault();

        $log.debug('evt.wheelDeltaY', evt.wheelDeltaY);

        var scrollAmount = evt.wheelDeltaY * -1;

        // Get the scroll percentage
        var scrollPercentage = (uiGridCtrl.viewport[0].scrollTop + scrollAmount) / (uiGridCtrl.viewport[0].scrollHeight - scope.options.viewportHeight);

        // TODO(c0bra): Keep scrollPercentage within the range 0-1.

        $log.debug('scrollPercentage', scrollPercentage);

        // $log.debug('new scrolltop', uiGridCtrl.canvas[0].scrollTop + scrollAmount);
        // uiGridCtrl.canvas[0].scrollTop = uiGridCtrl.canvas[0].scrollTop + scrollAmount;
        // $log.debug('new scrolltop', uiGridCtrl.canvas[0].scrollTop);

        scope.$broadcast('uiGridScrollVertical', { scrollPercentage: scrollPercentage, target: elm });
      });

      // TODO(c0bra): Scroll the viewport when the up and down arrow keys are used
      elm.bind('keyDown', function(evt, args) {

      });

      elm.bind('$destroy', function() {
        scrollUnbinder();
        elm.unbind('mousewheel');
        elm.unbind('keyDown');
      });

      uiGridCtrl.setRenderedRows = function (newRows) {
        scope.renderedRows.length = newRows.length;
        scope.$evalAsync(function() {
          for (var i = 0; i < newRows.length; i++) {
            // if (! scope.renderedRows[i]) {
              // $scope.renderedRows[i] = angular.copy(newRows[i]);
            // }
            
            scope.renderedRows[i] = newRows[i];
          }
        });
        
        //   $scope.renderedRows[i].rowIndex = newRows[i].rowIndex;
        //   $scope.renderedRows[i].offsetTop = newRows[i].offsetTop;
        //   $scope.renderedRows[i].selected = newRows[i].selected;
        //   newRows[i].renderedRowIndex = i;
        // }

        // uiGridCtrl.refreshCanvas();
        // uiGridCtrl.buildStyles();
        // uiGridCtrl.recalcRowStyles();
      };

      // Method for updating the visible rows
      uiGridCtrl.updateViewableRange = function(renderedRange) {
        // $log.debug('new viewable range', renderedRange);
        var rowArr = scope.options.data.slice(renderedRange[0], renderedRange[1]);
        uiGridCtrl.currentTopRow = renderedRange[0];

        uiGridCtrl.setRenderedRows(rowArr);
      };

      // scope.rowStyle = function(index) {
      //    var offset = (-1 * scope.options.rowHeight * scope.options.excessRows) + (scope.options.offsetTop || 0);
      //    var ret = { top: offset + (index * scope.options.rowHeight) + 'px' };
      //    return ret;
      // };

//      scope.rowStyle = function(index) {
//        var offset = Math.max(0, (-1 * scope.options.rowHeight * scope.options.excessRows) + (scope.options.offsetTop || 0));
//        // offset = Math.min(scope.options.canvasHeight - scope.options.viewportHeight, offset);
//        var ret = { top: offset + (index * scope.options.rowHeight) + 'px' };
//        return ret;
//      };

      scope.rowStyle = function (index) {
        if (index === 0 && uiGridCtrl.currentTopRow !== 0) {
          // Here we need to add an extra bit on to our offset. We are calculating the offset below based on the number of rows
          //   that will fit into the viewport. If it's not an even amount there will be a remainder and the viewport will not scroll far enough.
          //   We add the remainder on by using the offset-able height's (canvas - viewport) modulus of the row height, and then we multiply
          //   by the percentage of the index of the row we're scrolled to so the modulus is added increasingly the further on we scroll
          var rowPercent = (uiGridCtrl.prevScrollIndex / uiGridCtrl.maxRowIndex);
          var mod = Math.ceil( ((scope.options.canvasHeight - scope.options.viewportHeight) % scope.options.rowHeight) * rowPercent);

          // We need to add subtract a row from the offset at the beginning to prevent a "jump/snap" effect where the grid moves down an extra rowHeight of pixels, then
          //   add it back until the offset is fully there are the bottom
          var extraRowOffset = (1 - rowPercent);

          var offset = (scope.options.offsetTop) - (scope.options.rowHeight * (scope.options.excessRows - extraRowOffset)) - mod; // + extraRowOffset;

          // $log.debug('offset | offsetTop', offset, scope.options.offsetTop);
          return { 'margin-top': offset + 'px' };
        }
          
        return null;
      };
    }
  };
}]);

})();
(function(){
'use strict';

var app = angular.module('ui.grid.header', ['ui.grid.util']);

app.directive('uiGridHeader', ['$log', '$templateCache', '$compile', 'GridUtil', function($log, $templateCache, $compile, GridUtil) {
  return {
    restrict: 'EA',
    templateUrl: 'ui-grid/ui-grid-header',
    replace: true,
    // priority: 1000,
    require: '?^uiGrid',
    scope: false,
    link: function (scope, elm, attrs, uiGridCtrl) {
      if (uiGridCtrl === undefined) {
        $log.warn('[ui-grid-header] uiGridCtrl is undefined!');
      }
      $log.debug('ui-grid-header link');

      if (uiGridCtrl) {
        uiGridCtrl.header = elm;
      }

      // Need to refresh the canvas size when the columnDefs change
      scope.$watch('options.columnDefs', function(n, o) {
        uiGridCtrl.refreshCanvas();
      });
    }
  };
}]);

})();
(function(){
'use strict';

var app = angular.module('ui.grid.row', []);

app.directive('uiGridRow', ['$log', '$compile', 'GridUtil', function($log, $compile, GridUtil) {
  return {
    replace: true,
    // priority: 2001,
    templateUrl: 'ui-grid/ui-grid-row',
    require: ['?^uiGrid', '?^ngRepeat'],
    scope: {
      row: '=uiGridRow',
      rowIndex: '='
    },
    compile: function() {
      return {
        pre: function(scope, elm, attrs) {
          // if (scope.rowIndex === 0) {
          //   ng-style="rowStyle($index)"
          //   elm.attr('ng-style', "rowStyle($index)");
          //   $compile(elm)(scope);
          // }
        },
        post: function(scope, elm, attrs, controllers) {
          var uiGridCtrl   = controllers[0];
          var ngRepeatCtrl = controllers[1];

          if (uiGridCtrl === undefined) {
            $log.warn('[ui-grid-row] uiGridCtrl is undefined!');
          }

          // if (scope.rowIndex === 0) {
          //   // ng-style="rowStyle($index)"
          //   elm.attr('ng-style', "rowStyle($index)");
          //   $log.debug(elm.contents());
          //   // $compile()(scope);
          // }

          scope.options = uiGridCtrl.grid.options;
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

var app = angular.module('ui.grid.scrollbar', []);

app.directive('uiGridScrollbar', ['$log', '$document', 'GridUtil', function($log, $document, GridUtil) {
  return {
    replace: true,
    // priority: 1000,
    templateUrl: 'ui-grid/ui-grid-scrollbar',
    require: '?^uiGrid',
    scope: false,
    link: function(scope, elm, attrs, uiGridCtrl) {
      if (uiGridCtrl === undefined) {
        $log.warn('[ui-grid-scrollbar] uiGridCtrl is undefined!');
      }

      $log.debug('ui-grid-scrollbar link');

      // Size the scrollbar according to the amount of data. 35px high minimum, otherwise scale inversely proportinal to canvas vs viewport height
      function updateScrollbar(gridScope) {
        var scrollbarHeight = Math.floor(Math.max(35, gridScope.options.viewportHeight / gridScope.options.canvasHeight * gridScope.options.viewportHeight));

        gridScope.scrollbarStyles = '.grid' + gridScope.gridId + ' .ui-grid-scrollbar-vertical { height: ' + scrollbarHeight + 'px; }';
      }

      // Only show the scrollbar when the canvas height is less than the viewport height
      scope.showScrollbar = function() {
        return scope.options.canvasHeight > scope.options.viewportHeight;
      };

      if (uiGridCtrl) {
        uiGridCtrl.styleComputions.push(updateScrollbar);
      }

      var startY = 0,
          y = 0;
      
      // Get the height of the scrollbar, including its margins
      var elmHeight = GridUtil.elementHeight(elm, 'margin');

      // Get the "bottom bound" which the scrollbar cannot scroll past
      var elmBottomBound = scope.options.viewportHeight - elmHeight;
      
      function mousedown(event) {
        // Prevent default dragging of selected content
        event.preventDefault();
        elmHeight = GridUtil.elementHeight(elm, 'margin');
        elmBottomBound = scope.options.viewportHeight - elmHeight;
        startY = event.screenY - y;

        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      }

      elm.on('mousedown', mousedown);

      function mousemove(event) {
        y = event.screenY - startY;

        if (y < 0) { y = 0; }
        if (y > elmBottomBound) { y = elmBottomBound; }

        var scrollPercentage = y / elmBottomBound;
        // $log.debug('scrollPercentage', y, scope.options.viewportHeight, elmHeight, elmBottomBound, scrollPercentage);

        scope.$emit('uiGridScrollVertical', { scrollPercentage: scrollPercentage, target: elm });
      }

      var scrollDereg = scope.$on('uiGridScrollVertical', function(evt, args) {
        if (args.scrollPercentage < 0) { args.scrollPercentage = 0; }
        if (args.scrollPercentage > 1) { args.scrollPercentage = 1; }

        elmHeight = GridUtil.elementHeight(elm, 'margin');
        elmBottomBound = scope.options.viewportHeight - elmHeight;

        // $log.debug('elmHeight', elmHeight);
        // $log.debug('elmBottomBound', elmBottomBound);

        // var newScrollTop = Math.floor(args.scrollPercentage * elmBottomBound);
        var newScrollTop = args.scrollPercentage * elmBottomBound;

        // $log.debug('newScrollTop', newScrollTop);
        // $log.debug('maxScrollTop', elmBottomBound);

        var newTop = newScrollTop; //(scope.options.offsetTop || 0) + newScrollTop;

        // Prevent scrollbar from going beyond container
        if (newTop > scope.options.canvasHeight - elmHeight) {
          $log.debug('newTop too big!', newTop);
          newTop = scope.options.canvasHeight - elmHeight;
        }

        // $log.debug('newTop', newTop);

        y = newScrollTop;
        elm.css({
          top: newTop + 'px'
        });
      });

      function mouseup() {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
      }

      elm.on('$destroy', function() {
        scrollDereg();
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
        elm.unbind('mousedown');
      });
    }
  };
}]);

})();
(function(){
// 'use strict';

/**
 * @ngdoc directive
 * @name ui.grid.style.directive:uiGridStyle
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

var app = angular.module('ui.grid.style', []);

app.directive('uiGridStyle', ['$log', '$interpolate', function($log, $interpolate) {
  return {
    // restrict: 'A',
    // priority: 1000,
    require: '?^uiGrid',
    link: function(scope, element, attrs, uiGridCtrl) {
      $log.debug('ui-grid-style link');

      var interpolateFn = $interpolate(element.text(), true);

      if (interpolateFn) {
        scope.$watch(interpolateFn, function(value) {
          element.text(value);
        });
      }

      if (uiGridCtrl) {
        uiGridCtrl.styleComputions.push(function() {
          var width = uiGridCtrl.grid.gridWidth;
          var equalWidth = width / scope.options.columnDefs.length;

          var ret = '';
          var left = 0;
          angular.forEach(scope.options.columnDefs, function(c, i) {
            ret = ret + ' .grid' + scope.gridId + ' .col' + i + ' { width: ' + equalWidth + 'px; left: ' + left + 'px; }';
            left = left + equalWidth;
          });

          scope.columnStyles = ret;
        });

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
    }
  };
}]);

})();
(function(){
'use strict';

var app = angular.module('ui.grid', ['ui.grid.header', 'ui.grid.body', 'ui.grid.row', 'ui.grid.style', 'ui.grid.scrollbar']);

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
app.directive('uiGrid',
  [
    '$log',
    '$compile',
    '$templateCache',
    'GridUtil',
  function(
    $log,
    $compile,
    $templateCache,
    GridUtil
  ) {

    function preLink(scope, elm, attrs, uiGridCtrl) {
      $log.debug('ui-grid prelink');

      var options = scope.options = {
        data: [],

        /**
        * @property {Array} columnDefs
        */
        columnDefs: null,

        // Height of the header row in
        headerRowHeight: 30,

        rowHeight: 30,

        maxVisibleRowCount: 200,

        // Turn virtualization on when number of data elements goes over this number
        virtualizationThreshold: 50,

        // Extra rows to to render outside of the viewport
        excessRows: 4,

        scrollThreshold: 4
      };
      uiGridCtrl.grid = { options: scope.options };

      angular.extend(options, scope.uiGrid);

      // Create an ID for this grid
      scope.gridId = GridUtil.newId();

      // Initialize the grid
      scope.renderedRows = [];

      // Get the column definitions
      //   If no columnDefs were supplied, generate them ourself
      if (! options.columnDefs || options.columnDefs.length === 0) {
        options.columnDefs = GridUtil.getColumnsFromData(options.data);

        // TODO(c0bra): Put a watch on them
      }

      // if (angular.isArray(options.data)) {
      //   scope.renderedRows = options.data;
      // }

      // scope.$evalAsync(function() {
      //   uiGridCtrl.refreshCanvas();
      // });

      elm.on('$destroy', function() {
        // Remove columnDefs watch
      });
    }
    
    return {
      templateUrl: 'ui-grid/ui-grid',
      scope: {
        uiGrid: '='
      },
      replace: true,
      compile: function () {
        return {
          pre: preLink,
          post: function (scope, elm, attrs, uiGridCtrl) {
            $log.debug('ui-grid postlink');

            // Get the grid dimensions from the element
            // uiGridCtrl.grid.gridWidth = scope.gridWidth = GridUtil.elementWidth(elm);
            // uiGridCtrl.grid.gridHeight = scope.gridHeight = GridUtil.elementHeight(elm);
            uiGridCtrl.grid.gridWidth = scope.gridWidth = elm[0].clientWidth;
            uiGridCtrl.grid.gridHeight = scope.gridHeight = GridUtil.elementHeight(elm);
            
            uiGridCtrl.refreshCanvas();

            if (typeof(scope.options.data) !== 'undefined' && scope.options.data !== undefined && scope.options.data.length) {
              scope.visibleRowCount = scope.options.data.length;
            }

            function watchFunction(n, o) {
              // $log.debug('watch fired!', n, o);
              if (n) {
                if (scope.options.columnDefs.length <= 0) {
                  scope.options.columnDefs = GridUtil.getColumnsFromData(n);
                }

                scope.options.data = n;
                // scope.renderedRows = scope.options.data;

                uiGridCtrl.buildStyles();

                var scrollTop = uiGridCtrl.viewport[0].scrollTop;
                uiGridCtrl.adjustScrollVertical(scrollTop, null, true);

                scope.$evalAsync(function() {
                  uiGridCtrl.refreshCanvas();
                });
              }
            }
            
            var dataWatchDereg;
            if (angular.isString(scope.uiGrid.data)) {
              dataWatchDereg = scope.$parent.$watch(scope.uiGrid.data, watchFunction);
            }
            else {
              dataWatchDereg = scope.$parent.$watch(function() { return scope.uiGrid.data; }, watchFunction);
            }

            elm.on('$destroy', dataWatchDereg);
          }
        };
      },
      controller: function ($scope, $element, $attrs) {
        $log.debug('ui-grid controller');

        var self = this;
        self.styleComputions = [];

        self.buildStyles = function() {
          // uiGridCtrl.buildColumnStyles();
          // uiGridCtrl.buildRowStyles();

          angular.forEach(self.styleComputions, function(comp) {
            comp.call(self, $scope);
          });
        };

        $scope.$watch(function () { return self.styleComputions; }, function() {
          self.buildStyles();
        });

        self.minRowsToRender = function() {
          return Math.ceil($scope.options.viewportHeight / $scope.options.rowHeight);
        };

        // Refresh the canvas drawable size 
        self.refreshCanvas = function() {
          // Default to the configured header row height, then calculate it once the header is linked
          var headerHeight = $scope.options.headerRowHeight;

          if (self.header) {
            headerHeight = GridUtil.outerElementHeight(self.header);
          }
          
          // TODO(c0bra): account for footer height
          // NOTE: viewport drawable height is the height of the grid minus the header row height (including any border)
          // self.grid.options.canvasHeight = $scope.gridHeight - headerHeight;
          $scope.options.viewportHeight = $scope.gridHeight - headerHeight;
          $scope.options.canvasHeight = $scope.options.rowHeight * $scope.options.data.length;

          // Calculate the height of all the displayable rows
          if (self.canvas && self.grid.options.data.length) {
            self.grid.options.totalRowHeight = self.grid.options.rowHeight * self.grid.options.data.length;
          }

          self.buildStyles();
        }; 
      }
    };
  }
]);

})();
(function(){
'use strict';
  
// (part of the sf.virtualScroll module).
var mod = angular.module('ui.virtual-repeat', []);

var DONT_WORK_AS_VIEWPORTS = ['TABLE', 'TBODY', 'THEAD', 'TR', 'TFOOT'];
var DONT_WORK_AS_CONTENT = ['TABLE', 'TBODY', 'THEAD', 'TR', 'TFOOT'];
var DONT_SET_DISPLAY_BLOCK = ['TABLE', 'TBODY', 'THEAD', 'TR', 'TFOOT'];

// Utility to clip to range
function clip(value, min, max){
  if (angular.isArray(value)) {
    return angular.forEach(value, function(v) {
      return clip(v, min, max);
    });
  }

  return Math.max(min, Math.min(value, max));
}

mod.directive('uiVirtualRepeat', ['$log', '$rootElement', function($log, $rootElement){

  // Turn the expression supplied to the directive:
  //
  //     a in b
  //
  // into `{ value: "a", collection: "b" }`
  function parseRepeatExpression(expression) {
    var match = expression.match(/^\s*([\$\w]+)\s+in\s+([\S\s]*)$/);
    if (! match) {
      throw new Error("Expected uiVirtualRepeat in form of '_item_ in _collection_' but got '" + expression + "'.");
    }
    return {
      value: match[1],
      collection: match[2]
    };
  }

  // Utility to filter out elements by tag name
  function isTagNameInList(element, list) {
    var t,
        tag = element.tagName.toUpperCase();

    for (t = 0; t < list.length; t++) {
      if (list[t] === tag) {
        return true;
      }
    }
    return false;
  }


  // Utility to find the viewport/content elements given the start element:
  function findViewportAndContent(startElement) {
    /*jshint eqeqeq:false, curly:false */
    var root = $rootElement[0];
    var e, n;

    // Somewhere between the grandparent and the root node
    for (e = startElement.parent().parent()[0]; e !== root; e = e.parentNode) {
      // is an element
      if (e.nodeType != 1) break;
      // that isn't in the blacklist (tables etc.),
      if (isTagNameInList(e, DONT_WORK_AS_VIEWPORTS)) continue;
      // has a single child element (the content),
      if (e.childElementCount != 1) continue;
      // which is not in the blacklist
      if (isTagNameInList(e.firstElementChild, DONT_WORK_AS_CONTENT)) continue;
      // and no text.
      for (n = e.firstChild; n; n = n.nextSibling) {
        if (n.nodeType == 3 && /\S/g.test(n.textContent)) {
          break;
        }
      }

      if (n == null) {
        // That element should work as a viewport.
        return {
          viewport: angular.element(e),
          content: angular.element(e.firstElementChild)
        };
      }
    }

    throw new Error("No suitable viewport element");
  }

  // Apply explicit height and overflow styles to the viewport element.
  //
  // If the viewport has a max-height (inherited or otherwise), set max-height.
  // Otherwise, set height from the current computed value or use
  // window.innerHeight as a fallback
  //
  function setViewportCSS(viewport) {
    var viewportCSS = {'overflow': 'auto'};

    var style = window.getComputedStyle ?
                window.getComputedStyle(viewport[0]) :
                viewport[0].currentStyle;

    var maxHeight = style && style.getPropertyValue('max-height');
    var height = style && style.getPropertyValue('height');

    if (maxHeight && maxHeight !== '0px') {
      viewportCSS.maxHeight = maxHeight;
    }
    else if (height && height !== '0px') {
      viewportCSS.height = height;
    }
    else {
      viewportCSS.height = window.innerHeight;
    }

    viewport.css(viewportCSS);
  }

  // Apply explicit styles to the content element to prevent pesky padding
  // or borders messing with our calculations:
  function setContentCSS(content) {
    var contentCSS = {
      margin: 0,
      padding: 0,
      border: 0,
      'box-sizing': 'border-box'
    };

    content.css(contentCSS);
  }

  // TODO: compute outerHeight (padding + border unless box-sizing is border)
  function computeRowHeight(element) {
    var style = window.getComputedStyle ?
                window.getComputedStyle(element) :
                element.currentStyle;

    var maxHeight = style && style.getPropertyValue('max-height');
    var height = style && style.getPropertyValue('height');

    if (height && height !== '0px' && height !== 'auto') {
      // $log.info('Row height is "%s" from css height', height);
    }
    else if (maxHeight && maxHeight !== '0px' && maxHeight !== 'none') {
      height = maxHeight;
      // $log.info('Row height is "%s" from css max-height', height);
    }
    else if (element.clientHeight) {
      height = element.clientHeight + 'px';
      // $log.info('Row height is "%s" from client height', height);
    }
    else {
      //throw new Error("Unable to compute height of row");
      return;
    }

    angular.element(element).css('height', height);

    return parseInt(height, 10);
  }

  // The compile gathers information about the declaration. There's not much
  // else we could do in the compile step as we need a viewport parent that
  // is exculsively ours - this is only available at link time.
  function uiVirtualRepeatCompile(element, attr, linker) {
    var ident = parseRepeatExpression(attr.uiVirtualRepeat);
    
    // ----

    // Set up the initial value for our watch expression (which is just the
    // start and length of the active rows and the collection length) and
    // adds a listener to handle child scopes based on the active rows.
    function sfVirtualRepeatPostLink(scope, iterStartElement, attrs) {

      var rendered = [];
          scope.rendered = rendered;

      var rowHeight = 0;
      var sticky = false;
      var dom = findViewportAndContent(iterStartElement);
      // The list structure is controlled by a few simple (visible) variables:
      var state = 'ngModel' in attrs ? scope.$eval(attrs.ngModel) : {};
      //  - The index of the first active element
      state.firstActive = 0;
      //  - The index of the first visible element
      state.firstVisible = 0;
      //  - The number of elements visible in the viewport.
      state.visible = 0;
      // - The number of active elements
      state.active = 0;
      // - The total number of elements
      state.total = 0;
      // - The point at which we add new elements
      state.lowWater = state.lowWater || 10;
      // - The point at which we remove old elements
      state.highWater = state.highWater || 20;
      // TODO: now watch the water marks

      setContentCSS(dom.content);
      setViewportCSS(dom.viewport);
      // When the user scrolls, we move the `state.firstActive`
      dom.viewport.bind('scroll', sfVirtualRepeatOnScroll);

      // The watch on the collection is just a watch on the length of the
      // collection. We don't care if the content changes.
      scope.$watch(sfVirtualRepeatWatchExpression, sfVirtualRepeatListener, true);

      // and that's the link done! All the action is in the handlers...
      
      // ----

      // Apply explicit styles to the item element
      function setElementCSS(element) {
        var elementCSS = {
          // no margin or it'll screw up the height calculations.
          margin: '0'
        };

        if (!isTagNameInList(element[0], DONT_SET_DISPLAY_BLOCK)) {
          // display: block if it's safe to do so
          elementCSS.display = 'block';
        }

        if (rowHeight) {
          elementCSS.height = rowHeight + 'px';
        }

        element.css(elementCSS);
      }

      function makeNewScope (idx, collection, containerScope) {
        var childScope = containerScope.$new();
        childScope[ident.value] = collection[idx];
        childScope.$index = idx;
        childScope.$first = (idx === 0);
        childScope.$last = (idx === (collection.length - 1));
        childScope.$middle = !(childScope.$first || childScope.$last);
        childScope.$watch(function updateChildScopeItem(){
          childScope[ident.value] = collection[idx];
        });
        return childScope;
      }

      function addElements (start, end, collection, containerScope, insPoint) {
        var frag = document.createDocumentFragment();
        var newElements = [], element, idx, childScope;

        for (idx = start; idx !== end; idx++) {
          childScope = makeNewScope(idx, collection, containerScope);
          element = linker(childScope, angular.noop);
          setElementCSS(element);
          newElements.push(element);
          frag.appendChild(element[0]);
        }

        insPoint.after(frag);
        return newElements;
      }

      function recomputeActive() {
        // We want to set the start to the low water mark unless the current
        // start is already between the low and high water marks.
        var start = clip(state.firstActive, state.firstVisible - state.lowWater, state.firstVisible - state.highWater);
        // Similarly for the end
        var end = clip(state.firstActive + state.active,
                       state.firstVisible + state.visible + state.lowWater,
                       state.firstVisible + state.visible + state.highWater );
        state.firstActive = Math.max(0, start);
        state.active = Math.min(end, state.total) - state.firstActive;
      }

      function sfVirtualRepeatOnScroll(evt) {
        if (!rowHeight) {
          return;
        }

        // Enter the angular world for the state change to take effect.
        scope.$apply(function() {
          state.firstVisible = Math.floor(evt.target.scrollTop / rowHeight);
          state.visible = Math.ceil(dom.viewport[0].clientHeight / rowHeight);

          // $log.log('scroll to row %o', state.firstVisible);
          sticky = evt.target.scrollTop + evt.target.clientHeight >= evt.target.scrollHeight;

          recomputeActive();
          // $log.log(' state is now %o', state);
          // $log.log(' sticky = %o', sticky);
        });
      }

      function sfVirtualRepeatWatchExpression(scope) {
        var coll = scope.$eval(ident.collection);

        if (coll.length !== state.total) {
          state.total = coll.length;
          recomputeActive();
        }

        return {
          start: state.firstActive,
          active: state.active,
          len: coll.length
        };
      }

      function destroyActiveElements (action, count) {
        var dead,
            ii,
            remover = Array.prototype[action];

        for (ii = 0; ii < count; ii++) {
          dead = remover.call(rendered);
          dead.scope().$destroy();
          dead.remove();
        }
      }

      // When the watch expression for the repeat changes, we may need to add
      // and remove scopes and elements
      function sfVirtualRepeatListener(newValue, oldValue, scope) {
        var oldEnd = oldValue.start + oldValue.active,
            collection = scope.$eval(ident.collection),
            newElements;

        if (newValue === oldValue) {
          // $log.info('initial listen');
          newElements = addElements(newValue.start, oldEnd, collection, scope, iterStartElement);
          rendered = newElements;

          if (rendered.length) {
            rowHeight = computeRowHeight(newElements[0][0]);
          }
        }
        else {
          var newEnd = newValue.start + newValue.active;
          var forward = newValue.start >= oldValue.start;
          var delta = forward ? newValue.start - oldValue.start
                              : oldValue.start - newValue.start;
          var endDelta = newEnd >= oldEnd ? newEnd - oldEnd : oldEnd - newEnd;
          var contiguous = delta < (forward ? oldValue.active : newValue.active);
          // $log.info('change by %o,%o rows %s', delta, endDelta, forward ? 'forward' : 'backward');

          if (!contiguous) {
            // $log.info('non-contiguous change');
            destroyActiveElements('pop', rendered.length);
            rendered = addElements(newValue.start, newEnd, collection, scope, iterStartElement);
          }
          else {
            if (forward) {
              // $log.info('need to remove from the top');
              destroyActiveElements('shift', delta);
            }
            else if (delta) {
              // $log.info('need to add at the top');
              newElements = addElements(
                newValue.start,
                oldValue.start,
                collection, scope, iterStartElement);
              rendered = newElements.concat(rendered);
            }

            if (newEnd < oldEnd) {
              // $log.info('need to remove from the bottom');
              destroyActiveElements('pop', oldEnd - newEnd);
            }
            else if (endDelta) {
              var lastElement = rendered[rendered.length-1];
              // $log.info('need to add to the bottom');
              newElements = addElements(
                oldEnd,
                newEnd,
                collection, scope, lastElement);

              rendered = rendered.concat(newElements);
            }
          }

          if (!rowHeight && rendered.length) {
            rowHeight = computeRowHeight(rendered[0][0]);
          }

          dom.content.css({'padding-top': newValue.start * rowHeight + 'px'});
        }

        dom.content.css({'height': newValue.len * rowHeight + 'px'});

        if (sticky) {
          dom.viewport[0].scrollTop = dom.viewport[0].clientHeight + dom.viewport[0].scrollHeight;
        }

        scope.rendered = rendered;
      }

      return;
    }

    return {
      post: sfVirtualRepeatPostLink
    };
  }

  var directive =  {
    require: '?ngModel',
    transclude: 'element',
    priority: 1000,
    // terminal: true,
    compile: uiVirtualRepeatCompile,
    controller: ['$scope', function ($scope) {
      this.visibleRows = 0;
      this.visibleRows = this.visibleRows + 1;
    }]
  };

  return directive;
}]);

}());
(function() {

var app = angular.module('ui.grid.util', []);

function getStyles (elem) {
  return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
}

var rnumnonpx = new RegExp( "^(" + (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source + ")(?!px)[a-z%]+$", "i" );

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
 *  @name ui.grid.util.service:GridUtil
 *  
 *  @description Grid utility functions
 */
app.service('GridUtil', ['$window', function ($window) {
  var s = {

    /**
     * @ngdoc method
     * @name readableColumnName
     * @methodOf ui.grid.util.service:GridUtil
     *
     * @param {string} columnName Column name as a string
     * @returns {string} Column name appropriately capitalized and split apart
     *
       @example
       <example module="app">
        <file name="app.js">
          var app = angular.module('app', ['ui.grid.util']);

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
     * @methodOf ui.grid.util.service:GridUtil
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
      
      angular.forEach(item, function (prop, propName) {
        columnDefs.push({
          field: propName,
          name: s.readableColumnName(propName)
        });
      });

      return columnDefs;
    },

    /**
     * @ngdoc method
     * @name newId
     * @methodOf ui.grid.util.service:GridUtil
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
    * @name elementWidth
    * @methodOf ui.grid.util.service:GridUtil
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
    * @methodOf ui.grid.util.service:GridUtil
    *
    * @param {element} element DOM element
    * @param {string} [extra] Optional modifier for calculation. Use 'margin' to account for margins on element
    *
    * @returns {number} Element height in pixels, accounting for any borders, etc.
    */
    elementHeight: function (elem) {
      
    }
  };

  angular.forEach(['width', 'height'], function (name){
    var capsName = angular.uppercase(name.charAt(0)) + name.substr(1);
    s['element' + capsName] = function (elem, extra) {
      var e = elem;
      if (typeof(e.length) !== 'undefined' && e.length) {
        e = elem[0];
      }
      
      return elem ? getWidthOrHeight( e, name, extra ) : null;
    };

    s['outerElement' + capsName] = function (elem, margin) {
      return elem ? s['element' + capsName].call(this, elem, margin ? 'margin' : 'border') : null;
    };
  });



  return s;
}]);

})();
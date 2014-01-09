/*! ui-grid - v2.0.7-4773b16 - 2014-01-09
* Copyright (c) 2014 ; Licensed MIT */
(function(){
  'use strict';

  var app = angular.module('ui.grid.body', []);

  app.directive('uiGridBody', ['$log', 'gridUtil', function($log, GridUtil) {
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

          // var rowIndex = Math.floor(scrollTop / uiGridCtrl.grid.options.rowHeight);
          // $log.debug(uiGridCtrl.grid.options.data.length + ' * (' + scrollTop + ' / ' + uiGridCtrl.grid.options.canvasHeight + ')');
          // var rowIndex = Math.floor(uiGridCtrl.grid.options.data.length * scrollTop / uiGridCtrl.grid.options.canvasHeight);
          // scrollTop = Math.floor(uiGridCtrl.canvas[0].scrollHeight * scrollPercentage);
          scrollTop = uiGridCtrl.canvas[0].scrollHeight * scrollPercentage;

          var minRows = uiGridCtrl.grid.minRowsToRender();
          var maxRowIndex = uiGridCtrl.grid.options.data.length - minRows;
          uiGridCtrl.maxRowIndex = maxRowIndex;

          // var rowIndex = Math.ceil(Math.min(uiGridCtrl.grid.options.data.length, uiGridCtrl.grid.options.data.length * scrollPercentage));
          var rowIndex = Math.ceil(Math.min(maxRowIndex, maxRowIndex * scrollPercentage));
          // $log.debug('rowIndex', rowIndex);

          // Define a max row index that we can't scroll past
          if (rowIndex > maxRowIndex) {
            rowIndex = maxRowIndex;
          }

          // $log.debug('newScrollTop', scrollTop);
          // $log.debug('rowIndex', rowIndex);
          // $log.debug('data.length', uiGridCtrl.grid.options.data.length);
          var newRange = [];
          if (uiGridCtrl.grid.options.data.length > uiGridCtrl.grid.options.virtualizationThreshold) {
            // Have we hit the threshold going down?
            if (uiGridCtrl.prevScrollTop < scrollTop && rowIndex < uiGridCtrl.prevScrollIndex + uiGridCtrl.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
              return;
            }
            //Have we hit the threshold going up?
            if (uiGridCtrl.prevScrollTop > scrollTop && rowIndex > uiGridCtrl.prevScrollIndex - uiGridCtrl.grid.options.scrollThreshold && rowIndex < maxRowIndex) {
              return;
            }

            // $log.debug('rowIndex | maxRowIndex | minRows', rowIndex, maxRowIndex, minRows);

            var rangeStart = Math.max(0, rowIndex - uiGridCtrl.grid.options.excessRows);
            var rangeEnd = Math.min(uiGridCtrl.grid.options.data.length, rowIndex + minRows + uiGridCtrl.grid.options.excessRows);

            // if (rangeEnd - rangeStart < minRows) {
            //   $log.debug('range too small', rangeStart);
            //   rangeStart = rangeEnd - minRows - uiGridCtrl.grid.options.excessRows; //rangeStart - (minRows - (rangeEnd - rangeStart));
            //   $log.debug('new start of range', rangeStart);
            // }

            // Check to make sure the range isn't too long
            // var rangeLength = rangeEnd - rangeStart;
            // if (rowIndex === maxRowIndex && (uiGridCtrl.grid.options.offsetTop + (uiGridCtrl.grid.options.rowHeight * rangeLength) > uiGridCtrl.grid.options.canvasHeight)) {
            //   $log.debug('range too big!', uiGridCtrl.grid.options.offsetTop, uiGridCtrl.grid.options.rowHeight * rangeLength, uiGridCtrl.grid.options.canvasHeight);

            //   var removeRange = Math.floor( (uiGridCtrl.grid.options.offsetTop + (uiGridCtrl.grid.options.rowHeight * rangeLength) - uiGridCtrl.grid.options.canvasHeight) / uiGridCtrl.grid.options.rowHeight);
            //   $log.debug('remove range', removeRange);

            //   rangeStart = rangeStart + removeRange;
            // }

            newRange = [rangeStart, rangeEnd];
          }
          else {
            var maxLen = uiGridCtrl.grid.options.data.length;
            newRange = [0, Math.max(maxLen, minRows + uiGridCtrl.grid.options.excessRows)];
          }

          uiGridCtrl.prevScrollTop = scrollTop;
          updateViewableRange(newRange);
          uiGridCtrl.prevScrollIndex = rowIndex;
        };

        // Listen for scroll events
        var scrollUnbinder = $scope.$on('uiGridScrollVertical', function(evt, args) {
          // $log.debug('scroll', args.scrollPercentage, uiGridCtrl.grid.options.canvasHeight, args.scrollPercentage * uiGridCtrl.grid.options.canvasHeight);

          var scrollLength = (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.viewportHeight);

          // $log.debug('scrollLength', scrollLength, scrollLength % uiGridCtrl.grid.options.rowHeight);
          var newScrollTop = Math.max(0, args.scrollPercentage * scrollLength);
          // $log.debug('mod', (scrollLength % uiGridCtrl.grid.options.rowHeight));
          // newScrollTop = newScrollTop + (scrollLength % uiGridCtrl.grid.options.rowHeight);

          // $log.debug('uiGridCtrl.canvas[0].scrollHeight', uiGridCtrl.canvas[0].scrollHeight);

          // var scrollMultiplier = (uiGridCtrl.grid.options.canvasHeight / (uiGridCtrl.grid.options.rowHeight * uiGridCtrl.grid.options.data.length)) * 100;
          var scrollMultiplier = 1; // (uiGridCtrl.grid.options.rowHeight * uiGridCtrl.grid.options.data.length) / uiGridCtrl.grid.options.canvasHeight;
          // $log.debug('scrollMultiplier', scrollMultiplier);
          // newScrollTop = newScrollTop * scrollMultiplier;

          var scrollPercentage = args.scrollPercentage * scrollMultiplier;

          // $log.debug('newScrollTop', newScrollTop);
          // $log.debug('scrollPercentage - newScrollTop', scrollPercentage, newScrollTop);

          // Prevent scroll top from going over the maximum (canvas height - viewport height)
          // if (newScrollTop > uiGridCtrl.grid.options.canvasHeight - uiGridCtrl.grid.options.viewportHeight) {
          //   $log.debug('too high!');
          //   newScrollTop = uiGridCtrl.grid.options.canvasHeight - uiGridCtrl.grid.options.viewportHeight;
          // }

          uiGridCtrl.adjustScrollVertical(newScrollTop, scrollPercentage);
          uiGridCtrl.viewport[0].scrollTop = newScrollTop;
          uiGridCtrl.grid.options.offsetTop = newScrollTop;

          // scope.$evalAsync(function() {

          // });
        });

        // Scroll the viewport when the mousewheel is used
        $elm.bind('wheel mousewheel DomMouseScroll MozMousePixelScroll', function(evt) {
          // use wheelDeltaY
          evt.preventDefault();

          // $log.debug('evt', evt);
          // $log.debug('evt.wheelDeltaY', evt.wheelDeltaY);

          var newEvent = GridUtil.normalizeWheelEvent(evt);

          var scrollAmount = newEvent.deltaY * -120;

          // Get the scroll percentage
          // var scrollPercentage = (uiGridCtrl.viewport[0].scrollTop + scrollAmount) / (uiGridCtrl.viewport[0].scrollHeight - uiGridCtrl.grid.options.viewportHeight);
          var scrollPercentage = (uiGridCtrl.viewport[0].scrollTop + scrollAmount) / (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

          // TODO(c0bra): Keep scrollPercentage within the range 0-1.
          if (scrollPercentage < 0) { scrollPercentage = 0; }
          if (scrollPercentage > 1) { scrollPercentage = 1; }

          // $log.debug('scrollPercentage', scrollPercentage);

          // $log.debug('new scrolltop', uiGridCtrl.canvas[0].scrollTop + scrollAmount);
          // uiGridCtrl.canvas[0].scrollTop = uiGridCtrl.canvas[0].scrollTop + scrollAmount;
          // $log.debug('new scrolltop', uiGridCtrl.canvas[0].scrollTop);

          $scope.$broadcast('uiGridScrollVertical', { scrollPercentage: scrollPercentage, target: $elm });
        });

        // TODO(c0bra): Scroll the viewport when the up and down arrow keys are used
        $elm.bind('keyDown', function(evt, args) {

        });

        // Unbind all $watches and events on $destroy
        $elm.bind('$destroy', function() {
          scrollUnbinder();
          $elm.unbind('keyDown');

          ['wheel', 'mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'].forEach(function (eventName) {
            $elm.unbind(eventName);
          });
        });



        var setRenderedRows = function (newRows) {
          // NOTE: without the $evalAsync the new rows don't show up
          $scope.$evalAsync(function() {
            uiGridCtrl.grid.setRenderedRows(newRows);
          });
        };

        // Method for updating the visible rows
        var updateViewableRange = function(renderedRange) {
          // Slice out the range of rows from the data
          var rowArr = uiGridCtrl.grid.options.data.slice(renderedRange[0], renderedRange[1]);

          // Define the top-most rendered row
          uiGridCtrl.currentTopRow = renderedRange[0];

          setRenderedRows(rowArr);
        };

        $scope.rowStyle = function (index) {
          if (index === 0 && uiGridCtrl.currentTopRow !== 0) {
            // Here we need to add an extra bit on to our offset. We are calculating the offset below based on the number of rows
            //   that will fit into the viewport. If it's not an even amount there will be a remainder and the viewport will not scroll far enough.
            //   We add the remainder on by using the offset-able height's (canvas - viewport) modulus of the row height, and then we multiply
            //   by the percentage of the index of the row we're scrolled to so the modulus is added increasingly the further on we scroll
            var rowPercent = (uiGridCtrl.prevScrollIndex / uiGridCtrl.maxRowIndex);
            var mod = Math.ceil( ((uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight()) % uiGridCtrl.grid.options.rowHeight) * rowPercent);

            // We need to add subtract a row from the offset at the beginning to prevent a "jump/snap" effect where the grid moves down an extra rowHeight of pixels, then
            //   add it back until the offset is fully there are the bottom. Basically we add a percentage of a rowHeight back as we scroll down, from 0% at the top to 100%
            //   at the bottom
            var extraRowOffset = (1 - rowPercent);

            var offset = (uiGridCtrl.grid.options.offsetTop) - (uiGridCtrl.grid.options.rowHeight * (uiGridCtrl.grid.options.excessRows - extraRowOffset)) - mod;

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

  var app = angular.module('ui.grid.header', ['ui.grid']);

  app.directive('uiGridHeader', ['$log', '$templateCache', '$compile', 'gridUtil', function($log, $templateCache, $compile, gridUtil) {
    return {
      restrict: 'EA',
      templateUrl: 'ui-grid/ui-grid-header',
      replace: true,
      // priority: 1000,
      require: '?^uiGrid',
      scope: false,
      link: function ($scope, $elm, $attrs, uiGridCtrl) {
        if (uiGridCtrl === undefined) {
          throw new Error('[ui-grid-header] uiGridCtrl is undefined!');
        }
        $log.debug('ui-grid-header link');

        if (uiGridCtrl) {
          uiGridCtrl.grid.headerHeight = gridUtil.outerElementHeight($elm);
        }
      }
    };
  }]);

})();
(function(){
  'use strict';

  var app = angular.module('ui.grid.row', []);

  app.directive('uiGridRow', ['$log', function($log) {
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
          },
          post: function($scope, $elm, $attrs, uiGridCtrl) {
            if (uiGridCtrl === undefined) {
              throw new Error('[ui-grid-row] uiGridCtrl is undefined!');
            }

            $scope.grid = uiGridCtrl.grid;
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

  app.directive('uiGridScrollbar', ['$log', '$document', 'gridUtil', function($log, $document, gridUtil) {
    return {
      replace: true,
      // priority: 1000,
      templateUrl: 'ui-grid/ui-grid-scrollbar',
      require: '?^uiGrid',
      scope: false,
      link: function($scope, $elm, $attrs, uiGridCtrl) {
        if (uiGridCtrl === undefined) {
          throw new Error('[ui-grid-scrollbar] uiGridCtrl is undefined!');
        }

        $log.debug('ui-grid-scrollbar link');

        // Size the scrollbar according to the amount of data. 35px high minimum, otherwise scale inversely proportinal to canvas vs viewport height
        function updateScrollbar(gridScope) {
          var scrollbarHeight = Math.floor(Math.max(35, uiGridCtrl.grid.getViewportHeight() / uiGridCtrl.grid.getCanvasHeight() * uiGridCtrl.grid.getViewportHeight()));

          $scope.scrollbarStyles = '.grid' + uiGridCtrl.grid.id + ' .ui-grid-scrollbar-vertical { height: ' + scrollbarHeight + 'px; }';
        }

        // Only show the scrollbar when the canvas height is less than the viewport height
        $scope.showScrollbar = function() {
          return uiGridCtrl.grid.getCanvasHeight() > uiGridCtrl.grid.getViewportHeight();
        };

        uiGridCtrl.grid.registerStyleComputation(updateScrollbar);


        var startY = 0,
          y = 0;

        // Get the height of the scrollbar, including its margins
        var elmHeight = gridUtil.elementHeight($elm, 'margin');

        // Get the "bottom bound" which the scrollbar cannot scroll past
        var elmBottomBound = uiGridCtrl.grid.getViewportHeight() - elmHeight;

        function mousedown(event) {
          // Prevent default dragging of selected content
          event.preventDefault();
          elmHeight = gridUtil.elementHeight($elm, 'margin');
          elmBottomBound = uiGridCtrl.grid.getViewportHeight() - elmHeight;
          startY = event.screenY - y;

          $document.on('mousemove', mousemove);
          $document.on('mouseup', mouseup);
        }

        $elm.on('mousedown', mousedown);

        function mousemove(event) {
          y = event.screenY - startY;

          if (y < 0) { y = 0; }
          if (y > elmBottomBound) { y = elmBottomBound; }

          var scrollPercentage = y / elmBottomBound;
          // $log.debug('scrollPercentage', y, uiGridCtrl.grid.optionsviewportHeight, elmHeight, elmBottomBound, scrollPercentage);

          $scope.$emit('uiGridScrollVertical', { scrollPercentage: scrollPercentage, target: $elm });
        }

        var scrollDereg = $scope.$on('uiGridScrollVertical', function(evt, args) {
          if (args.scrollPercentage < 0) { args.scrollPercentage = 0; }
          if (args.scrollPercentage > 1) { args.scrollPercentage = 1; }

          elmHeight = gridUtil.elementHeight($elm, 'margin');
          elmBottomBound = uiGridCtrl.grid.getViewportHeight() - elmHeight;

          // $log.debug('elmHeight', elmHeight);
          // $log.debug('elmBottomBound', elmBottomBound);

          // var newScrollTop = Math.floor(args.scrollPercentage * elmBottomBound);
          var newScrollTop = args.scrollPercentage * elmBottomBound;

          // $log.debug('newScrollTop', newScrollTop);
          // $log.debug('maxScrollTop', elmBottomBound);

          var newTop = newScrollTop; //(uiGridCtrl.grid.optionsoffsetTop || 0) + newScrollTop;

          // Prevent scrollbar from going beyond container
          if (newTop > uiGridCtrl.grid.getCanvasHeight() - elmHeight) {
            $log.debug('newTop too big!', newTop);
            newTop = uiGridCtrl.grid.getCanvasHeight() - elmHeight;
          }

          // $log.debug('newTop', newTop);

          y = newScrollTop;
          $elm.css({
            top: newTop + 'px'
          });
        });

        function mouseup() {
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);
        }

        $elm.on('$destroy', function() {
          scrollDereg();
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);
          $elm.unbind('mousedown');
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
      link: function($scope, $elm, $attrs, uiGridCtrl) {
        $log.debug('ui-grid-style link');
        if (uiGridCtrl === undefined) {
           $log.warn('[ui-grid-style link] uiGridCtrl is undefined!');
        }

        var interpolateFn = $interpolate($elm.text(), true);

        if (interpolateFn) {
          $scope.$watch(interpolateFn, function(value) {
            $elm.text(value);
          });
        }


        //todo: remove this if by injecting gridCtrl into unit tests
        if(uiGridCtrl){
          uiGridCtrl.grid.registerStyleComputation(function() {
            var width = uiGridCtrl.grid.gridWidth;
            var equalWidth = width / uiGridCtrl.grid.options.columnDefs.length;

            var ret = '';
            var left = 0;
            uiGridCtrl.grid.options.columnDefs.forEach(function(c, i) {
              ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + i + ' { width: ' + equalWidth + 'px; left: ' + left + 'px; }';
              left = left + equalWidth;
            });

            $scope.columnStyles = ret;
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

  //class definitions

  /**
   * @description Grid defines a logical grid.  Any non-dom properties and elements needed by the grid should
   *              be defined in this class
   * @param id
   * @constructor
   */
  var Grid = function(id){
    this.id = id;
    this.options = new OptionsInstance();
    this.headerHeight = this.options.headerRowHeight;
    this.gridHeight = 0;
    this.gridWidth = 0;
    this.columnsProcessors = [];
    this.styleComputations = [];
    this.renderedRows = [];
  };

  Grid.prototype.registerColumnsProcessor = function(columnsProcessor){
    this.columnsProcessors.push(columnsProcessor);
  };

  Grid.prototype.registerStyleComputation = function(styleComputation){
    this.styleComputations.push(styleComputation);
  };

  Grid.prototype.setRenderedRows = function(newRows){
    for (var i = 0; i < newRows.length; i++) {
      this.renderedRows.length = newRows.length;

      this.renderedRows[i] = newRows[i];
    }
  };

  Grid.prototype.buildStyles = function($scope) {
    var self = this;
    self.styleComputations.forEach(function(comp) {
        comp.call(self, $scope);
      });
  };

  Grid.prototype.minRowsToRender = function() {
    return Math.ceil(this.getViewportHeight() / this.options.rowHeight);
  };

  // NOTE: viewport drawable height is the height of the grid minus the header row height (including any border)
  // TODO(c0bra): account for footer height
  Grid.prototype.getViewportHeight = function(){
    return this.gridHeight - this.headerHeight;
  };

  Grid.prototype.getCanvasHeight = function(){
    return this.options.rowHeight * this.options.data.length;
  };

  Grid.prototype.getTotalRowHeight = function(){
     return this.options.rowHeight * this.options.data.length;
  };


  //Grid Options defaults
  var OptionsInstance = function(){
    this.data = [];
    this.columnDefs = [];
    this.headerRowHeight = 30;
    this.rowHeight = 30;
    this.maxVisibleRowCount = 200;

    // Turn virtualization on when number of data elements goes over this number
    this.virtualizationThreshold = 50;

    // Extra rows to to render outside of the viewport
    this.excessRows = 4;

    this.scrollThreshold = 4;
  };


var module = angular.module('ui.grid', ['ui.grid.header', 'ui.grid.body', 'ui.grid.row', 'ui.grid.style', 'ui.grid.scrollbar','ui.grid.util']);

  module.controller('uiGridController',['$scope', '$element', '$attrs','$log','gridUtil',
    function ($scope, $elm, $attrs,$log,gridUtil) {
      $log.debug('ui-grid controller');

      var self = this;

      self.grid = new Grid(gridUtil.newId);
      //extend options with ui-grid attribute reference
      angular.extend(self.grid.options, $scope.uiGrid);

      //all properties of grid are available on scope
      $scope.grid = self.grid;

      //use gridOptions.columns or ui-grid-columns attribute json or get the columns from the data
      if (self.grid.options.columnDefs.length === 0) {
        self.grid.options.columnDefs =  $scope.$eval($attrs.uiGridColumns) || gridUtil.getColumnsFromData($scope.uiGrid);
      }

      // Need to refresh the canvas size when the columnDefs change
      $scope.$watch('grid.options.columnDefs', function () {
        self.refreshCanvas();
      });

      function dataWatchFunction(n, o) {
        // $log.debug('watch fired!', n, o);
        if (n) {
          if (self.grid.options.columnDefs.length <= 0) {
            self.grid.options.columnDefs = gridUtil.getColumnsFromData(n);
          }

          self.grid.options.data = n;

          self.grid.buildStyles();

          var scrollTop = self.viewport[0].scrollTop;
          self.adjustScrollVertical(scrollTop, null, true);

          $scope.$evalAsync(function() {
            self.refreshCanvas();
          });
        }
      }

      var dataWatchDereg;
      if (angular.isString($scope.uiGrid.data)) {
        dataWatchDereg = $scope.$parent.$watch($scope.uiGrid.data, dataWatchFunction);
      }
      else {
        dataWatchDereg = $scope.$parent.$watch(function() { return $scope.uiGrid.data; }, dataWatchFunction);
      }


      $scope.$on('$destroy', dataWatchDereg);


      $scope.$watch(function () { return self.grid.styleComputations; }, function() {
        self.grid.buildStyles($scope);
      });



      // Refresh the canvas drawable size
      self.refreshCanvas = function() {
        self.grid.buildStyles($scope);
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
module.directive('uiGrid',
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

              uiGridCtrl.grid.gridWidth = $scope.gridWidth = $elm[0].clientWidth;
              uiGridCtrl.grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);

              uiGridCtrl.refreshCanvas();
            }
          };
        }
      };
    }
  ]);

})();
(function() {

var module = angular.module('ui.grid.util', []);

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
module.service('gridUtil', ['$window', function ($window) {
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
      
      angular.forEach(item,function (prop, propName) {
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
      
    },

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
    }
  };

  ['width', 'height'].forEach(function (name){
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
angular.module('ui.grid').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ui-grid/ui-grid-body',
    "<div class=\"ui-grid-body\"><div class=\"ui-grid-scrollbar-box\"><div ui-grid-viewport=\"\" class=\"ui-grid-viewport\"><div class=\"ui-grid-canvas\"><div ng-repeat=\"row in grid.renderedRows track by $index\" class=\"ui-grid-row\" ng-style=\"rowStyle($index)\"><div ui-grid-row=\"row\" row-index=\"$index\"></div></div></div></div></div><div ui-grid-scrollbar=\"\"></div></div>"
  );


  $templateCache.put('ui-grid/ui-grid-header',
    "<div class=\"ui-grid-top-panel\"><div class=\"ui-grid-header\"><div ng-repeat=\"col in grid.options.columnDefs\" class=\"ui-grid-header-cell col{{ $index }}\"><!-- ng-style=\"{ height: col.headerRowHeight }\" --><div class=\"ui-grid-vertical-bar\">&nbsp;</div><!-- ng-style=\"{height: col.headerRowHeight}\" ng-class=\"{ ngVerticalBarVisible: !$last }\" --><!-- <div ng-header-cell></div> --><div class=\"ui-grid-cell-contents\">{{ col.name || col.field }}</div></div></div><div ui-grid-menu=\"\"></div></div>"
  );


  $templateCache.put('ui-grid/ui-grid-row',
    "<div><div ng-repeat=\"col in grid.options.columnDefs\" class=\"ui-grid-cell col{{ $index }}\"><!-- ng-style=\"{ 'cursor': row.cursor }\" ng-class=\"col.colIndex()\" class=\"{{col.cellClass}}\" --><div class=\"ui-grid-vertical-bar\">&nbsp;</div><!-- ng-style=\"{height: rowHeight}\" ng-class=\"{ ngVerticalBarVisible: !$last }\" --><div class=\"ui-grid-cell-contents\">{{ row[col.field] }}</div><!-- ng-class=\"col.colIndex()\" --></div></div>"
  );


  $templateCache.put('ui-grid/ui-grid-scrollbar',
    "<div class=\"ui-grid-scrollbar ui-grid-scrollbar-vertical\" ng-show=\"showScrollbar()\"></div>"
  );


  $templateCache.put('ui-grid/ui-grid',
    "<div class=\"ui-grid grid{{ grid.id }}\"><!-- TODO (c0bra): add \"scoped\" attr here, eventually? --><style ui-grid-style=\"\">.grid{{ grid.id }} {\n" +
    "      /* Styles for the grid */\n" +
    "    }\n" +
    "\n" +
    "    .grid{{ grid.id }} .ui-grid-viewport {\n" +
    "      height: {{ grid.getViewportHeight() }}px;\n" +
    "    }\n" +
    "\n" +
    "    .grid{{ grid.id }} .ui-grid-canvas {\n" +
    "      height: {{ grid.getCanvasHeight() }}px;\n" +
    "    }\n" +
    "\n" +
    "    .grid{{ grid.id }} .ui-grid-header, .grid{{ grid.id }} .ui-grid-header-cell .ui-grid-vertical-bar {\n" +
    "      height: {{ grid.options.headerRowHeight }}px;\n" +
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
    "    {{ scrollbarStyles }}</style><div ui-grid-header=\"\"></div><div ui-grid-body=\"\"></div><div ui-grid-footer=\"\"></div></div>"
  );

}]);

/*! ui-grid - v2.0.7-c121954 - 2014-01-16
* Copyright (c) 2014 ; Licensed MIT */
(function () {
  'use strict';
  var module = angular.module('ui.grid.cellnav', ['ui.grid', 'ui.grid.util']);

  /**
   *  @ngdoc object
   *  @name ui.grid.cellnav.constant:uiGridEditConstants
   *
   *  @description constants available in edit module
   */
  module.constant('uiGridCellNavConstants', {
 //   EDITABLE_CELL_TEMPLATE: /EDITABLE_CELL_TEMPLATE/g,
    //must be lowercase because template bulder converts to lower

  });

  /**
   *  @ngdoc service
   *  @name ui.grid.cellnav.service:uiGridNavService
   *
   *  @description Services for editing features. If you don't like the key maps we use,
   *  override with a service decorator (see angular docs)
   */
  module.service('uiGridCellNavService', ['$log', 'uiGridConstants',
    function ($log, uiGridConstants) {

      var service = {
        isKeyLeft : function(evt){
             return evt.keyCode === uiGridConstants.keymap.LEFT ||
               (evt.keyCode === uiGridConstants.keymap.TAB && evt.shiftKey);
        }
      };

      return service;
    }]);

  /**
  *  @ngdoc directive
  *  @name ui.grid.cellnav.directive:uiCellNav
  *  @element div
  *  @restrict EA
  *
  *  @description Adds editing features to the ui-grid directive.
  *
  *  @example
  <example module="app">
    <file name="app.js">
    var app = angular.module('app', ['ui.grid', 'ui.grid.cellnav']);

    app.controller('MainCtrl', ['$scope', function ($scope) {
      $scope.data = [
        { name: 'Bob', title: 'CEO' },
            { name: 'Frank', title: 'Lowly Developer' }
      ];

      $scope.columnDefs = [
        {field: 'name',
        {field: 'title'}
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
  module.directive('uiGridCellnav', ['$log', 'uiGridCellNavService', function ($log, uiGridCellNavService) {
    return {
      replace: true,
      priority: 5000,
      require: '^uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
          //  $log.debug('uiGridEdit preLink');

          },
          post: function ($scope, $elm, $attrs, uiGridCtrl) {
          }
        };
      }
    };
  }]);

  /**
   *  @ngdoc directive
   *  @name ui.grid.cellnav.directive:uiGridBody
   *  @element div
   *  @restrict A
   *
   *  @description Stacks on top of ui.grid.uiGridBody to provide cell navigation
   */
  module.directive('uiGridBody', ['$compile', 'uiGridCellNavService', '$log',
    function ($compile, uiGridCellNavService,  $log) {
      return {
        priority: -110, // run after default uiGridCell directive
        restrict: 'A',
        scope: false,
        link: function ($scope, $elm, $attrs) {
         // $log.debug('cellnav uiGridBody post-link');

          var x = $elm;

          $elm.on('keydown', function(evt) {
            if (uiGridCellNavService.isKeyLeft(evt)){
              evt.stopPropagation();
            }

            return true;
          });
        }
      };
    }]);


  /**
   *  @ngdoc directive
   *  @name ui.grid.cellnav.directive:uiGridCell
   *  @element div
   *  @restrict A
   *
   *  @description Stacks on top of ui.grid.uiGridCell to provide cell navigation
   */
  module.directive('uiGridCell', ['$compile', 'uiGridConstants', '$log',
    function ($compile, uiGridConstants,  $log) {
      return {
        priority: -110, // run after default uiGridCell directive
        restrict: 'A',
        scope: false,
        link: function ($scope, $elm, $attrs) {
              $elm.find('div').attr("tabindex",0);
            }
      };

    }]);

})();
(function(){
  'use strict';

  var app = angular.module('ui.grid.body', []);

  app.directive('uiGridBody', ['$log', '$document', '$timeout', 'gridUtil', function($log, $document, $timeout, GridUtil) {
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

        // Explicitly set the viewport scrollTop to 0; Firefox apparently caches it
        uiGridCtrl.viewport[0].scrollTop = 0;

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
          var maxRowIndex = uiGridCtrl.grid.rows.length - minRows;
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
          if (uiGridCtrl.grid.rows.length > uiGridCtrl.grid.options.virtualizationThreshold) {
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
            var rangeEnd = Math.min(uiGridCtrl.grid.rows.length, rowIndex + minRows + uiGridCtrl.grid.options.excessRows);

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
            var maxLen = uiGridCtrl.grid.rows.length;
            newRange = [0, Math.max(maxLen, minRows + uiGridCtrl.grid.options.excessRows)];
          }

          uiGridCtrl.prevScrollTop = scrollTop;
          updateViewableRange(newRange);
          uiGridCtrl.prevScrollIndex = rowIndex;
        };

        // Listen for scroll events
        var scrollUnbinder = $scope.$on('uiGridScrollVertical', function(evt, args) {
          // $log.debug('scroll', args.scrollPercentage, uiGridCtrl.grid.getCanvasHeight(), args.scrollPercentage * uiGridCtrl.grid.getCanvasHeight());
          var scrollLength = (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

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

          uiGridCtrl.fireScrollEvent();

          // scope.$evalAsync(function() {

          // });
        });

        // Scroll the viewport when the mousewheel is used
        $elm.bind('wheel mousewheel DomMouseScroll MozMousePixelScroll', function(evt) {
          // use wheelDeltaY
          evt.preventDefault();
          
          // $log.debug('evt.wheelDeltaY', evt.wheelDeltaY);

          var newEvent = GridUtil.normalizeWheelEvent(evt);

          var scrollAmount = newEvent.deltaY * -120;

          // Get the scroll percentage
          // var scrollPercentage = (uiGridCtrl.viewport[0].scrollTop + scrollAmount) / (uiGridCtrl.viewport[0].scrollHeight - uiGridCtrl.grid.options.viewportHeight);
          // $log.debug(uiGridCtrl.viewport[0].scrollTop, scrollAmount, uiGridCtrl.grid.getCanvasHeight(), uiGridCtrl.grid.getViewportHeight());
          var scrollPercentage = (uiGridCtrl.viewport[0].scrollTop + scrollAmount) / (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

          // Keep scrollPercentage within the range 0-1.
          if (scrollPercentage < 0) { scrollPercentage = 0; }
          if (scrollPercentage > 1) { scrollPercentage = 1; }

          // $log.debug('scrollPercentage', scrollPercentage);

          // $log.debug('new scrolltop', uiGridCtrl.canvas[0].scrollTop + scrollAmount);
          // uiGridCtrl.canvas[0].scrollTop = uiGridCtrl.canvas[0].scrollTop + scrollAmount;
          // $log.debug('new scrolltop', uiGridCtrl.canvas[0].scrollTop);

          $scope.$broadcast('uiGridScrollVertical', { scrollPercentage: scrollPercentage, target: $elm });
        });

        
        var startY = 0,
            startX = 0,
            scrollTopStart = 0,
            direction = 1,
            moveStart;
        function touchmove(event) {
          event.preventDefault();

          // $log.debug('touchmove', event);

          var deltaX, deltaY, newX, newY;
          newX = event.targetTouches[0].pageX;
          newY = event.targetTouches[0].screenY;
          deltaX = -(newX - startX);
          deltaY = -(newY - startY);

          direction = (deltaY < 1) ? -1 : 1;

          deltaY *= 2;

          var scrollPercentage = (scrollTopStart + deltaY) / (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

          $scope.$broadcast('uiGridScrollVertical', { scrollPercentage: scrollPercentage, target: event.target });
        }

        function touchend(event) {
          // $log.debug('touchend!');
          event.preventDefault();
          $document.unbind('touchmove', touchmove);
          $document.unbind('touchend', touchend);
          $document.unbind('touchcancel', touchend);

          // Get the distance we moved on the Y axis
          var scrollTopEnd = uiGridCtrl.viewport[0].scrollTop;
          var deltaY = Math.abs(scrollTopEnd - scrollTopStart);

          // Get the duration it took to move this far
          var moveDuration = (new Date()) - moveStart;

          // Scale the amount moved by the time it took to move it (i.e. quicker, longer moves == more scrolling after the move is over)
          var moveScale = deltaY / moveDuration;

          var decelerateInterval = 125; // 1/8th second
          var decelerateCount = 4; // == 1/2 second
          var scrollLength = 60 * direction * moveScale;
          
          function decelerate() {
            $timeout(function() {
              var scrollPercentage = (uiGridCtrl.viewport[0].scrollTop + scrollLength) / (uiGridCtrl.grid.getCanvasHeight() - uiGridCtrl.grid.getViewportHeight());

              $scope.$broadcast('uiGridScrollVertical', { scrollPercentage: scrollPercentage, target: event.target });

              decelerateCount = decelerateCount -1;
              scrollLength = scrollLength / 2;

              if (decelerateCount > 0) {
                decelerate();
              }
            }, decelerateInterval);
          }
          decelerate();
        }

        if (GridUtil.isTouchEnabled()) {
          $elm.bind('touchstart', function (event) {
            event.preventDefault();
            // $log.debug('touchstart', event);

            moveStart = new Date();
            startY = event.targetTouches[0].screenY;
            scrollTopStart = uiGridCtrl.viewport[0].scrollTop;
            
            $document.on('touchmove', touchmove);
            $document.on('touchend touchcancel', touchend);
          });
        }

        // TODO(c0bra): Scroll the viewport when the up and down arrow keys are used
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
          $scope.$evalAsync(function() {
            uiGridCtrl.grid.setRenderedRows(newRows);
          });
        };

        // Method for updating the visible rows
        var updateViewableRange = function(renderedRange) {
          // Slice out the range of rows from the data
          var rowArr = uiGridCtrl.grid.rows.slice(renderedRange[0], renderedRange[1]);

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
          pre: function ($scope, $elm, $attrs) {
            var headerTemplate = ($scope.grid.options.headerTemplate) ? $scope.grid.options.headerTemplate : defaultTemplate;

             gridUtil.getTemplate(headerTemplate)
              .then(function (contents) {
                var template = angular.element(contents);
                
                var newElm = $compile(template)($scope);
                $elm.append(newElm);
              });
          },

          post: function ($scope, $elm, $attrs, uiGridCtrl) {
            if (uiGridCtrl === undefined) {
              throw new Error('[ui-grid-header] uiGridCtrl is undefined!');
            }

            $log.debug('ui-grid-header link');

            if (uiGridCtrl) {
              uiGridCtrl.header = $elm;
            }

            //todo: remove this if by injecting gridCtrl into unit tests
            if (uiGridCtrl) {
              uiGridCtrl.grid.registerStyleComputation(function() {
                var width = uiGridCtrl.grid.gridWidth;
                var equalWidth = width / uiGridCtrl.grid.options.columnDefs.length;

                var ret = '';
                var left = 0;
                uiGridCtrl.grid.options.columnDefs.forEach(function(c, i) {
                  // ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + i + ' { width: ' + equalWidth + 'px; left: ' + left + 'px; }';
                  ret = ret + ' .grid' + uiGridCtrl.grid.id + ' .col' + i + ' { width: ' + equalWidth + 'px; }';
                  left = left + equalWidth;
                });

                $scope.columnStyles = ret;
              });
            }
          }
        };
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

          //TODO: When this is part of ui.grid module, the event name should be a constant
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

        $elm.on('$destroy', function() {
          scrollDereg();
          $document.unbind('mousemove', mousemove);
          $document.unbind('mouseup', mouseup);
          $elm.unbind('mousedown');
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
      // require: '?^uiGrid',
      link: function($scope, $elm, $attrs, uiGridCtrl) {
        $log.debug('ui-grid-style link', $elm);
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
(function () {
  'use strict';
  var module = angular.module('ui.grid', ['ui.grid.header', 'ui.grid.body', 'ui.grid.row', 'ui.grid.style', 'ui.grid.scrollbar', 'ui.grid.util']);

  module.constant('uiGridConstants', {
    CUSTOM_FILTERS: /CUSTOM_FILTERS/g,
    COL_FIELD: /COL_FIELD/g,
    DISPLAY_CELL_TEMPLATE: /DISPLAY_CELL_TEMPLATE/g,
    TEMPLATE_REGEXP: /<.+>/,
    events: {
      GRID_SCROLL: 'uiGridScroll'
    },
    // copied from http://www.lsauer.com/2011/08/javascript-keymap-keycodes-in-json.html
    keymap: {
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

  /**
   *  @ngdoc object
   *  @name ui.grid.service:gridClassFactory
   *
   *  @description factory to return dom specific instances of a grid
   *
   */
  module.service('gridClassFactory', ['gridUtil', '$q', '$templateCache', 'uiGridConstants', '$log',
        function (gridUtil, $q, $templateCache, uiGridConstants, $log) {

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


      //representation of the rows on the grid.
      //these are wrapped references to the actual data rows (options.data)
      this.rows = [];

      //represents the columns on the grid
      this.columns = [];

      //current rows that are rendered on the DOM
      this.renderedRows = [];
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
    * rowBuilders
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
     * @parameter {GridRow} gridRow reference to gridRow
     * @returns {GridRow} the gridRow with all additional behaivor added
     */
    Grid.prototype.processRowBuilders = function(gridRow) {
      var self = this;

      self.rowBuilders.forEach(function (builder) {
        builder.call(self,gridRow);
      });

      return gridRow;
    };

    /**
     * @ngdoc function
     * @name registerStyleComputation
     * @methodOf ui.grid.class:Grid
     * @description registered a styleComputation function
     * @parameter {function($scope)} styleComputation function
     */
    Grid.prototype.registerStyleComputation = function (styleComputation) {
      this.styleComputations.push(styleComputation);
    };

    Grid.prototype.setRenderedRows = function (newRows) {
      for (var i = 0; i < newRows.length; i++) {
        this.renderedRows.length = newRows.length;

        this.renderedRows[i] = newRows[i];
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
      self.styleComputations.forEach(function (comp) {
        comp.call(self, $scope);
      });
    };

    Grid.prototype.minRowsToRender = function () {
      return Math.ceil(this.getViewportHeight() / this.options.rowHeight);
    };

    // NOTE: viewport drawable height is the height of the grid minus the header row height (including any border)
    // TODO(c0bra): account for footer height
    Grid.prototype.getViewportHeight = function () {
      var viewPortHeight = this.gridHeight - this.headerHeight;
      return viewPortHeight;
    };

    Grid.prototype.getCanvasHeight = function () {
      return this.options.rowHeight * this.rows.length;
    };

    Grid.prototype.getTotalRowHeight = function () {
      return this.options.rowHeight * this.rows.length;
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

      // Turn virtualization on when number of data elements goes over this number
      this.virtualizationThreshold = 50;

      // Extra rows to to render outside of the viewport
      this.excessRows = 4;

      this.scrollThreshold = 4;

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
      self.colDef = colDef;
      if (colDef.name === undefined) {
        throw new Error('colDef.name is required');
      }

      //position of column
      self.index = index;

      self.width = colDef.width;
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
    }

    return service;
  }]);

  module.controller('uiGridController', ['$scope', '$element', '$attrs', '$log', 'gridUtil', '$q', 'uiGridConstants', '$templateCache', 'gridClassFactory',
    function ($scope, $elm, $attrs, $log, gridUtil, $q, uiGridConstants, $templateCache, gridClassFactory) {
      $log.debug('ui-grid controller');

      var self = this;

      self.grid = gridClassFactory.createGrid();

      // Extend options with ui-grid attribute reference
      angular.extend(self.grid.options, $scope.uiGrid);

      //all properties of grid are available on scope
      $scope.grid = self.grid;

      if ($attrs.uiGridColumns) {
        $attrs.$observe('uiGridColumns', function(value) {
          self.grid.options.columnDefs =  value;
          self.grid.buildColumns()
            .then(function(){
              self.refreshCanvas();
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
            //wrap data in a gridRow
            $log.debug('Modifying rows');
            self.grid.modifyRows(n);

            //todo: move this to the ui-body-directive and define how we handle ordered event registration
            if (self.viewport) {
              var scrollTop = self.viewport[0].scrollTop;
              self.adjustScrollVertical(scrollTop, 0, true);
            }

            $scope.$evalAsync(function() {
              self.refreshCanvas();
            });
          });
        }
      }


      $scope.$on('$destroy', dataWatchCollectionDereg);


      $scope.$watch(function () { return self.grid.styleComputations; }, function() {
        self.refreshCanvas();
      });

      // Refresh the canvas drawable size
      $scope.grid.refreshCanvas = self.refreshCanvas = function() {
        self.grid.buildStyles($scope);

        if (self.header) {
          self.grid.headerHeight = gridUtil.outerElementHeight(self.header);
        }
      };

      //todo: throttle this event?
      self.fireScrollEvent = function() {
        $scope.$broadcast(uiGridConstants.events.GRID_SCROLL, 'vertical');
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

              uiGridCtrl.grid.element = $elm;

              uiGridCtrl.grid.gridWidth = $scope.gridWidth = gridUtil.elementWidth($elm);
              uiGridCtrl.grid.gridHeight = $scope.gridHeight = gridUtil.elementHeight($elm);

              uiGridCtrl.refreshCanvas();
            }
          };
        }
      };
    }
  ]);


  module.directive('uiGridCell', ['$compile', 'uiGridConstants', '$log', function ($compile, uiGridConstants, $log) {
    var ngCell = {
      priority: 0,
      scope: false,
      compile: function() {
        return {
          pre: function($scope, $elm) {
            // $log.debug('uiGridCell pre-link');
            var html = $scope.col.cellTemplate
              .replace(uiGridConstants.COL_FIELD, $scope.row.getQualifiedColField($scope.col));
            var cellElement = $compile(html)($scope);
            $elm.append(cellElement);
          },
          post: function($scope, $elm) {
            // $log.debug('uiGridCell post-link');
          }
        };
      }
    };

    return ngCell;
  }]);

})();
(function() {

var module = angular.module('ui.grid.util', []);

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
 *  @name ui.grid.util.service:GridUtil
 *  
 *  @description Grid utility functions
 */
module.service('gridUtil', ['$window', '$document', '$http', '$templateCache', function ($window, $document, $http, $templateCache) {
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
          name: propName
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
     * @name getTemplate
     * @methodOf ui.grid.util.service:GridUtil
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
    * @methodOf ui.grid.util.service:GridUtil
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

})();
(function () {
  'use strict';
  var module = angular.module('ui.grid.edit', ['ui.grid', 'ui.grid.util']);

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
  module.service('uiGridEditService', ['$log', '$q', '$templateCache',
    function ($log, $q, $templateCache) {

      var service = {
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
            col.editableCellTemplate = colDef.editableCellTemplate || $templateCache.get('ui-grid/edit/editableCell');
            col.editableCellDirective = colDef.editableCellDirective || 'ui-grid-text-editor';
          }

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
      priority: 5000,
      require: '^uiGrid',
      scope: false,
      compile: function () {
        return {
          pre: function ($scope, $elm, $attrs, uiGridCtrl) {
            $log.debug('uiGridEdit preLink');
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
  module.directive('uiGridCell', ['$compile', 'uiGridConstants', 'uiGridEditConstants', '$log','$parse',
    function ($compile, uiGridConstants, uiGridEditConstants, $log, $parse) {
      return {
        priority: -100, // run after default uiGridCell directive
        restrict: 'A',
        scope: false,
        link: function ($scope, $elm, $attrs) {
          if (!$scope.col.colDef.enableCellEdit) {
            return;
          }

          var origHtml;
          var html;
          var origCellValue;
          var inEdit = false;
          var cellModel;

          registerBeginEditEvents();

          function registerBeginEditEvents(){
            $elm.on('dblclick', function () {
              beginEdit();
            });
            $elm.on('keydown', function (evt) {
              switch (evt.keyCode) {
                case uiGridConstants.keymap.F2:
                  evt.stopPropagation();
                  beginEdit();
                  break;
              }
            });
          }

          function cancelBeginEditEvents(){
            $elm.off('dblclick', 'keydown');
          }

          function beginEdit() {
            cellModel = $parse($scope.row.getQualifiedColField($scope.col));
            //get original value from the cell
            origCellValue = cellModel($scope);


            origHtml = $scope.col.cellTemplate;
            origHtml = origHtml.replace(uiGridConstants.COL_FIELD, $scope.row.getQualifiedColField($scope.col));

            html = $scope.col.editableCellTemplate;
            html = html.replace(uiGridEditConstants.EDITABLE_CELL_DIRECTIVE, $scope.col.editableCellDirective);

            var cellElement;
            $scope.$apply(function () {
                inEdit = true;
                cancelBeginEditEvents();

                cellElement = $compile(html)($scope);
                $elm.find('div').replaceWith(cellElement);
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
            //replace element with original
            var cellElement = $compile(origHtml)($scope);
            $elm.find('div').replaceWith(cellElement);
            $scope.$apply();
            inEdit = false;
            registerBeginEditEvents();
          }

          function cancelEdit() {
            if (!inEdit) {
              return;
            }

            cellModel.assign($scope,origCellValue);

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
          compile: function () {
            return {
              pre: function ($scope, $elm, $attrs) {

              },
              post: function ($scope, $elm, $attrs) {
                var html = $templateCache.get('ui-grid/edit/cellTextEditor');
                html = html.replace(uiGridConstants.COL_FIELD, $scope.row.getQualifiedColField($scope.col));
                var cellElement = $compile(html)($scope);
                $elm.append(cellElement);

                var input = $elm.find('input')[0];

                //set focus at start of edit
                $scope.$on(uiGridEditConstants.events.BEGIN_CELL_EDIT, function () {
                  input.focus();
                });

                $scope.stopEdit = function () {
                  $scope.$emit(uiGridEditConstants.events.END_CELL_EDIT);
                };

                $elm.on('keydown', function(evt) {
                  switch (evt.keyCode) {
                    case uiGridConstants.keymap.ESC:
                      evt.stopPropagation();
                      $scope.$emit(uiGridEditConstants.events.CANCEL_CELL_EDIT);
                      break;
                    case uiGridConstants.keymap.ENTER: // Enter (Leave Field)
                      evt.stopPropagation();
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
angular.module('ui.grid').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ui-grid/edit/cellTextEditor',
    "<input ng-class=\"'colt' + col.index\" ng-input=\"COL_FIELD\" ng-model=\"COL_FIELD\" ng-blur=\"stopEdit()\">"
  );


  $templateCache.put('ui-grid/edit/editableCell',
    "<div editable_cell_directive=\"\"></div>"
  );


  $templateCache.put('ui-grid/ui-grid-body',
    "<div class=\"ui-grid-body\"><div class=\"ui-grid-scrollbar-box\"><div ui-grid-viewport=\"\" class=\"ui-grid-viewport\"><div class=\"ui-grid-canvas\"><div ng-repeat=\"row in grid.renderedRows track by $index\" class=\"ui-grid-row\" ng-style=\"rowStyle($index)\"><div ui-grid-row=\"row\" row-index=\"$index\"></div></div></div></div></div><div ui-grid-scrollbar=\"\"></div></div>"
  );


  $templateCache.put('ui-grid/ui-grid-header',
    "<div class=\"ui-grid-top-panel\"><div class=\"ui-grid-header\"><div ng-repeat=\"col in grid.columns\" class=\"ui-grid-header-cell col{{ $index }}\"><div class=\"ui-grid-vertical-bar\">&nbsp;</div><div class=\"ui-grid-cell-contents\">{{ col.displayName }}</div></div></div><div ui-grid-menu=\"\"></div></div>"
  );


  $templateCache.put('ui-grid/ui-grid-row',
    "<div><div ng-repeat=\"col in grid.columns\" class=\"ui-grid-cell col{{ $index }}\"><!-- ng-style=\"{ 'cursor': row.cursor }\" ng-class=\"col.colIndex()\" class=\"{{col.cellClass}}\" --><div class=\"ui-grid-vertical-bar\">&nbsp;</div><!-- ng-style=\"{height: rowHeight}\" ng-class=\"{ ngVerticalBarVisible: !$last }\" --><div ui-grid-cell=\"\"></div></div>"
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


  $templateCache.put('ui-grid/uiGridCell',
    "<div class=\"ui-grid-cell-contents\">{{COL_FIELD CUSTOM_FILTERS}}</div>"
  );


  $templateCache.put('ui-grid/uiGridHeaderCell',
    "<div class=\"ngHeaderSortColumn {{col.headerClass}}\" ng-style=\"{'cursor': col.cursor}\" ng-class=\"{ 'ngSorted': !noSortVisible }\"><div ng-click=\"col.sort($event)\" ng-class=\"'colt' + col.index\" class=\"ngHeaderText\">{{col.displayName}}</div><div class=\"ngSortButtonDown\" ng-show=\"col.showSortButtonDown()\"></div><div class=\"ngSortButtonUp\" ng-show=\"col.showSortButtonUp()\"></div><div class=\"ngSortPriority\">{{col.sortPriority}}</div><div ng-class=\"{ ngPinnedIcon: col.pinned, ngUnPinnedIcon: !col.pinned }\" ng-click=\"togglePin(col)\" ng-show=\"col.pinnable\"></div></div><div ng-show=\"col.resizable\" class=\"ngHeaderGrip\" ng-click=\"col.gripClick($event)\" ng-mousedown=\"col.gripOnMouseDown($event)\"></div>"
  );

}]);

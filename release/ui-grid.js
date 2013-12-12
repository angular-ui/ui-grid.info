/*! ui-grid - v3.0.0 - 2013-12-12
* Copyright (c) 2013 ; Licensed MIT */
(function(){
'use strict';

var app = angular.module('ui.grid.body', []);

app.directive('uiGridBody', ['$log', 'GridUtil', function($log, GridUtil) {
  return {
    replace: true,
    priority: 1000,
    templateUrl: 'ui-grid/ui-grid-body',
    require: '?^uiGrid',
    scope: {
      tableClass: '=uiGridTableClass'
    },
    link: function(scope, elm, attrs, uiGridCtrl) {
      $log.debug('body postlink scope', scope.$id);

      if (uiGridCtrl === undefined) {
        $log.warn('[ui-grid-body] uiGridCtrl is undefined!');
      }

      if (uiGridCtrl && typeof(uiGridCtrl.columns) !== 'undefined' && uiGridCtrl.columns) {
        scope.columns = uiGridCtrl.columns;
      }
      if (uiGridCtrl && typeof(uiGridCtrl.gridData) !== 'undefined' && uiGridCtrl.gridData) {
        scope.gridData = uiGridCtrl.gridData;
      }
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
    // templateUrl: 'ui-grid/ui-grid-header',
    // replace: true,
    priority: 1000,
    require: '?^uiGrid',
    scope: {
      tableClass: '=uiGridTableClass'
    },
    compile: function (elm, attrs) {
      $log.debug('header compile');

      // If the contents of the grid element are empty, use the default grid template
      var tmpl;
      if (elm.html() === '' || /^\s*$/.test(elm.html())) {
        tmpl = $templateCache.get('ui-grid/ui-grid-header');
      }

      var preLink = function (scope, elm, attrs) {
        $log.debug('header prelink scope', scope.$id);

        if (tmpl) {
          elm.append(tmpl);
        }
        $compile(elm.contents())(scope);
      };

      var postLink = function(scope, elm, attrs, uiGridCtrl) {
        $log.debug('header postlink scope', scope.$id);

        if (uiGridCtrl === undefined) {
          $log.warn('[ui-grid-header] uiGridCtrl is undefined!');
        }

        // Get the column defs from the parent grid controller
        if (uiGridCtrl && typeof(uiGridCtrl.columns) !== 'undefined' && uiGridCtrl.columns) {
          scope.columns = uiGridCtrl.columns;
        }

        // if (tmpl) {
        //   elm.append(tmpl);
        //   $compile(elm.contents())(scope);
        // }

        // scope.$watch('columns', function(n, o) {
        //    $log.debug('columns change', n, o);
        //    var contents = elm.contents();
        //    $compile(contents)(scope);
        // });
      };

      return {
        pre: preLink,
        post: postLink
      };
    }
  };
}]);

})();
(function(){
'use strict';

var app = angular.module('ui.grid', ['ui.grid.header', 'ui.grid.body', 'ui.virtual-repeat']);

/**
 *  @ngdoc directive
 *  @name ui.grid.directive:uiGrid
 *  @element div
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
          <div ui-grid="data"></div>
        </div>
      </file>
    </example>
 */
app.directive('uiGrid', ['$compile', '$templateCache', '$log', 'GridUtil', function($compile, $templateCache, $log, GridUtil) {
  function postLink(scope, elm, attrs, controller) {
    $log.debug('grid postlink scope', scope.$id);
  }

  return {
    restrict: 'EA',
    // templateUrl: 'ui-grid/ui-grid',
    // transclude: true,
    priority: 1000,
    scope: {
      uiGrid: '=',
      tableClass: '@uiGridTableClass',
      options: '@uiGridOptions'
    },
    compile: function (elm, attrs) {
      // If the contents of the grid element are empty, use the default grid template
      var tmpl;
      if (elm.html() === '' || /^\s*$/.test(elm.html())) {
        tmpl = $templateCache.get('ui-grid/ui-grid');
      }

      var preLink = function (scope, elm, attrs) {
        scope.blah = 'test1';

        $log.debug('grid prelink scope', scope.$id);

        if (tmpl) {
          elm.append(tmpl);
          $compile(elm.contents())(scope);
        }
      };

      return {
        pre: preLink,
        post: postLink
      };
    },
    controller: ['$scope','$element','$attrs', function($scope, $element, $attrs) {
      $log.debug('controller scope', $scope.$id);
      $log.debug('controller running');

      this.gridData = $scope.uiGrid;

      $scope.gridOptions = {};
      
      //use parent scope options if specified
      if ($scope.options) {
        if (!$scope.$parent[$scope.options]) {
          throw new Error($scope.options + ' was not defined in parent scope');
        }
        $scope.gridOptions = $scope.$parent[$scope.options];
      }

      //use gridOptions.columns or ui-grid-columns attribute json or get the columns from the data
      this.columns = $scope.gridOptions.columnDefs || $scope.$eval($attrs.uiGridColumns) || GridUtil.getColumnsFromData($scope.uiGrid);

      $scope.gridOptions.columnDefs = $scope.gridOptions.columnDefs || this.columns;
    }]
  };
}]);

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

app.service('GridUtil', function () {

  var s = {
    // Given a column name, return a readable version of it
    readableColumnName: function (columnName) {
      // Convert underscores to spaces
      return columnName.replace(/_/g, ' ')
        // Replace a completely all-capsed word with a first-letter-capitalized version
        .replace(/^[A-Z]+$/, function (match) {
          return angular.lowercase(angular.uppercase(match.charAt(0)) + match.slice(1));
        })
        // Capitalize the first letter of words
        .replace(/(\w+)/g, function (match) {
          return angular.uppercase(match.charAt(0)) + match.slice(1);
        })
        // Put a space in between words that have partial capilizations (i.e. 'firstName' becomes 'First Name')
        .replace(/([A-Z]|[A-Z]\w+)([A-Z])/g, "$1 $2");
    },

    // Return a list of column names, given a data set
    getColumnsFromData: function (data) {
      var columnDefs = [];

      var item = data[0];
      
      angular.forEach(item, function (prop, propName) {
        columnDefs.push({
          field: propName,
          name: s.readableColumnName(propName)
        });
      });

      return columnDefs;
    }
  };

  return s;
});

})();
angular.module('ui.grid').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('ui-grid/ui-grid-body',
    "<div class=\"ui-grid-viewport\"><div><table ng-class=\"tableClass\"><tbody><tr ui-virtual-repeat=\"d in gridData\"><td ng-repeat=\"c in columns\">{{ d[c.field] }}</td></tr></tbody></table></div></div>"
  );


  $templateCache.put('ui-grid/ui-grid-header',
    "<div><table class=\"ui-grid-header ui-grid-header-table\" ng-class=\"tableClass\"><thead><tr><th ng-repeat=\"col in columns\">{{ col.name }}</th></tr></thead></table></div>"
  );


  $templateCache.put('ui-grid/ui-grid',
    "<div class=\"ui-grid ui-grid-viewport\"><div ui-grid-header=\"\" ui-grid-table-class=\"tableClass\"></div><div ui-grid-body=\"\" ui-grid-table-class=\"tableClass\"></div></div>"
  );

}]);

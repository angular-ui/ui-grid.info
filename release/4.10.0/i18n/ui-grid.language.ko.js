/*!
 * ui-grid - v4.10.0 - 2021-02-01
 * Copyright (c) 2021 ; License: MIT 
 */

(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('ko', {
        aggregate: {
          label: '아이템'
        },
        groupPanel: {
          description: '컬럼으로 그룹핑하기 위해서는 컬럼 헤더를 끌어 떨어뜨려 주세요.'
        },
        search: {
          placeholder: '검색...',
          showingItems: '항목 보여주기:',
          selectedItems: '선택 항목:',
          totalItems: '전체 항목:',
          size: '페이지 크기:',
          first: '첫번째 페이지',
          next: '다음 페이지',
          previous: '이전 페이지',
          last: '마지막 페이지'
        },
        menu: {
          text: '컬럼을 선택하세요:'
        },
        sort: {
          ascending: '오름차순 정렬',
          descending: '내림차순 정렬',
          remove: '소팅 제거'
        },
        column: {
          hide: '컬럼 제거'
        },
        aggregation: {
          count: '전체 갯수: ',
          sum: '전체: ',
          avg: '평균: ',
          min: '최소: ',
          max: '최대: '
        },
        pinning: {
         pinLeft: '왼쪽 핀',
          pinRight: '오른쪽 핀',
          unpin: '핀 제거'
        },
        gridMenu: {
          columns: '컬럼:',
          importerTitle: '파일 가져오기',
          exporterAllAsCsv: 'csv로 모든 데이터 내보내기',
          exporterVisibleAsCsv: 'csv로 보이는 데이터 내보내기',
          exporterSelectedAsCsv: 'csv로 선택된 데이터 내보내기',
          exporterAllAsPdf: 'pdf로 모든 데이터 내보내기',
          exporterVisibleAsPdf: 'pdf로 보이는 데이터 내보내기',
          exporterSelectedAsPdf: 'pdf로 선택 데이터 내보내기',
          clearAllFilters: '모든 필터를 청소'
        },
        importer: {
          noHeaders: '컬럼명이 지정되어 있지 않습니다. 파일에 헤더가 명시되어 있는지 확인해 주세요.',
          noObjects: '데이터가 지정되어 있지 않습니다. 데이터가 파일에 있는지 확인해 주세요.',
          invalidCsv: '파일을 처리할 수 없습니다. 올바른 csv인지 확인해 주세요.',
          invalidJson: '파일을 처리할 수 없습니다. 올바른 json인지 확인해 주세요.',
          jsonNotArray: 'json 파일은 배열을 포함해야 합니다.'
        },
        pagination: {
          sizes: '페이지당 항목',
          totalItems: '전체 항목'
        }
      });
      return $delegate;
    }]);
  }]);
})();

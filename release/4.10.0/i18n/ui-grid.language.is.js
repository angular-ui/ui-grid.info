/*!
 * ui-grid - v4.10.0 - 2021-02-01
 * Copyright (c) 2021 ; License: MIT 
 */

(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      $delegate.add('is', {
        headerCell: {
          aria: {
            defaultFilterLabel: 'Sía fyrir dálk',
            removeFilter: 'Fjarlægja síu',
            columnMenuButtonLabel: 'Dálkavalmynd'
          },
          priority: 'Forgangsröðun:',
          filterLabel: "Sía fyrir dálka: "
        },
        aggregate: {
          label: 'hlutir'
        },
        groupPanel: {
          description: 'Dragðu dálkhaus hingað til að flokka saman eftir þeim dálki.'
        },
        search: {
          placeholder: 'Leita...',
          showingItems: 'Sýni hluti:',
          selectedItems: 'Valdir hlutir:',
          totalItems: 'Hlutir alls:',
          size: 'Stærð síðu:',
          first: 'Fyrsta síða',
          next: 'Næsta síða',
          previous: 'Fyrri síða',
          last: 'Síðasta síða'
        },
        menu: {
          text: 'Veldu dálka:'
        },
        sort: {
          ascending: 'Raða hækkandi',
          descending: 'Raða lækkandi',
          none: 'Engin röðun',
          remove: 'Fjarlægja röðun'
        },
        column: {
          hide: 'Fela dálk'
        },
        aggregation: {
          count: 'fjöldi raða: ',
          sum: 'summa: ',
          avg: 'meðaltal: ',
          min: 'lágmark: ',
          max: 'hámark: '
        },
        pinning: {
          pinLeft: 'Festa til vinstri',
          pinRight: 'Festa til hægri',
          unpin: 'Losa'
        },
        columnMenu: {
          close: 'Loka'
        },
        gridMenu: {
          aria: {
            buttonLabel: 'Töflu valmynd'
          },
          columns: 'Dálkar:',
          importerTitle: 'Flytja inn skjal',
          exporterAllAsCsv: 'Flytja út gögn sem csv',
          exporterVisibleAsCsv: 'Flytja út sýnileg gögn sem csv',
          exporterSelectedAsCsv: 'Flytja út valin gögn sem csv',
          exporterAllAsPdf: 'Flytja út öll gögn sem pdf',
          exporterVisibleAsPdf: 'Flytja út sýnileg gögn sem pdf',
          exporterSelectedAsPdf: 'Flytja út valin gögn sem pdf',
          clearAllFilters: 'Hreinsa allar síur'
        },
        importer: {
          noHeaders: 'Ekki hægt að vinna dálkanöfn úr skjalinu, er skjalið örugglega með haus?',
          noObjects: 'Ekki hægt að vinna hluti úr skjalinu, voru örugglega gögn í skjalinu önnur en hausinn?',
          invalidCsv: 'Tókst ekki að vinna skjal, er það örggulega gilt CSV?',
          invalidJson: 'Tókst ekki að vinna skjal, er það örugglega gilt Json?',
          jsonNotArray: 'Innflutt json skjal verður að innihalda fylki, hætti við.'
        },
        pagination: {
          aria: {
            pageToFirst: 'Fletta að fyrstu',
            pageBack: 'Fletta til baka',
            pageSelected: 'Valin síða',
            pageForward: 'Fletta áfram',
            pageToLast: 'Fletta að síðustu'
          },
          sizes: 'hlutir á síðu',
          totalItems: 'hlutir',
          through: 'gegnum',
          of: 'af'
        },
        grouping: {
          group: 'Flokka',
          ungroup: 'Sundurliða',
          aggregate_count: 'Fjöldi: ',
          aggregate_sum: 'Summa: ',
          aggregate_max: 'Hámark: ',
          aggregate_min: 'Lágmark: ',
          aggregate_avg: 'Meðaltal: ',
          aggregate_remove: 'Fjarlægja: '
        },
        validate: {
          error: 'Villa:',
          minLength: 'Gildi ætti að vera a.m.k. THRESHOLD stafa langt.',
          maxLength: 'Gildi ætti að vera í mesta lagi THRESHOLD stafa langt.',
          required: 'Þarf að hafa gildi.'
        }
      });
      return $delegate;
    }]);
  }]);
})();

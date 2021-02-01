/*!
 * ui-grid - v4.10.0 - 2021-02-01
 * Copyright (c) 2021 ; License: MIT 
 */

(function () {
  angular.module('ui.grid').config(['$provide', function($provide) {
    $provide.decorator('i18nService', ['$delegate', function($delegate) {
      var lang = {
              aggregate: {
                  label: 'položky'
              },
              groupPanel: {
                  description: 'Přesuňte záhlaví zde pro vytvoření skupiny dle sloupce.'
              },
              search: {
                  placeholder: 'Hledat...',
                  showingItems: 'Zobrazuji položky:',
                  selectedItems: 'Vybrané položky:',
                  totalItems: 'Celkem položek:',
                  size: 'Velikost strany:',
                  first: 'První strana',
                  next: 'Další strana',
                  previous: 'Předchozí strana',
                  last: 'Poslední strana'
              },
              menu: {
                  text: 'Vyberte sloupec:'
              },
              sort: {
                  ascending: 'Seřadit od A-Z',
                  descending: 'Seřadit od Z-A',
                  remove: 'Odebrat seřazení'
              },
              column: {
                  hide: 'Schovat sloupec'
              },
              aggregation: {
                  count: 'celkem řádků: ',
                  sum: 'celkem: ',
                  avg: 'avg: ',
                  min: 'min.: ',
                  max: 'max.: '
              },
              pinning: {
                  pinLeft: 'Zamknout vlevo',
                  pinRight: 'Zamknout vpravo',
                  unpin: 'Odemknout'
              },
              gridMenu: {
                  columns: 'Sloupce:',
                  importerTitle: 'Importovat soubor',
                  exporterAllAsCsv: 'Exportovat všechna data do csv',
                  exporterVisibleAsCsv: 'Exportovat viditelná data do csv',
                  exporterSelectedAsCsv: 'Exportovat vybraná data do csv',
                  exporterAllAsPdf: 'Exportovat všechna data do pdf',
                  exporterVisibleAsPdf: 'Exportovat viditelná data do pdf',
                  exporterSelectedAsPdf: 'Exportovat vybraná data do pdf',
                  exporterAllAsExcel: 'Exportovat všechna data do excel',
                  exporterVisibleAsExcel: 'Exportovat viditelná data do excel',
                  exporterSelectedAsExcel: 'Exportovat vybraná data do excel',
                  clearAllFilters: 'Odstranit všechny filtry'
              },
              importer: {
                  noHeaders: 'Názvy sloupců se nepodařilo získat, obsahuje soubor záhlaví?',
                  noObjects: 'Data se nepodařilo zpracovat, obsahuje soubor řádky mimo záhlaví?',
                  invalidCsv: 'Soubor nelze zpracovat, jedná se o CSV?',
                  invalidJson: 'Soubor nelze zpracovat, je to JSON?',
                  jsonNotArray: 'Soubor musí obsahovat json. Ukončuji..'
              },
              pagination: {
                  sizes: 'položek na stránku',
                  totalItems: 'položek'
              },
              grouping: {
                  group: 'Seskupit',
                  ungroup: 'Odebrat seskupení',
                  aggregate_count: 'Agregace: Count',
                  aggregate_sum: 'Agregace: Sum',
                  aggregate_max: 'Agregace: Max',
                  aggregate_min: 'Agregace: Min',
                  aggregate_avg: 'Agregace: Avg',
                  aggregate_remove: 'Agregace: Odebrat'
              }
          };

          // support varianty of different czech keys.
          $delegate.add('cs', lang);
          $delegate.add('cz', lang);
          $delegate.add('cs-cz', lang);
          $delegate.add('cs-CZ', lang);
      return $delegate;
    }]);
  }]);
})();

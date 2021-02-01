/*!
 * ui-grid - v4.10.0 - 2021-02-01
 * Copyright (c) 2021 ; License: MIT 
 */

(function() {
	angular.module('ui.grid').config(['$provide', function($provide) {
		$provide.decorator('i18nService', ['$delegate', function($delegate) {
			$delegate.add('tr', {
				headerCell: {
					aria: {
						defaultFilterLabel: 'Sütun için filtre',
						removeFilter: 'Filtreyi Kaldır',
						columnMenuButtonLabel: 'Sütun Menüsü'
					},
					priority: 'Öncelik:',
					filterLabel: "Sütun için filtre: "
				},
				aggregate: {
					label: 'kayıtlar'
				},
				groupPanel: {
					description: 'Sütuna göre gruplamak için sütun başlığını buraya sürükleyin ve bırakın.'
				},
				search: {
					placeholder: 'Arama...',
					showingItems: 'Gösterilen Kayıt:',
					selectedItems: 'Seçili Kayıt:',
					totalItems: 'Toplam Kayıt:',
					size: 'Sayfa Boyutu:',
					first: 'İlk Sayfa',
					next: 'Sonraki Sayfa',
					previous: 'Önceki Sayfa',
					last: 'Son Sayfa'
				},
				menu: {
					text: 'Sütunları Seç:'
				},
				sort: {
					ascending: 'Artan Sırada Sırala',
					descending: 'Azalan Sırada Sırala',
					none: 'Sıralama Yapma',
					remove: 'Sıralamayı Kaldır'
				},
				column: {
					hide: 'Sütunu Gizle'
				},
				aggregation: {
					count: 'toplam satır: ',
					sum: 'toplam: ',
					avg: 'ort: ',
					min: 'min: ',
					max: 'maks: '
				},
				pinning: {
					pinLeft: 'Sola Sabitle',
					pinRight: 'Sağa Sabitle',
					unpin: 'Sabitlemeyi Kaldır'
				},
				columnMenu: {
					close: 'Kapat'
				},
				gridMenu: {
					aria: {
						buttonLabel: 'Tablo Menü'
					},
					columns: 'Sütunlar:',
					importerTitle: 'Dosya içeri aktar',
					exporterAllAsCsv: 'Bütün veriyi CSV olarak dışarı aktar',
					exporterVisibleAsCsv: 'Görünen veriyi CSV olarak dışarı aktar',
					exporterSelectedAsCsv: 'Seçili veriyi CSV olarak dışarı aktar',
					exporterAllAsPdf: 'Bütün veriyi PDF olarak dışarı aktar',
					exporterVisibleAsPdf: 'Görünen veriyi PDF olarak dışarı aktar',
					exporterSelectedAsPdf: 'Seçili veriyi PDF olarak dışarı aktar',
					clearAllFilters: 'Bütün filtreleri kaldır'
				},
				importer: {
					noHeaders: 'Sütun isimleri üretilemiyor, dosyanın bir başlığı var mı?',
					noObjects: 'Nesneler üretilemiyor, dosyada başlıktan başka bir veri var mı?',
					invalidCsv: 'Dosya işlenemedi, geçerli bir CSV dosyası mı?',
					invalidJson: 'Dosya işlenemedi, geçerli bir Json dosyası mı?',
					jsonNotArray: 'Alınan Json dosyasında bir dizi bulunmalıdır, işlem iptal ediliyor.'
				},
				pagination: {
					aria: {
						pageToFirst: 'İlk sayfaya',
						pageBack: 'Geri git',
						pageSelected: 'Seçili sayfa',
						pageForward: 'İleri git',
						pageToLast: 'Sona git'
					},
					sizes: 'Sayfadaki nesne sayısı',
					totalItems: 'kayıtlar',
					through: '', // note(fsw) : turkish dont have this preposition
					of: '' // note(fsw) : turkish dont have this preposition
				},
				grouping: {
					group: 'Grupla',
					ungroup: 'Gruplama',
					aggregate_count: 'Yekun: Sayı',
					aggregate_sum: 'Yekun: Toplam',
					aggregate_max: 'Yekun: Maks',
					aggregate_min: 'Yekun: Min',
					aggregate_avg: 'Yekun: Ort',
					aggregate_remove: 'Yekun: Sil'
				}
			});
			return $delegate;
		}]);
	}]);
})();

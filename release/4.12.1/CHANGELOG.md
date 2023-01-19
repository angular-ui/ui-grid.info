# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.12.1](https://github.com/angular-ui/ui-grid/compare/v4.12.0...v4.12.1) (2023-01-19)


### Bug Fixes

* **core:** ensure ui-grid loads on site ([b215403](https://github.com/angular-ui/ui-grid/commit/b2154039f6fe8b027bc9a8a4a7e5fd5a16904188)), closes [#7277](https://github.com/angular-ui/ui-grid/issues/7277)





# [4.12.0](https://github.com/angular-ui/ui-grid/compare/v4.11.1...v4.12.0) (2023-01-12)


### Bug Fixes

* **pinning:** blank space between pinnedRight column and the last unpinned column ([7687192](https://github.com/angular-ui/ui-grid/commit/7687192afa6b67f013c8a559a60dc9c3f78e4efb)), closes [#4949](https://github.com/angular-ui/ui-grid/issues/4949) [#6284](https://github.com/angular-ui/ui-grid/issues/6284)


### Features

* **exporter:** add export type in format method ([#7223](https://github.com/angular-ui/ui-grid/issues/7223)) ([4c36808](https://github.com/angular-ui/ui-grid/commit/4c36808e26c1ece5b48237523934e7dd5d2d2242))
* 🎸 option to disable GridMenu close on scrolling ([6d3f006](https://github.com/angular-ui/ui-grid/commit/6d3f0065f6635179b4a3ccca5d8f0ac274bd3755))




## [4.11.1](https://github.com/angular-ui/ui-grid/compare/v4.11.0...v4.11.1) (2022-02-23)


### Bug Fixes

* clear selection function ([f616137](https://github.com/angular-ui/ui-grid/commit/f61613794aa9f919d091ea60cc27eb85bf70ee74))
* Find or Select by Row Entity's 'ID' ([7a0a6c6](https://github.com/angular-ui/ui-grid/commit/7a0a6c6f3ed29c3e41f5cfa77b46639d3df7f1ca))
* exchanged filter() with every() ([583940f](https://github.com/angular-ui/ui-grid/commit/583940ffa30df614b64122dc1f8b9d83103821df))
* **i18n:** complete ru locale ([8d2caee](https://github.com/angular-ui/ui-grid/commit/8d2caeeb7fa0e85d73c5513d39f0c8ff7992f0b7))
* **resize-columns:** width gets adjusted so that ellipses aren't shown ([7851ff8](https://github.com/angular-ui/ui-grid/commit/7851ff81eae5b48bf89f4ca88ac66b097240c1ef))





# [4.11.0](https://github.com/angular-ui/ui-grid/compare/v4.10.3...v4.11.0) (2021-08-12)


### Bug Fixes

* 🐛 ensure viewport height cannot be negative ([a7111a1](https://github.com/angular-ui/ui-grid/commit/a7111a13b4c7d67068522881783925dedbacda88)), closes [#3034](https://github.com/angular-ui/ui-grid/issues/3034)


### Features

* 🎸 option to disable multi-column sorting ([c9abb8b](https://github.com/angular-ui/ui-grid/commit/c9abb8bab2101479b0498848b4a288c1ad7d17f9)), closes [#2913](https://github.com/angular-ui/ui-grid/issues/2913)
* 🎸 the ability to disable hide columns on a grid level ([2dd1688](https://github.com/angular-ui/ui-grid/commit/2dd168859e03583cdc7e6ab671d146e343ae4275)), closes [#1604](https://github.com/angular-ui/ui-grid/issues/1604)





## [4.10.3](https://github.com/angular-ui/ui-grid/compare/v4.10.2...v4.10.3) (2021-08-01)


### Bug Fixes

* 🐛 address linting issues and unit test failures ([a9cf59f](https://github.com/angular-ui/ui-grid/commit/a9cf59f6ff31f065332bdd20b0931dba0b982183))
* export filter with time part ('date:"MM-dd-YYYY HH:mm'). ([29d4803](https://github.com/angular-ui/ui-grid/commit/29d4803d702409bffafc30b33cbbdeda53992776))
* error when entering *+ combination in the column filter ([1201ad2](https://github.com/angular-ui/ui-grid/commit/1201ad2678f7b54d8351f8aa876405c97beb6d05))
* Missing german translation for selection and validate ([3ff57e0](https://github.com/angular-ui/ui-grid/commit/3ff57e00893890b3be73ec3c350d30b3b2a91cdf))
* canvas now has a minimum height of 1px, which renders it even if it has no data ([07c26d5](https://github.com/angular-ui/ui-grid/commit/07c26d576fe6e012730fead14c9e9139d606ed13))
* adjustColumns now calculates the colIndex instead of guessing it scrollpercentage ([ed76f02](https://github.com/angular-ui/ui-grid/commit/ed76f02090f3510d555cacdae03f1edad849d27a))




## [4.10.2](https://github.com/angular-ui/ui-grid/compare/v4.10.1...v4.10.2) (2021-06-14)


### Bug Fixes

* 🐛 add missing translations for es, fr, it and pt ([051b182](https://github.com/angular-ui/ui-grid/commit/051b1820a4a0bb97af86bba29f8889238c9b4907))
* 🐛 improve accessibility in the grid menus and selection ([e5ae7c0](https://github.com/angular-ui/ui-grid/commit/e5ae7c085f4ac314dfbd4fab15b24f20730ee5cd))
* **core:** use allowFloatWidth property to allow float calculations for width ([bb28b2f](https://github.com/angular-ui/ui-grid/commit/bb28b2fb523f5e47aa61a80bf70e4aabc49ab1e7))
* **core:** use allowFloatWidth property to allow float calculations for width ([f4d3e22](https://github.com/angular-ui/ui-grid/commit/f4d3e222965d91a7faf0f4886ad6d4906789df9e))





## [4.10.1](https://github.com/angular-ui/ui-grid/compare/v4.10.0...v4.10.1) (2021-05-28)


### Bug Fixes

* 🐛 ensure select all checkbox is announced correctly ([3b478fa](https://github.com/angular-ui/ui-grid/commit/3b478fa22fd6a438bc63331a36b4c0606d0edd36))
* 🐛 remove extra $applyAsync from header-cell ([f9a84ff](https://github.com/angular-ui/ui-grid/commit/f9a84ff8cb314e6823bda53f174157b318b238d7))
* clearSelectedRows should respect enableSelection ([fcad35c](https://github.com/angular-ui/ui-grid/commit/fcad35c432ad26468056451530d21d4a855c69c1))





# [4.10.0](https://github.com/angular-ui/ui-grid/compare/v4.9.1...v4.10.0) (2021-02-01)


### Bug Fixes

* **tree-base:** grouping showing duplicate rows ([685d3c7](https://github.com/angular-ui/ui-grid/commit/685d3c798a3417a1963241e1c7763dc9e60f9d8d))
* **tree-base:** if parent exists in cache ([cf7a5bc](https://github.com/angular-ui/ui-grid/commit/cf7a5bc8ef4d592c0907a35df7779be00ba7feac))


### Features

* 🎸 add 'aria-expanded' to expand buttons for accessibility ([2677f67](https://github.com/angular-ui/ui-grid/commit/2677f675c33d0584d6647d2f3903cd06ce36a659))


### Reverts

* Revert "chore: update changelog" and "chore: Release v4.9.2" ([3a4a27f](https://github.com/angular-ui/ui-grid/commit/3a4a27f6f1283f9b785287a53c2acc3539de170b))





## [4.9.1](https://github.com/angular-ui/ui-grid/compare/v4.9.0...v4.9.1) (2020-10-26)


### Bug Fixes

* **core:** update rtl support function to fix rtl support ([75580b8](https://github.com/angular-ui/ui-grid/commit/75580b88c46a36029b3abb3b57eaccf1928c22ad)), closes [#7126](https://github.com/angular-ui/ui-grid/issues/7126)
* **exporter:** pass both tree parent nodes and children nodes when exporting ([3a5ac8a](https://github.com/angular-ui/ui-grid/commit/3a5ac8adf83051b48081b2cc5d9d1bae77e5ef86)), closes [#7127](https://github.com/angular-ui/ui-grid/issues/7127) [#6819](https://github.com/angular-ui/ui-grid/issues/6819)





# [4.9.0](https://github.com/angular-ui/ui-grid/compare/v4.8.5...v4.9.0) (2020-09-27)


### Bug Fixes

* **edit:** fixing firefox number edit ([b58f78d](https://github.com/angular-ui/ui-grid/commit/b58f78d6e175dce283a5c709041acbfa41d68e5e)), closes [#6953](https://github.com/angular-ui/ui-grid/issues/6953)
* **core:** replace missing string with empty string ([f7d48ee](https://github.com/angular-ui/ui-grid/commit/f7d48ee4e28f8a1233d0dc1bf4e10a5446df6e32)), closes [#7063](https://github.com/angular-ui/ui-grid/issues/7063)


### Reverts

* Revert "Revert "Update ui-grid-column-resizer.js"" ([fe09d9b](https://github.com/angular-ui/ui-grid/commit/fe09d9bee956c538bcef28c997d1da9ff0b200e1))
* Revert "Update ui-grid-column-resizer.js" ([88191a0](https://github.com/angular-ui/ui-grid/commit/88191a00ccac5b6f4c9abb0bd62d62db64daa58f))


### BREAKING CHANGES

* MISSING string will no longer be displayed.





## [4.8.5](https://github.com/angular-ui/ui-grid/compare/v4.8.3...v4.8.5) (2020-09-14)


### Bug Fixes

* **all**: Add support for angular 1.8.0






## [4.8.4](https://github.com/angular-ui/ui-grid/compare/v4.8.3...v4.8.4) (2020-09-14)


### Bug Fixes

* **core:** update remove method as it was throwing error.. ([#7060](https://github.com/angular-ui/ui-grid/issues/7060)) ([9f58abd](https://github.com/angular-ui/ui-grid/commit/9f58abd4a3b99a967d0ca80eefebd7401ca3740f))
* **grouping:** adds aggregationLabel to aggregateColumn call to match ([60fcedc](https://github.com/angular-ui/ui-grid/commit/60fcedcebd815661fbb7868a5d11e964c971c5b6))





## [4.8.3](https://github.com/angular-ui/ui-grid/compare/v4.8.2...v4.8.3) (2019-10-21)


### Bug Fixes

* **a11y:** keyboard navigation changes of expand and selection buttons ([#7048](https://github.com/angular-ui/ui-grid/issues/7048)) ([9854f69](https://github.com/angular-ui/ui-grid/commit/9854f69))
* **exporter:** remove extra double quotes in excel export ([29c4fb1](https://github.com/angular-ui/ui-grid/commit/29c4fb1))





## [4.8.2](https://github.com/angular-ui/ui-grid/compare/v4.8.1...v4.8.2) (2019-10-07)


### Bug Fixes

* **core:** scrollToIfNecessary not properly including rowHeight on downward scrolls ([7a0e1dc](https://github.com/angular-ui/ui-grid/commit/7a0e1dc))
* **scrolling:** column footers misaligned with data [#6909](https://github.com/angular-ui/ui-grid/issues/6909) ([74f9107](https://github.com/angular-ui/ui-grid/commit/74f9107))
* change Safari support to 12 - 13 ([6b0f21a](https://github.com/angular-ui/ui-grid/commit/6b0f21a))





## [4.8.1](https://github.com/angular-ui/ui-grid/compare/v4.8.0...v4.8.1) (2019-06-27)


### Bug Fixes

* **core:** change translation in in i18n nl.js for clearAllFilters ([06c3d36](https://github.com/angular-ui/ui-grid/commit/06c3d36))
* **core:** support jQlite ([78e44f9](https://github.com/angular-ui/ui-grid/commit/78e44f9))
* handle rejection on timeout to avoid angularjs error message about possibly unhandled rejection ([635410c](https://github.com/angular-ui/ui-grid/commit/635410c))
* **i18n:** improve Swedish translations ([2d3abfa](https://github.com/angular-ui/ui-grid/commit/2d3abfa))
* **i18n:** translate clearAllFilters correctly in Swedish ([0fad621](https://github.com/angular-ui/ui-grid/commit/0fad621))
* **ui-grid:** [#6937](https://github.com/angular-ui/ui-grid/issues/6937) fix linter error ([13bb9c0](https://github.com/angular-ui/ui-grid/commit/13bb9c0))
* **ui-grid:** [#6937](https://github.com/angular-ui/ui-grid/issues/6937) getScrollBarWidth for Firefox ([6aee591](https://github.com/angular-ui/ui-grid/commit/6aee591))





# [4.8.0](https://github.com/angular-ui/ui-grid/compare/v4.7.1...v4.8.0) (2019-05-02)


### Bug Fixes

* **exporter:** remove unnecessary dependencies ([c354e27](https://github.com/angular-ui/ui-grid/commit/c354e27))
* **i18n:** add ru excel export values + fix clearAllFilters typo ([83b2aa1](https://github.com/angular-ui/ui-grid/commit/83b2aa1)), closes [#6841](https://github.com/angular-ui/ui-grid/issues/6841)
* **less:** improve less compilation ([2ab139e](https://github.com/angular-ui/ui-grid/commit/2ab139e))
* **ui-grid-site:** upgrade bootstrap to version 3.4.1 ([a125627](https://github.com/angular-ui/ui-grid/commit/a125627))


### Features

* **filterChanged:** pass the changed column as first argument to filterChanged function ([13eacc3](https://github.com/angular-ui/ui-grid/commit/13eacc3)), closes [#4775](https://github.com/angular-ui/ui-grid/issues/4775)





# [4.7.1](https://github.com/angular-ui/ui-grid/compare/v4.7.0...v4.7.1) (2019-02-06)


### Bug Fixes

* **selection:** fix row.setSelected is not a function issue ([eb98748](https://github.com/angular-ui/ui-grid/commit/eb98748))
* **ui-grid.js:** prevent build from duplicating files during concat ([eb98748](https://github.com/angular-ui/ui-grid/commit/eb98748))



# [4.7.0](https://github.com/angular-ui/ui-grid/compare/v4.6.6...v4.7.0) (2019-02-01)


### Bug Fixes

* **exporter:** add missing dependencies ([a86eb0e](https://github.com/angular-ui/ui-grid/commit/a86eb0e))
* **grouping.js:** fix typo in description ([4597c69](https://github.com/angular-ui/ui-grid/commit/4597c69))
* **less:** update less file references ([47c1239](https://github.com/angular-ui/ui-grid/commit/47c1239))
* **selection:** prevent cell to be selected when user scroll ([a537f0c](https://github.com/angular-ui/ui-grid/commit/a537f0c))
* **selection:** take in care about time touched properly ([0dbdafe](https://github.com/angular-ui/ui-grid/commit/0dbdafe))
* **uiGridColumMenu:** Add missing promise catch handlers for focus.bySelector calls ([de57fdc](https://github.com/angular-ui/ui-grid/commit/de57fdc))
* **uiGridColumMenu:** Check column visibility before trying to focus it in the menu-hidden callback ([3a8e87b](https://github.com/angular-ui/ui-grid/commit/3a8e87b))
* **uiGridColumMenu:** Check for menu item visibility before trying to focus the first visible menu item ([3085417](https://github.com/angular-ui/ui-grid/commit/3085417))


### Features

* **css:** add feature based CSS files ([9e1c042](https://github.com/angular-ui/ui-grid/commit/9e1c042))
* **filter:** add filterContainer option to allow a column filter to be placed in column menu ([bdb832a](https://github.com/angular-ui/ui-grid/commit/bdb832a)), closes [#3989](https://github.com/angular-ui/ui-grid/issues/3989)


### BREAKING CHANGES

* **less:** feature less files have been moved to the root of the
less folder.





<a name="4.6.5"></a>
## [4.6.5](https://github.com/angular-ui/ui-grid/compare/v4.6.4...v4.6.5) (2018-11-16)


### Bug Fixes

* **customizer:** fix customizer ([ee5f27d](https://github.com/angular-ui/ui-grid/commit/ee5f27d)), closes [#6834](https://github.com/angular-ui/ui-grid/issues/6834)
* **rowSorter.js:** wrap rowSortFn while innards in function to prevent issue with webpack compress. ([21fa2af](https://github.com/angular-ui/ui-grid/commit/21fa2af))
* **sort:** add an extra check for sort data ([045b77c](https://github.com/angular-ui/ui-grid/commit/045b77c))


### Features

* **sv.js:** Added missing Swedish translations ([6dfbad3](https://github.com/angular-ui/ui-grid/commit/6dfbad3))



<a name="4.6.4"></a>
## [4.6.4](https://github.com/angular-ui/ui-grid/compare/v4.6.3...v4.6.4) (2018-10-30)


### Bug Fixes

* **exporter:** Allow csv export for object field type ([#6870](https://github.com/angular-ui/ui-grid/issues/6870)) ([24d4224](https://github.com/angular-ui/ui-grid/commit/24d4224))
* **grouping:** respect customTreeAggregationFn on grouped columns ([#6868](https://github.com/angular-ui/ui-grid/issues/6868)) ([e2a7310](https://github.com/angular-ui/ui-grid/commit/e2a7310)), closes [#6402](https://github.com/angular-ui/ui-grid/issues/6402)
* **treeBase:** allow setting row.$$treeLevel to undefined ([#6867](https://github.com/angular-ui/ui-grid/issues/6867)) ([3057b46](https://github.com/angular-ui/ui-grid/commit/3057b46)), closes [#5548](https://github.com/angular-ui/ui-grid/issues/5548)



<a name="4.6.3"></a>
## [4.6.3](https://github.com/angular-ui/ui-grid/compare/v4.6.2...v4.6.3) (2018-08-04)


### Bug Fixes

* **fonts:** changed space endings on font files ([ed8ebba](https://github.com/angular-ui/ui-grid/commit/ed8ebba)), closes [#6809](https://github.com/angular-ui/ui-grid/issues/6809)
* **header:** Change grid header css to flexbox ([f9ac3e5](https://github.com/angular-ui/ui-grid/commit/f9ac3e5)), closes [#6799](https://github.com/angular-ui/ui-grid/issues/6799) [#2592](https://github.com/angular-ui/ui-grid/issues/2592)
* **less:** create a core.less file for import ([6866583](https://github.com/angular-ui/ui-grid/commit/6866583)), closes [#4659](https://github.com/angular-ui/ui-grid/issues/4659)
* **less:** remove bootstrap dependency ([a480900](https://github.com/angular-ui/ui-grid/commit/a480900)), closes [#4173](https://github.com/angular-ui/ui-grid/issues/4173) [#5435](https://github.com/angular-ui/ui-grid/issues/5435)
* **tree-base:** agg: remove now works ([4a37231](https://github.com/angular-ui/ui-grid/commit/4a37231)), closes [#5682](https://github.com/angular-ui/ui-grid/issues/5682)



<a name="4.6.2"></a>
## [4.6.2](https://github.com/angular-ui/ui-grid/compare/v4.6.1...v4.6.2) (2018-07-09)


### Performance Improvements

* **ui-grid.core:** Remove unnecessary code. ([cfec75c](https://github.com/angular-ui/ui-grid/commit/cfec75c))



<a name="4.6.1"></a>
## [4.6.1](https://github.com/angular-ui/ui-grid/compare/v4.6.0...v4.6.1) (2018-07-05)


### Bug Fixes

* **exporter:** Handle filters with 3 arguments ([3207b29](https://github.com/angular-ui/ui-grid/commit/3207b29)), closes [#6784](https://github.com/angular-ui/ui-grid/issues/6784)
* **exporter:** exporterExcelCustomFormatter should return the unmodified docDefinition ([7fc39ad](https://github.com/angular-ui/ui-grid/commit/7fc39ad)), closes [#6774](https://github.com/angular-ui/ui-grid/issues/6774) [#6774](https://github.com/angular-ui/ui-grid/issues/6774)
* **i18n:** Fix Japanese translation. ([#6781](https://github.com/angular-ui/ui-grid/issues/6781)) ([9ab0a4c](https://github.com/angular-ui/ui-grid/commit/9ab0a4c))
* **selection:** Fix multiSelect + modifierKeysToMultiSelect ([2bc8c7b](https://github.com/angular-ui/ui-grid/commit/2bc8c7b)), closes [#6793](https://github.com/angular-ui/ui-grid/issues/6793) [#6791](https://github.com/angular-ui/ui-grid/issues/6791)
* **selection:** Remove focus rows styles. ([a8480a2](https://github.com/angular-ui/ui-grid/commit/a8480a2)), closes [#6782](https://github.com/angular-ui/ui-grid/issues/6782)
* **validate:** missing getErrorMessages method ([588c868](https://github.com/angular-ui/ui-grid/commit/588c868))


### Documentation

* **ui-grid.info:** Clean up API documentation. ([a535bea](https://github.com/angular-ui/ui-grid/commit/a535bea96109540f6ca66f42646321e785f62136))
* **ui-grid.info:** Added missing documentation. ([71c3db8](https://github.com/angular-ui/ui-grid/commit/71c3db8157159193c1fc7ce310c8c8b48f140760))



<a name="4.6.0"></a>
# [4.6.0](https://github.com/angular-ui/ui-grid/compare/v4.5.1...v4.6.0) (2018-06-21)


### Bug Fixes

* **gridContainer:** Revert body container id to previous. ([981e9e2](https://github.com/angular-ui/ui-grid/commit/981e9e2)), closes [#6096](https://github.com/angular-ui/ui-grid/issues/6096)
* **selection:** Selected row style only applied to left container ([ab31e0b](https://github.com/angular-ui/ui-grid/commit/ab31e0b))
* **uiGridHeaderCell:** Remove unncessary space ([5ea8e54](https://github.com/angular-ui/ui-grid/commit/5ea8e54))


### Documentation

* **scrollThreshold:** Add missing documentation details. ([cc0fdb7](https://github.com/angular-ui/ui-grid/commit/cc0fdb7))


### Features

* **es-ct:** Add catalan translations. ([f482800](https://github.com/angular-ui/ui-grid/commit/f482800)), closes [#5536](https://github.com/angular-ui/ui-grid/issues/5536)
* **rs-lat:** Added Serbian translations. ([da57ad1](https://github.com/angular-ui/ui-grid/commit/da57ad1))
* **i18n:** Add fallback lang support ([0e47f10](https://github.com/angular-ui/ui-grid/commit/0e47f10)), closes [#6396](https://github.com/angular-ui/ui-grid/issues/6396)


### BREAKING CHANGES

* **horizontalScrollThreshold:** Removed horizontalScrollThreshold as it is not being used by the grid.
* **i18n:** getSafeText() will now return [MISSING] + the path to
the missing property or the fallback value if the property is available
on the fallback language.



<a name="4.5.1"></a>
## [4.5.1](https://github.com/angular-ui/ui-grid/compare/v4.5.0...v4.5.1) (2018-06-18)


### Bug Fixes

* **fonts:** Add missing fonts folder to release ([544a483](https://github.com/angular-ui/ui-grid/commit/544a483)), closes [#6759](https://github.com/angular-ui/ui-grid/issues/6759)



<a name="4.5.0"></a>
# [4.5.0](https://github.com/angular-ui/ui-grid/compare/v4.4.11...v4.5.0) (2018-06-15)


### Bug Fixes

* **fonts:** Change font files path. ([1bd060c](https://github.com/angular-ui/ui-grid/commit/1bd060c)), closes [#3751](https://github.com/angular-ui/ui-grid/issues/3751)
* **i18n:** Add missing Danish pinning translations [#6731](https://github.com/angular-ui/ui-grid/issues/6731) ([c14def4](https://github.com/angular-ui/ui-grid/commit/c14def4))
* **i18n:** Add missing sk translations. ([2d6907f](https://github.com/angular-ui/ui-grid/commit/2d6907f))
* **selection, expandable:** Add pointer cursor css ([faf332e](https://github.com/angular-ui/ui-grid/commit/faf332e))
* **ui-grid-menu-button.js:**  Click on the menu button item checkbox … ([#6738](https://github.com/angular-ui/ui-grid/issues/6738)) ([c0d27d1](https://github.com/angular-ui/ui-grid/commit/c0d27d1))
* **ui-grid.core:** Address resizing issues. ([767e022](https://github.com/angular-ui/ui-grid/commit/767e022))


### Features

* **expandable:** Enhance the expandable grid feature. ([ec13255](https://github.com/angular-ui/ui-grid/commit/ec13255))
* **selection:** Enhance the selection feature ([2485652](https://github.com/angular-ui/ui-grid/commit/2485652))


### BREAKING CHANGES

* **fonts:** If you take the new CSS and do not relocate the icon files, your icons will likely cease to
show in the grid.



<a name="4.4.11"></a>
## [4.4.11](https://github.com/angular-ui/ui-grid/compare/v4.4.9...v4.4.11) (2018-05-16)

### Features

* **angular.js:** Support Angular 1.7. ([8c6cb51](https://github.com/angular-ui/ui-grid/commit/8c6cb51d3fbcf8bb6e3fc15c8378d9ba7b11a32c))

### Bug Fixes

* **ui-grid-util.js:** Replace angular.uppercase with toUpperCase. ([82033e0](https://github.com/angular-ui/ui-grid/commit/82033e0)), closes [#6729](https://github.com/angular-ui/ui-grid/issues/6729)


<a name="4.4.10"></a>
## [4.4.10](https://github.com/angular-ui/ui-grid/compare/v4.4.9...v4.4.10) (2018-05-15)


### Bug Fixes

* **ui-grid-menu-button.js:** Change "Columns:" item to a heading. ([85ad462](https://github.com/angular-ui/ui-grid/commit/85ad462))
* **ui-grid-util.js:** Replace angular.uppercase and .lowercase with String.toUpperCase and .toLowerC ([a41677a](https://github.com/angular-ui/ui-grid/commit/a41677a)), closes [#6715](https://github.com/angular-ui/ui-grid/issues/6715)



<a name="4.4.9"></a>
## [4.4.9](https://github.com/angular-ui/ui-grid/compare/v4.4.7...v4.4.9) (2018-04-30)


### Bug Fixes

* **exporter.js:** Eliminate selection column. Add export scale factor for excel and fonts ([d96f43d](https://github.com/angular-ui/ui-grid/commit/d96f43d))
* **cellnav.js:** Do not trigger edit on undefined event. ([615fe49](https://github.com/angular-ui/ui-grid/commit/615fe49))
* **Grid.js:** Use scrollbarHeight instead of scrollbarWidth for vertical scroll calculations. ([1b01490](https://github.com/angular-ui/ui-grid/commit/1b01490)), closes [#6653](https://github.com/angular-ui/ui-grid/issues/6653)
* **selection.js:**
  * Allow group header selection. ([9718d8b](https://github.com/angular-ui/ui-grid/commit/9718d8b)), closes [#6698](https://github.com/angular-ui/ui-grid/issues/6698)
  * Check if column is row header before disabling selection. ([dff19a7](https://github.com/angular-ui/ui-grid/commit/dff19a7)), closes [#5239](https://github.com/angular-ui/ui-grid/issues/5239)
  * getSelectedRows will work on primitive data types. ([39a5439](https://github.com/angular-ui/ui-grid/commit/39a5439)), closes [#6704](https://github.com/angular-ui/ui-grid/issues/6704)
  * Raise rowSelectionChangedBatch after toggling selectAll flag. ([bff5bb2](https://github.com/angular-ui/ui-grid/commit/bff5bb2)), closes [#5411](https://github.com/angular-ui/ui-grid/issues/5411)
* **tree-base.js:**
  * Allow treeIndent to be 0. ([68be14e](https://github.com/angular-ui/ui-grid/commit/68be14e))
  * Call updateRowHeaderWidth even when no data exists. ([49678eb](https://github.com/angular-ui/ui-grid/commit/49678eb)), closes [#5430](https://github.com/angular-ui/ui-grid/issues/5430)


### Features

* **ui-i18n.js:** Allow replacing/customizing specific existing locale strings when using add. ([d6d820f](https://github.com/angular-ui/ui-grid/commit/d6d820f))



<a name="v4.4.7"></a>
### v4.4.7 (2018-04-20)


#### Bug Fixes

* **exporter.js:**
  * Eliminate selection column. Add export scale factor for excel and fonts ([bc50dfb0](http://github.com/angular-ui/ng-grid/commit/bc50dfb054ad4a571505051de258eee33539ffe2))
  * Fix to handle filter args and spaces after filter name (#6681) ([7c2c002b](http://github.com/angular-ui/ng-grid/commit/7c2c002b29f43b46e6ac965d59bd5ff0bef677c8))
  * Fix export when selection col is hidden. (#6676) ([b971f417](http://github.com/angular-ui/ng-grid/commit/b971f4177cf19666f420eb5f70fbe774c33fd137))
* **Grid.js:** ScrollIfNecessary does not account for scrollWidth correctly ([16826bf1](http://github.com/angular-ui/ng-grid/commit/16826bf15f9ef72f885545894deddbdef99dcc97))
* **i18n:** Add missing portuguese translations. ([25fdb473](http://github.com/angular-ui/ng-grid/commit/25fdb4738d6daadc91ffa28294a655d45cfeac74))
* **uiGridRenderContainer.html:** Prevent duplicate ids in the grid for ADA compliance. ([ecf07c6f](http://github.com/angular-ui/ng-grid/commit/ecf07c6f19b18a87002791d66fe8e85b0e0f0e33))

<a name="v4.4.6"></a>
### v4.4.6 (2018-04-06)


#### Bug Fixes

* **Grid.js:** ScrollIfNecessary will not scroll if percentage has not changed. ([7ed11ecb](http://github.com/angular-ui/ng-grid/commit/7ed11ecb57e9a809af41e36315575486e1ad2b93))
* **exporter.js:** Exporter will respect headerCellFilter and cellFilter. ([4c632391](http://github.com/angular-ui/ng-grid/commit/4c63239186c73fd3ba1723481ed67618897e9fe4))
* **footer.less:** Footer column width now matches header column width. ([3134f77b](http://github.com/angular-ui/ng-grid/commit/3134f77b3dc659e172a5cda67ef7c45528a3ea3a))
* **ui-grid-menu-button.js:** Replace show/hide buttons with a single toggle button. ([a6a26d99](http://github.com/angular-ui/ng-grid/commit/a6a26d997ed7fee102ab89cb863b0a5a40ce895c))
* **ui-grid-menu.js:** Give bySelector correct parent. ([1972dcc2](http://github.com/angular-ui/ng-grid/commit/1972dcc29a7727f6e66fffdcbe3c5c4240f3e499))
* **ui-grid.js:** gridOptions.data string value now works again. ([c62b986d](http://github.com/angular-ui/ng-grid/commit/c62b986d14e68f7e6e8f72ceb89666d7b7add749))

<a name="v4.4.5"></a>
### v4.4.5 (2018-03-31)


#### Bug Fixes

* **Grid.js:** scrollToIfNecessary can scroll to last row. ([87c9eed3](http://github.com/angular-ui/ng-grid/commit/87c9eed31c5e3b1b81d60721cd4fad846b0eb5a9))
* **expandable.js:** Update expandedAll attribute when toggling rows. ([1b080b91](http://github.com/angular-ui/ng-grid/commit/1b080b916798addff1b67985465c6b01a8c5dce7))
* **footer.less:** Empty footer cells now take the full available height. (#6630) ([dbe3ecd3](http://github.com/angular-ui/ng-grid/commit/dbe3ecd3ccf1d768b8ad3a8adc5bc38676f8542c))
* **gridClassFactory.js:** Move priority to correct spot. ([842a9b77](http://github.com/angular-ui/ng-grid/commit/842a9b772f6b3f8dc43c614133b8284e991cd0e7))
* **gridEdit.js:** Move deregister events until event conclusion. ([214f6cc4](http://github.com/angular-ui/ng-grid/commit/214f6cc4aa547c0e027bf7c2c8ce1865f50adddc))
* **pagination.less:** Correct style pagination in footer info panel. ([5ca555a8](http://github.com/angular-ui/ng-grid/commit/5ca555a81efd12d3411e950c379dd58a4ad23c4f))
* **selection.js:** When enableSelection is false, row cannot be toggled. ([33260602](http://github.com/angular-ui/ng-grid/commit/33260602609711077637e04614887b3341289cb1))
* **tree-base.js:** Stop event propagation on click of the row header. ([c2824d5c](http://github.com/angular-ui/ng-grid/commit/c2824d5cbee3cb100291f51d95c09d58fcb4f5a6))
* **ui-grid-render-container:** Use offsetHeight to avoid sizing issues. ([9927b711](http://github.com/angular-ui/ng-grid/commit/9927b711e037946e52d17fd521600e5c4e9d8b99))
* **ui-grid.js:** Ignore scrollbar height prior to checking if autoAdjustHeight is needed. ([f9971a5d](http://github.com/angular-ui/ng-grid/commit/f9971a5d19d215c8978f64ecbc349830be6f7d6e))

<a name="v4.4.4"></a>
### v4.4.4 (2018-03-23)


#### Bug Fixes

* **Grid.js:** Select All button should be disabled when no data is present. ([08ec049a](http://github.com/angular-ui/ng-grid/commit/08ec049af25e8ef6f953955a2b2e2f570b29a4b6))
* **column-resizer:** Disable text selection while resizing columns. ([2cf3e02a](http://github.com/angular-ui/ng-grid/commit/2cf3e02a8a1fe9762b09604cc3dff8bd079bc86d))
* **filter:** Filter input fits in column without bootstrap ([a63e1f1a](http://github.com/angular-ui/ng-grid/commit/a63e1f1a3daae51feefab9f2b467ddfd922628d0))
* **pagination.less:** Pagination footer no longer overlaps last row. ([713d3ea9](http://github.com/angular-ui/ng-grid/commit/713d3ea9caadaaa6e24f98ef31a43821bf9065e3))
* **selection:**
  * SelectAllRows pays attention to isRowSelectable function. ([0b7304f4](http://github.com/angular-ui/ng-grid/commit/0b7304f40d97343c2f7c249abb82050af7ef40dd))
  * Center checkmarx in selection row header. ([3f8758aa](http://github.com/angular-ui/ng-grid/commit/3f8758aa76f523fc3a23762e9772095a963d7a65))
* **styles:** Removed div. from LESS files. ([5a7dabd6](http://github.com/angular-ui/ng-grid/commit/5a7dabd60d13405f4f9a585b45ddf2c660225b82))
* **ui-grid-column-menu.js:** Added keyboard navigation to column menu (#6629) ([df429208](http://github.com/angular-ui/ng-grid/commit/df4292083397d498594e893746d5975c4998105b))

<a name="v4.4.3"></a>
### v4.4.3 (2018-03-21)


#### Bug Fixes

* **GridColumn:** Respect minimumColumnSize when a valid minWidth is not present ([89c43ef3](http://github.com/angular-ui/ng-grid/commit/89c43ef34f01249c6025f535519ad3899daa0049))
* **pagination.html:** Limits pagination page number to integers only ([d7eca115](http://github.com/angular-ui/ng-grid/commit/d7eca115da85b0273688855706975eb231c54e6d))
* **selection.js:** enableFullRowSelection allows enableRowHeaderSelection. ([f77a5b3f](http://github.com/angular-ui/ng-grid/commit/f77a5b3f5092fdc4a3f5d1717855af405acb0d81))
* **ui-grid-column-menu.js:** Focus on first item in column menu on open. ([43b313fc](http://github.com/angular-ui/ng-grid/commit/43b313fc281a13236c6e6ed3e471a0eb3bf3257f))
* **ui-grid-util.js:** Comment out log statement. ([6b127e2d](http://github.com/angular-ui/ng-grid/commit/6b127e2d6d50a004cf85dff7ef715bd841b04624))

<a name="v4.4.2"></a>
### v4.4.2 (2018-03-20)


#### Bug Fixes

* **GridRenderContainer.js:** needsHScrollbarPlaceholder accounts for WHEN_NEEDED ([403bf3ee](http://github.com/angular-ui/ng-grid/commit/403bf3ee145be349ca783f5e5cf86a5420b638bf))
* **i18n:** change some strings in de.js due to typos ([9ebe1168](https://github.com/angular-ui/ui-grid/commit/9ebe116808ff2d56e18bc3623355121a934de080))

<a name="v4.4.1"></a>
### v4.4.1 (2018-03-16)


#### Bug Fixes

* **122_accessibility.ngdoc:** Update angular-aria version. ([faa17fba](http://github.com/angular-ui/ng-grid/commit/faa17fbaea083e9e80d823601c22b81fc4899f14))
* **pagination.less:** Remove unnecessary underline from pagination styles. ([f3a4086d](http://github.com/angular-ui/ng-grid/commit/f3a4086d8e9509dea5490105b9fbb73ceb96611d))
* **ui-grid.core.js:** Add missing i18nService to ui-grid.core.js ([06f53d91](http://github.com/angular-ui/ng-grid/commit/06f53d91be8c4219e0dad2027b8717eeb6183f79))

<a name="v4.4.0"></a>
## v4.4.0 (2018-03-15)


#### Features

* **concat.js:** Rename ui-grid.base.js to ui-grid.core.js. ([18c5ffb8](http://github.com/angular-ui/ng-grid/commit/18c5ffb8807122e6045643c73138b9d6c83b5f9e))
* **i18n:** Separate language files from ui-grid.base.js ([1342f803](http://github.com/angular-ui/ng-grid/commit/1342f8031441647ef8533f66c7141b04bb0fafe6))


#### Breaking Changes

* ui-grid.base.js has been rename to ui-grid.core.js. Also, ui-grid.core.js no longer
contains most of the language files available to UI-Grid. It only contains english as that is the
default language of the grid. See tutorials for examples.
 ([18c5ffb8](http://github.com/angular-ui/ng-grid/commit/18c5ffb8807122e6045643c73138b9d6c83b5f9e))

<a name="v4.3.1"></a>
### v4.3.1 (2018-03-15)

* **release:** Released UI-Grid to NPM and bower ([e90a837](https://github.com/angular-ui/ui-grid/commit/e90a837b7e2414f456a3ec7b5482afe7697f4e29))

<a name="v4.3.0"></a>
## v4.3.0 (2018-03-14)


#### Bug Fixes

* **build:** Remove Safari 7 from tests and switch $digest to "$apply" to add $$hashKey to da ([323fa956](http://github.com/angular-ui/ng-grid/commit/323fa956e26aa858a022449b71d5d79beaac6205))
* **menus:**
  * streamline menu positioning ([a83df5bc](http://github.com/angular-ui/ng-grid/commit/a83df5bcec80a38e8566a5385a2639173b7cd00e), closes [#5396](http://github.com/angular-ui/ng-grid/issues/5396), [#5990](http://github.com/angular-ui/ng-grid/issues/5990), [#6085](http://github.com/angular-ui/ng-grid/issues/6085))
  * Fix menu positioning/animation ([25dbd2ec](http://github.com/angular-ui/ng-grid/commit/25dbd2ec3823e20d5d458903260caf3beed83920), closes [#3436](http://github.com/angular-ui/ng-grid/issues/3436), [#3921](http://github.com/angular-ui/ng-grid/issues/3921), [#3978](http://github.com/angular-ui/ng-grid/issues/3978), [#6587](http://github.com/angular-ui/ng-grid/issues/6587))
* **selection.js:** Allow selection to work with grouping. ([b21096b2](http://github.com/angular-ui/ng-grid/commit/b21096b2c275e365e561a39a7987a3e290b3ee59))
* **utils.js:** Remove IE9 from supported browsers list. ([f14da2fc](http://github.com/angular-ui/ng-grid/commit/f14da2fc9995d60bed26fd00ad5c271fd7eac470), closes [#2273](http://github.com/angular-ui/ng-grid/issues/2273), [#2552](http://github.com/angular-ui/ng-grid/issues/2552), [#3593](http://github.com/angular-ui/ng-grid/issues/3593), [#3854](http://github.com/angular-ui/ng-grid/issues/3854), [#4439](http://github.com/angular-ui/ng-grid/issues/4439))


#### Features

* **GridRenderContainer:** Added WHEN_NEEDED option back to ui-grid. ([1c1ea72e](http://github.com/angular-ui/ng-grid/commit/1c1ea72e60ac082ce1c746414cb63a469462cc13))
* **uglify/concat:** Publish multiple files separated by features. ([6d26274](https://github.com/angular-ui/ui-grid/commit/6d26274024a6925a6b89fcaab4ded6173d68169f))


#### Breaking Changes

* IE9 and Safari 7 are no longer officially supported.

Closes #2273, #2552, #3593, #3854, #4439
 ([f14da2fc](http://github.com/angular-ui/ng-grid/commit/f14da2fc9995d60bed26fd00ad5c271fd7eac470))

<a name="v4.2.4"></a>
### v4.2.4 (2018-02-07)


#### Bug Fixes

* **uiGridAutoResize:** Asking for grid $elm sizing in a digest loop always triggers `refresh`, not cond ([835153ce](http://github.com/angular-ui/ng-grid/commit/835153ce256fbeb5f58e20752ca7a4ea35b7a963), closes [#6561](http://github.com/angular-ui/ng-grid/issues/6561))


#### Features

* **expandAllButton:** Add ability to hide expand all button. ([343d7116](http://github.com/angular-ui/ng-grid/commit/343d711660e83b47c664e74fb8ec735da06a0a07))

<a name="v4.2.3"></a>
### v4.2.3 (2018-02-02)


#### Bug Fixes

* **exporter:** Fix bug where selection column width was included ([d6aeb166](http://github.com/angular-ui/ng-grid/commit/d6aeb166c9931d6da6f464807e6d6575b6b2addf))
* **importer.js:** Remove unnecessary on destroy event. ([497a554b](http://github.com/angular-ui/ng-grid/commit/497a554bc01fe1148aa804732804c0b41b0c2ced))
* **selection.js:** Allow selection in tables that use grouping (#6556) ([f3d2a7f1](http://github.com/angular-ui/ng-grid/commit/f3d2a7f1019d269df567047be901e07523cefcb4))
* **ui-grid-header-cell:** Improved styles with grid menu. ([c6b8d3bc](http://github.com/angular-ui/ng-grid/commit/c6b8d3bcf5095e7543603e1622499aefa2d5c0a4))


#### Features

* **i18n:** Add Arabic translation (#6551) ([24be1fb6](http://github.com/angular-ui/ng-grid/commit/24be1fb6f78bc9c5c55af0b88dfa0ef87967c395))

<a name="v4.2.2"></a>
### v4.2.2 (2018-01-17)


#### Bug Fixes

* **gridEdit:** Fixing scrollToFocus issues. ([cc8144ca](http://github.com/angular-ui/ng-grid/commit/cc8144ca8b9138dfd08fffbe8cd4382f853c76e2))

<a name="v4.2.1"></a>
### v4.2.1 (2018-01-17)


#### Bug Fixes

* **GridRenderContainer:** Fixing scrollbar styles. ([c36be957](http://github.com/angular-ui/ng-grid/commit/c36be957b8943110ffe4f10de8783acf8d706127))
* **gridEdit:** Fixing issues with focus and grid edit. ([924cd9b4](http://github.com/angular-ui/ng-grid/commit/924cd9b45f7f83a620fa77bfb39a4fc8d4d1ca2d))
* **importer:** Fix console error on opening grid menu. ([01dee3c5](http://github.com/angular-ui/ng-grid/commit/01dee3c5d5bc4f25278f58bbaab00f8e62be45e5))
* **menus:** Switching applyAsync for timeout. ([136335fc](http://github.com/angular-ui/ng-grid/commit/136335fcba88fa0f202be90480a54c69cd90abae))

<a name="v4.2.0"></a>
## v4.2.0 (2018-01-15)


#### Bug Fixes

* **build:** Fixing build failure due to poor updates. ([9382312d](http://github.com/angular-ui/ng-grid/commit/9382312d71308a2276956822918e3699491a6e8f))
* **cellnav:** Replace $timeout with $applyAsync. ([be18d09e](http://github.com/angular-ui/ng-grid/commit/be18d09e06c36df23c017380e217bec9264d7986))
* **docs:** Fix broken docs. ([10c3100](https://github.com/angular-ui/ui-grid/commit/10c310030730fca98d2b9a9ff4f3d02fb5d2fa62))
* **edit:** Replace $timeout with $applyAsync. ([2d409557](http://github.com/angular-ui/ng-grid/commit/2d409557f17ef10f7ccac89f313ed16e57513c87))
* **infinite-scroll:** Replace $timeout with $applyAsync. ([30af7e9b](http://github.com/angular-ui/ng-grid/commit/30af7e9b2d53effcb959de67cb80fc3ae68c656b))
* **lang:** Update Polish translations. ([2999817](https://github.com/angular-ui/ui-grid/commit/299981767161b6f989af13847333eea069cdbc9a))
* **move-columns:** Replace $timeout with $applyAsync. ([f77df14c](http://github.com/angular-ui/ng-grid/commit/f77df14c6aef34d8a938acd437ffdf92f51df7db))
* **resize-columns:** Replace $timeout with $applyAsync. ([b77ddc36](http://github.com/angular-ui/ng-grid/commit/b77ddc362ef207ca9b89ed0fda1cecf0538330d1))
* **tutorial:** Updating some tutorial examples. ([804fce72](http://github.com/angular-ui/ng-grid/commit/804fce72f621ca9abac75c1de0deca3c6bed2fd2))

<a name="v4.1.3"></a>
### v4.1.3 (2017-12-23)


#### Bug Fixes

* **protractor:** Improving reliability of protractor tests and ensuring they can run at a basic l ([44396d22](http://github.com/angular-ui/ng-grid/commit/44396d22cf89efb6f0039e0e1bc5d1c8a19570b5))
* **uiGridAutoResize:** Changed [0].clientHeight to gridUtil.elementHe… (#6490) ([fef9552e](http://github.com/angular-ui/ng-grid/commit/fef9552e1dc82693ee4182b694d7f3c8e893a282))
* **GridRenderContainer.js:** Fix bug of space to the right of the last column (#6371) ([a2f2fd5](https://github.com/angular-ui/ui-grid/commit/a2f2fd518de3d88100da6ad44ec970cb53262e66))
* **ui-grid.html:** Fix bug with template for last row's bottom border (#4413) ([faa8ece](https://github.com/angular-ui/ui-grid/commit/faa8ece144231a50d9fa771187275088b28dd3eb))

<a name="v4.1.2"></a>
### v4.1.2 (2017-12-21)


#### Bug Fixes

* **tutorial:** Replacing .success with .then due to angular upgrade. ([07cbe8a8](http://github.com/angular-ui/ng-grid/commit/07cbe8a8c3315e638704ded07e49b677896ab3d0))

<a name="v4.1.1"></a>
### v4.1.1 (2017-12-20)


#### Bug Fixes

* **ui-grid.info:** Updating ui-grid.info to support angular 1.6.7 ([99819cc2](http://github.com/angular-ui/ng-grid/commit/99819cc2a3a9d442e734892ec9e09847e0bd88f7))

<a name="v4.1.0"></a>
## v4.1.0 (2017-12-18)


#### Bug Fixes

* **exporter:**
  * fix issue #6019 errors while opening grid menu with exporter service ([18547eb6](http://github.com/angular-ui/ng-grid/commit/18547eb6db79d62d3eb6594ac281ac9c462acd75))
  * Excel export with npm instructions, fix error on menu and more examples ([88f5525](https://github.com/angular-ui/ui-grid/commit/bc37cb4d63f00ef3e49e2a8f14b6efad11107be0))

#### Features

* **chore:** Support Angular 1.6. ([56d3c5f](https://github.com/angular-ui/ui-grid/commit/56d3c5f529f171d82873d4bd1c172d82d0a32ac0))

<a name="v4.0.11"></a>
### v4.0.11 (2017-11-20)


#### Bug Fixes

* **sorting:** fixed the priority computing when unsorting using column menu action (#6427) ([97e0ffa5](http://github.com/angular-ui/ng-grid/commit/97e0ffa5005960bf0e1f5e933e028f0e93b78d23))
* **uiGridAutoResize:** Replaced timeout checker with watcher (#6470) ([262dbdc8](http://github.com/angular-ui/ng-grid/commit/262dbdc89323790a4d8e87a6aeb9fa21b0b24b37))
* **uiGridHeader:** stop preserving explicit header heights when styles are rebuilt. (#3705) ([76e18d6](https://github.com/angular-ui/ui-grid/commit/76e18d6faa9fff5bd866312e3bf1989528d6f9eb))
* **uiGridGroupPanel:** Cleaning up dead code. (#4059) ([ded2c12](https://github.com/angular-ui/ui-grid/commit/ded2c127962d6cd3a21f0f8e25bc0118233bbb02))


#### Features

* **Excel export:**  Adds ability to export as Excel with the help of Excel-builder. ([dc7d773](https://github.com/angular-ui/ui-grid/commit/dc7d7733b3989eba372d4e912b0d3189b59d23ca))

<a name="v4.0.10"></a>
### v4.0.10 (2017-11-11)


#### Features

* **hidePin:** Added option to hide pinLeft or pinRight from pinning menu (#6334) ([145e3662](http://github.com/angular-ui/ng-grid/commit/145e36623f08dd7749ee54aad8eaa07c7318bcc4))
* **tree-view:** Supports recursive expanding ([48434903](http://github.com/angular-ui/ng-grid/commit/48434903937ce93bae208a026da9d4daa032c12d))

<a name="v4.0.9"></a>
### v4.0.9 (2017-11-11)

#### Bug Fixes

* **selection:** Adjust bug in checkbox for selection. (#6459) ([adfc83c](https://github.com/angular-ui/ui-grid/commit/adfc83c667c395e9bfee404270f8de5b212cfd91))
* **exporterAllDataFn:** exporterAllDataFn results is no longer ignored. (#6163) ([f16cdb0](https://github.com/angular-ui/ui-grid/commit/f16cdb06860dcd416520a48586b49d0dd50a1966))
* **resizing:** Fix zero delta on double click resizing. (#5362) ([8dd0359](https://github.com/angular-ui/ui-grid/commit/8dd035999054837b2a1f62fb4535542620ca4e59))


#### Features

* **tree-view:** Supports recursive expanding ([4843490](https://github.com/angular-ui/ui-grid/commit/48434903937ce93bae208a026da9d4daa032c12d))
* **hidePin:** Added option to hide pined containers from pinning menu. ([145e366](https://github.com/angular-ui/ui-grid/commit/145e36623f08dd7749ee54aad8eaa07c7318bcc4))


<a name="v4.0.8"></a>
### v4.0.8 (2017-11-06)


#### Bug Fixes

* **ARIA-Roles:** Improving accessibility of ui-grid. (#6341) ([6cf44b4b](http://github.com/angular-ui/ng-grid/commit/6cf44b4bea55e9e3883dc00ada9fe3593b538a4f))
* **Grid.js:**
  * add column header to text read by aria when user moves through grid with keyboar ([a6b52c2a](http://github.com/angular-ui/ng-grid/commit/a6b52c2a3e143fa36929ad0f850a026080656ea2))
  * wrong  use in getCellDisplayValue ([57d258e9](http://github.com/angular-ui/ng-grid/commit/57d258e900fdfc1ac312edf1951edb3e04f48e76))
* **core:** Fixes URL-based template loading for `header-cell`, `footer-cell`, `filter`. ([f0b2fa7d](http://github.com/angular-ui/ng-grid/commit/f0b2fa7d85b5e731e37f9b0ef7ab306f27bfdb3a))
* **edit:** trigger edit when single click when set enableCellEditOnFocus with true ([bcbd8433](http://github.com/angular-ui/ng-grid/commit/bcbd8433dcb8e69d13ea4281f426febf226986aa))
* **pagination:** remove unneeded height adjustment ([4c667e72](http://github.com/angular-ui/ng-grid/commit/4c667e721cd3273e4a34f5000bd75c8fecdec631))
* **selection:** Prevent space bar scrolling (#6410) ([7dbf3955](http://github.com/angular-ui/ng-grid/commit/7dbf3955208496514ccf2d37d5af8e9f71ae8611))
* **utils.js:** Update browser setting based on changes to SauceLabs. ([0cdf4e93](http://github.com/angular-ui/ng-grid/commit/0cdf4e9385423d0d6f02ca45e6dc40217cb66719))

<a name="v4.0.7"></a>
### v4.0.7 (2017-09-27)


#### Bug Fixes

* **build:** Cope with tags not conforming to semver format when building. (#6376) ([1248e5a3](http://github.com/angular-ui/ng-grid/commit/1248e5a3209595fc232de992880d5de9d6397201))
* **i18n:** Fixed i18n typo in German language (#6262) ([02a6a68d](http://github.com/angular-ui/ng-grid/commit/02a6a68d52d064f5fa9cc0c2d47f1588ba71f912))
* **rowEdit:** cancel rowEditSaveTimer on flushDirtyRows - may cause double row save ([6711c725](http://github.com/angular-ui/ng-grid/commit/6711c725f634a1a755316269ce840ec1633109cb))
* **scrollEvent:** Prevent scrollEvent when scroll percentage is greater then 1. (#6241) ([43ffebba](http://github.com/angular-ui/ng-grid/commit/43ffebbad73d9d4b4c4bc982d15872fb2a378f6f))
* **ui-grid.info:**
  * Removing unknown broken link. ([2968158c](http://github.com/angular-ui/ng-grid/commit/2968158c5fec17576fe88f8be6e366ef7330fc98))
  * Fix broken customizer url on homepage (#5976) ([209fc1d6](http://github.com/angular-ui/ng-grid/commit/209fc1d68769fe1918d88f3accf5cd6e48f64acb))
* **cellnav.js:** trim text of DOM element before checking ([84ea8fa](https://github.com/angular-ui/ui-grid/commit/84ea8fa8db9c9979ee46452a773ae7da028d0dc2))
* **gridEdit.js:** verify that the keyCode is greater than zero ([5ccd7f3](https://github.com/angular-ui/ui-grid/commit/5ccd7f3645e20f1f514f2a549cf831b63e35aadf))
* **Grid.js:**
  * Fixed grid height growing indefinitely with auto-resize. ([553d72b](https://github.com/angular-ui/ui-grid/commit/553d72bc4153dc5945978c9f7ece8bcb0040cccc))
  * "selectAll" header sync with the actual selection state of the row. ([aae3f9d](https://github.com/angular-ui/ui-grid/commit/aae3f9d965b1e39a32d1471fcd025afeb3d006b6))
* **ui-grid-menu:** Menu Items's title can now be a function. ([df10da9](https://github.com/angular-ui/ui-grid/commit/df10da916eb52ffe5636041b56eb88242ecfdd0d))
* **selection.less:** Focus on selection mark of unselected rows was hardly visible. ([d1aee28](https://github.com/angular-ui/ui-grid/commit/d1aee28b01782b42061e2599c5b285399ec144fa))


#### Features

* **cellnav:**
  * output aria text for cells that come from selection feature - works on IE with J ([151f32b9](http://github.com/angular-ui/ng-grid/commit/151f32b904145893c9e6d51c8350814be70b5dc8))
  * output aria text for cells that come from selection feature ([6d951b2a](http://github.com/angular-ui/ng-grid/commit/6d951b2a7ac33f53b8512a6f3ad5d5498cd079c9))
* **gridEdit:** Pass triggerEvent to cellEditableCondition fn call ([219ea716](http://github.com/angular-ui/ng-grid/commit/219ea7165ff1f6030c7d125550020181fa1fc3ae))


#### Breaking Changes

* Menu Items's title should now be a function
 ([df10da91](https://github.com/angular-ui/ui-grid/commit/df10da916eb52ffe5636041b56eb88242ecfdd0d#diff-3baddc9493adec1550b73c74401d4b46))

<a name="v4.0.6"></a>
### v4.0.6 (2017-06-14)


#### Bug Fixes

* **5007:**
  * Reduced the amount of digest cycles initiated by the grid. ([d0bc03d9](http://github.com/angular-ui/ng-grid/commit/d0bc03d960cf06a85f8819a1d227b47d1cedc527))
  * Reduced the amount of digest cycles initiated by the grid. ([bd51855f](http://github.com/angular-ui/ng-grid/commit/bd51855fe00dac4e932f854c1d3d5116beef5678))
  * Reduced the amount of digest cycles initiated by the grid. ([75f98c3e](http://github.com/angular-ui/ng-grid/commit/75f98c3eda3e46f14f9d924e6f5a6d6e35bcc2b5))
* **6160:** Select childrens of row group (#6167) ([21819c57](http://github.com/angular-ui/ng-grid/commit/21819c57474bf4451f3126985cfccf294c4c01e2))
* **build:**
  * Fixing test expectations since removal of close button. ([5bf9400a](http://github.com/angular-ui/ng-grid/commit/5bf9400aed4520010cfc04b3bbe91b6183092884))
  * Removing performance improvements from ui-grid-util.js and comma separated vars. ([738df91f](http://github.com/angular-ui/ng-grid/commit/738df91fd61642e2d31cec8a7381f0083dbfb338))
  * Updating protractor and selenium dependencies. (#6034) ([ca0c0368](http://github.com/angular-ui/ng-grid/commit/ca0c03683878889a5d9c40b4f2cac7ff32ee5b64))
* **protractor:** Fixing npm so protractor can be installed and run locally. ([724df352](http://github.com/angular-ui/ng-grid/commit/724df3520ccc1d5f585fcc42508a537935875da2))
* **shell.js:** Adding windows support. ([5e438643](http://github.com/angular-ui/ng-grid/commit/5e438643ea06e06455e91f9d0368f0021b8ef9c8))
* **sort:** Fixing sorting priority aria-label ([a364886f](http://github.com/angular-ui/ng-grid/commit/a364886f37a2685500643d5df05b4c936dcd42a5))


#### Features

* **saveState:** change restore() to return Promise created by refresh() (#6178) ([f380055b](http://github.com/angular-ui/ng-grid/commit/f380055b58e3a42ee922c36812aa316cfef34174))
* **sorting:** Default sorting ([e629bc69](http://github.com/angular-ui/ng-grid/commit/e629bc695d4e98a04710478310729aabf53853a1))

<a name="v4.0.5"></a>
### v4.0.5 (2017-06-14)


#### Bug Fixes

* **5007:**
  * Reduced the amount of digest cycles initiated by the grid. ([d0bc03d9](http://github.com/angular-ui/ng-grid/commit/d0bc03d960cf06a85f8819a1d227b47d1cedc527))
  * Reduced the amount of digest cycles initiated by the grid. ([bd51855f](http://github.com/angular-ui/ng-grid/commit/bd51855fe00dac4e932f854c1d3d5116beef5678))
  * Reduced the amount of digest cycles initiated by the grid. ([75f98c3e](http://github.com/angular-ui/ng-grid/commit/75f98c3eda3e46f14f9d924e6f5a6d6e35bcc2b5))
* **6160:** Select childrens of row group (#6167) ([21819c57](http://github.com/angular-ui/ng-grid/commit/21819c57474bf4451f3126985cfccf294c4c01e2))
* **build:**
  * Fixing test expectations since removal of close button. ([5bf9400a](http://github.com/angular-ui/ng-grid/commit/5bf9400aed4520010cfc04b3bbe91b6183092884))
  * Removing performance improvements from ui-grid-util.js and comma separated vars. ([738df91f](http://github.com/angular-ui/ng-grid/commit/738df91fd61642e2d31cec8a7381f0083dbfb338))
  * Updating protractor and selenium dependencies. (#6034) ([ca0c0368](http://github.com/angular-ui/ng-grid/commit/ca0c03683878889a5d9c40b4f2cac7ff32ee5b64))
* **protractor:** Fixing npm so protractor can be installed and run locally. ([724df352](http://github.com/angular-ui/ng-grid/commit/724df3520ccc1d5f585fcc42508a537935875da2))
* **shell.js:** Adding windows support. ([5e438643](http://github.com/angular-ui/ng-grid/commit/5e438643ea06e06455e91f9d0368f0021b8ef9c8))
* **sort:** Fixing sorting priority aria-label ([a364886f](http://github.com/angular-ui/ng-grid/commit/a364886f37a2685500643d5df05b4c936dcd42a5))
* **ui-grid-menu.js:** Removed log debug statement (#5388) ([7efe5304](https://github.com/angular-ui/ui-grid/commit/7efe5304f015714c8ba742bafe9a96ba80971622))


#### Features

* **saveState:** change restore() to return Promise created by refresh() (#6178) ([f380055b](http://github.com/angular-ui/ng-grid/commit/f380055b58e3a42ee922c36812aa316cfef34174))
* **sorting:** Default sorting ([e629bc69](http://github.com/angular-ui/ng-grid/commit/e629bc695d4e98a04710478310729aabf53853a1))

<a name="v4.0.4"></a>
### v4.0.4 (2017-04-04)


#### Bug Fixes

* **6123:** Allowing selection and tree-base to build columns. ([2ea9a06e](http://github.com/angular-ui/ng-grid/commit/2ea9a06e594601cc44947a997f08bce628e813f4))
* **flatEntityAccess:**  getCellDisplayValue now returns the correct value. ([ba77c875](http://github.com/angular-ui/ng-grid/commit/ba77c8750431236ff4f729fe8a77eb44cbbfc9b7))
* **japanese:** Update japanese translation. ([47e78d1](https://github.com/angular-ui/ui-grid/commit/47e78d16710a96033c692f800c5bb4874f694fc8)), closes [#6089](https://github.com/angular-ui/ui-grid/issues/6089)

<a name="v4.0.3"></a>
### v4.0.3 (2017-03-24)


#### Bug Fixes

* **6061:** Translated missing resources to Norwegian in no.js ([c6b0592d](http://github.com/angular-ui/ng-grid/commit/c6b0592dc1223b412985b6a3f41fbcb55038a25e))
* **Grid:** Add missing promise wait in refresh(). (#5934) ([e23a2af3](http://github.com/angular-ui/ng-grid/commit/e23a2af3bd796d5ed3e247bbc67d53cf24e91963))
* **Grid.js:** Reducing amount of digests cycles triggered. ([205a2151](http://github.com/angular-ui/ng-grid/commit/205a2151e7d1d31dd6a78866d0413d97487769bf))
* **Grid.refresh:** Refreshing canvas after processing. ([e6ab96bb](http://github.com/angular-ui/ng-grid/commit/e6ab96bbae7d1ec5848a65974f5addea8e012589))
* **SauceLabs:** Updating Sauce Labs scripts per suggestion. ([ccd0bef3](http://github.com/angular-ui/ng-grid/commit/ccd0bef30c748c7dd4eb74e9f951787256c1ec25))
* **gridMenu:** Fixing gridMenu undefined error. ([2f5ac879](http://github.com/angular-ui/ng-grid/commit/2f5ac879f27c90ff8de6ff873414a59dfc8cd2cd))
* **enableColumnResizing:** enableColumnResizing accumulates watchers with each table $digest cycle (#5933) ([954bebad](http://github.com/angular-ui/ng-grid/commit/954bebad33f6a4442658db1a100687a9cd4574cb))
* **ui-grid-util:** Reducing amount of digests triggered by ui-grid-util. ([1f116fe8](http://github.com/angular-ui/ng-grid/commit/1f116fe88094d178af11f9925b822fb9643779d0))
* **uiGridDirective:** Reducing digest cycles and improving coverage. ([56f0dc11](http://github.com/angular-ui/ng-grid/commit/56f0dc11978b9231373435d9e73da81375b5cda7))


#### Features

* **themes:** Adding a new paper theme to the customizer tool and more features to that grid. ([30f64925](http://github.com/angular-ui/ng-grid/commit/30f64925af90cff9c6b3506fb354ee883c41a3f5))

<a name="v4.0.2"></a>
### v4.0.2 (2016-12-30)


#### Bug Fixes

* **bower and npm:** Fixing bower.json and package.json configuration. ([84b4f328](http://github.com/angular-ui/ng-grid/commit/84b4f3284e5d928e6dc713f4c33a29d0d233ae52))
* **memory_leaks:** Ensuring events get unbound when grid is destroyed. (#5913) ([da942e90](http://github.com/angular-ui/ng-grid/commit/da942e90f082b851a08a3114813af88cc5d8b85e))
* **modifyRows:** modifyRows uses the new entity when using enableRowHashing ([138d1499](http://github.com/angular-ui/ng-grid/commit/138d14994d240764f7be71d25c3034e2eaadb0a7))


#### Features

* **core:** expose GridMenuTemplate ([5f15eab5](http://github.com/angular-ui/ng-grid/commit/5f15eab5f9234d47de5d45def65829b3818922ef))

<a name="v4.0.1"></a>
### v4.0.1 (2016-12-15)


#### Bug Fixes

* **core:** Adding back digest triggers when using $timeout ([d8820874](http://github.com/angular-ui/ng-grid/commit/d8820874312250919a64d0dbfa26b6a6f7e6286b))

<a name="v4.0.0"></a>
## v4.0.0 (2016-12-09)


#### Bug Fixes

* Fix for dropdown losing focus when using scrollToFocus from another editfield ([02110029](http://github.com/angular-ui/ng-grid/commit/02110029cf9a5a8096f64db48c1d9b0798ea127e))
* **5515:** Fix validation documentation ([b017d7f0](http://github.com/angular-ui/ng-grid/commit/b017d7f0541b869239326f5263dfa25f6cef7a7b))
* **cellnav:** when grid has only one focusable column, should navigate up and down ([d3801bad](http://github.com/angular-ui/ng-grid/commit/d3801bad38055afe624c1a2b25a416cd5c8d8d16))
* **core:** Do not clear condition when clearing all filters ([97be89a2](http://github.com/angular-ui/ng-grid/commit/97be89a2e7ce4bd7636c4812893959b3608e383d), closes [#4657](http://github.com/angular-ui/ng-grid/issues/4657))
* **edit:** fix boolean edit issue on Firefox and Safari on macOS ([2059db95](http://github.com/angular-ui/ng-grid/commit/2059db95adcf3fcb6a44e8b04bd045920a71b6d0))
* **fonts:** Ensuring that fonts are added to the ui-grid package. (#5844) ([8096ed04](http://github.com/angular-ui/ng-grid/commit/8096ed043bd33f8b401817296f74e94dbf35ea3d))
* **infinite-scroll:** Remove returns of adjustInfiniteScrollPosition. ([156665f7](http://github.com/angular-ui/ng-grid/commit/156665f7e41054d9ca8ad6989fe325b69282fb45))
* **pagination:**
  * off-by-one error ([29fdb7cd](http://github.com/angular-ui/ng-grid/commit/29fdb7cd485607e0c7e579df82880b4aceae0d35))
  * Refactor 'getLastRowIndex' to call 'getFirstRowIndex' ([13bf8079](http://github.com/angular-ui/ng-grid/commit/13bf80796e0e8b60109c6875de26c6c5bdeb2c8d))


#### Features

* **Scrolling:** Adding support for a custom scroller. (#5859) ([3c6fcb44](http://github.com/angular-ui/ng-grid/commit/3c6fcb44e8514cb2ac076a667d637e4b60c3a907))
* **core:** Reduce digest triggers when using $timeout ([7e25a9b1](http://github.com/angular-ui/ng-grid/commit/7e25a9b1b5d8278e8122b793adc6a657931f7f4f))
* **emptyBaseLayer:** made emptyBaseLayer module to create grid background ([852f6993](http://github.com/angular-ui/ng-grid/commit/852f6993978638697cfed6d2fb4f2a0d7cbb3de2))
* **pagination:** Add custom pagination with variable page sizes ([50880578](http://github.com/angular-ui/ng-grid/commit/50880578f6adcbd9ad59b55b157d94aa4151aaef))


#### Breaking Changes

* UI Grid is no longer compatible with
angular versions below 1.4
 ([4341af5e](http://github.com/angular-ui/ng-grid/commit/4341af5e47974e318a44951b72d93168bed445e2))

<a name="v3.2.9"></a>
### v3.2.9 (2016-09-21)


#### Bug Fixes

* #5667 honor editModelField when checking new vs old cell value ([d846c5b1](http://github.com/angular-ui/ng-grid/commit/d846c5b1d4fb5896285d9467bd6964b71b6e55e6))
* use grid headerHeight instead of random 30px value for menu height calculation ([5a67dd82](http://github.com/angular-ui/ng-grid/commit/5a67dd82c43b621aedb53efacf5f9530f60e8995))
* prevent hidden columns triggering unnecessary re-order ([8413d8e3](http://github.com/angular-ui/ng-grid/commit/8413d8e30e7ddf815a5b429378bcb9547bf3c695))
* update bower.json and package.json to include files for current npm ([6e2331b7](http://github.com/angular-ui/ng-grid/commit/6e2331b726bd08b209ca3927eb6074d4f1c8d6dd))
* Wrong sort priorities 4653 and 4196 ([17296cdc](http://github.com/angular-ui/ng-grid/commit/17296cdcd57a67b16168128444b2c87d914b9ec2))
* **3901:** Raise rowsVisibleChanged on setVisibleRows. ([801042b9](http://github.com/angular-ui/ng-grid/commit/801042b96d7530f5e0b04397bbe597056e1b06d6))
* **col-movable:** prevent hidden columns triggering unnecessary re-order event ([644b324b](http://github.com/angular-ui/ng-grid/commit/644b324b42e83cf8014ffcd05acc948084698aaa))
* **columnMoving:** handle touch events properly when jQuery is used (#5666) ([a81e5d5e](http://github.com/angular-ui/ng-grid/commit/a81e5d5e16f5b323d8d202e464a828dfce8d7f78))
* **filter:** Fix noTerm option for filtering ([45bb113a](http://github.com/angular-ui/ng-grid/commit/45bb113a861525cd93ca63514376d7fe2890d18a))
* **selection:** remove a logic bug in setSelected(..) ([57cdb31b](http://github.com/angular-ui/ng-grid/commit/57cdb31b8653e19ed306a9a54055c5060adbbf1b))


#### Features

* **core:** Allow binding a column to the row entity itself ([65e49fd5](http://github.com/angular-ui/ng-grid/commit/65e49fd59a165672c71738e4ba7df553e7f6e673))
* **filter:** Add rawTerm option to columnDef filter options ([a75e65a6](http://github.com/angular-ui/ng-grid/commit/a75e65a6d866de174c0021dcfa6aa766e38a240d))

<a name="v3.2.8"></a>
### v3.2.8 (2016-09-09)


#### Bug Fixes

* #5667 honor editModelField when checking new vs old cell value ([d846c5b1](http://github.com/angular-ui/ng-grid/commit/d846c5b1d4fb5896285d9467bd6964b71b6e55e6))
* Wrong sort priorities 4653 and 4196 ([17296cdc](http://github.com/angular-ui/ng-grid/commit/17296cdcd57a67b16168128444b2c87d914b9ec2))
* **columnMoving:** handle touch events properly when jQuery is used (#5666) ([a81e5d5e](http://github.com/angular-ui/ng-grid/commit/a81e5d5e16f5b323d8d202e464a828dfce8d7f78))
* **filter:** Fix noTerm option for filtering ([45bb113a](http://github.com/angular-ui/ng-grid/commit/45bb113a861525cd93ca63514376d7fe2890d18a))


#### Features

* **core:** Allow binding a column to the row entity itself ([65e49fd5](http://github.com/angular-ui/ng-grid/commit/65e49fd59a165672c71738e4ba7df553e7f6e673))

<a name="v3.2.7"></a>
### v3.2.7 (2016-09-09)


#### Bug Fixes

* #5667 honor editModelField when checking new vs old cell value ([d846c5b1](http://github.com/angular-ui/ng-grid/commit/d846c5b1d4fb5896285d9467bd6964b71b6e55e6))
* Wrong sort priorities 4653 and 4196 ([17296cdc](http://github.com/angular-ui/ng-grid/commit/17296cdcd57a67b16168128444b2c87d914b9ec2))
* **columnMoving:** handle touch events properly when jQuery is used (#5666) ([a81e5d5e](http://github.com/angular-ui/ng-grid/commit/a81e5d5e16f5b323d8d202e464a828dfce8d7f78))
* **filter:** Fix noTerm option for filtering ([45bb113a](http://github.com/angular-ui/ng-grid/commit/45bb113a861525cd93ca63514376d7fe2890d18a))
* **runValidators:** runValidators now returns a promise(..) ([f3bf313](http://github.com/angular-ui/ng-grid/commit/57cdb31b8653e19ed306a9a54055c5060adbbf1b))


#### Features

* **core:** Allow binding a column to the row entity itself ([65e49fd5](http://github.com/angular-ui/ng-grid/commit/65e49fd59a165672c71738e4ba7df553e7f6e673))

<a name="v3.2.6"></a>
### v3.2.6 (2016-07-14)


#### Bug Fixes

* use grid headerHeight instead of random 30px value for menu height calculation ([5a67dd82](http://github.com/angular-ui/ng-grid/commit/5a67dd82c43b621aedb53efacf5f9530f60e8995))
* prevent hidden columns triggering unnecessary re-order ([8413d8e3](http://github.com/angular-ui/ng-grid/commit/8413d8e30e7ddf815a5b429378bcb9547bf3c695))
* update bower.json and package.json to include files for current npm ([6e2331b7](http://github.com/angular-ui/ng-grid/commit/6e2331b726bd08b209ca3927eb6074d4f1c8d6dd))
* **col-movable:** prevent hidden columns triggering unnecessary re-order event ([644b324b](http://github.com/angular-ui/ng-grid/commit/644b324b42e83cf8014ffcd05acc948084698aaa))
* **selection:** remove a logic bug in setSelected(..) ([57cdb31b](http://github.com/angular-ui/ng-grid/commit/57cdb31b8653e19ed306a9a54055c5060adbbf1b))

<a name="v3.2.5"></a>
### v3.2.5 (2016-07-01)

* update for package.json creation for npm

<a name="v3.2.4"></a>
### v3.2.4 (2016-06-30)


#### Bug Fixes

* update bower.json and package.json to include files for current npm ([f7c6700d](http://github.com/angular-ui/ng-grid/commit/f7c6700dedacfa213eaa65838d127aab0bf24867))
* **col-movable:** prevent hidden columns triggering unnecessary re-order event ([644b324b](http://github.com/angular-ui/ng-grid/commit/644b324b42e83cf8014ffcd05acc948084698aaa))

<a name="v3.2.3"></a>
### v3.2.3 (2016-06-29)

<a name="v3.2.2"></a>
### v3.2.2 (2016-06-29)


#### Bug Fixes

* **col-movable:** prevent hidden columns triggering unnecessary re-order event ([644b324b](http://github.com/angular-ui/ng-grid/commit/644b324b42e83cf8014ffcd05acc948084698aaa))

<a name="v3.2.1"></a>
### v3.2.1 (2016-06-24)

#### Bug Fixes

* **col-movable:** prevent hidden columns triggering unnecessary re-order event ([644b324b](http://github.com/angular-ui/ng-grid/commit/644b324b42e83cf8014ffcd05acc948084698aaa))

<a name="v3.2.0"></a>
## v3.2.0 (2016-06-20)

#### Bug Fixes

* Incorrect scroll percentage calculation in scrollHorizontal method ([f075dcbe](http://github.com/angular-ui/ng-grid/commit/f075dcbe36f1c617a2baa233deebe2e42cc854c9))
* Introduce gridDimensionChanged event ([40ec65c0](http://github.com/angular-ui/ng-grid/commit/40ec65c0501d29d94f3d369d8e8f24b4d575cd0d), closes [#5090](http://github.com/angular-ui/ng-grid/issues/5090))
* **cellNav:** notifyText incorrect if cellFilter had string literal parameter (#5404) ([08a9b687](http://github.com/angular-ui/ng-grid/commit/08a9b687697fe3b9592ef563a2c2ffc832bb95e0))
* **core:**
  *  add row headers in order ([572766de](http://github.com/angular-ui/ng-grid/commit/572766deec7a7d4b815b8d8d5bd30fd6c02e5a09))
  *  sort priorities were not displaying when 2nd sort was added ([47c77de4](http://github.com/angular-ui/ng-grid/commit/47c77de40c9a54ace853e297a0940053c10fea4a))
  * add false flag to $timeout and $interval to prevent $apply Nice increase in scro ([4ba28205](http://github.com/angular-ui/ng-grid/commit/4ba28205926ac98d16873db3c92866ff47d362fa))
  * Sort Priority Zero Based ([62dbcfe9](http://github.com/angular-ui/ng-grid/commit/62dbcfe917235d827ac09755f37d0896904a99b0), closes [#4685](http://github.com/angular-ui/ng-grid/issues/4685))
  * correct filter detection in autoAdjustHeight ([31c8e9e8](http://github.com/angular-ui/ng-grid/commit/31c8e9e8375236938c8244d87ac7f5d10bd4efe0))
* **expandable:** Stop adding Expandable column and behavior if feature is disabled ([0bb1208c](http://github.com/angular-ui/ng-grid/commit/0bb1208cd5a6cf664c8eecdf9b544d936712b494))
* **exporter:**
  * remove coma since we use set columnseperator or default,addition to #5130 ([d0e40eb7](http://github.com/angular-ui/ng-grid/commit/d0e40eb7b652b17d63f6660b229cff6e51d37c3e))
  * use boolean ieVersion for csv export ([17b1a0a4](http://github.com/angular-ui/ng-grid/commit/17b1a0a4a4432046e5aea022265967cee60290c1))
  * pass column seperator options as param to downloadFile ([aa9b7793](http://github.com/angular-ui/ng-grid/commit/aa9b7793bbd73ce7d70f8a67cd214372579b0a2a))
* **filter:** Custom Filter fix (#4012) ([d6d00c21](http://github.com/angular-ui/ng-grid/commit/d6d00c2142ed870ca5f29cccdd3e218b8d83a408))
* **getTemplate:** Updated custom templates as promises condition (#5311) ([01cdfe41](http://github.com/angular-ui/ng-grid/commit/01cdfe413389aa4e7dbb2874d46035f217b60b57))
* **i18n:** Add japanese translation ([805c8805](http://github.com/angular-ui/ng-grid/commit/805c880567b0f35a35b3c03f340276821c3f7966))
* **infinitescroll:** make sure more data is always loaded if scrolled to top/bottom quickly (#5183) ([49536222](http://github.com/angular-ui/ng-grid/commit/49536222de1a0d0b710713b67eaf007d0f80232f))
* **saveState:** - Allow saving of pagination state ([c6d3b2a1](http://github.com/angular-ui/ng-grid/commit/c6d3b2a1f3df9e7374c91280b243d5592013f7a6), closes [#4146](http://github.com/angular-ui/ng-grid/issues/4146))
* **util:** deltaMode being set to 0 (#5155) ([8e5d4c4d](http://github.com/angular-ui/ng-grid/commit/8e5d4c4d0f5bddf50bd2f2dec8fe23a087289181))


#### Features

* **expandable:** Add 'expandRow', 'collapseRow' and 'getExpandedRows' ([005ca6a5](http://github.com/angular-ui/ng-grid/commit/005ca6a54c10ad60188cfb9529f92353f80cbd57))


#### Breaking Changes

* It is possible that your application will show row headers in a different order after this change.
If you are adding rowHeaders, use the new order parameter in grid.addRowHeader(colDef, order) to specify where you
want the header column.
 ([572766de](http://github.com/angular-ui/ng-grid/commit/572766deec7a7d4b815b8d8d5bd30fd6c02e5a09))
* **GridOptions.columnDef.sort.priority** now expects the lowest value
to be 0.
The Grid Header will display a sort priority of 0 as 1.
Using `if(col.sort.priority)` to determine if a column is sorted is no
longer valid as `0 == false`.
Saved grid objects may be affected by this.
 ([62dbcfe9](http://github.com/angular-ui/ng-grid/commit/62dbcfe917235d827ac09755f37d0896904a99b0))

<a name="v3.1.1"></a>
### v3.1.1 (2016-02-09)


#### Bug Fixes

* **core:**
  *  sort priorities were not displaying when 2nd sort was added ([47c77de4](http://github.com/angular-ui/ng-grid/commit/47c77de40c9a54ace853e297a0940053c10fea4a))
  * add false flag to $timeout and $interval to prevent $apply Nice increase in scro ([4ba28205](http://github.com/angular-ui/ng-grid/commit/4ba28205926ac98d16873db3c92866ff47d362fa))
  * Sort Priority Zero Based ([62dbcfe9](http://github.com/angular-ui/ng-grid/commit/62dbcfe917235d827ac09755f37d0896904a99b0), closes [#4685](http://github.com/angular-ui/ng-grid/issues/4685))
  * correct filter detection in autoAdjustHeight ([31c8e9e8](http://github.com/angular-ui/ng-grid/commit/31c8e9e8375236938c8244d87ac7f5d10bd4efe0))
* **i18n:** Add japanese translation ([805c8805](http://github.com/angular-ui/ng-grid/commit/805c880567b0f35a35b3c03f340276821c3f7966))
* **saveState:** - Allow saving of pagination state ([c6d3b2a1](http://github.com/angular-ui/ng-grid/commit/c6d3b2a1f3df9e7374c91280b243d5592013f7a6), closes [#4146](http://github.com/angular-ui/ng-grid/issues/4146))


#### Features

* **expandable:** Add 'expandRow', 'collapseRow' and 'getExpandedRows' ([005ca6a5](http://github.com/angular-ui/ng-grid/commit/005ca6a54c10ad60188cfb9529f92353f80cbd57))


#### Breaking Changes

* **GridOptions.columnDef.sort.priority** now expects the lowest value
to be 0.
The Grid Header will display a sort priority of 0 as 1.
Using `if(col.sort.priority)` to determine if a column is sorted is no
longer valid as `0 == false`.
Saved grid objects may be affected by this.
 ([62dbcfe9](http://github.com/angular-ui/ng-grid/commit/62dbcfe917235d827ac09755f37d0896904a99b0))

<a name="v3.1.0"></a>
## v3.1.0 (2016-01-17)


#### Bug Fixes

* **core:**
  * fix #4592.  this in link functions = window, not the directive. I could not find ([cad146bd](http://github.com/angular-ui/ng-grid/commit/cad146bd5c8a36b2c9ad7e023895aafbf54dce0e))
  * Fix #4776 scrollTo doesn't work with higher rowHeight ([0d7d37bb](http://github.com/angular-ui/ng-grid/commit/0d7d37bb6dfac4be9c6f0fcaccf8d73657417f63))
  * Column Menu Hidden by Hiding Column ([b54cc344](http://github.com/angular-ui/ng-grid/commit/b54cc344b0a0e0a31e3778aa7c9b1ee8d09ad546), closes [#3953](http://github.com/angular-ui/ng-grid/issues/3953))
  * Return promise from `handleWindowResize` method ([ad0095eb](http://github.com/angular-ui/ng-grid/commit/ad0095eb85c66154395c1bc64b553fffa1621c7d))
* **edit:** Change setViewValue to use a fromCharCode based on evt.which ([f4054b79](http://github.com/angular-ui/ng-grid/commit/f4054b79017ee55869ffe18ba29d684dd1313d79))
* **grid:** adjust grid height when initial height is equal to row height ([33b4d6d2](http://github.com/angular-ui/ng-grid/commit/33b4d6d2b2f4f5ff9b64e1cc3cc658dc267b7266))
* **grouping:** When 'field' in columnDef is referred to some javascript object than a primitive ([d6320636](http://github.com/angular-ui/ng-grid/commit/d632063647787dae2d6641933d44c74887b7ecd9))
* **move-columns:** Fix #3448 - The issue is caused by setting a left position to moving element rel ([ab0dc113](http://github.com/angular-ui/ng-grid/commit/ab0dc1136db20cc5201c38ecf418ffa34fa3ccde))
* **uiGrid:** Fix race condition in data watcher ([b22681a3](http://github.com/angular-ui/ng-grid/commit/b22681a3e70675983a8247d01d39df96d9646118), closes [#4532](http://github.com/angular-ui/ng-grid/issues/4532))


#### Features

* **edit:** add a function to retrieve dropdown options ([480927ff](http://github.com/angular-ui/ng-grid/commit/480927ffdd6ae1e4951c149a925e2dae5e2352fc))
* **i18n:**
  * turkish(tr) translation fix ([05715b8b](http://github.com/angular-ui/ng-grid/commit/05715b8b23f45b16c93385cd2d235cc306a68b1e))
  * turkish(tr) translation ([4d147574](http://github.com/angular-ui/ng-grid/commit/4d147574d69b5416e5ba99f7a5a0718af118a30c))
  * improve da translation ([70fdf8df](http://github.com/angular-ui/ng-grid/commit/70fdf8df18c0a9319379cfcc7441c98465a6d63d))
* **sort:** sort priority indicator hiding ([7725eac3](http://github.com/angular-ui/ng-grid/commit/7725eac316ffc48f63792b0ba7e4b898b4663467))

<a name="v3.0.7"></a>
### v3.0.7 (2015-10-06)


#### Bug Fixes

* **Header:** Use IE9 condcom to fix header sizing ([a549eaa7](http://github.com/angular-ui/ng-grid/commit/a549eaa76c4a0fcb9cfd48f62cb4081b7734caf8), closes [#3854](http://github.com/angular-ui/ng-grid/issues/3854)) <b>(REVERTED [#4417](https://github.com/angular-ui/ui-grid/pull/4417))</B>
* **core:**
  * Fixes sort priority starting at 2 ([c910a6a3](http://github.com/angular-ui/ng-grid/commit/c910a6a318fd6ae832e3265a9220c43431f7e97c))
  * scrollTo rightBound calculation ([28227877](http://github.com/angular-ui/ng-grid/commit/2822787719f230808898b940f04bc7d63c0869f5))
* **infinite-scroll:** load more data if needed ([65a541f3](http://github.com/angular-ui/ng-grid/commit/65a541f39c708a070244e09aa0c7bbe4b0506eff))
* **pagination:** fix pager select not showing 3 digits on some browsers ([b183fc79](http://github.com/angular-ui/ng-grid/commit/b183fc79f785a8ff433cc52538b872a874c7732a))
* **selection:**
  * properly update selectAll flag based on current selection ([86badfd2](http://github.com/angular-ui/ng-grid/commit/86badfd2562e21179175b0974829ff7c159fc218))
  * reset selectedCount on clearSelectedRows If your data  is completely replaced by ([880ce190](http://github.com/angular-ui/ng-grid/commit/880ce1905fbefcb822b0a20f4c7b183ba9b09f79))


#### Features

* **core:**
  * add sortDirectionCycle column option ([3eca46e9](http://github.com/angular-ui/ng-grid/commit/3eca46e99766eb0cc9f330948f68739dbf7d7bff))
  * Adds sort priority number to header ([ca47b8ab](http://github.com/angular-ui/ng-grid/commit/ca47b8abd7d114cb7622cd8c08a677e25134d268))
* **i18n:** completes nl translation ([b7326d81](http://github.com/angular-ui/ng-grid/commit/b7326d814938f079e32ef574c9503c7ae40c4244))
* **sort:** Give more information to the sort functions ([0e094c97](http://github.com/angular-ui/ng-grid/commit/0e094c97fc55d064150e1a33a3042c5091327be3))

<a name="v3.0.6"></a>
### v3.0.6 (2015-09-07)


#### Bug Fixes

* **gridUtil:** Fixes gridUtil.off.mousewheel event handler ([4057c64d](http://github.com/angular-ui/ng-grid/commit/4057c64d89d8c762b156961d565b65f9d9340749))
* **infiniteScroll:** Fixes infinitescroll scrolling
* **moveColumns:** Restore column order after altering columnDefs array. ([2d433bb](http://github.com/angular-ui/ng-grid/commit/2d433bb40ff089223dd019f35543a65d3d801a84))
* **pinnedColums:** Included pinned columns in export of visibile data. ([0b37bc4](http://github.com/angular-ui/ng-grid/commit/0b37bc403d3326514485e2c5a1a2bbed2a84ca65)), closes ([#3888](http://github.com/angular-ui/ng-grid/issues/3888))

<a name="v3.0.5"></a>
### v3.0.5 (2015-08-25)


#### Bug Fixes

* **cellNav:** Error when field defined with number ([5b74559f](http://github.com/angular-ui/ng-grid/commit/5b74559f3f2a34cbe3e4b1eca7c6e8df35b2d392), closes [#4258](http://github.com/angular-ui/ng-grid/issues/4258))
* **columns:** don't reset resized columns on data reset by default ([bda48aab](http://github.com/angular-ui/ng-grid/commit/bda48aabeb7898d63d5e05244fe88b37ba552899), closes [#4005](http://github.com/angular-ui/ng-grid/issues/4005))
* **core:**
  * fix #4180 by adding validity check for minWidth and maxWidth ([5b03cb2d](http://github.com/angular-ui/ng-grid/commit/5b03cb2da798c298eb78d2e2dfdf55bbb3d4bc51))
  * IE does not render correctly when binding is used in style. use ng-style instead ([9aea44ac](http://github.com/angular-ui/ng-grid/commit/9aea44ac78c3f27b1fbc2c0b70760511c5b37030))
* **customizer:** Fixes less customizer in docs ([f739d9fd](http://github.com/angular-ui/ng-grid/commit/f739d9fd88abef67172496b8dab4c257ed8a7b09), closes [#4079](http://github.com/angular-ui/ng-grid/issues/4079), [#3918](http://github.com/angular-ui/ng-grid/issues/3918))
* **edit:** fixes #4129 by only adding edit listener events when needed because of 'track by ([e6bc3009](http://github.com/angular-ui/ng-grid/commit/e6bc3009612570a4197aa50d8a908c6e99e8fe35))
* **expandable:** fix #4156 by calling stopProp on subgrid scroll ([a7dd337a](http://github.com/angular-ui/ng-grid/commit/a7dd337a7225941aeb203628d249bb7b173a5471))
* **less:** Makes less bootstrap dir a variable ([654c75f9](http://github.com/angular-ui/ng-grid/commit/654c75f9a9ded0a1d1e70a1e23668cd7fc4da03f), closes [#3368](http://github.com/angular-ui/ng-grid/issues/3368))
* **pagination:** avoid initial double firing of `paginationChanged` ([1407038b](http://github.com/angular-ui/ng-grid/commit/1407038b206a8cdc4590d84d079ed22b3d087853))


#### Features

* **core:**
  * Adds GridRowColumn to core ([2bed5307](http://github.com/angular-ui/ng-grid/commit/2bed5307c11e3882860c73f6d5f7e9a14d8adf74))
  * Add Clear all filters to grid menu ([77ffba5a](http://github.com/angular-ui/ng-grid/commit/77ffba5abf7b9efbbf63f37f13e2b94b9b8a483d))
* **i18n:** Completes zh-cn translation. ([0ad28408](http://github.com/angular-ui/ng-grid/commit/0ad28408c60ef7187f4a4e61efda9e0c62d79452))

<a name="v3.0.4"></a>
### v3.0.4 (2015-08-13)


#### Bug Fixes

* **grouping:** Grouping now raises a sort changed event ([d30b1ad3](http://github.com/angular-ui/ng-grid/commit/d30b1ad343ace939bf165bad2b061638a1404692), closes [#4155](http://github.com/angular-ui/ng-grid/issues/4155))

<a name="v3.0.3"></a>
### v3.0.3 (2015-08-10)


#### Bug Fixes

* **build:** Fixes Grunt Task not Publishing ([7571028d](http://github.com/angular-ui/ng-grid/commit/7571028d70069fed63bee65aadd606b5caf41ac6))

<a name="v3.0.2"></a>
### v3.0.2 (2015-08-10)


#### Bug Fixes

* flushDirtyRows will not throw an error when no dirty rows ([d46d04ca](http://github.com/angular-ui/ng-grid/commit/d46d04ca3574630ae09eae687e4cf4ea620c4321))
* **Build:**
  * Allow Angular 1.3.x upper constraint ([13d93f4e](http://github.com/angular-ui/ng-grid/commit/13d93f4e10f1f5e0fd7409eb258692876ed0f1b7), closes [#4064](http://github.com/angular-ui/ng-grid/issues/4064))
  * Handle -stable suffix for stable files ([f6c881e9](http://github.com/angular-ui/ng-grid/commit/f6c881e91d3eb26a8ed26d42189790b37b32f82f))
* **Grid:** Allow >45k row identities ([d533200f](http://github.com/angular-ui/ng-grid/commit/d533200f7e3702e61115e2e507f4201f9ba08319))
* **cellNav:** cellNav not getting attached to left container if it is built after body is rend ([36f386f4](http://github.com/angular-ui/ng-grid/commit/36f386f48419b378b93bd11da2914fb7c9649e35))
* **core:**
  * consider enableFiltering in autoAdjustHeight ([43974c48](http://github.com/angular-ui/ng-grid/commit/43974c48784bc5a2b61e6050489160c82131537c))
  * fix template issue in angular 1.2 ([d9c50cf3](http://github.com/angular-ui/ng-grid/commit/d9c50cf39b9b03c06bddf8515f07cbb9d9f60470))
* **edit:**
  * fix for Chrome and numeric inputs ([7d8af94c](http://github.com/angular-ui/ng-grid/commit/7d8af94c41baa0c7f81dce9fe7786dab814e9b8c))
  * selecting text no longer required on editor After implementing viewPortKeyPress, ([d609a108](http://github.com/angular-ui/ng-grid/commit/d609a108402293f49220d1523a9089ddd390aa78))
  * add/remove mousedown events in cellNav on beginEdit/endEdit A recent change by A ([708231f9](http://github.com/angular-ui/ng-grid/commit/708231f9f6e1f12f0f0f7d15eb8415dd0a7b7f11))


#### Features

* **cellNav:** Accessibility Support to Cell Nav ([9532de2b](http://github.com/angular-ui/ng-grid/commit/9532de2bdb083a0bb40a6099924e98893ab354e7), closes [#3896](http://github.com/angular-ui/ng-grid/issues/3896))
* **core:**
  * Two new directives to one bind ([a9d2f903](http://github.com/angular-ui/ng-grid/commit/a9d2f903848786fa09122354cfd00e11abbdb627))
  * grid menus accessible ([1d577b15](http://github.com/angular-ui/ng-grid/commit/1d577b1514c26fc005a47506a600b38d8d271a9a))
  * Accessibility and keyboard support to the grid header. ([1f1de5a4](http://github.com/angular-ui/ng-grid/commit/1f1de5a40ddf12311d719a7b58c1bbcd4b999612))
  * Accessibility and keyboard support to the filter controls. ([11a1ae55](http://github.com/angular-ui/ng-grid/commit/11a1ae55d4e4b6dab58f192eec9e6ddd34730446))
  * Basic screen reader accessibility functionality ([377485a4](http://github.com/angular-ui/ng-grid/commit/377485a47dcb32868f155c880108e3f07ec74820))
* **edit:** raise beginCellEdit in timeout allows complex editors time to render so they can ([6b5807fe](http://github.com/angular-ui/ng-grid/commit/6b5807fe5ddd0bba9a4b7535d5109923a1981388))
* **gridUtil:** Focus helper functions ([94e50a53](http://github.com/angular-ui/ng-grid/commit/94e50a532f7cef928385a5922169a88309c013b6))
* **i18n:**
  * Create ta.js ([40c58651](http://github.com/angular-ui/ng-grid/commit/40c58651baa3a008149bf79abd55875d8a7ae823))
  * accessibility i18n terms to 'en' ([e5c82998](http://github.com/angular-ui/ng-grid/commit/e5c8299839000ebba88fa43011f3778918c51b0b))
* **pagination:** Accessibiliy & Keyboard Support to Pagination Controls ([ee04132a](http://github.com/angular-ui/ng-grid/commit/ee04132a9857d64919c860c329fe09e27d9091fa))

<a name="v3.0.0"></a>
## v3.0.0 (2015-07-17)


#### Bug Fixes

* **Grid:** Force scroll to 100% when necessary ([3bcbe72d](http://github.com/angular-ui/ng-grid/commit/3bcbe72de0f296eedbeeca28f09600c0721824ba), closes [#3772](http://github.com/angular-ui/ng-grid/issues/3772))
* **Tests:** All e2e tests working in Firefox ([b9cc39f1](http://github.com/angular-ui/ng-grid/commit/b9cc39f1e067a318a38d1390ed4d20695a6a282e))
* **core:**
  * change scrollbar-placeholder background-color to transparent ([18a487ea](http://github.com/angular-ui/ng-grid/commit/18a487ea3b009beb9b584f446d8f0dfabe64304d))
  * add a horizontal scrollbar placeholder when needed ([365f21f0](http://github.com/angular-ui/ng-grid/commit/365f21f0bb8383c2103af0dea6e3a03986db0c04))
  * fix #3666 #3531 #3340 thanks to @500tech-user and @Jacquelin for PR's that led t ([e582174a](http://github.com/angular-ui/ng-grid/commit/e582174a826bb232ddbb4fda8001b64c3273df0d))
* **edit:** fix lost focus and cell scrolling into view on edit ([e9a6d4eb](http://github.com/angular-ui/ng-grid/commit/e9a6d4eba67dba23c42b54b23054c048cf9d8ebc))
* **grouping:** grouping a pinned column was broken ([acb7e7b6](http://github.com/angular-ui/ng-grid/commit/acb7e7b636aa9215b2463a2d4282261e95ef87f0))
* **i18n:** Replace ZWNJ with \u200c in Persian ([2f2936ae](http://github.com/angular-ui/ng-grid/commit/2f2936ae48df6fd9392f9f2ce9dc8369ac9c8261), closes [#3842](http://github.com/angular-ui/ng-grid/issues/3842))

<a name="v3.0.0-rc.22"></a>
### v3.0.0-rc.22 (2015-06-15)


#### Bug Fixes

* **Edit:** Allow COL_FIELD in editable templates ([fa9066b2](http://github.com/angular-ui/ng-grid/commit/fa9066b263f3ae27c085c85db07561e90fad10bd))
* **Selection:** Prevent IE from selecting text ([a1bbc0c5](http://github.com/angular-ui/ng-grid/commit/a1bbc0c57148076ddf5b988acc9abb748cbca1e6), closes [#3392](http://github.com/angular-ui/ng-grid/issues/3392))
* **cellNav:**
  * #3528  handle focus into grid from other controls ([92477c7a](http://github.com/angular-ui/ng-grid/commit/92477c7ad97f439582039b574baa2286f724d0ef))
  * IE was scrolling the viewPort to the end when the focuser div received focus.  S ([aa563554](http://github.com/angular-ui/ng-grid/commit/aa56355469e0c2fe825f6c063bb2e2f7937817c7))
  * focuser element should not have width or height or else the window will scroll t ([6997d2b7](http://github.com/angular-ui/ng-grid/commit/6997d2b7365e5fad79f0568d5f6a41d3600d69c0))
  * was processing left and right renderContainers where there is no need fix(edit): ([6f5d503d](http://github.com/angular-ui/ng-grid/commit/6f5d503d48c5871a4fd04918a6a6269758ef9bf7))
  *  add an empty element to focus on instead of focusing on the viewport ([6937d4d5](http://github.com/angular-ui/ng-grid/commit/6937d4d56d722e8e23c6c0b19e917f8bdc3d8be6))
* **edit:**
  * #3128 remove grid scrollbars when in deepedit to prevent any scrolling of parent ([91077e82](http://github.com/angular-ui/ng-grid/commit/91077e828f450bbb7cb0c76404686110f700e396))
  * deep edit keydown logic wasn't right ([9e995e9e](http://github.com/angular-ui/ng-grid/commit/9e995e9e58582a6c190657c62ddf47632dc38045))
  * tweak the deep edit keydown logic so that Enter and Tab stops editing ([fbc38cb1](http://github.com/angular-ui/ng-grid/commit/fbc38cb17e314ceb48c887b03a9256199f101fe6))
  * #3742 dropdown was not calling out to cellNav for cellNav keys. also refactored  ([2edc4d66](http://github.com/angular-ui/ng-grid/commit/2edc4d66193b37734733b2a8a1999921426424b2))
  * Edit events were being attached in gridCell directive even if edit was not enabl ([13ab0945](http://github.com/angular-ui/ng-grid/commit/13ab0945a17597c9a7048fdb95936662a0cfdd82))
* **gridEdit:**
  * #3373 spacebar on checkbox was incorrectly invoking deep edit mode ([4d9ec8b5](http://github.com/angular-ui/ng-grid/commit/4d9ec8b5774b6beeaab05909a7a493aa6f16e72c))
  * issue 2885 non-character fields were invoking edit.  Not sure if I got all the k ([025c8939](http://github.com/angular-ui/ng-grid/commit/025c89397184ba44d65b7ad457546538e0cb3f22))
* **gridUtil:** rtlScrollType using wrong method ([15ee480e](http://github.com/angular-ui/ng-grid/commit/15ee480ef1ad34f1bd99de1f3ddfaa9730998c07), closes [#3637](http://github.com/angular-ui/ng-grid/issues/3637))
* **moveColumn:** account for width of left container when positioning moving column header. ([06f223bb](http://github.com/angular-ui/ng-grid/commit/06f223bbeb8cf8a82dd70142ab8d46f051df12be), closes [#3417](http://github.com/angular-ui/ng-grid/issues/3417), [#3395](http://github.com/angular-ui/ng-grid/issues/3395))
* **saveState:** Saving state was storing rowHeader columns, causing issues on restore. ([c9ce96af](http://github.com/angular-ui/ng-grid/commit/c9ce96af75ffde134dba3b8c319b301f41781c33))
* **treeBase:** Change calculation of number of levels in tree ([26ca6215](http://github.com/angular-ui/ng-grid/commit/26ca621594252f2e8b87687b2667b3e8d2e36226))
* **uiGrid:**
  * Add relatively-positioned wrapper ([9b2c6d51](http://github.com/angular-ui/ng-grid/commit/9b2c6d515968d0502a5a7fa1b6b6f15693669715), closes [#3412](http://github.com/angular-ui/ng-grid/issues/3412))
  * Use track by uid on columns ([e9ea9d47](http://github.com/angular-ui/ng-grid/commit/e9ea9d470823506b76458b9071cd16c3d08fb9e6))
* **uiGridColumns:** Fix auto-incrementing of column names ([a10f1414](http://github.com/angular-ui/ng-grid/commit/a10f141444043589ecc87a79f74938d1640cdc40))
* **uiGridHeader:**
  * ensure that styles are rebuilt on explicit height ([65ad61f4](http://github.com/angular-ui/ng-grid/commit/65ad61f4439983179be4d44bac3a6cc9151ac094))
  * Recalc all explicit heights ([43f63ac9](http://github.com/angular-ui/ng-grid/commit/43f63ac9f62a133b51d7af2f4a966318eae8e9ac), closes [#3136](http://github.com/angular-ui/ng-grid/issues/3136))


#### Features

* **grouping:** Add option groupingNullLabel, to group null and undefined values together. ([9fbb1b87](http://github.com/angular-ui/ng-grid/commit/9fbb1b874ecd773649bb27f9eea145b017614e51), closes [#3271](http://github.com/angular-ui/ng-grid/issues/3271))

<a name="v3.0.0-rc.21"></a>
### v3.0.0-rc.21 (2015-04-28)


#### Bug Fixes

* **Expandable:** Run with lower priority than ngIf ([949013c3](http://github.com/angular-ui/ng-grid/commit/949013c332c5af1b3e37b1d3fa515dfd96c8acb2), closes [#2804](http://github.com/angular-ui/ng-grid/issues/2804))
* **RTL:**
  * Use Math.abs for normalizing negatives ([4acbdc1a](http://github.com/angular-ui/ng-grid/commit/4acbdc1a58d8043d60e3a62d1126b0f69bc6ee86))
  * Use feature detection to determine RTL ([fbb36319](http://github.com/angular-ui/ng-grid/commit/fbb363197ab3975411589dfa0904495f861795c0), closes [#1689](http://github.com/angular-ui/ng-grid/issues/1689))
* **cellNav:** fix null ref issue in  navigate event for oldRowColumn  scrollTo should not setF ([02b05cae](http://github.com/angular-ui/ng-grid/commit/02b05cae6d5385e01d00f812662f16009130c647))
* **pinning:** restore correct width state ([4ffaaf26](http://github.com/angular-ui/ng-grid/commit/4ffaaf26774bae7f52bf4956f45243f6c7dd53a3))
* **scrolling:** Fix for #3260  atTop/Bottom/Left/Right needed tweaking ([89461bcb](http://github.com/angular-ui/ng-grid/commit/89461bcbcfdfc527655c398df19555738fa9bd63))
* **selection:**
  * allow rowSelection to be navigable if using cellNav; allow rowSelection via the  ([95ce7b1b](http://github.com/angular-ui/ng-grid/commit/95ce7b1b694b23f1a7506cf4f6a32d0ae384697c))
  * allow rowSelection to be navigable if using cellNav; allow rowSelection via the  ([3d5d6031](http://github.com/angular-ui/ng-grid/commit/3d5d603178f0fcb4cc2abab6ce637c1dd6face8d))
* **uiGrid:**
  * Use margins rather than floats for pinning ([1373b99e](http://github.com/angular-ui/ng-grid/commit/1373b99e1e1680184270d61bca88124efd7a4c14), closes [#2997](http://github.com/angular-ui/ng-grid/issues/2997), [#NaN](http://github.com/angular-ui/ng-grid/issues/NaN))
  * Wait for grid to get dimensions ([e7dfb8c2](http://github.com/angular-ui/ng-grid/commit/e7dfb8c2dfac69bb3a38f7253062367671fec56d))
* **uiGridColumnMenu:** Position relatively ([9d918052](http://github.com/angular-ui/ng-grid/commit/9d9180520d8d6fd16b897ba4b9fbfc4bb4860ea9), closes [#2319](http://github.com/angular-ui/ng-grid/issues/2319))
* **uiGridFooter:** Watch for col change ([1f9100de](http://github.com/angular-ui/ng-grid/commit/1f9100defb1489bed46515fb859aed9c9a090e73), closes [#2686](http://github.com/angular-ui/ng-grid/issues/2686))
* **uiGridHeader:**
  * Use parseInt on header heights ([98ed0104](http://github.com/angular-ui/ng-grid/commit/98ed01049015b22caddb651b1884f6e383fc58aa))
  * Allow header to shrink in size ([7c5cdca1](http://github.com/angular-ui/ng-grid/commit/7c5cdca1f471a0a3c1ef340fe65af268df68cae3), closes [#3138](http://github.com/angular-ui/ng-grid/issues/3138))


#### Features

* **saveState:** add pinning to save state ([b0d943a8](http://github.com/angular-ui/ng-grid/commit/b0d943a82a1d5c64808b759c8b96833e66380b02))


#### Breaking Changes

* gridUtil will no longer calculate dimensions of hidden
elements
 ([e7dfb8c2](http://github.com/angular-ui/ng-grid/commit/e7dfb8c2dfac69bb3a38f7253062367671fec56d))
*  Two events are now emitted on scroll:

 grid.api.core.ScrollBegin
 grid.api.core.ScrollEnd

 Before:
 grid.api.core.ScrollEvent
 After:
grid.api.core.ScrollBegin

ScrollToIfNecessary and ScrollTo moved from cellNav to core and grid removed from arguments
Before:
grid.api.cellNav.ScrollToIfNecessary(grid, gridRow, gridCol)
grid.api.cellNav.ScrollTo(grid, rowEntity, colDef)

After:
grid.api.core.ScrollToIfNecessary(gridRow, gridCol)
grid.api.core.ScrollTo(rowEntity, colDef)

GridEdit/cellNav
When using cellNav, a cell no longer receives focus.  Instead the viewport always receives focus.  This eliminated many bugs associated with scrolling and focus.

If you have a custom editor, you will no longer receive keyDown/Up events from the readonly cell.  Use the cellNav api viewPortKeyDown to capture any needed keydown events.  see GridEdit.js for an example
 ([052c2321](http://github.com/angular-ui/ng-grid/commit/052c2321f97b37f860c769dcbd2e8d9094cf2bbf))

<a name="v3.0.0-rc.20"></a>
### v3.0.0-rc.20 (2015-02-24)


#### Bug Fixes

* **Edit:** Wrong arguments on scrollToIfNecessary ([0fc6b21c](http://github.com/angular-ui/ng-grid/commit/0fc6b21ceff002226697e5d3520b6d4f8374b678))
* **Filtering:** Redraw grid properly when scrolled ([4c32e3d7](http://github.com/angular-ui/ng-grid/commit/4c32e3d77a1dce55a9354ad4e9d8f59b9fe2732f), closes [#2557](http://github.com/angular-ui/ng-grid/issues/2557))
* **Grid:**
  * fix buildColumns handling same field ([dd6dc150](http://github.com/angular-ui/ng-grid/commit/dd6dc1505b68a865b1c37197c133acbf5a5e58e0), closes [#2789](http://github.com/angular-ui/ng-grid/issues/2789))
  * Redraw needs scrollTop when adding rows ([509e0071](http://github.com/angular-ui/ng-grid/commit/509e0071b1929adecb6e75be20166902a70452ad))
  * Adjust available width for columns ([cf86090f](http://github.com/angular-ui/ng-grid/commit/cf86090f66ee057f541961d563ca42597112bdb4), closes [#2521](http://github.com/angular-ui/ng-grid/issues/2521), [#2734](http://github.com/angular-ui/ng-grid/issues/2734), [#2592](http://github.com/angular-ui/ng-grid/issues/2592))
  * Alter mousewheel event handling ([382f0aed](http://github.com/angular-ui/ng-grid/commit/382f0aeda61a5afde845c8faaed7b04def6fa162))
* **Pinning:** Move rowStyle() to uiGridViewport ([09f478c2](http://github.com/angular-ui/ng-grid/commit/09f478c2af4a5f47f8b144484fe71b96f62aa64b), closes [#2821](http://github.com/angular-ui/ng-grid/issues/2821))
* **Scrolling:** Don't trap scroll at 100% down ([78a4b433](http://github.com/angular-ui/ng-grid/commit/78a4b433b4f186a23a2ec35afe88660f8f361119))
* **cellNav:** Allow tabbing out of grid ([aabcd4da](http://github.com/angular-ui/ng-grid/commit/aabcd4da564391296d182d78415ab51f9853df64), closes [#2339](http://github.com/angular-ui/ng-grid/issues/2339))
* **uiGridHeader:**
  * Refresh grid with new header ([d841b92b](http://github.com/angular-ui/ng-grid/commit/d841b92b8538f0683a2b4dbaf3d84c1273459eaa), closes [#2822](http://github.com/angular-ui/ng-grid/issues/2822))
  * Fix dynamic header heights ([893bb13e](http://github.com/angular-ui/ng-grid/commit/893bb13e08c3c8fac9e886b5021777d752761c2d))
  * Fix header height growth bug ([fee00cdf](http://github.com/angular-ui/ng-grid/commit/fee00cdfa5aeaeb5a10db8ea71e64035eb39bba0), closes [#2781](http://github.com/angular-ui/ng-grid/issues/2781))
* **uiGridRenderContainer:**
  * Use header min-height ([4381ca58](http://github.com/angular-ui/ng-grid/commit/4381ca5857ac09a5e752a95bf18a0356e58de9f8), closes [#2768](http://github.com/angular-ui/ng-grid/issues/2768))
  * Don't reverse X delta ([7a0e075d](http://github.com/angular-ui/ng-grid/commit/7a0e075d73bc9ff876466754404ba6f41decdcfd))

<a name="v3.0.0-rc.19"></a>
### v3.0.0-rc.19 (2015-02-11)


#### Bug Fixes

* **Filtering:** Let mobile devices tap filter box ([01c22acf](http://github.com/angular-ui/ng-grid/commit/01c22acf18847cc7646e405c13f50cb0b0407835))
* **Grid:**
  * Add css to allow iOS momentum scroll ([48fd5021](http://github.com/angular-ui/ng-grid/commit/48fd5021a19e3792dbc04de55770bfc26a95ce53), closes [#2671](http://github.com/angular-ui/ng-grid/issues/2671))
  * Allow col reordering with column defs ([865573cd](http://github.com/angular-ui/ng-grid/commit/865573cd61df80ed5de22b8fd5da424d4c9dcd8b), closes [#1948](http://github.com/angular-ui/ng-grid/issues/1948))
  * refactor(core) ui-grid $parent scope is now automatically assigned to grid.appScope.  gridOptions.appScopeProvider can be used to assign anything to grid.appScope

* **GridColumn:** Allow for duplicate field coldefs ([82a72130](http://github.com/angular-ui/ng-grid/commit/82a7213057a7d4c559e470c534a6ca834cad2fb6), closes [#2364](http://github.com/angular-ui/ng-grid/issues/2364))
* **GridRenderContainer:** Redraw with scroll % ([bc2c68ab](http://github.com/angular-ui/ng-grid/commit/bc2c68aba48cdd5a3e840a589fb90cdba363618c), closes [#2357](http://github.com/angular-ui/ng-grid/issues/2357))
* **Mobile:**
  * Don't prevent default container touches ([8fe4e498](http://github.com/angular-ui/ng-grid/commit/8fe4e498caca973c6bcaac737841e38875ed9d37))
  * Allow either touch and mouse events ([654e0ce8](http://github.com/angular-ui/ng-grid/commit/654e0ce83f1ebd824341ab3d63b6d38495a67b80))
  * Bind only to touch or mouse events ([995d3c47](http://github.com/angular-ui/ng-grid/commit/995d3c472530407d19124e622c570fa65319e6fb))
* **Selection:** Fix selection w/ row templates ([b1a57b69](http://github.com/angular-ui/ng-grid/commit/b1a57b693fb9715198f42d411345ed18548a660b))
* **Tests:**
  * Mistakenly using classList ([04d2fa69](http://github.com/angular-ui/ng-grid/commit/04d2fa694a8e0b02baaf6dcabd4b882c72a4157d))
  * Use fork of csv-js ([ef78823c](http://github.com/angular-ui/ng-grid/commit/ef78823c380dd2ed48829a02d27bdf7f395f23d3))
  * angular 1.3 compiles style blocks ([c7b0a66f](http://github.com/angular-ui/ng-grid/commit/c7b0a66fd42f14b2f6626660aff97d6ca6ab6c67))
  * Add global for Protractor ([77969eb6](http://github.com/angular-ui/ng-grid/commit/77969eb6500aa4384286a939eefa8c4ef0332960))
  * Allow touch event simulation ([2dc02753](http://github.com/angular-ui/ng-grid/commit/2dc0275391b37a1a316dee8a1418c200da5f4347))
* **Tutorials:** Point back to angular 1.2.26 ([96625e2a](http://github.com/angular-ui/ng-grid/commit/96625e2ac8924051e6b6ec00224e565884a6fdbf))
* **cellNav:** If cellNav api exists, turn on stuff ([14264540](http://github.com/angular-ui/ng-grid/commit/14264540c4402e77f1cb64458b568146457f6dbe), closes [#2294](http://github.com/angular-ui/ng-grid/issues/2294))
   *refactor(cellNav) remove unused $scope parameter from api methods
* **uiGridHeaderCell:**
  * Change test measure method ([7774d30e](http://github.com/angular-ui/ng-grid/commit/7774d30e6085a0f98850a94880961f0511ddce50))
  * Adjust test width measure ([1f786b9c](http://github.com/angular-ui/ng-grid/commit/1f786b9c05c5330480809645c4cd3b549861c720))
* **uiGridRow:**
  * Use promise to get compiled elm fn ([5160b805](http://github.com/angular-ui/ng-grid/commit/5160b8057301c773a3ec62dab43b5c29819737a8))
  * Fix memory leak ([64d3918b](http://github.com/angular-ui/ng-grid/commit/64d3918b55c5dcb01772697cf8fcfd10dac945a4))
* **edit:**   edit cell scope was not being destroyed when element was removed
* **gridApi** add ability to pass _this variable in api.feature.on.eventName

#### Performance
* **Grid** encapsulate the renderContainer canvasHeight and GridRow.height properties Changes getCanvasHeight function to only recalculate all the row heights when needed.  Adds a CanvasH
eightChanged event to api.core




#### Features

* **Core:** Implementation for #2483.  Adds a showGridFooter option that will create a grid  ([d0233601](http://github.com/angular-ui/ng-grid/commit/d0233601a67a445049a710fe84dacdb0b64c1c33))
          * Adds a showGridFooter option that will create a grid footer with the Total Items and Shown Items displayed.  Also shows Selected Items if using Selection feature.

* **cellnav:** provide row option to disallow all cells from having focus ([1bc05ebc](http://github.com/angular-ui/ng-grid/commit/1bc05ebc775a81fd164c562a343bb5d0dd7e7578))
* **uiGridRow:** Allow dynamic row templates ([a547a52e](http://github.com/angular-ui/ng-grid/commit/a547a52e7b699ffd33bd4c5eb661b22d4c066b39))


#### Breaking Changes
* getExternalScopes() function is removed.  Use grid.appScope instead.
  external-scopes attribute is removed.  Use gridOptions.appScopeProvider to assign values other than $scope.$parent to appScope

* removed scope parameter from grid.api.cellNav methods
  old:
     scrollTo($scope, rowEntity, colDef)
 	  scrollToFocus($scope, rowEntity, colDef)
 	  scrollToIfNecessary($scope, row, col)
 	 new:
     scrollTo(rowEntity, colDef)
 	  scrollToFocus(rowEntity, colDef)
 	  scrollToIfNecessary(row, col
* scrollbars.WHEN_NEEDED no longer an option
* showFooter option renamed to showColumnFooter;  footerRowHeight option renamed to columnFooterHeight
 ([d0233601](http://github.com/angular-ui/ng-grid/commit/d0233601a67a445049a710fe84dacdb0b64c1c33))
* On mobile devices the user will have to long-click to
edit a cell instead of double-clicking
 ([654e0ce8](http://github.com/angular-ui/ng-grid/commit/654e0ce83f1ebd824341ab3d63b6d38495a67b80))
* **rowEdit:** * remove grid from all method signatures
* **importer:** * remove grid from importFile signature
* **core:** * remove grid from notifyDataChange signature


<a name="v3.0.0-RC.18"></a>
### v3.0.0-RC.18 (2014-12-09)

#### Bug Fixes

* **Builds:** Switch to websockets to get SauceLabs tests running again

<a name="v3.0.0-RC.17"></a>
### v3.0.0-RC.17 (2014-12-08)


#### Bug Fixes

* **Aggregation:** Refactor introduced bug ([a54c6639](http://github.com/angular-ui/ng-grid/commit/a54c6639fb9db0dbb1e85346cd445f316f59c1f4))
* **Builds:** Turn off Safari 5 for SL ([3cf645ea](http://github.com/angular-ui/ng-grid/commit/3cf645eaaf3c119ee41822a2d1bee4a3c31b9c05))
* **Edit:** Remove leftover console.log() ([3b707584](http://github.com/angular-ui/ng-grid/commit/3b7075840bf6d4788f6c1786654372e90e7a4df3))
* **Header:** Hidden header height misplacement ([783fefbd](http://github.com/angular-ui/ng-grid/commit/783fefbd89ab51c7257c57c7e592c5aa086d664f), closes [#1995](http://github.com/angular-ui/ng-grid/issues/1995))
* **Pinning:** Add left border for right container ([e409c54b](http://github.com/angular-ui/ng-grid/commit/e409c54bef5cddc5dfeb4bd4e84d171114960d5a))
* **RTL:** Put filter cancel on left for RTL ([0885e509](http://github.com/angular-ui/ng-grid/commit/0885e509e9fe46e58f3b016e342088f138cb072c), closes [#2058](http://github.com/angular-ui/ng-grid/issues/2058))
* **Tests:** Accidentally left in a ddescribe ([e6cf438a](http://github.com/angular-ui/ng-grid/commit/e6cf438a6fda31338427c7bb51f0b998d9b351bb))
* **cellNav:** Don't setup when directive not there ([9bfa6e3f](http://github.com/angular-ui/ng-grid/commit/9bfa6e3f638548f3f78c565f142771ca65e580bd), closes [#2128](http://github.com/angular-ui/ng-grid/issues/2128))


#### Breaking Changes

* The `hideHeader` option has been changed to `showHeader`

To migrate, change your code from the following:

`hideHeader: true`

To:

`showHeader: false`
 ([783fefbd](http://github.com/angular-ui/ng-grid/commit/783fefbd89ab51c7257c57c7e592c5aa086d664f))

<a name="v3.0.0-rc.16"></a>
### v3.0.0-rc.16 (2014-11-13)


#### Bug Fixes

* **Edit:** Retain "focus" in endEdit() ([f3a45ef5](http://github.com/angular-ui/ng-grid/commit/f3a45ef51e5f49c11490654cb757b579163e45ba))
* **Filter:** Watch running w/o change check ([79f6c21a](http://github.com/angular-ui/ng-grid/commit/79f6c21a45fe11e4ae87f3dd6eda8326bcfbb265))
* **Grid:** Avoid too-early header height calc ([a335b922](http://github.com/angular-ui/ng-grid/commit/a335b9223c397dca31d5db82f48d62e9b7b43187))
* **GridRenderContainer:** Correct prevScroll* ([1182b059](http://github.com/angular-ui/ng-grid/commit/1182b059ce64b3b5b4e49054b4737684393e5a19))
* **Selection:** Change api for getSelectAllState() ([5ffefafc](http://github.com/angular-ui/ng-grid/commit/5ffefafc000351a71b269ce2265f2faddb35b6e7), closes [#2086](http://github.com/angular-ui/ng-grid/issues/2086))
* **cellNav:**
  * Don't lose focus with wrapping nav ([0e27c181](http://github.com/angular-ui/ng-grid/commit/0e27c1815d9fe1aabce2a9ba981bb75655f08979))
  * Minor fixes and speed improvement ([94a31149](http://github.com/angular-ui/ng-grid/commit/94a31149ca0282612d7dc85d87d2a68f2c12367c))
* **gridUtil:** Allow multiple logDebug params ([c903ecc8](http://github.com/angular-ui/ng-grid/commit/c903ecc89fabebceed576f4ca637bb3c5277a32c))
* **uiGrid:**
  * syntax error, change variable name ([63fedb6c](http://github.com/angular-ui/ng-grid/commit/63fedb6c87ac7b60d3362ce3f9359fdf070848ed))
  * syntax error, change variable name ([181dec76](http://github.com/angular-ui/ng-grid/commit/181dec76aed49ff03a7f2c329ae8b6d65bdd594e))
  * Fix race condition in data watcher ([2b25f249](http://github.com/angular-ui/ng-grid/commit/2b25f249cd133a02f44eec34ccee7f4e77adab16), closes [#2053](http://github.com/angular-ui/ng-grid/issues/2053))
* **uiGridMenu:** Only run applyHide when not shown ([91bf06f2](http://github.com/angular-ui/ng-grid/commit/91bf06f289632f331fd125851282cb9f5b499bd4))

<a name="v3.0.0-rc.15"></a>
### v3.0.0-rc.15 (2014-11-11)


#### Bug Fixes

* **uiGridRenderContainer:** Inherit position ([fd353287](http://github.com/angular-ui/ng-grid/commit/fd353287639276083340ef96aa82749367f1deef), closes [#2030](http://github.com/angular-ui/ng-grid/issues/2030))


#### Features

* **Interpolation:** Handle custom symbols ([555ddecd](http://github.com/angular-ui/ng-grid/commit/555ddecddeb967f338f8bdf4da814d74f8b44495), closes [#1576](http://github.com/angular-ui/ng-grid/issues/1576))

<a name="v3.0.0-rc.14"></a>
### v3.0.0-rc.14 (2014-11-05)


#### Bug Fixes

* **bower:** Use right angular version spec ([6bd917a0](http://github.com/angular-ui/ng-grid/commit/6bd917a05527afe7f75db51bdaff24b44f554fd9))

<a name="v3.0.0-rc.13"></a>
### v3.0.0-rc.13 (2014-11-05)


#### Bug Fixes

* **AutoResize:** Redraw all of grid on resize. ([1bb5367c](http://github.com/angular-ui/ng-grid/commit/1bb5367cb304baeee6ca4ecc084cbc02601fb6f6), closes [#1770](http://github.com/angular-ui/ng-grid/issues/1770))
* **Importer:** Account for older browsers properly ([52823249](http://github.com/angular-ui/ng-grid/commit/528232492ea9860390dd8da1a604103b25f33719))

<a name="v3.0.0-rc.12"></a>
### v3.0.0-rc.12 (2014-10-08)


#### Bug Fixes

* **Customizer:** Update column menu style ([ffa80002](http://github.com/angular-ui/ng-grid/commit/ffa80002c983b5eb60a4357ba2d7150682f343a2))
* **Grid:** Fix a few mobile-browser issues ([4bb2d699](http://github.com/angular-ui/ng-grid/commit/4bb2d6996aad6463155bcd01b1521441cab45270))
* **Pinning:** Fix pinning when col has dyanmic width ([9e022bab](http://github.com/angular-ui/ng-grid/commit/9e022babd07f6261ce6b4325b791c744da895f91), closes [#1634](http://github.com/angular-ui/ng-grid/issues/1634))
* **RTL:** Unfixed .css() call post-jquery ([8d31f6a1](http://github.com/angular-ui/ng-grid/commit/8d31f6a1a2ae68d9c9b40fa6a2bcd3ed47febe96), closes [#1620](http://github.com/angular-ui/ng-grid/issues/1620))
* **Selection:** Remove IE11 ellipsis in header ([a8ac76c6](http://github.com/angular-ui/ng-grid/commit/a8ac76c638c65ef3c9a062f9efb7847ebc5ddd94))
* **Site:** Fix version select box height ([d2699092](http://github.com/angular-ui/ng-grid/commit/d2699092b0fd882c6ed2999595d5805854fa8749))
* **Tests:** Date() usage failing on Safari 5 ([6440d81c](http://github.com/angular-ui/ng-grid/commit/6440d81c6d2ca2604aff5e0f8904a6e66093b8a9))
* **Travis:** Make travis run saucelabs tests ([3bc3f272](http://github.com/angular-ui/ng-grid/commit/3bc3f272986c2cae55f26bc6ef8dd8f5fa6ef401))
* **grunt:** Use correct version of grunt-jscs ([e88600a0](http://github.com/angular-ui/ng-grid/commit/e88600a0118af1535be2e4f66c0e09c41aa15efa))
* **uiGridCell:** Use promises for tmpl processing ([9fb29cce](http://github.com/angular-ui/ng-grid/commit/9fb29cce5ea5f67c43d2aa5926a4f7a8aa4ba81c), closes [#1712](http://github.com/angular-ui/ng-grid/issues/1712))
* **uiGridHeader:** Fix height calculations ([cfc24442](http://github.com/angular-ui/ng-grid/commit/cfc24442e08d6e9956c7f94159ddf30b7db185f7), closes [#1639](http://github.com/angular-ui/ng-grid/issues/1639), [#NaN](http://github.com/angular-ui/ng-grid/issues/NaN))
* **uiGridHeaderCell:** Use hasClass() for IE9 ([7923f229](http://github.com/angular-ui/ng-grid/commit/7923f229a4657538923a535bb7bd5d501320c3b8))
* **uiGridMenu:** Set box-sizing: content box ([ee418f0d](http://github.com/angular-ui/ng-grid/commit/ee418f0de9c6bf5c727d7eed7daa153dce1c5dd1))
* **uiGridUtil:** getBorderSize() missing "width" ([174f2521](http://github.com/angular-ui/ng-grid/commit/174f25214caa10ec643db6c81aaa0f3511bf78f4))


#### Features

* **cellTemplates:** add MODEL_COL_FIELD to cellTemplate parsing so it can be used in ng-model #1633  ([66f3404a](http://github.com/angular-ui/ng-grid/commit/66f3404ade7ead010142ecf047e863f526d960a3))


<a name="v3.0.0-rc.NEXT"></a>
### v3.0.0-rc.NEXT Current Master

#### Breaking Changes
* editableCellTemplates should use MODEL_COL_FIELD instead of COL_FIELD.
https://github.com/angular-ui/ng-grid/issues/1633 MODEL_COL_FIELD variable was added to the cellTemplate and editCellTemplate for utilizing the bound field in ng-model.  Edit feature
was changed to use MODEL_COL_FIELD instead of COL_FIELD for consistency.


<a name="v3.0.0-rc.11"></a>
### v3.0.0-rc.11 (2014-09-26)

<a name="v3.0.0-rc.10"></a>
### v3.0.0-rc.10 (2014-09-25)


#### Bug Fixes

* typo ([1272cf65](http://github.com/angular-ui/ng-grid/commit/1272cf65659a0e84102be9b1fa63f659437383ca))
* **CHANGELOG:** anchor tag for v2.0.7 was wrong ([d0ecd310](http://github.com/angular-ui/ng-grid/commit/d0ecd31061c6dc20fa6a558dbc9e696debf83874))
* **column-resizing:** 100% width/height not needed on ui-grid-cell-contents, just ui-grid-inner-cell-c ([6912d14f](http://github.com/angular-ui/ng-grid/commit/6912d14fe4222afe3468df846487b922741ac16b))
* **customizer:** point to ui-grid-unstable.css at top of page ([4892fbc4](http://github.com/angular-ui/ng-grid/commit/4892fbc4804c1bdf39ef6af07b51bcf753ef0849))
* **grunt:**
  * Add testDependencies file array to karma config for travis ([7a15fe42](http://github.com/angular-ui/ng-grid/commit/7a15fe42e85f11962e000fe34a1cb67d6a28ef5e))
  * typo ([0f641c0f](http://github.com/angular-ui/ng-grid/commit/0f641c0ff055f06ea50b54f86e6c686a2d69284b))
  * cut-release wasn't running done() ([025c61b2](http://github.com/angular-ui/ng-grid/commit/025c61b28807d0b6160bbb9d50b12ea42e881695))
  * Make getVersion() work on travis ([129f28b8](http://github.com/angular-ui/ng-grid/commit/129f28b8ae5c6c5678945fbd279c91788ea19a20))
* **less:** header variables were in file twice ([f93f675c](http://github.com/angular-ui/ng-grid/commit/f93f675c2bbb491ebe3fce27ebeb00e9adc5cca8))
* **travis:**
  *  Need only one script command in travis.yml ([2278c691](http://github.com/angular-ui/ng-grid/commit/2278c69122b9bd1b8aaf2225160e015b4a161fab))
  * had grunt args out of order ([c790245a](http://github.com/angular-ui/ng-grid/commit/c790245ace77b6856d4c046f3a08d4ded188648d))
  * use SauceLabs for e2e tests on travis ([5d8a21da](http://github.com/angular-ui/ng-grid/commit/5d8a21da57a466541aef5b16b032a21e46bbf15b))
  * accidentally switched a couple words ([d67c1871](http://github.com/angular-ui/ng-grid/commit/d67c1871a748d036cc386acc559a7dcfd80a32c3))
* **ui-grid-body:**
  * normalize mouse wheel events because browsers suck ([2075bf3c](http://github.com/angular-ui/ng-grid/commit/2075bf3c04e68b0bbedb378f6d16e7cfe5b4e149))
  * scrolling with mousewheel works ([7933c1a4](http://github.com/angular-ui/ng-grid/commit/7933c1a4f353aaebe5ecb2e9c06fd472564b8152))
* **uiGrid:**
  * introduced a bug that added columns over and over when data was swapped ([7fc55b5d](http://github.com/angular-ui/ng-grid/commit/7fc55b5d255b5940139717e35e891a7b3a5bee3a))
  * Fix elm height calc for hidden grids ([420a0dcf](http://github.com/angular-ui/ng-grid/commit/420a0dcf00351d3b5c256f38da1bc2796d869ddf))
* **uiGridCell:** re-compile if template changes ([7485e6ef](http://github.com/angular-ui/ng-grid/commit/7485e6efc8ee8105b3bb835e7f82d7f1997dcac6))
* **uiGridHeader:**
  * handle leftover pixels ([64941b3a](http://github.com/angular-ui/ng-grid/commit/64941b3a82b5ae72b1c75b1e46a6dfed2d68a696))
  * Fix header height calculation ([b1562854](http://github.com/angular-ui/ng-grid/commit/b1562854c808814695ab436b2ba63cd1afa28d4d))
* **uiGridStyle:** <br>s were being needlessly added ([ade12ec9](http://github.com/angular-ui/ng-grid/commit/ade12ec98f82400ddbc25ac2676fc88e66408164))


#### Features

* **AutoResize:** Adding auto-resize feature. ([d0bdd829](http://github.com/angular-ui/ng-grid/commit/d0bdd8295121a9b58a8a3f8ca3a52cdcba400fc0))
* **RTL:** Adding RTL support and fixing virtualization ([d5a9982d](http://github.com/angular-ui/ng-grid/commit/d5a9982d1f6562ad4a379cfcf53165247065fe3f))
* **Selection:** Updates ([b20c41c1](http://github.com/angular-ui/ng-grid/commit/b20c41c1715d7c5745bee7c3ea05ec585ab9bd16))
* **e2e:** protractor testing of docs now works properly with 'grunt dev' ([08787be4](http://github.com/angular-ui/ng-grid/commit/08787be454890a3fbaae324c6741670a59a50f3f))
* **filtering:** Add row filtering ([16161643](http://github.com/angular-ui/ng-grid/commit/16161643fa4eb925e816252937fadfabc59f55a0))
* **row-hashing:** Add new row hashing feature ([da87ff9a](http://github.com/angular-ui/ng-grid/commit/da87ff9a4082c0f9f8996d4bdb5225ce191392ef))
* **rowSort:** Added row sorting ([ce330978](http://github.com/angular-ui/ng-grid/commit/ce330978fe566e9695c30acef04e55221e520960))
* **uiGridStyle:** Added ui-grid-style directive ([5687723f](http://github.com/angular-ui/ng-grid/commit/5687723f318ac322fa84ce96cc9b7cb97e2946f2))

<a name="2.0.7"></a>
## 2.0.7 *(2013-07-01)*

### Features
This release is mainly focused on fixing the grid layout/column widths:

Columns
----------------------------------

*  Removed border-left and border-right from columns. Now we are using vertical bars so if someone sets a width to be 400px for a column, the column will actually be 400px, not 401-402px due to the border. This caused the horizontal overflowing to happen producing a horizontal scrollbar. This also fixed issues like https://github.com/angular-ui/ng-grid/issues/411 where you would see columns not extend all the way to the edge and you would get double borders
* Percent calculation is handled before asterisks calculations because percent calculation should take higher priority, and the asterisks calculations will then be able to fill the remaining space instead of horizontally overflowing the viewport


----------------------------------
A fix contributed by @swalters for #436:

Editing Cells
----------------------------------

When editing a cell, the ng-cell-has-focus directive will broadcast a message named ngGridEventStartCellEdit to let all children know that you can now give yourself focus. When the editable cell template is done with editing (usually on a blur event) you need to emit ngGridEventEndCellEdit to let ng-cell-has-focus know that you are done editing and it will then show the non-editable cell template. The reasoning for this is (good quote): "Now I can wrap my input elements in divs/spans, whatever and control exactly what element's blur triggers the end edit" - @swalters. An example (used for ng-input directive):

scope.$on('ngGridEventStartCellEdit', function () {
    elm.focus();
 });

angular.element(elm).bind('blur', function () {
    scope.$emit('ngGridEventEndCellEdit');
});

Also, there is another option now which is enableCellEditOnFocus (yes, it's coming back) so now you can choose between excel-like editing or enabling edit mode on focus.

----------------------------------
Also some fixes contributed by @ebbe-brandstrup are:

configureColumnWidths
----------------------------------
* Columns sized with * or % now expand / shrink as other * or %-based columns are hidden / shown
  * Note: the changes auto-expand/shrink only take effect on-the-fly
  * Works with grouping and when enabling the selection checkbox row (showSelectionCheckbox)
* Bugfixes in configureColumnWidths
  * Re-ordered columns now keep their width setup
  * Fixed "asteriskNum" so it no longer includes hidden columns (was checking .visible on a columnDefs column instead of the matching ngColumn)
  * Fixed "totalWidth" so it no longer includes hidden columns when using px values for width (was checking .visible on a columnDefs column instead of the matching ngColumn)
  * Fixed ngColumn width being initialized to undefined when using "auto" for width, regardless of "minWidth" settings (was checking .minWidth on a columnDefs column instead of the matching ngColumn)

Renamed "col" to "colDef" in configureColumnWidths() in the places where "col" was a column from "columnDefs". It made it clearer for me whether I was referring to a ngColumn or a column from columnDefs. There were a couple of bugs caused by that (col.visible incorrectly accessed on columnDefs objects instead of ngColumns, and the like).

ng-grid-flexible-height plugin
----------------------------------------
* Bugfixes in ng-grid-flexible-height
  * The plugin couldn't shrink the grid, only grow it
  * Using domUtilityService.UpdateGridLayout instead of grid.refreshDomSizes which correctly grows the grid if it's been shrunk (e.g. when paging to the last page and it has few rows + the plugin has a smaller min. height than what's needed on the other pages)

### Bug fixes
Too many to list. Here is the pull request https://github.com/angular-ui/ng-grid/pull/511


<a name="2.0.6"></a>
## 2.0.6 *(2013-06-?)*

### Features

- **Development**
  - Continuous integration testing with [Travis CI](https://travis-ci.org/angular-ui/ng-grid). A few tests that were looking for pixel perfection had to be relaxed due to rendering differences between browsers and OSes.
  - Moved this changelog to CHANGELOG.md!
  - Added tests for i18n languages. Any new language must cover all the properties that the default language (English) has.
  - CSS files compiling with less ([24bb173](https://github.com/angular-ui/ng-grid/commit/24bb173))
  - Added optional --browsers flag for test tasks. `grunt test --browsers=Chrome,Firefox,PhantomJS` will test in all 3 browsers at once.

- **Sorting**
  - Allow optional '+' prefix to trigger numerical sort ([f3aff74](https://github.com/angular-ui/ng-grid/commit/f3aff74), [8e5c0a1](https://github.com/angular-ui/ng-grid/commit/8e5c0a1))
  - Standardizing sort arrow direction (thanks @dcolens) ([9608488](https://github.com/angular-ui/ng-grid/commit/9608488))

- **i18n**
  - Added Brazilian Portugeuse (thanks @dipold) ([ab0f207](https://github.com/angular-ui/ng-grid/commit/ab0f207))

### Bug fixes

- Allow column `displayName` to be an empty string. ([#363](https://github.com/angular-ui/ng-grid/issues/363), [46a992f](https://github.com/angular-ui/ng-grid/commit/46a992f))
- Fix for `totalServerItems` not updating ([#332](https://github.com/angular-ui/ng-grid/issues/332), [#369](https://github.com/angular-ui/ng-grid/issues/369), [fcfe316](https://github.com/angular-ui/ng-grid/commit/fcfe316))
- Fixed regression in [2.0.5](#2.0.5) that used Array.forEach, which isn't supported in IE8. Moved to angular.forEach ([e4b08a7](https://github.com/angular-ui/ng-grid/commit/e4b08a7))
- Fixed and added tests for wysiwyg-export plugin ([57df36f](https://github.com/angular-ui/ng-grid/commit/57df36f))
- Fixed extraneous trailing comma ([#449](https://github.com/angular-ui/ng-grid/issues/449), [2c655c7](https://github.com/angular-ui/ng-grid/commit/2c655c7))
- **Cell editing** - various attempts at fixing broken cell editing eventually resulted in using [NgModelController](http://docs.angularjs.org/api/ng.directive:ngModel.NgModelController) (thanks @swalters). ([#442](https://github.com/angular-ui/ng-grid/issues/442), [050a1ba](https://github.com/angular-ui/ng-grid/commit/050a1ba), [5c82f9b](https://github.com/angular-ui/ng-grid/commit/5c82f9b), [5c82f9b](https://github.com/angular-ui/ng-grid/commit/5c82f9b), [f244363](https://github.com/angular-ui/ng-grid/commit/f244363), [ee2a5f1](https://github.com/angular-ui/ng-grid/commit/ee2a5f1))

<a name="2.0.5"></a>
## 2.0.5 *(2013-04-23)*

### Features

- Moving to $http for external template fetching. Should fix issues with grid rendering before templates are retrieved, as well as fetching the same template multiple times.

### Bug fixes

- Fixed bug that prevented the grid from maintaining row selections post-sort thanks to [sum4me](https://github.com/sum4me)

<a name="2.0.4"></a>
## 2.0.4 *(2013-04-08)*

### Bug fixes

- Fixing some more minor bugs

<a name="2.0.3"></a>
## 2.0.3 *(2013-03-29)*

- Changed default multiSelect behavior, updating some plugins and making some more minor bugfixes.

<a name="2.0.2"></a>
## 2.0.2 *(2013-03-08)*

- minor bugfixes, updating some plugins.

<a name="2.0.1"></a>
## 2.0.1 *(2013-03-05)*

 - Moved to grunt build system. No more international version; all languages are included by default. Fixed minor grouping display issue. Using $templateCache for templates instead of global namespace.

<a name="2.0.0"></a>
## 2.0.0 *(2013-03-05)*

 - Breaking Changes: see documentation (showSelectionBox, enableRowSelection, showFooter). Column Virtualization added. Row virtualization performance improved. Excel-like editing instead of enableFocusedCellEdit.

<a name="1.9.0"></a>
## 1.9.0 *(2013-02-18)*

 - Aggregates now display correctly. Added more option methods to select and group data (see wiki), Added column pinning.

<a name="1.8.0"></a>
## 1.8.0 [Hotfix] *(2013-02-11)*

 - Fixes for multi-level grouping and adding the gridId to both the grid options and as argument to the "ngGridEventData" so you can identify what grid it came from.

<a name="1.8.0"></a>
## 1.8.0 *(2013-02-07)*

 - Major architectural changes which greatly improves performance. virtualizationThreshold now controlls when virtualization is force-enabled and is user-specified in options.

<a name="1.7.1"></a>
## 1.7.1 *(2013-02-06)*

 - Fixed bug with selections and multiple grids. New emit message for notifying when hitting bottom of viewport. Can disable virtualization. ng-grid virtualization is on by default, but can be disabled if there are less than 50 rows in the grid. Anything > 50 rows virtualization is forced on for performance considerations.

<a name="1.7.0"></a>
## 1.7.0 *(2013-02-05)*

 - BREAKING CHANGES: Will add examples. Adding cell selection, navigation, and edit on focus. Added programmatic selections. Improved scrolling. ngGridEvents changed/added: see wiki.

<a name="1.6.3"></a>
## 1.6.3 *(2013-01-17)*

 - Can now highlight/copy text in grid. Fixed multiple issues when using multiselect along with shift key. Refactored key events so now they are all in the same directive for viewport. Hovering over highlightable text will change cursors in viewport. Fixed #93.

<a name="1.6.2"></a>
## 1.6.2 *(2013-01-09)*

 - Merged changes to have two-way data-binding work in templates, so if you're using a celltemplate, you can now use COL_FIELD instead of row.getProperty(col.field). row.getProperty is still in the row class for accessing other row values.

<a name="1.6.1"></a>
## 1.6.1 *(2013-01-08)*

 - Adding ability to preselect rows. Can deselect when multiSelect:false. Bug fixes/merging pull requests. Bower now works. Can now sync external search with ng-grid internal search. Check out other examples on examples page.

<a name="1.6.0"></a>
## 1.6.0 *(2012-12-27)*

 - Adding i18n support and support for different angularjs interpolation symbols (requires building from source).

<a name="1.5.0"></a>
## 1.5.0 *(2012-12-20)*

 - Modifying the way we watch for array changes. Added groupable column definition option. Bugfixes for #58, #59.

<a name="1.4.1"></a>
## 1.4.1 *(2012-12-18)*

 - jslint reformat, minor bugfixes, performance improvements while keydown navigating, adding "use strict" to script.

<a name="1.4.0"></a>
## 1.4.0 *(2012-12-12)*

 - Massive improvements to search thanks to [iNeedFat](https://github.com/ineedfat)!

<a name="1.3.9"></a>
## 1.3.9 *(2012-12-12)*

 - Refactored and removed unneeded code. Added scope events.

<a name="1.3.7"></a>
## 1.3.7 *(2012-12-12)*

 - Improving template compilation and fixing jquery theme support. Improving comments on grid options.

<a name="1.3.6"></a>
## 1.3.6 *(2012-12-06)*

 - sortInfo can now be set to default sort the grid. Improvements to the beforeSelectionChange callback mechanism when multi-selecting.

<a name="1.3.5"></a>
## 1.3.5 *(2012-12-06)*

 - Improved template rendering when using external template files. columnDefs can now be a $scope object which can be push/pop/spliced. Fixed box model for cells and header cells.

<a name="1.3.4"></a>
## 1.3.4 *(2012-12-04)*

 - Improved aggregate grouping, minor bugfixes. Auto-width works!

<a name="1.3.2"></a>
## 1.3.2 *(2012-11-27)*

 - Changed default width behavior to use *s and added option to maintain column ratios while resizing

<a name="1.3.1"></a>
## 1.3.1 *(2012-11-27)*

 - Added layout plugin. Support for uri templates. Performance improvements.

<a name="1.3.0"></a>
## 1.3.0 *(2012-11-23)*

 - Major code refactoring, can now group-by using column menu, changes to build

<a name="1.2.2"></a>
## 1.2.2 *(2012-11-21)*

 - Built-in filtering support, numerous perfomance enhancements and minor code refactoring

<a name="1.2.1"></a>
## 1.2.1 *(2012-11-20)*

 - Added ability to specify property "paths" as fields and for grid options.

<a name="1.2.0"></a>
## 1.2.0 *(2012-11-19)*

 - Added Server-Side Paging support and minor bug fixes.

<a name="1.1.0"></a>
## 1.1.0 *(2012-11-17)*

 - Added ability to hide/show columns and various bug fixes/performance enhancements.

<a name="1.0.0"></a>
## 1.0.0 *(2012-11-14)*

 - Release

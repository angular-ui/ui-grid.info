author: Brian
title: 3 Ways to Customize Your UI-Grid Data
date: 2015-02-27 10:55:01
tags:
 - customize
 - display
---

<!-- 5 ways to display data the way you want -->

Getting your data displayed just right can be a huge pain.

You might just want to format some numbers, or you might want to embed something complex like a chart or custom directive.

In this post outline three different tactics you can use to get your data **just the way you want it**:

* Bindings
* Cell Filters,
* and Cell Templates

## Bindings

UI Grid columns can be bound to any sort of Angular expression, as well as property names that would normally break an expression:

{% codeblock lang:js %}
var columnDefs = [
  { field: 'name' },
  { field: 'addresses[0]' },

  /*
    Yes, you can use hyphens, plus signs, etc.

    Normally something like {{ row.entity.first-name }} would bomb but UI Grid pre-processes
    your bindings to make sure they work correctly.
  */
  { field: 'first-name' }, 

  /* Function expressions work too */
  { field: 'getCurrency()' },
  { field: 'transformValue(row.entity.myField)' },

  /* Plain old functions are also an option */
  { field: function () { return this.address.zip; } }
];
{% endcodeblock %}

## Cell Filters

Cell filters can transform the displayed value for a column while leaving the model intact. In this plunker the amount column contains floating point values, but we only want to display the integer part. A simple cellFilter that uses `.toFixed()` will alter the displayed value the way we want.

{% iframe http://embed.plnkr.co/BjLqXGiUI8nQFwvijduh/preview %}

### Passing Arguments ###

In the third column I am using two different fields. The column itself is bound to the same field as the second column, but on the filter I am passing the scope like so: `cellFilter: 'currencyFilter:this'`.  Using the `this` argument on your filter will pass the scope.

Then I can lookup the currency symbol I want using the currency field from the row.

If you double-click a cell in the Currency column you'll see that the raw value is still available to be edited. Cell filters only change your displayed value!

## Cell Templates ##

Column definitions take a `cellTemplate` argument you can use to give your cells a custom template. You can specify it a few different ways, with a url (relative or absolute), an Angular template ID, a string/Angular element, or a promise.

{% codeblock lang:js %}
var columnDefs = [
  { field: 'name', cellTemplate: 'name-template.html' },
  { field: 'name', cellTemplate: 'myTemplateId' },
  { field: 'name', cellTemplate: $.get('url-to-your-template.html') }
};
{% endcodeblock %}

### Links and Buttons ###

### Tooltips ###

### Custom Directives ###

You can put absolutely anything in your cell templates, but in order to make it look good there's just one thing to remember. Wrapping your cell in an element using the class `.ui-grid-cell-contents` will apply the proper CSS settings like padding, overflow, etc., and make sure your cell fits in its space nicely.

{% iframe http://embed.plnkr.co/irskqERheTOiFql82QFC/preview %}

Here I've used d3.js, nvd3.js, and angular-nvd3.js to create sparkline charts in my cells.

author: Brian
title: 5 Ways to Customize Your UI-Grid Data
date: 2015-02-27 10:55:01
tags:
 - customize
 - display
mailchimp_tag: 5_ways_customized_data
mailchimp_title: Send me that flowchart!
---

<!-- 5 ways to display data the way you want -->

Getting your data displayed just right can be a huge pain.

You might just want to format some numbers, or you might want to embed something complex like a chart or custom directive.

In this post outline five different tactics you can use to get your data **just the way you want it**.

* Bindings
* Cell Filters
* Cell Templates

## Bindings

UI Grid columns can be bound to any sort of Angular expression, as well as property names that would normally break an expression:

{% codeblock lang:js %}
var columnDefs = [
  { field: 'name' },
  { field: 'addresses[0]' },
  { field: 'first-name' }, /* Yes, you can use hyphens, plus signs, etc */

  /* Function expressions work too */
  { field: 'getCurrency()' },
  { field: 'transformValue(row.entity.myField)' },

  /* Plain old functions are also an option */
  { field: function () { return this.address.zip; } }
];
{% endcodeblock %}

## Cell Filters

Cell filters can transform the displayed value for a column while leaving the model intact. In this plunker the amount column contains floating point values, but we only want to display the integer part. A simple cellFilter will alter the displayed value the way we want.

{% iframe http://embed.plnkr.co/BjLqXGiUI8nQFwvijduh/preview %}



### Passing Arguments ###

### Using Scope ###

## Cell Templates ##

### Custom Directives ###


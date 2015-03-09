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
* Cell Filters
* Cell Templates
** Links
** Buttons
** Custom directives

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

### Bindings in Cell Templates ###

There are a couple options for your binding your row's data in your template. You can access the `row` object which is in the local scope; `row.entity` will contain the reference to your object, so if you want the "name" field, you can bind like so: {{ row.entity.name }}.

If you've *already* defined your binding in your column definition you can use one of UI Grid's placeholders: `{% raw %}{{ COL_FIELD }}{% endraw %}`. UI Grid will automatically replace COL_FIELD with the appropriate binding. If you need to two-way bind to your row, like when you're using the edit feature, you'll need to use the `MODEL_COL_FIELD` placeholder.

{% codeblock lang:js %}
var columnDefs = [
  {
    field: 'image_url',
    cellTemplate: '<div class="ui-grid-cell-contents"><img src="{% raw %}{{ COL_FIELD }}{% endraw %}" /></div>'
  }
];
{% endcodeblock %}

### Links and Buttons ###

Links are simple, just use regular old HTML. Wrapping your cell in an element using the class `.ui-grid-cell-contents` will apply the proper CSS settings like padding, overflow, etc., and make sure your cell fits in its space nicely.

{% codeblock lang:js %}
var columnDefs = [
  {
    field: 'email',
    cellTemplate: '<div class="ui-grid-cell-contents"><a href="mailto:{% raw %}{{ COL_FIELD }}{% endraw %}">Send E-Mail</a></div>'
  }
];
{% endcodeblock %}

In the plunker below I'm using a basic cellTemplate to bind both the first and last name fields into one column. On the second column I'm using a simple link like above (note: none of these emails are real).

On the third one, I'm using a template that's referenced in index.html. If you check the bottom of that file you'll see the template inside a `<script type="text/ng-template">` tag. Any tags of that type will put automatically put into the template cache (`$templateCache`) by Angular, with the id you specify.

Also in the third column template you can see I'm using a variable called `grid.appScope`. Anywhere in your templates, `grid.appScope` will be bound to the parent scope of your grid. I use it to bind my button to a function in my controller that will open a new window with a url to google maps with the address in it (note: most if not all of these address will not exist).

{% iframe http://embed.plnkr.co/ciExi4w6706sbO4esU0q/ %}

### Tooltips ###



### Custom Directives ###

You can put absolutely anything in your cell templates, just remember to use `.ui-grid-cell-contents` if you're not applying your own custom cell CSS.

{% iframe http://embed.plnkr.co/irskqERheTOiFql82QFC/preview %}

Here I've used d3.js, nvd3.js, and angular-nvd3.js to create sparkline charts in my cells.

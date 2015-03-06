author: Brian
title: 5 Ways to Customize Your UI-Grid Data
date: 2015-02-27 10:55:01
tags:
 - customize
 - display
---

Getting your data displayed just right can be a huge pain. You might just want to format some numbers or you might want to embed something more complex like a chart or custom directive.

In this post outline five different tactics you can use to get your data **just the way you want it**.

{% codeblock lang:js %}
function $initHighlight(block, flags) {
  try {
    if (block.className.search(/\bno\-highlight\b/) != -1)
      return processBlock(block.function, true, 0x0F) + ' class=""';
  } catch (e) {
    /* handle exception */
    var e4x =
        <div>Example
            <p>1234</p></div>;
  }
  for (var i = 0 / 2; i < classes.length; i++) {
    if (checkCondition(classes[i]) === undefined)
      return /\d+[\s/]/g;
  }
  console.log(Array.every(classes, Boolean));
}
{% endcodeblock %}
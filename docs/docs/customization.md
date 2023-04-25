---
layout: docs
description: Customize cursora
group: extend
title: Customization
toc: true
---

# Customization

Cursora provides several customization options to make your cursor more engaging and interactive. Here are some of the options you can customize:

## Basic customizations

* `size` (`integer`): The size of the "blob" cursor [`defaults to 40`]
* `bg` (`string`): The background for the cursor blob (any css valid value) [`defaults to "#dee2e6"`]
* `opacity` (`float`): Default opacity for the cursor [`defaults to 1.0`]
* `dot` (`string`): Background color for the middle pointer of the cursor [`defaults to #000`]
* `magnetic` (`boolean`): Whether or not the cursor is magnetic by default [`defaults to false`]
* `zIndex` (`integer`): The default z-index for the cursor [`defaults to -1`]
* `invert` (`boolean`): If the cursor should distinguish from the background [`defaults to false`]

Here's an example on how to apply the configuration:

```javascript
new Cursora({
    dot: "#fff",
    bg: "rgba(255, 255, 255, .1)",
    zIndex: 3,
});
```

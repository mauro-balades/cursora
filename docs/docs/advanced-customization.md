---
layout: docs
description: Customize (advanced version) cursora
group: extend
title: Advanced customization
toc: true
---

# Advanced customization

Cursora not only provides several customization options to make your cursor more engaging, it also allows you to customize it's behaviour and motion.

## Cursor type

The cursor type allows the user to experience different animations and types of cursors.

```javascript
new Cursora({
    type: {
        acceleration: 0.1,
        friction: 0.35,
    },
});
```

There are also some cursor behavior presets that you can play with:

* `Cursora.type.normal`
* `Cursora.type.bouncy`
* `Cursora.type.slow`

## Hover offsets

Hover offsets allows the cursor to have more or less offset (or "element border") when hovering a focusable element.

```
new Cursora({
    hoverOffset: {
        x: 6,  // defaults to 16
        y: 10, // defaults to 16
    },
})
```

## Magnet strength

Magnet strength tells the cursor how much an element (with magnetism) can be stretched from it's original container until it's considered as not focusable anymore. **NOTE**: recomended to have it under `0.5`!
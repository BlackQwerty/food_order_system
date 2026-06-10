# DESIGN.md — UI Design System

This file defines the visual design system for this project. AI agents building UI must follow these tokens and rules exactly.

---

## Mode

**Light mode** only.

---

## Colors

| Role       | Value     |
|------------|-----------|
| Background | `#ffffff` |
| Text       | `#1d1d1f` |
| Accent     | `#0071e3` |
| Link Blue  | `#2997ff` |

---

## Typography

All fonts fall back through: `"SF Pro Text"`, `"SF Pro Icons"`, `"Helvetica Neue"`, `Helvetica`, `Arial`, `sans-serif`.

### Headings

| Level | Font Family     | Size  | Weight | Line Height | Letter Spacing |
|-------|----------------|-------|--------|-------------|----------------|
| H1    | SF Pro Text    | 32px  | 700    | 38px        | 0px            |
| H2    | SF Pro Text    | 27px  | 600    | 37.5px      | -0.374px       |
| H3    | SF Pro Display | 23px  | 600    | 36px        | 0.064px        |
| H4    | SF Pro Text    | 19px  | 600    | 23px        | 0px            |

### Body (Paragraph)

| Property       | Value          |
|----------------|----------------|
| Font Family    | SF Pro Display |
| Font Size      | 16px           |
| Font Weight    | 400            |
| Line Height    | 28px           |
| Letter Spacing | 0.216px        |

---

## Spacing

Use these named spacing values for margins, paddings, and gaps.

| Token | Value |
|-------|-------|
| `xs`  | 8px   |
| `sm`  | 16px  |
| `md`  | 24px  |
| `lg`  | 44px  |
| `xl`  | 70px  |

---

## Shadows

Only one shadow is defined. Use it for small elevation (cards, popovers, dropdowns).

| Token | Value                                     |
|-------|-------------------------------------------|
| `sm`  | `rgba(0, 0, 0, 0.22) 3px 5px 30px 0px`  |
| All others (`md`, `lg`, `xl`, `inner`) | `none` |

---

## Components

### Button — Primary

```css
box-sizing: border-box;
display: inline-block;
min-width: 26px;
min-height: 44px;
background-color: #0071e3;
color: #ffffff;
border: 1px solid transparent;
border-radius: 980px;
padding: 11px 21px;
font-size: 17px;
font-weight: 400;
font-family: "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
text-decoration: none;
```

### Button — Secondary

```css
box-sizing: border-box;
display: inline-block;
min-width: 26px;
min-height: 44px;
background-color: transparent;
color: #2997ff;
border: 1px solid #2997ff;
border-radius: 980px;
padding: 11px 21px;
font-size: 17px;
font-weight: 400;
font-family: "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
text-decoration: none;
```

### Button — Link

```css
color: #1d1d1f;
font-size: 17px;
font-weight: 400;
font-family: "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
text-decoration: underline;
background-color: transparent;
border: none;
padding: 0;
```

### Card

```css
background-color: #ffffff;
color: #1d1d1f;
border: 1px solid #e5e7eb;
border-radius: 8px;
padding: 16px;
box-shadow: none;
```

---

## Font Loading

Fonts are loaded from Apple's CDN. Load them via `@font-face` or reference them directly.

| Font Name      | Base URL Pattern                                              |
|----------------|---------------------------------------------------------------|
| SF Pro Text    | `https://www.apple.com/wss/fonts/SF-Pro-Text/v3/sf-pro-text_{weight}.woff2` |
| SF Pro Display | `https://www.apple.com/wss/fonts/SF-Pro-Display/v3/sf-pro-display_{weight}.woff2` |
| SF Pro Icons   | `https://www.apple.com/wss/fonts/SF-Pro-Icons/v3/sf-pro-icons_{weight}.woff2` |

Available weight names: `ultralight`, `thin`, `light`, `regular`, `medium`, `semibold`, `bold`, `heavy`, `black`

---

## Agent Rules

1. Always use the color tokens above — do not introduce new colors.
2. Use spacing tokens (`xs` / `sm` / `md` / `lg` / `xl`) for all layout gaps and padding — do not use arbitrary pixel values.
3. Buttons must use the pill shape (`border-radius: 980px`) and meet the 44px min-height touch target.
4. Cards use `border-radius: 8px`, no shadow.
5. Only the `sm` shadow is available — use it sparingly for elevated elements.
6. Font sizes and weights must match the type scale above exactly.
7. The design is light mode only — do not add dark mode styles unless explicitly instructed.
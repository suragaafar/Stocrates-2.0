# Stocrates Design System

## Overview
Stocrates features a clean, playful, game-inspired UI with a retro-modern aesthetic. The design is friendly, interactive, and easy on the eyes.

---

## Color Palette

### Primary Colors
```css
--text-dark: #22271e      /* Main text color - dark charcoal */
--bg-cream: #fffcf0       /* Background - warm cream */
--accent-red: #fe502d     /* Accent/CTA - vibrant red-orange */
```

### Secondary Colors
```css
--light-gray: #efefef     /* Subtle backgrounds */
--accent-blue: #a7dcfa    /* Interactive elements - light blue */
--dark-blue: #416072      /* Hover states - muted blue */
```

### Usage Guidelines
- **Text**: Use `#22271e` for all body text and headings
- **Backgrounds**: Primary background is `#fffcf0` (cream)
- **Interactive Elements**: Use `#a7dcfa` (light blue) for hover states and highlights
- **CTAs**: Use `#fe502d` (red) sparingly for important actions
- **Borders**: Use `#22271e` (dark) for all borders and frames

---

## Typography

### Font Families

#### Space Mono (Headings/Titles)
```css
font-family: 'Space Mono', monospace;
```
- **Usage**: All headings (h1-h6), titles, important labels
- **Weights**: 400 (regular), 700 (bold)
- **Characteristics**: Monospace, geometric, modern

#### Roboto (Body Text)
```css
font-family: 'Roboto', sans-serif;
```
- **Usage**: All body text, paragraphs, descriptions
- **Weights**: 300 (light), 400 (regular), 500 (medium), 700 (bold)
- **Characteristics**: Clean, readable, friendly

#### Courier New (Game Elements)
```css
font-family: 'Courier New', monospace;
```
- **Usage**: Game-specific UI (UPLOAD, SAVE buttons, scores)
- **Weights**: 700 (bold)
- **Characteristics**: Retro, game-y, robotic
- **Styling**: UPPERCASE, increased letter-spacing (0.15em)

### Typography Scale
```css
h1: 2.5rem (40px) - Space Mono Bold
h2: 2rem (32px) - Space Mono Bold
h3: 1.5rem (24px) - Space Mono Bold
h4: 1.25rem (20px) - Space Mono Bold
body: 1rem (16px) - Roboto Regular
small: 0.875rem (14px) - Roboto Regular
```

---

## Game Components

### Buttons

#### Game Button (UPLOAD/SAVE style)
```tsx
<StocratesButton variant="game">UPLOAD</StocratesButton>
```
- Background: `#22271e` (dark)
- Text: `#fffcf0` (cream)
- Font: Courier New, bold, uppercase
- Border-radius: Full (pill shape)
- Hover: Lift effect (-2px translateY) + shadow

#### Primary Button
```tsx
<StocratesButton variant="primary">Get Started</StocratesButton>
```
- Background: `#22271e` (dark)
- Text: `#fffcf0` (cream)
- Font: Space Mono, bold, uppercase

#### Secondary Button
```tsx
<StocratesButton variant="secondary">Learn More</StocratesButton>
```
- Background: `#a7dcfa` (light blue)
- Text: `#22271e` (dark)
- Font: Space Mono, bold, uppercase

### Cards

#### Decorative Card (with corner circles)
```tsx
<StocratesCard variant="decorative" background="cream">
  Content here
</StocratesCard>
```
- Border: 3px solid `#22271e`
- Corner circles: 12px diameter, positioned at all 4 corners
- Background: Cream, blue, or gray

#### Decorative Frame (for images/content)
```tsx
<DecorativeFrame cornerColor="dark">
  <img src="..." alt="..." />
</DecorativeFrame>
```
- Border: 3px solid `#22271e`
- 4 corner circles with customizable colors
- Perfect for highlighting images or important content

### Info Boxes
```tsx
<div className="info-box">
  <p>Use this to keep track of points!</p>
  <p className="delete-note">Kindly delete this note after editing this page.</p>
</div>
```
- Background: `#efefef` (light gray)
- Left border: 4px solid `#fe502d` (red)
- Font: Roboto
- Delete notes in red italic

---

## Design Patterns

### Decorative Borders
All major content areas use decorative borders with corner circles:
- 3px solid border in `#22271e`
- 12px circular corners at all 4 corners
- Corners can be filled with cream, blue, or dark colors

### Interactive Elements
All clickable elements should have:
- Hover: Slight lift (-2px translateY) + subtle shadow
- Active: Return to original position (0px translateY)
- Transition: 200ms ease

### Spacing
- Use consistent padding: 1rem (16px), 1.5rem (24px), 2rem (32px)
- Card padding: 1.5rem (24px)
- Button padding: 0.75rem 1.5rem (12px 24px)

---

## Tailwind Classes

### Quick Reference
```tsx
// Colors
bg-stocrates-cream    // #fffcf0
bg-stocrates-dark     // #22271e
bg-stocrates-red      // #fe502d
bg-stocrates-gray     // #efefef
bg-stocrates-blue     // #a7dcfa
bg-stocrates-dark-blue // #416072

text-stocrates-dark   // #22271e
text-stocrates-cream  // #fffcf0

// Fonts
font-title  // Space Mono
font-body   // Roboto
font-game   // Courier New

// Borders
border-stocrates-dark
border-3    // 3px border width
```

---

## Layout Guidelines

### Background Colors
- **Main app background**: `#fffcf0` (cream)
- **Alternate sections**: `#a7dcfa` (light blue) for variety
- **Cards/panels**: `#fffcf0` (cream) or white

### Contrast
- Always use `#22271e` (dark) text on light backgrounds
- Always use `#fffcf0` (cream) text on dark backgrounds
- Ensure WCAG AA compliance for accessibility

---

## Game Mode Styling

For game-related features:
- Use **Courier New** font for scores, buttons, labels
- Add decorative frames around game boards
- Use chess piece icons or similar game iconography
- Scoreboard: Simple table with horizontal dividers
- Buttons: UPPERCASE with increased letter-spacing

---

Made by Team Code of Duty


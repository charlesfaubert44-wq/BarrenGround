# Barren Ground Coffee - Design System Guidelines

> **Version:** 1.0 | **Last Updated:** November 4, 2025
> **Author's Note**: These guidelines represent five decades of experience designing for hospitality, retail, and food service brands. From the early days of print catalogs to today's mobile-first experiences, these principles have stood the test of time.

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Brand Identity](#brand-identity)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Iconography](#iconography)
7. [Components](#components)
8. [Navigation Patterns](#navigation-patterns)
9. [Interactive Elements](#interactive-elements)
10. [Accessibility](#accessibility)
11. [Responsive Design](#responsive-design)
12. [Motion & Animation](#motion--animation)
13. [Content Strategy](#content-strategy)
14. [Error Handling](#error-handling)
15. [Performance Guidelines](#performance-guidelines)

---

## Design Philosophy

### Core Principles

Over my career, I've learned that successful food service interfaces must balance three critical elements:

#### 1. **Warmth Without Clutter**
Coffee shops are about community and comfort. Your interface should feel like walking into a well-designed café—inviting, organized, and intentional. Every element should have a purpose.

#### 2. **Speed Without Anxiety**
Users want their coffee quickly, but rushing them creates mistakes. Design for confident, quick decisions without pressure.

#### 3. **Trust Through Transparency**
Food service requires trust. Show users exactly what they're ordering, when they'll get it, and how much it costs. No surprises.

### Design Values

```
CLARITY over cleverness
CONSISTENCY over novelty
ACCESSIBILITY over aesthetics
PERFORMANCE over polish
PRACTICALITY over trends
```

---

## Brand Identity

### Brand Personality

**Barren Ground Coffee** embodies:
- **Rustic Authenticity**: Northern Canadian heritage, honest and unpretentious
- **Warm Hospitality**: Welcoming like a friend's home
- **Reliable Quality**: Consistently excellent, no gimmicks
- **Community Focused**: Local, personal, trustworthy

### Voice & Tone

**Voice** (constant):
- Friendly but not forced
- Clear and direct
- Knowledgeable without being pretentious
- Warm without being overly casual

**Tone** (contextual):
- **Ordering**: Helpful and efficient
- **Errors**: Apologetic and solution-oriented
- **Confirmations**: Reassuring and clear
- **Marketing**: Inviting and appetizing

---

## Color System

### Primary Palette

After 50 years, I've learned that food service colors must be:
1. Appetizing (warm earth tones)
2. Readable (sufficient contrast)
3. Memorable (distinctive but not jarring)

```css
/* Primary Colors */
--coffee-brown-900: #78350f;  /* Primary brand, buttons, headers */
--coffee-brown-800: #92400e;  /* Hover states */
--coffee-brown-700: #b45309;  /* Lighter accents */

/* Secondary - Warmth */
--amber-100: #fef3c7;  /* Backgrounds, subtle highlights */
--amber-50:  #fffbeb;  /* Page backgrounds */
--orange-50: #fff7ed;  /* Alternating sections */

/* Neutrals */
--gray-900: #111827;  /* Primary text */
--gray-800: #1f2937;  /* Secondary text */
--gray-600: #4b5563;  /* Tertiary text */
--gray-400: #9ca3af;  /* Disabled text */
--gray-200: #e5e7eb;  /* Borders */
--gray-100: #f3f4f6;  /* Backgrounds */
--white:    #ffffff;  /* Cards, containers */

/* Semantic Colors */
--success-green: #10b981;  /* Confirmations, ready status */
--warning-yellow: #f59e0b; /* Preparing status */
--error-red: #ef4444;      /* Errors, cancelled */
--info-blue: #3b82f6;      /* Information, received status */
```

### Color Usage Rules

**DO:**
- Use brown-900 for primary actions (Order Now, Add to Cart)
- Use warm backgrounds (amber-50, orange-50) for main content areas
- Use semantic colors consistently for status indicators
- Maintain 4.5:1 contrast ratio minimum for text

**DON'T:**
- Never use pure black (#000000) - too harsh
- Avoid cool colors (blues, greens) except for semantic meaning
- Don't use more than 3 colors in a single component
- Never rely on color alone to convey information (accessibility)

### Gradients

Use sparingly for emphasis and visual interest:

```css
/* Hero sections, featured items */
.gradient-warm {
  background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
}

/* Text emphasis */
.gradient-text {
  background: linear-gradient(135deg, #78350f 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

**Lesson from 50 years**: Gradients are like spices—a little goes a long way. Overuse makes everything look dated.

---

## Typography

### Font Philosophy

Typography in food service must be:
1. **Immediately readable** (even on the go)
2. **Appetizing** (warm, inviting letterforms)
3. **Professional** (trustworthy, established)

### Font Stack

```css
/* Primary Font - System UI */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
             'Helvetica Neue', sans-serif;
```

**Why system fonts?**
- Instant loading (critical for performance)
- Native to each platform (feels right everywhere)
- Excellent readability (battle-tested)
- Professional without being corporate

### Type Scale

Based on the 1.25 (major third) modular scale:

```css
/* Headings */
--text-6xl: 3.75rem;   /* 60px - Hero titles */
--text-5xl: 3rem;      /* 48px - Page titles */
--text-4xl: 2.25rem;   /* 36px - Section headers */
--text-3xl: 1.875rem;  /* 30px - Card titles */
--text-2xl: 1.5rem;    /* 24px - Subsections */
--text-xl:  1.25rem;   /* 20px - Large body */

/* Body */
--text-base: 1rem;     /* 16px - Body text */
--text-sm:   0.875rem; /* 14px - Secondary text */
--text-xs:   0.75rem;  /* 12px - Captions, labels */
```

### Typography Rules

**Headings:**
```css
h1, h2, h3 {
  font-weight: 700;      /* Bold */
  line-height: 1.2;      /* Tight for impact */
  letter-spacing: -0.02em; /* Slightly tight */
  color: var(--gray-900);
}
```

**Body Text:**
```css
body, p {
  font-weight: 400;      /* Regular */
  line-height: 1.6;      /* Comfortable reading */
  letter-spacing: 0;
  color: var(--gray-800);
}
```

**Emphasis:**
```css
strong, .font-bold {
  font-weight: 600;      /* Semibold, not too heavy */
}

.price {
  font-weight: 700;      /* Bold for prices */
  color: var(--coffee-brown-900);
  font-variant-numeric: tabular-nums; /* Aligned numbers */
}
```

### Typography Best Practices

**Hierarchy:**
```
1. One H1 per page (SEO and clarity)
2. H2 for major sections
3. H3 for subsections
4. No more than 3 levels deep
```

**Line Length:**
- Optimal: 50-75 characters per line
- Maximum: 90 characters per line
- Use max-width on text containers

**Readable Text:**
```css
.content-text {
  max-width: 65ch;          /* Optimal line length */
  font-size: 1.125rem;      /* 18px - easier on eyes */
  line-height: 1.7;         /* Extra breathing room */
  color: var(--gray-800);
}
```

---

## Spacing & Layout

### The 8-Point Grid System

**Lesson from 5 decades**: The 8pt grid is not a trend—it's mathematics. It creates visual harmony and makes design decisions easier.

```css
/* Base spacing scale (multiples of 8) */
--space-1:  0.5rem;   /* 8px */
--space-2:  1rem;     /* 16px */
--space-3:  1.5rem;   /* 24px */
--space-4:  2rem;     /* 32px */
--space-6:  3rem;     /* 48px */
--space-8:  4rem;     /* 64px */
--space-12: 6rem;     /* 96px */
--space-16: 8rem;     /* 128px */
```

### Layout Principles

#### 1. **Container Widths**

```css
.container {
  max-width: 1280px;    /* Desktop max */
  margin: 0 auto;
  padding: 0 1rem;      /* Mobile */
}

@media (min-width: 640px) {
  .container { padding: 0 1.5rem; }
}

@media (min-width: 1024px) {
  .container { padding: 0 2rem; }
}
```

#### 2. **Content Sections**

```css
.section {
  padding-top: 4rem;     /* 64px */
  padding-bottom: 4rem;
}

@media (min-width: 768px) {
  .section {
    padding-top: 6rem;   /* 96px */
    padding-bottom: 6rem;
  }
}
```

#### 3. **Card Spacing**

```css
.card {
  padding: 1.5rem;       /* 24px - mobile */
  border-radius: 1rem;   /* 16px - friendly curves */
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

@media (min-width: 768px) {
  .card {
    padding: 2rem;       /* 32px - desktop */
  }
}
```

### Grid Layouts

#### Menu Grid

```css
.menu-grid {
  display: grid;
  gap: 1.5rem;                    /* 24px */
  grid-template-columns: 1fr;     /* Mobile: 1 column */
}

@media (min-width: 640px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);  /* Tablet: 2 columns */
    gap: 2rem;
  }
}

@media (min-width: 1024px) {
  .menu-grid {
    grid-template-columns: repeat(3, 1fr);  /* Desktop: 3 columns */
  }
}
```

### White Space Philosophy

**From 50 years of experience:**

> "White space is not wasted space. It's the difference between a cluttered food court and a fine dining experience."

**Rules:**
1. More space around important elements (CTAs, prices)
2. Consistent spacing creates rhythm
3. Group related items closer together
4. Separate unrelated items with more space
5. Mobile needs MORE white space, not less

---

## Iconography

### Icon Strategy

**Philosophy**: Icons should clarify, not decorate. If an icon needs a label to be understood, question whether you need it.

### Icon Guidelines

**Style:**
- **Line-based** icons (not filled, unless active state)
- **2px stroke weight** for consistency
- **24×24px base size** (scales well)
- **Rounded corners** (friendlier than sharp)
- **Aligned to 8pt grid**

**Usage:**
```jsx
// Good - Icon with clear meaning
<button>
  <ShoppingCart /> {/* Cart is universal */}
  <span>3 items</span>
</button>

// Bad - Icon without clear meaning
<button>
  <AbstractShape /> {/* What does this mean? */}
  <span>Action</span>
</button>
```

### Icon Library

**Essential Icons:**

```
Navigation:
- Home (house)
- Menu (grid/list)
- Cart (shopping bag)
- Account (user circle)
- Search (magnifying glass)

Actions:
- Plus (add to cart)
- Minus (remove)
- X (close/remove)
- Check (confirm)
- Edit (pencil)

Status:
- Clock (pending/preparing)
- Check Circle (completed)
- Alert Circle (attention needed)
- Info Circle (information)

Food/Beverage:
- Coffee cup
- Food/plate
- Star (favorites)
```

### Icon Sizing

```css
.icon-xs  { width: 16px; height: 16px; } /* Inline text */
.icon-sm  { width: 20px; height: 20px; } /* Buttons, small UI */
.icon-md  { width: 24px; height: 24px; } /* Default */
.icon-lg  { width: 32px; height: 32px; } /* Emphasis */
.icon-xl  { width: 48px; height: 48px; } /* Hero, empty states */
```

### Icon Best Practices

**DO:**
- Use consistent icon family throughout app
- Pair icons with text for clarity (especially actions)
- Use filled icons for active/selected states
- Ensure 44×44px touch target minimum

**DON'T:**
- Mix icon styles (outlined + filled in same context)
- Use decorative icons that don't aid comprehension
- Rely on icons alone for critical actions
- Use icons that require cultural knowledge

---

## Components

### Button System

**Lesson from decades of e-commerce**: Button design makes or breaks conversion. Clear hierarchy saves orders.

#### Primary Button (Main Actions)

```css
.btn-primary {
  /* Visual */
  background: var(--coffee-brown-900);
  color: white;
  border: none;
  border-radius: 0.75rem;        /* 12px - friendly but not too round */

  /* Sizing */
  padding: 0.75rem 1.5rem;       /* 12px 24px */
  font-size: 1rem;
  font-weight: 600;

  /* Interaction */
  cursor: pointer;
  transition: all 150ms ease;

  /* Touch target */
  min-height: 44px;              /* Apple HIG minimum */
  min-width: 88px;               /* Material Design minimum */
}

.btn-primary:hover {
  background: var(--coffee-brown-800);
  transform: translateY(-1px);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.2);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:focus-visible {
  outline: 3px solid var(--coffee-brown-700);
  outline-offset: 2px;
}

.btn-primary:disabled {
  background: var(--gray-400);
  cursor: not-allowed;
  transform: none;
}
```

#### Secondary Button (Alternative Actions)

```css
.btn-secondary {
  background: white;
  color: var(--coffee-brown-900);
  border: 2px solid var(--coffee-brown-900);
  /* Other properties same as primary */
}

.btn-secondary:hover {
  background: var(--amber-50);
}
```

#### Text Button (Tertiary Actions)

```css
.btn-text {
  background: transparent;
  color: var(--coffee-brown-900);
  border: none;
  padding: 0.5rem 1rem;
  font-weight: 600;
  text-decoration: underline;
}

.btn-text:hover {
  color: var(--coffee-brown-800);
  text-decoration: none;
}
```

#### Button Sizes

```css
.btn-sm {
  padding: 0.5rem 1rem;     /* 8px 16px */
  font-size: 0.875rem;      /* 14px */
  min-height: 36px;
}

.btn-md {
  /* Default - see primary above */
}

.btn-lg {
  padding: 1rem 2rem;       /* 16px 32px */
  font-size: 1.125rem;      /* 18px */
  min-height: 52px;
}
```

#### Button Hierarchy in Context

```jsx
// Shopping Cart Example
<div className="cart-actions">
  <button className="btn-primary btn-lg">
    Proceed to Checkout - $24.50
  </button>
  <button className="btn-secondary">
    Continue Shopping
  </button>
  <button className="btn-text">
    Save for Later
  </button>
</div>
```

### Card Component

Cards are your primary content container. They must be:
1. Clearly defined (shadow or border)
2. Interactive if clickable (hover states)
3. Scannable (clear hierarchy)

```css
.card {
  background: white;
  border-radius: 1.5rem;        /* 24px - warm and friendly */
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1),
              0 1px 2px -1px rgb(0 0 0 / 0.1);
  transition: all 200ms ease;
}

.card:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
              0 4px 6px -4px rgb(0 0 0 / 0.1);
  transform: translateY(-2px);
}

.card-header {
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--amber-100);
  padding-bottom: 1rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.card-body {
  color: var(--gray-800);
  line-height: 1.6;
}

.card-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

### Menu Item Card

```jsx
<div className="menu-item-card">
  <img src="coffee.jpg" alt="Latte" className="menu-item-image" />
  <div className="menu-item-content">
    <h3 className="menu-item-title">Caramel Latte</h3>
    <p className="menu-item-description">
      Espresso with steamed milk and caramel syrup
    </p>
    <div className="menu-item-footer">
      <span className="menu-item-price">$5.25</span>
      <button className="btn-primary">Add to Cart</button>
    </div>
  </div>
</div>
```

```css
.menu-item-card {
  background: white;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: all 200ms ease;
}

.menu-item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

.menu-item-image {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
}

.menu-item-content {
  padding: 1.5rem;
}

.menu-item-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 0.5rem 0;
}

.menu-item-description {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
}

.menu-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-item-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--coffee-brown-900);
}
```

### Form Inputs

**Golden Rule**: Forms should feel like a conversation, not an interrogation.

```css
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: var(--gray-900);
  background: white;
  border: 2px solid var(--gray-300);
  border-radius: 0.5rem;
  transition: all 150ms ease;

  /* Touch target */
  min-height: 44px;
}

.form-input:focus {
  outline: none;
  border-color: var(--coffee-brown-900);
  box-shadow: 0 0 0 3px rgba(120, 53, 15, 0.1);
}

.form-input::placeholder {
  color: var(--gray-400);
}

.form-input:disabled {
  background: var(--gray-100);
  color: var(--gray-500);
  cursor: not-allowed;
}

/* Error state */
.form-input.error {
  border-color: var(--error-red);
}

.form-error {
  color: var(--error-red);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* Helper text */
.form-helper {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
```

### Status Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;       /* Fully rounded */
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-pending {
  background: var(--gray-100);
  color: var(--gray-800);
}

.badge-received {
  background: #dbeafe;         /* Blue-100 */
  color: #1e40af;              /* Blue-800 */
}

.badge-preparing {
  background: #fef3c7;         /* Amber-100 */
  color: #92400e;              /* Amber-800 */
}

.badge-ready {
  background: #d1fae5;         /* Green-100 */
  color: #065f46;              /* Green-800 */
}

.badge-completed {
  background: var(--gray-200);
  color: var(--gray-700);
}

.badge-cancelled {
  background: #fee2e2;         /* Red-100 */
  color: #991b1b;              /* Red-800 */
}
```

---

## Navigation Patterns

### Header Navigation

**Philosophy**: Navigation should disappear when not needed, appear when expected.

```jsx
<header className="site-header">
  <div className="container">
    <nav className="nav-main">
      {/* Logo - Always visible */}
      <a href="/" className="logo">
        <img src="logo.svg" alt="Barren Ground Coffee" />
      </a>

      {/* Primary Navigation */}
      <ul className="nav-links">
        <li><a href="/menu">Menu</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>

      {/* Actions - Always visible */}
      <div className="nav-actions">
        <a href="/cart" className="cart-link">
          <ShoppingCart />
          <span className="cart-count">3</span>
        </a>
        <a href="/account" className="account-link">
          <User />
        </a>
      </div>
    </nav>
  </div>
</header>
```

```css
.site-header {
  background: white;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  position: sticky;
  top: 0;
  z-index: 50;
}

.nav-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  gap: 2rem;
}

.logo img {
  height: 48px;
  width: auto;
}

.nav-links {
  display: none;              /* Hidden on mobile */
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

@media (min-width: 768px) {
  .nav-links {
    display: flex;
  }
}

.nav-links a {
  color: var(--gray-900);
  font-weight: 600;
  text-decoration: none;
  transition: color 150ms ease;
  padding: 0.5rem 0;
}

.nav-links a:hover {
  color: var(--coffee-brown-900);
}

.nav-links a.active {
  color: var(--coffee-brown-900);
  border-bottom: 2px solid var(--coffee-brown-900);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cart-link {
  position: relative;
  padding: 0.5rem;
}

.cart-count {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--error-red);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 20px;
  text-align: center;
}
```

### Mobile Navigation

**Critical lesson**: Mobile navigation must be immediately accessible with one thumb.

```jsx
{/* Mobile Menu Button */}
<button
  className="mobile-menu-toggle"
  aria-label="Open menu"
  onClick={openMenu}
>
  <Menu />
</button>

{/* Mobile Menu Drawer */}
<div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
  <div className="mobile-menu-header">
    <span className="mobile-menu-title">Menu</span>
    <button onClick={closeMenu} aria-label="Close menu">
      <X />
    </button>
  </div>

  <nav className="mobile-menu-nav">
    <a href="/">Home</a>
    <a href="/menu">Menu</a>
    <a href="/about">About</a>
    <a href="/contact">Contact</a>
    <a href="/account">My Account</a>
  </nav>
</div>
```

```css
.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 85%;
  max-width: 320px;
  height: 100vh;
  background: white;
  box-shadow: 2px 0 8px rgb(0 0 0 / 0.1);
  transform: translateX(-100%);
  transition: transform 300ms ease;
  z-index: 100;
}

.mobile-menu.open {
  transform: translateX(0);
}

.mobile-menu-nav {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.mobile-menu-nav a {
  padding: 1rem;
  color: var(--gray-900);
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid var(--gray-200);
}

.mobile-menu-nav a:hover {
  background: var(--amber-50);
  color: var(--coffee-brown-900);
}
```

### Breadcrumbs

**For complex flows only** (checkout, account settings):

```jsx
<nav aria-label="Breadcrumb" className="breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/menu">Menu</a></li>
    <li aria-current="page">Beverages</li>
  </ol>
</nav>
```

```css
.breadcrumb ol {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
}

.breadcrumb li:not(:last-child)::after {
  content: "/";
  margin-left: 0.5rem;
  color: var(--gray-400);
}

.breadcrumb a {
  color: var(--gray-600);
  text-decoration: none;
}

.breadcrumb a:hover {
  color: var(--coffee-brown-900);
  text-decoration: underline;
}

.breadcrumb li[aria-current="page"] {
  color: var(--gray-900);
  font-weight: 600;
}
```

---

## Interactive Elements

### Hover States

**Philosophy**: Hover should preview interaction, not surprise users.

```css
/* Subtle lift for cards */
.interactive-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

/* Color shift for text links */
.text-link:hover {
  color: var(--coffee-brown-800);
}

/* Background color for menu items */
.menu-item:hover {
  background: var(--amber-50);
}
```

### Focus States

**Critical for accessibility and keyboard users:**

```css
/* Default focus ring */
:focus-visible {
  outline: 3px solid var(--coffee-brown-700);
  outline-offset: 2px;
}

/* Remove default outline */
:focus {
  outline: none;
}

/* Custom focus for specific elements */
.btn:focus-visible {
  outline: 3px solid var(--coffee-brown-700);
  outline-offset: 2px;
}

.form-input:focus {
  border-color: var(--coffee-brown-900);
  box-shadow: 0 0 0 3px rgba(120, 53, 15, 0.1);
}
```

### Active/Pressed States

```css
.btn:active {
  transform: translateY(0);  /* Cancel hover lift */
  box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.1);
}
```

### Loading States

**Never leave users wondering if something is happening:**

```jsx
<button className="btn-primary" disabled={loading}>
  {loading ? (
    <>
      <Spinner className="animate-spin" />
      <span>Processing...</span>
    </>
  ) : (
    <span>Place Order</span>
  )}
</button>
```

```css
.spinner {
  animation: spin 1s linear infinite;
  width: 20px;
  height: 20px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Skeleton loading for content */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-200) 25%,
    var(--gray-100) 50%,
    var(--gray-200) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 0.25rem;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Disabled States

```css
.btn:disabled,
.btn[aria-disabled="true"] {
  background: var(--gray-300);
  color: var(--gray-500);
  cursor: not-allowed;
  opacity: 0.6;
}

.form-input:disabled {
  background: var(--gray-100);
  color: var(--gray-500);
  cursor: not-allowed;
}
```

---

## Accessibility

**After 50 years, this is non-negotiable**: Accessible design is good design. Period.

### Color Contrast

**WCAG 2.1 Level AA minimum:**
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio
- Interactive elements: 3:1 contrast ratio

**Tools:**
- Use WebAIM Contrast Checker
- Chrome DevTools contrast checker
- Always test in grayscale

### Semantic HTML

```jsx
// Good - Semantic, accessible
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/menu">Menu</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Our Menu</h1>
    <section>
      <h2>Beverages</h2>
      {/* Content */}
    </section>
  </article>
</main>

// Bad - Div soup
<div className="nav">
  <div onClick={goToMenu}>Menu</div>
</div>
```

### ARIA Labels

```jsx
// Icon buttons need labels
<button aria-label="Add to cart">
  <Plus />
</button>

// Status announcements
<div role="status" aria-live="polite">
  3 items in cart
</div>

// Loading states
<button aria-busy="true" aria-label="Loading">
  <Spinner />
</button>
```

### Keyboard Navigation

**All interactive elements must be keyboard accessible:**

```css
/* Tab order should be logical (DOM order) */
/* Focus visible for keyboard users */
:focus-visible {
  outline: 3px solid var(--coffee-brown-700);
  outline-offset: 2px;
}

/* Skip to main content link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--coffee-brown-900);
  color: white;
  padding: 0.5rem 1rem;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### Screen Reader Support

```jsx
// Descriptive link text
<a href="/menu">View our menu</a>  {/* Good */}
<a href="/menu">Click here</a>     {/* Bad */}

// Image alt text
<img
  src="latte.jpg"
  alt="Caramel latte in white ceramic mug with latte art"
/>

// Form labels
<label htmlFor="email">Email Address</label>
<input id="email" type="email" name="email" />

// Hidden but accessible text
<button>
  <ShoppingCart />
  <span className="sr-only">Shopping Cart</span>
</button>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### Touch Targets

**Minimum 44×44px touch target** (Apple HIG):

```css
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 0.75rem 1rem;  /* Ensures minimum size */
}

/* If visual element is smaller, increase clickable area */
.small-icon {
  padding: 12px;  /* Icon is 20px, padding makes it 44px */
}
```

### Motion Preferences

**Respect user preferences:**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Design

### Mobile-First Approach

**Always design for mobile first, enhance for desktop.**

```css
/* Mobile default (320px - 639px) */
.menu-grid {
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet (640px - 1023px) */
@media (min-width: 640px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .menu-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}

/* Large desktop (1280px+) */
@media (min-width: 1280px) {
  .menu-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Breakpoints

```css
/* Standard breakpoints */
--mobile:    320px;   /* Base */
--sm:        640px;   /* Small tablet */
--md:        768px;   /* Tablet */
--lg:        1024px;  /* Desktop */
--xl:        1280px;  /* Large desktop */
--2xl:       1536px;  /* Extra large */
```

### Responsive Typography

```css
.heading-hero {
  font-size: 2.25rem;      /* 36px mobile */
  line-height: 1.2;
}

@media (min-width: 768px) {
  .heading-hero {
    font-size: 3rem;       /* 48px tablet */
  }
}

@media (min-width: 1024px) {
  .heading-hero {
    font-size: 3.75rem;    /* 60px desktop */
  }
}
```

### Responsive Images

```jsx
{/* Responsive image with srcset */}
<img
  srcset="
    latte-small.jpg 400w,
    latte-medium.jpg 800w,
    latte-large.jpg 1200w
  "
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 1024px) 50vw,
    33vw
  "
  src="latte-medium.jpg"
  alt="Caramel latte"
  loading="lazy"
/>
```

### Responsive Layout Patterns

#### Stack to Grid

```css
.feature-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

@media (min-width: 768px) {
  .feature-section {
    flex-direction: row;
  }
}
```

#### Hide/Show Elements

```css
.mobile-only {
  display: block;
}

.desktop-only {
  display: none;
}

@media (min-width: 768px) {
  .mobile-only {
    display: none;
  }

  .desktop-only {
    display: block;
  }
}
```

---

## Motion & Animation

**Philosophy**: Animation should clarify, not decorate. Every animation must have a purpose.

### Animation Principles

1. **Purpose**: Explain what's happening
2. **Duration**: 150-300ms for interactions, 300-500ms for transitions
3. **Easing**: Natural motion (ease-out for enter, ease-in for exit)
4. **Performance**: Use transform and opacity only
5. **Respect**: Honor prefers-reduced-motion

### Micro-Interactions

```css
/* Button press */
.btn {
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.btn:active {
  transform: translateY(1px);
}

/* Card hover */
.card {
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.card:hover {
  transform: translateY(-4px);
}

/* Toggle switch */
.toggle-switch {
  transition: background-color 200ms ease;
}

.toggle-handle {
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Page Transitions

```css
/* Fade in on load */
.fade-in {
  animation: fadeIn 400ms ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in */
.scale-in {
  animation: scaleIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Loading Animations

```css
/* Pulse for loading placeholders */
.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Spin for loaders */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Progress bar */
.progress-bar {
  animation: progress 2s ease-out;
}

@keyframes progress {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
```

### Notification Animations

```css
/* Slide in from top */
.notification-enter {
  transform: translateY(-100%);
  opacity: 0;
}

.notification-enter-active {
  transform: translateY(0);
  opacity: 1;
  transition: all 300ms ease-out;
}

.notification-exit {
  transform: translateY(0);
  opacity: 1;
}

.notification-exit-active {
  transform: translateY(-100%);
  opacity: 0;
  transition: all 200ms ease-in;
}
```

### Don'ts

**Never:**
- Animate without purpose
- Use animations longer than 500ms for interactions
- Animate width, height, or left/right (causes reflow)
- Auto-play animations that last >5 seconds
- Make essential UI dependent on animation completing

---

## Content Strategy

### Writing Principles

**From 50 years of experience**: Users don't read, they scan. Write for scanners.

#### Voice Guidelines

**DO:**
- Use active voice: "Add to cart" not "Your item will be added"
- Be concise: "Pickup in 15 min" not "Your order will be ready for pickup in approximately 15 minutes"
- Use familiar words: "Menu" not "Offerings"
- Be specific: "$4.50" not "Affordable"

**DON'T:**
- Use jargon or industry terms
- Be overly casual: "Sup?" ❌
- Be overly formal: "We cordially invite you" ❌
- Use unnecessary words: "Please proceed to..." → "Go to..."

### Microcopy

#### Button Labels

```
Good:
- "Add to Cart"
- "Checkout - $24.50"
- "Track Order"
- "View Menu"

Bad:
- "Submit" (submit what?)
- "Click Here" (where?)
- "OK" (ok to what?)
- "Continue" (ambiguous)
```

#### Error Messages

```
Good:
❌ Email is required
❌ Password must be at least 8 characters
❌ Credit card number is invalid

Bad:
❌ Error
❌ Invalid input
❌ Something went wrong
```

#### Empty States

```
Good:
🛒 Your cart is empty
   Start by adding items from our menu

📦 No orders yet
   Place your first order to see it here

Bad:
🛒 No items
📦 Empty
```

#### Success Messages

```
Good:
✓ Added to cart
✓ Order placed successfully! We'll have it ready in 15 minutes.
✓ Account created - Welcome to Barren Ground!

Bad:
✓ Success
✓ Done
✓ Completed
```

### Content Hierarchy

**Every page needs:**

1. **Clear headline** (what is this page?)
2. **Subheading** (why should I care?)
3. **Primary action** (what should I do?)
4. **Supporting info** (what else do I need to know?)

Example - Menu Page:

```
H1: Our Menu                    [What]
H2: Fresh coffee, made to order [Why]
[Filter buttons: All, Coffee, Tea, Pastries]
[Menu items grid]               [Primary content]
CTA: Can't decide? Try our Signature Blend [Secondary action]
```

---

## Error Handling

### Error States

**Philosophy**: Errors are opportunities to be helpful, not blame users.

#### Form Validation

```jsx
{/* Inline validation */}
<div className="form-group">
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    className={errors.email ? 'error' : ''}
    aria-invalid={errors.email ? 'true' : 'false'}
    aria-describedby={errors.email ? 'email-error' : undefined}
  />
  {errors.email && (
    <p id="email-error" className="form-error" role="alert">
      <AlertCircle />
      Please enter a valid email address
    </p>
  )}
</div>
```

#### Error Messages

**Structure:**
1. What went wrong (clear, specific)
2. Why it went wrong (if helpful)
3. How to fix it (actionable)

```jsx
{/* Good error message */}
<div className="error-message" role="alert">
  <AlertCircle />
  <div>
    <strong>Payment failed</strong>
    <p>Your card was declined. Please check your card details or try a different payment method.</p>
    <button className="btn-primary">Update Payment</button>
  </div>
</div>

{/* Bad error message */}
<div className="error">
  Error 422: Unprocessable Entity
</div>
```

#### API Error Handling

```jsx
// Network error
{error.type === 'network' && (
  <div className="error-state">
    <WifiOff />
    <h3>No internet connection</h3>
    <p>Check your connection and try again</p>
    <button onClick={retry}>Retry</button>
  </div>
)}

// Server error
{error.type === 'server' && (
  <div className="error-state">
    <AlertCircle />
    <h3>Something went wrong</h3>
    <p>We're working on it. Try again in a few moments.</p>
    <button onClick={retry}>Retry</button>
  </div>
)}

// Not found
{error.type === 'notfound' && (
  <div className="error-state">
    <Search />
    <h3>Order not found</h3>
    <p>Check your order number and try again</p>
    <a href="/orders">View all orders</a>
  </div>
)}
```

### Empty States

**Turn absence into opportunity:**

```jsx
{/* Empty cart */}
<div className="empty-state">
  <ShoppingCart />
  <h3>Your cart is empty</h3>
  <p>Add items from our menu to get started</p>
  <a href="/menu" className="btn-primary">Browse Menu</a>
</div>

{/* No orders */}
<div className="empty-state">
  <Coffee />
  <h3>No orders yet</h3>
  <p>Ready for your first coffee?</p>
  <a href="/menu" className="btn-primary">Order Now</a>
</div>

{/* No search results */}
<div className="empty-state">
  <Search />
  <h3>No results for "{searchQuery}"</h3>
  <p>Try searching for something else</p>
  <button onClick={clearSearch}>Clear search</button>
</div>
```

### Loading States

**Never show a blank screen:**

```jsx
{/* Skeleton loading */}
<div className="menu-grid">
  {[1, 2, 3, 4].map(i => (
    <div key={i} className="menu-item-skeleton">
      <div className="skeleton skeleton-image" />
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-button" />
    </div>
  ))}
</div>

{/* Spinner for quick actions */}
<button disabled>
  <Spinner className="animate-spin" />
  Adding to cart...
</button>

{/* Progress for long operations */}
<div className="upload-progress">
  <div className="progress-bar" style={{ width: `${progress}%` }} />
  <p>Uploading... {progress}%</p>
</div>
```

---

## Performance Guidelines

### Image Optimization

**Rules:**
1. Use WebP with JPG fallback
2. Serve responsive images (srcset)
3. Lazy load below-the-fold images
4. Compress images (80% quality)
5. Size appropriately (no 4K images for thumbnails)

```jsx
<picture>
  <source
    srcset="
      latte-small.webp 400w,
      latte-medium.webp 800w
    "
    type="image/webp"
  />
  <img
    srcset="
      latte-small.jpg 400w,
      latte-medium.jpg 800w
    "
    src="latte-medium.jpg"
    alt="Caramel latte"
    loading="lazy"
    width="800"
    height="600"
  />
</picture>
```

### Font Loading

```css
/* System fonts load instantly */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* If using custom fonts */
@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  font-display: swap;  /* Show fallback, swap when loaded */
  font-weight: 400;
}
```

### CSS Performance

```css
/* Good - GPU accelerated */
.element {
  transform: translateX(100px);
  opacity: 0.5;
}

/* Bad - Causes reflow */
.element {
  left: 100px;
  width: 200px;
}
```

### JavaScript Performance

**Critical rendering path:**
1. Inline critical CSS (above-the-fold)
2. Defer non-critical JavaScript
3. Use code splitting
4. Lazy load components

```jsx
// Lazy load heavy components
const OrderHistory = lazy(() => import('./OrderHistory'));

// Use in component
<Suspense fallback={<LoadingSpinner />}>
  <OrderHistory />
</Suspense>
```

### Performance Budget

**Target metrics:**
- First Contentful Paint: < 1.8s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.8s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

---

## Design Checklist

### Before Launch

#### Visual Design
- [ ] All colors meet WCAG AA contrast ratios
- [ ] Typography is readable on all devices
- [ ] Spacing is consistent (8pt grid)
- [ ] Interactive elements have clear states (hover, focus, active, disabled)
- [ ] Images are optimized and responsive
- [ ] Icons are consistent in style and size

#### Accessibility
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Form inputs have associated labels
- [ ] Images have descriptive alt text
- [ ] Color is not the only means of conveying information
- [ ] Screen reader tested
- [ ] ARIA labels added where needed

#### Responsive Design
- [ ] Mobile-first approach used
- [ ] Tested on actual devices (not just browser DevTools)
- [ ] Touch targets are minimum 44×44px
- [ ] Content is readable without zooming
- [ ] Horizontal scrolling is intentional only

#### Performance
- [ ] Images compressed and sized appropriately
- [ ] Critical CSS inlined
- [ ] JavaScript deferred/async where appropriate
- [ ] Fonts optimized (font-display: swap)
- [ ] Lighthouse score >90

#### Content
- [ ] All text is clear and concise
- [ ] Buttons have descriptive labels
- [ ] Error messages are helpful
- [ ] Empty states are friendly
- [ ] Loading states prevent confusion

#### Functionality
- [ ] All forms validate properly
- [ ] Error handling is robust
- [ ] Success states provide confirmation
- [ ] Navigation is logical and consistent
- [ ] Back button works as expected

---

## Final Thoughts

After five decades in this field, I've learned that **good design ages well**. Trends come and go, but clarity, consistency, and consideration for users never goes out of style.

**Remember:**

1. **Users don't care about your design** - They care about getting their coffee quickly and easily. Your design should be invisible.

2. **Every decision should have a reason** - "It looks cool" is not a reason. "It helps users understand the checkout process" is.

3. **Consistency builds trust** - When buttons look like buttons and links look like links, users feel confident.

4. **Accessibility is not optional** - It's the foundation of good design. If it's not accessible, it's not finished.

5. **Performance is a feature** - A beautiful design that loads slowly is a failed design.

6. **Test with real users** - Your assumptions will be wrong. Mine always were. Let users teach you.

7. **Iterate based on data** - Track metrics, watch heatmaps, read support tickets. Let behavior guide your decisions.

8. **Design systems prevent chaos** - These guidelines aren't restrictions—they're freedoms. They free you from reinventing solutions and let you focus on real problems.

---

## Resources

### Design Tools
- **Figma**: Component libraries, prototyping
- **Adobe XD**: Alternative to Figma
- **Sketch**: Mac-only design tool

### Accessibility Tools
- **WAVE**: Web accessibility evaluation
- **axe DevTools**: Browser extension
- **Lighthouse**: Built into Chrome DevTools
- **WebAIM Contrast Checker**: Color contrast

### Testing
- **BrowserStack**: Cross-browser testing
- **Chrome DevTools**: Performance, accessibility
- **Responsive Design Mode**: Built into browsers

### Learning
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Nielsen Norman Group**: UX research
- **A List Apart**: Web design articles
- **Smashing Magazine**: Design & development

---

*These guidelines are living documents. Update them as you learn. Question them when they don't serve users. And always, always put people first.*

— Your Senior UX Designer

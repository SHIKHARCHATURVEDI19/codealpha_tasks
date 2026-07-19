---
name: Quantum Precision
colors:
  surface: '#101417'
  surface-dim: '#101417'
  surface-bright: '#36393e'
  surface-container-lowest: '#0b0f12'
  surface-container-low: '#181c20'
  surface-container: '#1c2024'
  surface-container-high: '#272a2e'
  surface-container-highest: '#323539'
  on-surface: '#e0e2e8'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e0e2e8'
  inverse-on-surface: '#2d3135'
  outline: '#849495'
  outline-variant: '#3b494b'
  surface-tint: '#00dbe9'
  primary: '#dbfcff'
  on-primary: '#00363a'
  primary-container: '#00f0ff'
  on-primary-container: '#006970'
  inverse-primary: '#006970'
  secondary: '#c9c6c5'
  on-secondary: '#313030'
  secondary-container: '#4a4949'
  on-secondary-container: '#bab8b7'
  tertiary: '#f4f6f7'
  on-tertiary: '#2e3132'
  tertiary-container: '#d7d9da'
  on-tertiary-container: '#5c5f60'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#7df4ff'
  primary-fixed-dim: '#00dbe9'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c9c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e1e3e4'
  tertiary-fixed-dim: '#c5c7c8'
  on-tertiary-fixed: '#191c1d'
  on-tertiary-fixed-variant: '#444748'
  background: '#101417'
  on-background: '#e0e2e8'
  surface-variant: '#323539'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 72px
    fontWeight: '800'
    lineHeight: 80px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The brand personality is high-end, futuristic, and technically superior. It positions itself as a gateway to "next-gen" technology, catering to discerning enthusiasts who value both performance and aesthetics. The UI must evoke a sense of digital craftsmanship—precise, expensive, and innovative.

The design system utilizes a **Glassmorphic** style layered over a **Minimalist** foundation. It uses translucent surfaces, subtle background blurs, and vibrant cyan accents to create a sense of depth and technical sophistication. This is complemented by a "Dark Mode" default that emphasizes the luminosity of the hardware photography and the electric primary accents.

## Colors

The palette is anchored in deep charcoals and pure blacks to create a high-contrast environment where tech products can shine. 

- **Primary (Electric Cyan):** Used sparingly for key calls to action, active states, and "quantum" glows. It represents energy and innovation.
- **Secondary (Obsidian):** The foundation of the UI. This deep black provides the canvas for glass effects.
- **Tertiary (Graphite):** Used for surface-level containers and card backgrounds to create subtle layering.
- **Neutral (Slate):** Reserved for secondary text and disabled states to maintain low visual noise.

The "Glass" effect is achieved through semi-transparent whites (e.g., `rgba(255, 255, 255, 0.05)`) with a high backdrop-blur (20px+) and thin 1px borders.

## Typography

This design system uses **Inter** exclusively to maintain a clean, systematic, and modern aesthetic. The hierarchy is driven by significant variations in weight and letter-spacing rather than color. 

Headlines utilize tight tracking and heavy weights to appear bold and authoritative. Body text is optimized for legibility against dark backgrounds, using a slightly higher line-height to prevent eye fatigue. Labels utilize uppercase styling for a "technical readout" feel in navigation and metadata.

## Layout & Spacing

The layout follows a **Fluid Grid** philosophy within a maximum container width of 1280px. A 12-column system is used for desktop, collapsing to 4 columns on mobile. 

The spacing rhythm is generous, particularly in vertical stacking (XL/80px) to create the "luxury" feel mentioned in the brand narrative. Whitespace is used as a deliberate tool to separate product categories and spotlight featured hardware. Margins are kept wide (48px+ on desktop) to allow the glassmorphic surfaces room to breathe.

## Elevation & Depth

Visual hierarchy is established through **Backdrop Blurs** and **Inner Glows** rather than traditional drop shadows.

- **Level 0 (Floor):** Pure black `#000000`.
- **Level 1 (Base Layer):** Graphite `#1A1D1E` with a subtle 1px border `rgba(255, 255, 255, 0.1)`.
- **Level 2 (Glass Floating):** Semi-transparent white background with a 24px backdrop-blur. These surfaces feature a very soft "Cyan Glow" (`0px 0px 30px rgba(0, 240, 255, 0.05)`) to suggest quantum energy radiating from the component.
- **Level 3 (Interactive):** Active buttons and hovered cards increase the intensity of the Cyan glow and border opacity.

## Shapes

The shape language balances technical precision with modern comfort. A "Rounded" (8px base) corner radius is applied to most UI components including cards, input fields, and standard buttons. This softens the "industrial" feel of the dark theme. High-impact buttons (like "Shop Now") may utilize a pill-shape to draw immediate attention as distinct interactive objects.

## Components

### Buttons
- **Primary:** Solid Cyan fill with black text. On hover, apply a cyan outer glow (`box-shadow: 0 0 20px rgba(0, 240, 255, 0.4)`).
- **Secondary (Glass):** Transparent background with a 1px white border (20% opacity) and backdrop-blur.

### Cards
Product cards should use the "Glass Floating" style. The product image should be high-resolution with the background removed, appearing to sit *on top* of the glass surface. Use a subtle gradient overlay at the bottom of the card for text legibility.

### Input Fields
Dark backgrounds (`#0A0A0A`) with a 1px slate border. Focus states should transition the border color to Cyan and add a faint inner glow.

### Chips & Tags
Small, pill-shaped elements with a low-opacity Cyan background (`rgba(0, 240, 255, 0.1)`) and bright Cyan text. Used for "New Arrival" or "Exclusive" labels.

### Lists
Clean, borderless entries separated by generous vertical padding (16px). Use Cyan icons as bullet points or indicators to maintain the tech theme.
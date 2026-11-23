# Business Radar — design brief (warm editorial)

1. **Tokens.** Paper `#F5EFE4` page · Surface `#FBF7EF` cards · Sunk `#EBE3D3` wells/inputs · Ink `#1B1612` text + primary fills · Walnut `#5A4636` secondary text (7.8:1) · Tan `#8A6A4F` icons, large labels only (4.3:1, never small body text) · Hairline `#CDBBA3` borders. One accent: terracotta `#C2562B` for marks, rings, the stamp; `#A8461F` (accent-strong, 5.2:1) whenever the accent carries text or sits under text. Status: olive `#6B7A3A`/`#56632B`, ochre `#C8962E`/`#8A6414`, brick `#A33B2B`, stone `#8C8174`/`#6E6458` (base for dots, deep for text). Never `#000`, `#fff`, or raw Tailwind palette names in components.
2. **Type.** Display: Newsreader (opsz axis) — a newspaper text face with real optical sizes, so 56px headlines get sharp contrast while 20px card titles stay sturdy; it reads "local paper", which suits a product about neighbourhood shops. UI/body: Hanken Grotesk. Data: JetBrains Mono, tabular figures. Scale ≈1.25: 12 · 14 · 16 · 20 · 25 · 31 · 39 · 49 · 61. Headline tracking −0.02em, body line-height 1.55, prose max 62ch. Sentence case everywhere.
3. **Spacing.** 4px base: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 72 · 112. Sections breathe at 72–112; cards pad 16–24.
4. **Radius.** 6px controls (`rounded-ctl`), 14px panels (`rounded-panel`). `rounded-full` only for avatars, map dots and the score dial.
5. **Depth.** 1px hairline borders, no soft shadows. One hard shadow (`shadow-hard` = 4px 4px 0 ink) reserved for the primary button and the selected lead card.
6. **Texture.** SVG paper grain at 3.5% on the page background only. No glass, glow, gradient text or blobs.
7. **Icons.** lucide only, stroke 1.5, inline with text, never inside coloured tiles, never animated.
8. **Motion.** 150–400ms ease-out, one moving thing per region, all gated by `prefers-reduced-motion`. Only the map sweep may loop.
9. **Components.** Button (primary/ink/ghost) · Badge (status, flag) · Card · Input · Popover · Drawer · Score (dial + rotated stamp) · Skeleton. Build pages from these, not ad-hoc classes.
10. **Do / don't.** Do: uneven grids, real Hyderabad names and numbers, label sample data "sample", show the map. Don't: italic accent word, all-caps eyebrows over headings, numbered 01/02/03 sections, three equal cards in a row, emoji as UI, pulsing icons, "powerful/seamless/unlock".

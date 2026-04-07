# Brain2 Platform — Design System Spec

> Source of truth cho visual design. Claude Code PHẢI tuân theo file này khi build UI.

## Colors (CSS Variables)

```css
:root {
  /* Brand — Navy Blue + Gold */
  --primary: hsl(220, 70%, 45%);
  --primary-hover: hsl(220, 70%, 55%);
  --primary-light: hsl(220, 70%, 90%);
  --primary-glow: hsla(220, 70%, 50%, 0.15);
  --accent: hsl(45, 85%, 55%);
  --accent-hover: hsl(45, 85%, 65%);
  --accent-glow: hsla(45, 85%, 55%, 0.15);

  /* Dark Mode Surfaces */
  --bg-primary: hsl(225, 20%, 8%);
  --bg-secondary: hsl(225, 18%, 12%);
  --bg-tertiary: hsl(225, 16%, 16%);
  --bg-hover: hsl(225, 16%, 20%);
  --bg-input: hsl(225, 18%, 14%);

  /* Text */
  --text-primary: hsl(220, 15%, 92%);
  --text-secondary: hsl(220, 10%, 65%);
  --text-muted: hsl(220, 8%, 45%);
  --text-inverse: hsl(225, 20%, 8%);

  /* Functional */
  --success: hsl(145, 65%, 45%);
  --warning: hsl(35, 90%, 55%);
  --error: hsl(0, 70%, 55%);
  --info: hsl(200, 80%, 55%);

  /* Borders & Dividers */
  --border: hsl(225, 15%, 18%);
  --border-hover: hsl(225, 15%, 25%);
  --border-focus: var(--primary);

  /* Shadows */
  --shadow-sm: 0 1px 2px hsla(0, 0%, 0%, 0.3);
  --shadow-md: 0 4px 12px hsla(0, 0%, 0%, 0.4);
  --shadow-lg: 0 8px 24px hsla(0, 0%, 0%, 0.5);
  --shadow-glow: 0 0 20px var(--primary-glow);

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Typography */
  --font-sans: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;

  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;
  --text-4xl: 40px;

  --leading-tight: 1.3;
  --leading-normal: 1.6;
  --leading-relaxed: 1.8;

  /* Layout */
  --sidebar-width: 260px;
  --sidebar-collapsed: 60px;
  --header-height: 56px;
  --chat-max-width: 768px;
  --content-max-width: 960px;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}
```

## Typography

```css
/* Headings */
h1 { font-size: var(--text-3xl); font-weight: 700; line-height: var(--leading-tight); }
h2 { font-size: var(--text-2xl); font-weight: 600; line-height: var(--leading-tight); }
h3 { font-size: var(--text-xl); font-weight: 600; line-height: var(--leading-tight); }
h4 { font-size: var(--text-base); font-weight: 600; line-height: var(--leading-tight); }

/* Body */
body { font-size: var(--text-base); line-height: var(--leading-normal); }
small { font-size: var(--text-sm); }
code { font-family: var(--font-mono); font-size: var(--text-sm); }
```

## Component Styles

### Buttons
```css
.btn {
  display: inline-flex; align-items: center; gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-weight: 500; font-size: var(--text-sm);
  transition: all var(--transition-fast);
  cursor: pointer; border: none;
}
.btn-primary {
  background: var(--primary); color: white;
}
.btn-primary:hover {
  background: var(--primary-hover);
  box-shadow: var(--shadow-glow);
  transform: translateY(-1px);
}
.btn-secondary {
  background: transparent; color: var(--text-primary);
  border: 1px solid var(--border);
}
.btn-secondary:hover {
  border-color: var(--border-hover);
  background: var(--bg-hover);
}
.btn-accent {
  background: var(--accent); color: var(--text-inverse);
}
.btn-ghost {
  background: transparent; color: var(--text-secondary);
}
.btn-ghost:hover {
  color: var(--text-primary); background: var(--bg-hover);
}
```

### Cards
```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  transition: all var(--transition-base);
}
.card:hover {
  border-color: var(--border-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

### Inputs
```css
.input {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-sm) var(--space-md);
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: border-color var(--transition-fast);
}
.input:focus {
  border-color: var(--border-focus);
  outline: none;
  box-shadow: 0 0 0 3px var(--primary-glow);
}
.input::placeholder {
  color: var(--text-muted);
}
```

## Animations

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Usage */
.animate-fade-in { animation: fadeIn var(--transition-slow) ease; }
.animate-slide-up { animation: slideUp var(--transition-slow) ease; }
.animate-scale-in { animation: scaleIn var(--transition-base) ease; }

/* Skeleton loader */
.skeleton {
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-hover) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}
```

## Layout Patterns

### Sidebar + Main
```css
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-sans);
}
.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-base);
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

### Chat Layout
```css
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: var(--chat-max-width);
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--space-md);
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg) 0;
}
.chat-input-area {
  padding: var(--space-md) 0 var(--space-lg);
  border-top: 1px solid var(--border);
}
```

## Responsive Breakpoints

```css
/* Tablet — sidebar overlay */
@media (max-width: 1023px) {
  .sidebar { position: fixed; z-index: 50; transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
}

/* Mobile — bottom nav */
@media (max-width: 767px) {
  .sidebar { display: none; }
  .bottom-nav { display: flex; }
}
```

## Vibe Reference: Perplexity AI

Lấy cảm hứng từ:
- **Clean, minimal** — rất ít visual noise
- **Search-bar centered** — chat input là focal point
- **Neutral surfaces** — backgrounds rất subtle
- **Smooth transitions** — mọi thứ animate nhẹ nhàng
- **Premium feel** — typography chỉn chu, spacing rộng rãi

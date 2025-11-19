# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **frequency distribution table and histogram generator** - a pure client-side web application for statistical analysis. It generates frequency distribution tables, histograms, and relative frequency polygons from numerical data.

**Stack**: Vanilla JavaScript (ES6+), HTML5 Canvas, CSS3 (no frameworks or build tools)

## Architecture

### File Structure
```
statistics/
├── index.html    # Main HTML structure (2-column layout)
├── app.js        # All JavaScript logic (~750 lines)
└── styles.css    # Dark theme CSS with CSS variables
```

### Code Architecture (app.js)

The application follows a **layered architecture** with strict separation of concerns:

```
CONFIG (constants)
    ↓
Utils, Validator, MessageManager (utilities)
    ↓
DataProcessor (business logic)
    ↓
UIRenderer, ChartRenderer (presentation)
    ↓
FrequencyDistributionApp (controller)
```

#### Key Classes

1. **CONFIG** (lines 10-46): Global constants for all magic numbers
   - Data limits, chart dimensions, validation rules
   - `getColor(varName)` method to read CSS variables

2. **Utils** (lines 49-94): Static utility functions
   - `escapeHtml()` for XSS prevention
   - `formatNumber()` for consistent decimal formatting
   - `debounce()` for performance optimization

3. **Validator** (lines 97-158): Input validation layer
   - All validation returns `{ valid: boolean, message?: string }`
   - Validates data arrays, class counts, and class widths

4. **MessageManager** (lines 161-189): UI feedback system
   - Displays error/success/warning messages
   - Auto-hides after 5 seconds
   - Uses DOM manipulation (not innerHTML) for security

5. **DataProcessor** (lines 192-302): Core statistical calculations
   - **IMPORTANT**: `createClasses()` takes a `stats` object (not raw data) to avoid duplicate `Math.min/max` calls
   - `calculateFrequencies()` handles out-of-range data and shows warnings
   - All methods are static and pure (no side effects)

6. **UIRenderer** (lines 305-405): Table/stats card rendering
   - **XSS PREVENTION**: Uses DOM manipulation (createElement, textContent) instead of innerHTML
   - `renderStatsCards()` creates 6 stat cards and adds 'active' class to container
   - `renderFrequencyTable()` builds table with proper colspan for totals row

7. **ChartRenderer** (lines 408-650): Canvas visualization
   - Constructor sets up canvas with fixed size (700x450)
   - `draw()` method resets canvas size on each render
   - Uses `CONFIG.getColor()` to sync with CSS theme
   - Draws in order: grid → histogram → polygon → axes → legend

8. **FrequencyDistributionApp** (lines 653-748): Main controller
   - Initializes event listeners (no inline onclick handlers)
   - Supports Ctrl+Enter keyboard shortcut
   - Orchestrates all layers in `generate()` method

### Layout Structure (HTML)

```
.layout-grid (2-column grid)
├── .left-column (380px, sticky)
│   ├── .input-section
│   │   ├── .info (help text)
│   │   ├── textarea#dataInput
│   │   ├── input#classCount
│   │   ├── input#classWidth
│   │   └── button#generateBtn
│   └── .stats-summary#statsSummary (6 cards, 2x3 grid)
└── .right-column (flexible)
    └── .result-section#resultSection
        ├── .table-section
        │   └── table#frequencyTable
        └── .chart-container
            └── canvas#chart
```

### Theme System (CSS)

All colors and spacing use CSS variables defined in `:root`:
- Dark theme with gradient background (`#0f172a` → `#1e293b`)
- Primary color: `#7c3aed` (purple)
- Chart line: `#f97316` (orange)
- JavaScript accesses these via `CONFIG.getColor('--color-primary')`

## Development Workflow

### Running Locally
Open `index.html` in any modern browser. No build step required.

For live reload during development:
```bash
python -m http.server 8000
# or
npx serve
```

### Testing
Manual testing checklist:
1. Valid data input (comma/space separated numbers)
2. Edge cases: empty input, single value, very large datasets (10,000 limit)
3. Out-of-range data (should show warning)
4. Invalid class count (< 3 or > 20)
5. Responsive layout (resize browser window)
6. Keyboard shortcut (Ctrl+Enter)

## Key Design Decisions

### Security
- **XSS Prevention**: All user input is sanitized using `textContent` (never innerHTML)
- **Input Validation**: Comprehensive validation before processing (Validator class)
- **No eval()**: All data parsing uses safe methods

### Performance
- Canvas resets size on each draw to prevent memory leaks
- Debounced resize events (250ms)
- Early returns for empty/invalid data

### Accessibility
- ARIA labels and roles throughout HTML
- `.sr-only` class for screen reader text
- Keyboard navigation support (Ctrl+Enter)
- Focus states with visible outlines

### Data Flow
```
User Input → Validator → DataProcessor → { UIRenderer, ChartRenderer } → DOM/Canvas
                ↓
           MessageManager (on error)
```

## Common Modifications

### Changing Chart Colors
Edit CSS variables in `:root` (lines 1-54 in styles.css):
```css
--chart-bar-color: rgba(124, 58, 237, 0.7);
--chart-line-color: #f97316;
```

### Adjusting Validation Rules
Edit CONFIG constants (lines 10-46 in app.js):
```javascript
MAX_DATA_POINTS: 10000,
MIN_CLASS_COUNT: 3,
MAX_CLASS_COUNT: 20,
```

### Adding New Statistics
1. Calculate in `DataProcessor.calculateBasicStats()` (returns object)
2. Add to `statsData` array in `UIRenderer.renderStatsCards()`
3. Adjust `.stats-summary` grid in CSS if needed

### Modifying Canvas Size
Change `CONFIG.CANVAS_WIDTH` and `CONFIG.CANVAS_HEIGHT` (lines 38-39)

## Important Notes

- **State Management**: Application is stateless - each "generate" action recalculates everything
- **No Dependencies**: Pure vanilla JavaScript, no npm packages
- **Browser Support**: Modern browsers only (ES6+, Canvas API, CSS Grid)
- **Language**: UI text is in Korean (ko)
- **Canvas Context**: Never call `getContext('2d')` more than once per canvas (stored in constructor)
- **Class Intervals**: Uses `[min, max)` for all classes except last class which uses `[min, max]`

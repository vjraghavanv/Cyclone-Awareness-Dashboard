# Accessibility Features

This document outlines the accessibility features implemented in the Cyclone Awareness Dashboard to ensure WCAG 2.1 Level AA compliance.

## Overview

The Cyclone Awareness Dashboard is designed to be accessible to all users, including those with disabilities. We follow WCAG 2.1 Level AA guidelines to ensure the application is perceivable, operable, understandable, and robust.

## Implemented Features

### 1. Keyboard Navigation (WCAG 2.1.1, 2.1.2)

- **Skip to Main Content**: A skip link is provided at the top of the page for keyboard users to bypass navigation
- **Focus Visible**: All interactive elements have visible focus indicators (blue outline)
- **Tab Order**: Logical tab order throughout the application
- **No Keyboard Traps**: Users can navigate in and out of all components using keyboard alone

**How to test**: Use Tab, Shift+Tab, Enter, and Space keys to navigate the entire application.

### 2. Color and Contrast (WCAG 1.4.3, 1.4.11)

- **Text Labels with Colors**: All color-coded severity indicators include text labels
  - Yellow = "Moderate Risk"
  - Orange = "High Risk"  
  - Red = "Severe Risk"
- **Minimum Contrast Ratio**: 4.5:1 for normal text, 3:1 for large text
- **High Contrast Mode**: Special styles for users with high contrast preferences
- **Color Independence**: Information is not conveyed by color alone

**How to test**: Enable high contrast mode in your OS settings or use a contrast checker tool.

### 3. Screen Reader Support (WCAG 1.3.1, 4.1.2, 4.1.3)

- **Semantic HTML**: Proper use of `<main>`, `<section>`, `<article>`, `<nav>`, `<header>`, `<footer>`
- **ARIA Labels**: All interactive elements have descriptive labels
- **ARIA Live Regions**: Dynamic updates are announced (e.g., `aria-live="polite"` for updates feed)
- **ARIA Roles**: Appropriate roles for custom components
- **Alt Text**: All images and maps have alternative text descriptions

**Components with ARIA support**:
- UpdatesFeed: `aria-live="polite"` for new updates
- DistrictRiskPanel: `role="status"` for severity indicators
- HolidayPredictor: `role="status"` for predictions
- TravelRouteChecker: `role="status"` for recommendations
- PreparationChecklist: Progress bar with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

**How to test**: Use NVDA (Windows), JAWS (Windows), or VoiceOver (Mac/iOS) screen readers.

### 4. Responsive and Zoom Support (WCAG 1.4.4, 1.4.10)

- **200% Zoom**: Application remains functional without horizontal scrolling at 200% zoom
- **Responsive Typography**: Font sizes scale appropriately
- **Flexible Layouts**: Grid and flexbox layouts adapt to different screen sizes
- **No Fixed Widths**: Content reflows naturally

**How to test**: Zoom to 200% in your browser (Ctrl/Cmd + +) and verify no horizontal scrolling.

### 5. Touch Targets (WCAG 2.5.5)

- **Minimum Size**: All interactive elements are at least 44x44 pixels on mobile
- **Adequate Spacing**: Sufficient space between touch targets to prevent mis-taps
- **Touch-Friendly Controls**: Maps have touch-friendly zoom and pan controls

**How to test**: Use a mobile device or browser dev tools mobile emulation.

### 6. Motion and Animation (WCAG 2.3.3)

- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **No Auto-Play**: No automatically playing animations or videos
- **Smooth Scrolling**: Can be disabled via OS settings

**How to test**: Enable "Reduce motion" in your OS accessibility settings.

### 7. Language Support (WCAG 3.1.1, 3.1.2)

- **Language Attribute**: HTML lang attribute set appropriately
- **Bilingual Support**: Full English and Tamil translations
- **Language Switching**: Easy language selection with persistent preference

### 8. Form Accessibility (WCAG 3.3.1, 3.3.2)

- **Labels**: All form inputs have associated labels
- **Required Fields**: Marked with `aria-required="true"`
- **Error Messages**: Clear error messages for validation failures
- **Input Purpose**: Appropriate autocomplete attributes where applicable

## Testing Checklist

### Automated Testing
- [ ] Run axe DevTools or WAVE browser extension
- [ ] Check color contrast with WebAIM Contrast Checker
- [ ] Validate HTML with W3C Validator

### Manual Testing
- [ ] Navigate entire app using only keyboard
- [ ] Test with screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Zoom to 200% and verify no horizontal scroll
- [ ] Test on mobile device for touch targets
- [ ] Enable high contrast mode
- [ ] Enable reduced motion
- [ ] Test with different language settings

### User Testing
- [ ] Test with users who use assistive technologies
- [ ] Gather feedback on usability
- [ ] Iterate based on real-world usage

## Known Limitations

1. **Map Accessibility**: Interactive maps (Leaflet.js) have limited screen reader support. We provide text-based alternatives in the DistrictRiskPanel.

2. **Third-Party Embeds**: Zoom Earth and Windy iframe embeds may not be fully accessible. These are optional features.

## Future Improvements

1. Add more comprehensive keyboard shortcuts
2. Implement focus management for modal dialogs
3. Add more detailed ARIA descriptions for complex components
4. Provide audio alerts for critical warnings
5. Add customizable color themes for better personalization

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

## Contact

For accessibility issues or suggestions, please open an issue in the project repository.

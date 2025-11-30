# Implementation Plan

- [x] 1. Set up project structure and development environment
  - Initialize React 18 + Vite project with TypeScript
  - Configure TailwindCSS for styling
  - Set up Vitest for unit testing and fast-check for property-based testing
  - Create folder structure (components, services, contexts, types, utils, hooks)
  - Configure ESLint and Prettier
  - _Requirements: All requirements depend on proper project setup_

- [x] 2. Implement core data models and TypeScript interfaces
  - Define all TypeScript interfaces (CycloneData, DistrictRisk, TravelRouteAnalysis, Update, etc.)
  - Create CycloneEvent, District, and TravelRoute classes with methods
  - Implement data validation utilities
  - _Requirements: 1.1, 2.1, 4.1, 5.1_

- [x] 2.1 Write property test for data model validation
  - **Property 13: API response validation**
  - **Validates: Requirements 10.9**

- [x] 3. Build severity calculation system
  - Implement SeverityCalculator service with unified algorithm
  - Create severity score calculation: (rainfall * 0.4) + (wind * 0.3) + (flooding * 0.3)
  - Implement color mapping logic (yellow/orange/red based on score ranges)
  - _Requirements: 1.3, 12.1, 12.2, 12.3, 12.4_

- [x] 3.1 Write property test for severity calculation
  - **Property 1: Severity color classification consistency**
  - **Validates: Requirements 1.3, 12.2**

- [x] 3.2 Write property test for severity score calculation
  - **Property 15: Severity score calculation consistency**
  - **Validates: Requirements 12.1, 12.3**

- [x] 4. Implement Local Storage management





  - Create StorageManager service with save/get/delete/clear methods
  - Implement storage for cyclone ID, saved routes, checklist state, language preference
  - Add automatic cleanup for data older than 30 days
  - Implement storage quota management (5MB limit)
  - _Requirements: 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 7.5, 15.5, 17.2, 17.3, 17.4, 17.5_

- [x] 4.1 Write property test for Local Storage round-trip










  - **Property 9: Local Storage round-trip consistency**
  - **Validates: Requirements 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 15.5**

- [ ]* 4.2 Write property test for storage cleanup
  - **Property 10: Local Storage cleanup by age**
  - **Validates: Requirements 7.5**

- [ ]* 4.3 Write property test for storage data type restriction
  - **Property 22: Local Storage data type restriction**
  - **Validates: Requirements 17.2, 17.3**

- [ ]* 4.4 Write property test for storage quota management
  - **Property 23: Storage quota management**
  - **Validates: Requirements 17.5**

- [x] 5. Build caching system


  - Create CacheManager service with get/set/isValid/getFreshness/clear methods
  - Implement cache TTL configuration (5 minutes for most endpoints)
  - Create freshness indicator logic (fresh/yellow/orange/red based on age)
  - _Requirements: 13.1, 13.2, 13.5, 13.6, 14.1, 14.2, 14.3, 14.4_

- [ ]* 5.1 Write property test for cache TTL enforcement
  - **Property 16: Cache TTL enforcement**
  - **Validates: Requirements 13.1, 13.2**

- [ ]* 5.2 Write property test for manual refresh cache bypass
  - **Property 18: Manual refresh cache bypass**
  - **Validates: Requirements 13.6**

- [ ]* 5.3 Write property test for data staleness indicators
  - **Property 14: Data staleness indicator accuracy**
  - **Validates: Requirements 11.3, 14.2, 14.3, 14.4**

- [x] 6. Implement rate limiting



  - Create RateLimiter service with canMakeRequest/recordRequest methods
  - Configure 12 requests per hour per endpoint limit
  - Implement fallback to cached data when rate limit exceeded
  - _Requirements: 13.3, 13.4_

- [ ]* 6.1 Write property test for rate limit enforcement
  - **Property 17: Rate limit enforcement**
  - **Validates: Requirements 13.3, 13.4**

- [x] 7. Create API client with error handling



  - Implement APIClient service with all endpoint methods
  - Add retry logic with exponential backoff for 5xx errors
  - Implement error handling for network failures and API errors
  - Create error logging to browser console
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6, 10.1-10.10, 18.1_

- [ ]* 7.1 Write property test for network error handling
  - **Property 12: Network error graceful handling**
  - **Validates: Requirements 9.2, 9.3**

- [ ]* 7.2 Write property test for error logging
  - **Property 24: Error logging completeness**
  - **Validates: Requirements 18.1**

- [x] 8. Build internationalization (i18n) system



  - Create translation files for English and Tamil
  - Implement language detection from browser and Local Storage
  - Create LanguageContext for global language state
  - Implement useLanguage hook for components
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [ ]* 8.1 Write property test for language selection
  - **Property 19: Language selection text transformation**
  - **Validates: Requirements 15.1, 15.3**

- [ ]* 8.2 Write property test for browser language detection
  - **Property 20: Browser language detection**
  - **Validates: Requirements 15.6**

- [x] 9. Implement DataProvider context


  - Create DataContext with state for cyclone, districts, updates, holiday prediction
  - Integrate APIClient, CacheManager, and RateLimiter
  - Implement automatic data refresh logic
  - Add health check functionality for API endpoints
  - _Requirements: 9.1, 9.5, 18.2, 18.3, 18.4, 18.5, 18.6_

- [ ]* 9.1 Write property test for health check failure identification
  - **Property 25: Health check failure identification**
  - **Validates: Requirements 18.5**

- [x] 10. Checkpoint - Ensure all core services tests pass



  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Create Header component with system status



  - Build Header with app title and subtitle
  - Add LanguageSelector component for English/Tamil switching
  - Implement SystemStatus indicator (green/yellow/red based on health checks)
  - _Requirements: 15.1, 15.3, 18.6_

- [x] 12. Build CycloneMap component





  - Integrate Leaflet.js for interactive map
  - Display cyclone pathway visualization
  - Add district overlay with severity color coding
  - Implement iframe embeds for Zoom Earth and Windy
  - Add touch-friendly zoom and pan controls
  - _Requirements: 1.1, 1.2, 1.3, 8.5, 10.10_

- [ ]* 12.1 Write property test for district display completeness
  - **Property 2: District impact data completeness**
  - **Validates: Requirements 1.4, 1.5, 2.1**

- [x] 13. Create DistrictRiskPanel component






  - Display list of all districts with risk information
  - Show rainfall estimates, flooding probability, waterlogging risk
  - Implement severity indicators with color and numerical score
  - Add visual highlighting for high-risk districts
  - Include source attribution and last update timestamp
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 11.1, 11.2, 12.4_

- [ ]* 13.1 Write property test for risk level tag mapping
  - **Property 3: Risk level tag mapping**
  - **Validates: Requirements 2.3**

- [ ]* 13.2 Write property test for update metadata completeness
  - **Property 8: Update metadata completeness**
  - **Validates: Requirements 5.6, 11.1, 11.2**



- [x] 14. Implement HolidayPredictor component



  - Calculate holiday probability based on rainfall, wind speed, and alert levels
  - Display prediction label (Low Risk, Possible, Likely)
  - Show confidence level percentage
  - Display contributing factors
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ]* 14.1 Write property test for holiday prediction label validity
  - **Property 4: Holiday prediction label validity**
  - **Validates: Requirements 3.2**

- [x] 15. Build TravelRouteChecker component



  - Create RouteInput form with source and destination fields
  - Implement route analysis logic to identify intersecting districts
  - Display affected districts with rainfall levels
  - Show disruption time windows
  - Generate safety recommendation (Safe, Caution, Avoid Travel)
  - Highlight high-risk route segments on map
  - Integrate with Local Storage to save routes
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 7.2, 7.4_

- [ ]* 15.1 Write property test for route district intersection
  - **Property 5: Route district intersection completeness**
  - **Validates: Requirements 4.2**

- [ ]* 15.2 Write property test for route safety recommendation
  - **Property 6: Route safety recommendation validity**
  - **Validates: Requirements 4.5**

- [x] 16. Create UpdatesFeed component



  - Fetch and display IMD bulletins, rainfall alerts, government announcements, service advisories
  - Sort updates in chronological order (newest first)
  - Display timestamp and source for each update
  - Implement auto-refresh every 5 minutes
  - Show update type badges
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ]* 16.1 Write property test for updates chronological ordering
  - **Property 7: Updates chronological ordering**
  - **Validates: Requirements 5.1**

- [x] 17. Build PreparationChecklist component



  - Create checklist with categories (water, power, emergency, supplies)
  - Include water storage, power backup, emergency contacts items
  - Implement checkbox toggle functionality
  - Persist checklist state to Local Storage
  - Restore checklist state on dashboard load
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 18. Implement responsive design and mobile optimization



  - Apply TailwindCSS responsive classes for mobile (320-768px)
  - Optimize layout for tablet (768-1024px)
  - Optimize layout for desktop (>1024px)
  - Test touch interactions on mobile devices
  - Ensure 200% zoom support without horizontal scroll
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 16.7_

- [ ]* 18.1 Write property test for responsive layout adaptation
  - **Property 11: Responsive layout adaptation**
  - **Validates: Requirements 8.2, 8.3, 8.4**

- [x] 19. Add accessibility features



  - Implement keyboard navigation for all interactive elements
  - Add ARIA labels and roles to components
  - Include alt text for images and maps
  - Add text labels to all color-coded indicators
  - Ensure 4.5:1 contrast ratio for text
  - Create ARIA live regions for dynamic updates
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

- [ ]* 19.1 Write property test for accessibility text labels
  - **Property 21: Accessibility text labels for colors**
  - **Validates: Requirements 16.2**

- [x] 20. Create Footer with data provenance and privacy notice



  - Display data source attribution for all information
  - Show last update timestamps
  - Add privacy notice explaining Local Storage usage
  - Implement "Clear All Data" button
  - Display privacy policy text
  - _Requirements: 11.1, 11.2, 11.4, 11.5, 17.1, 17.4, 17.6_

- [ ] 21. Implement additional hazard information display
  - Update mock data generator to include storm surge and landslide data for districts
  - Add storm surge data display for coastal districts in DistrictRiskPanel
  - Show expected water level rise in meters for coastal districts
  - Display landslide probability for hilly districts in DistrictRiskPanel
  - Use consistent risk level indicators across all hazards
  - Show all applicable hazards for each district
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [ ]* 21.1 Write property test for multiple hazard display
  - **Property 26: Multiple hazard display completeness**
  - **Validates: Requirements 19.5**

- [x] 22. Create mock data generators for development
  - Implement MockDataGenerator with methods for all data types
  - Generate realistic cyclone data with various categories
  - Create district data with varying severity levels
  - Generate updates with different types and timestamps
  - Create holiday predictions and route analyses
  - _Requirements: Development support for all features_

- [x] 23. Set up error boundaries and error handling UI
  - Create ErrorBoundary component to catch React errors
  - Implement fallback UI for component errors
  - Add user-friendly error messages for API failures
  - Display offline indicator when network is unavailable
  - Show system status warnings for multiple API failures
  - _Requirements: 9.2, 9.3, 14.6, 18.2, 18.3_

- [x] 24. Implement data freshness indicators throughout UI
  - Add "Updated X minutes ago" text to all data panels
  - Display color-coded freshness indicators (green/yellow/orange/red)
  - Show warning message for data older than 60 minutes
  - Update indicators when fresh data arrives
  - _Requirements: 11.3, 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 25. Configure build and deployment





  - Set up Vite production build configuration
  - Configure code splitting for optimal bundle size
  - Set up environment variables for dev and production
  - Create deployment configuration for GitHub Pages, Vercel, and Netlify
  - Optimize assets (images, fonts)
  - Create pre-deployment check script
  - Create asset optimization script
  - Add SEO meta tags and PWA manifest
  - Configure security headers
  - _Requirements: Deployment infrastructure_

- [x] 26. Final Checkpoint - Ensure all tests pass








  - Ensure all tests pass, ask the user if questions arise.

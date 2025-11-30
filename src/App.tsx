import { 
  Header, 
  CycloneMap, 
  DistrictRiskPanel, 
  HolidayPredictor, 
  TravelRouteChecker, 
  UpdatesFeed, 
  PreparationChecklist, 
  Footer,
  OfflineIndicator,
  APIErrorDisplay,
  SystemStatusWarning
} from './components';
import { useData } from './contexts/DataContext';

function App() {
  const { cyclone, districts, loading, error, refreshData } = useData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to main content link for keyboard navigation */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      
      {/* Offline indicator - shows when network is unavailable */}
      <OfflineIndicator />
      
      <Header />
      
      {/* Main content with responsive padding */}
      <main 
        id="main-content" 
        className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl"
        role="main"
        aria-label="Cyclone dashboard main content"
      >
        {/* System status warning - shows when multiple API endpoints fail */}
        <SystemStatusWarning />
        
        {loading && !cyclone && (
          <div className="text-center py-12 sm:py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading cyclone data...</p>
          </div>
        )}
        
        {/* API error display - shows user-friendly error messages */}
        {error && !cyclone && (
          <APIErrorDisplay error={error} onRetry={refreshData} />
        )}
        
        {cyclone && (
          <div className="space-y-4 sm:space-y-6">
            {/* Map Section - Full width on mobile, constrained on desktop */}
            <section className="w-full">
              <CycloneMap 
                cycloneData={cyclone} 
                districtRisks={districts}
                showLiveEmbed={false}
              />
            </section>
            
            {/* Two-column layout on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Left column */}
              <div className="space-y-4 sm:space-y-6">
                <section>
                  <DistrictRiskPanel />
                </section>
                
                <section>
                  <HolidayPredictor />
                </section>
                
                <section>
                  <UpdatesFeed />
                </section>
              </div>
              
              {/* Right column */}
              <div className="space-y-4 sm:space-y-6">
                <section>
                  <TravelRouteChecker />
                </section>
                
                <section>
                  <PreparationChecklist />
                </section>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer component */}
      <Footer />
    </div>
  );
}

export default App;

import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Screen with animated background */}
      <section className="relative animated-gradient text-white min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Decorative floating wilderness elements */}
        <div className="absolute top-20 left-10 text-6xl opacity-15 float" style={{ animationDelay: '0s' }}>🌲</div>
        <div className="absolute top-40 right-20 text-5xl opacity-15 float" style={{ animationDelay: '1s' }}>⛰️</div>
        <div className="absolute bottom-32 left-1/4 text-4xl opacity-10 float" style={{ animationDelay: '0.5s' }}>⭐</div>
        <div className="absolute top-1/3 right-1/3 text-5xl opacity-15 float" style={{ animationDelay: '1.5s' }}>🏔️</div>
        <div className="absolute bottom-20 right-1/4 text-4xl opacity-15 float" style={{ animationDelay: '2s' }}>🌲</div>
        <div className="absolute top-1/2 left-1/3 text-3xl opacity-10 float" style={{ animationDelay: '2.5s' }}>✨</div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-4rem)] flex items-center">
          <div className="text-center w-full fade-in">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight slide-in-bottom distressed-text">
              BARREN GROUND<br />
              <span className="inline-block mt-4 text-stone-200 drop-shadow-2xl" style={{ letterSpacing: '0.15em' }}>
                COFFEE
              </span>
            </h1>

            <p className="text-base sm:text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-stone-100 drop-shadow-2xl leading-relaxed px-4 fade-in font-bold" style={{ animationDelay: '0.2s', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              Northern roasted coffee from Yellowknife, NT. Source responsibly, roast with care, serve people well.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center scale-in" style={{ animationDelay: '0.4s' }}>
              <Link
                to="/menu"
                className="w-full sm:w-auto vintage-paper text-stone-900 px-8 sm:px-12 py-5 rounded-lg text-lg font-bold hover:bg-stone-100 transition-all shadow-2xl transform hover:scale-110 duration-300 border-4 border-stone-800 pulse-glow distressed-text"
                style={{ letterSpacing: '0.1em' }}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>EXPLORE MENU</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>

              <Link
                to="/register"
                className="w-full sm:w-auto bg-transparent border-4 border-stone-100 text-stone-100 px-8 sm:px-12 py-5 rounded-lg text-lg font-bold hover:bg-stone-100 hover:text-stone-900 transition-all duration-300 shadow-xl transform hover:scale-110 distressed-text"
                style={{ letterSpacing: '0.1em' }}
              >
                JOIN THE CREW
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-white opacity-80">
            <span className="text-sm font-medium">Scroll to explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="vintage-paper py-16 sm:py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-stone-900 mb-4 fade-in distressed-text" style={{ letterSpacing: '0.1em' }}>
              THE BARREN GROUND WAY
            </h2>
            <p className="text-lg sm:text-xl text-stone-700 max-w-2xl mx-auto fade-in font-bold px-4" style={{ animationDelay: '0.1s' }}>
              Northern roasted. Community powered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12">
            <div className="text-center p-6 sm:p-10 rounded-lg bg-gradient-to-br from-stone-100 to-stone-200 hover:from-stone-200 hover:to-stone-300 transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl duration-300 border-4 border-stone-800 scale-in" style={{ animationDelay: '0s' }}>
              <div className="text-5xl sm:text-7xl mb-4 sm:mb-6 float">☕</div>
              <h3 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4 text-stone-900 distressed-text" style={{ letterSpacing: '0.08em' }}>WEEKLY ROASTED</h3>
              <p className="text-stone-700 leading-relaxed text-sm sm:text-lg font-medium">
                Fresh coffee roasted weekly in Yellowknife for homes, offices, and cafés across the North.
              </p>
            </div>

            <div className="text-center p-6 sm:p-10 rounded-lg bg-gradient-to-br from-stone-100 to-stone-200 hover:from-stone-200 hover:to-stone-300 transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl duration-300 border-4 border-stone-800 scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-5xl sm:text-7xl mb-4 sm:mb-6 float" style={{ animationDelay: '0.5s' }}>🤝</div>
              <h3 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4 text-stone-900 distressed-text" style={{ letterSpacing: '0.08em' }}>LIVING WAGE</h3>
              <p className="text-stone-700 leading-relaxed text-sm sm:text-lg font-medium">
                We prioritize people over profits with above-market wages and career support for our team.
              </p>
            </div>

            <div className="text-center p-6 sm:p-10 rounded-lg bg-gradient-to-br from-stone-100 to-stone-200 hover:from-stone-200 hover:to-stone-300 transition-all transform hover:scale-105 shadow-lg hover:shadow-2xl duration-300 border-4 border-stone-800 sm:col-span-2 lg:col-span-1 scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-5xl sm:text-7xl mb-4 sm:mb-6 float" style={{ animationDelay: '1s' }}>🌿</div>
              <h3 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4 text-stone-900 distressed-text" style={{ letterSpacing: '0.08em' }}>QUALITY SOURCED</h3>
              <p className="text-stone-700 leading-relaxed text-sm sm:text-lg font-medium">
                High-quality coffees with verified origins and certifications. Source responsibly, roast with care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="wood-texture py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-stone-100">
            <div className="scale-in" style={{ animationDelay: '0s' }}>
              <div className="text-5xl font-bold mb-2 distressed-text">30+</div>
              <div className="text-xl opacity-90 font-semibold tracking-wide">MENU ITEMS</div>
            </div>
            <div className="scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-5xl font-bold mb-2 distressed-text">100%</div>
              <div className="text-xl opacity-90 font-semibold tracking-wide">FRESH DAILY</div>
            </div>
            <div className="scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-5xl font-bold mb-2 distressed-text">5★</div>
              <div className="text-xl opacity-90 font-semibold tracking-wide">BACKCOUNTRY QUALITY</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="vintage-paper py-12 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="wood-texture rounded-lg p-8 sm:p-16 shadow-2xl transform hover:scale-105 transition-transform duration-300 border-4 sm:border-8 border-stone-800">
            <h2 className="text-3xl sm:text-5xl font-bold text-stone-100 mb-4 sm:mb-6 fade-in distressed-text" style={{ letterSpacing: '0.1em' }}>
              VISIT US IN YELLOWKNIFE
            </h2>
            <p className="text-base sm:text-2xl text-stone-200 mb-8 sm:mb-10 leading-relaxed fade-in font-bold px-2" style={{ animationDelay: '0.1s', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              Browse our Northern roasted menu. Order online for quick pickup at either location. ☕
            </p>
            <Link
              to="/menu"
              className="inline-block vintage-paper text-stone-900 px-8 sm:px-16 py-4 sm:py-5 rounded-lg text-base sm:text-xl font-bold hover:bg-stone-100 transition-all duration-300 shadow-2xl transform hover:scale-110 pulse-glow scale-in border-4 border-stone-800 distressed-text" style={{ animationDelay: '0.2s', letterSpacing: '0.1em' }}
            >
              <span className="flex items-center gap-2 sm:gap-3">
                ORDER NOW
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

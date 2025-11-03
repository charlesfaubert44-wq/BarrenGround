export default function Footer() {
  return (
    <footer className="wood-texture text-stone-100 py-12 mt-auto border-t-4 border-stone-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4 distressed-text" style={{ letterSpacing: '0.1em' }}>
              BARREN GROUND COFFEE
            </h3>
            <p className="text-stone-300 leading-relaxed mb-3 font-medium" style={{ letterSpacing: '0.03em' }}>
              Northern roasted. Community powered.
            </p>
            <p className="text-stone-400 leading-relaxed text-sm">
              Source responsibly, roast with care, and serve people well.
              Fresh coffee roasted weekly for homes, offices, and cafés across the North.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 distressed-text tracking-wider">LOCATIONS</h3>
            <div className="text-stone-300 space-y-3 text-sm">
              <div>
                <p className="font-bold text-stone-200">Main Café</p>
                <p className="text-stone-400">5103 52 Street</p>
                <p className="text-stone-400">Yellowknife, NT X1A 1T7</p>
              </div>
              <div>
                <p className="font-bold text-stone-200">Birchwood Coffee</p>
                <p className="text-stone-400">5021 49 Street</p>
                <p className="text-stone-400">Yellowknife, NT X1A 1P5</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4 distressed-text tracking-wider">CONNECT</h3>
            <div className="text-stone-300 space-y-2 text-sm">
              <p className="text-stone-200 font-medium text-base">(867) 873-3030</p>
              <p className="text-stone-400">@barrengroundcoffee</p>
              <div className="pt-2">
                <p className="text-stone-400">Living wage employer</p>
                <p className="text-stone-400">Est. 2017 • Yellowknife, NT</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-stone-800 mt-10 pt-8 text-center">
          <p className="text-stone-400 text-sm tracking-wide">
            &copy; 2025 Barren Ground Coffee. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

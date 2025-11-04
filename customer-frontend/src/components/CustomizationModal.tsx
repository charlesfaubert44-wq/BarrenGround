import { useState } from 'react';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

interface CustomizationModalProps {
  item: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (customizations: Record<string, string>) => void;
}

const CUSTOMIZATION_OPTIONS = {
  milk: {
    label: 'Milk',
    options: ['Whole Milk', 'Skim Milk', '2% Milk', 'Oat Milk', 'Almond Milk', 'Soy Milk', 'Coconut Milk', 'No Milk'],
    categories: ['coffee', 'drip-coffee', 'specialty'],
  },
  size: {
    label: 'Size',
    options: ['Small', 'Medium', 'Large'],
    categories: ['coffee', 'drip-coffee', 'cold-drinks', 'specialty'],
  },
  sweetness: {
    label: 'Sweetness',
    options: ['No Sugar', 'Light', 'Regular', 'Extra Sweet'],
    categories: ['coffee', 'cold-drinks', 'specialty'],
  },
  temperature: {
    label: 'Temperature',
    options: ['Hot', 'Extra Hot', 'Iced'],
    categories: ['coffee', 'drip-coffee', 'specialty'],
  },
  extras: {
    label: 'Extras',
    options: ['Extra Shot (+$0.75)', 'Vanilla Syrup (+$0.50)', 'Caramel Syrup (+$0.50)', 'Hazelnut Syrup (+$0.50)', 'Whipped Cream (+$0.50)', 'Extra Foam'],
    categories: ['coffee', 'cold-drinks', 'specialty'],
    multiple: true,
  },
  toasted: {
    label: 'Toasted',
    options: ['Not Toasted', 'Lightly Toasted', 'Well Toasted'],
    categories: ['pastries', 'food'],
  },
  spread: {
    label: 'Spread',
    options: ['Plain Cream Cheese', 'Veggie Cream Cheese', 'Butter', 'Jam', 'None'],
    categories: ['food', 'pastries'],
  },
  specialInstructions: {
    label: 'Special Instructions',
    type: 'textarea',
    categories: ['coffee', 'drip-coffee', 'cold-drinks', 'specialty', 'pastries', 'food'],
  },
};

export default function CustomizationModal({ item, isOpen, onClose, onAddToCart }: CustomizationModalProps) {
  const [customizations, setCustomizations] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleCustomizationChange = (key: string, value: string) => {
    setCustomizations(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMultipleCustomizationToggle = (key: string, value: string) => {
    setCustomizations(prev => {
      const current = prev[key] || '';
      const values = current.split(', ').filter(Boolean);

      if (values.includes(value)) {
        const newValues = values.filter(v => v !== value);
        return {
          ...prev,
          [key]: newValues.join(', '),
        };
      } else {
        return {
          ...prev,
          [key]: [...values, value].join(', '),
        };
      }
    });
  };

  const handleAddToCart = () => {
    onAddToCart(customizations);
    setCustomizations({});
    onClose();
  };

  const handleSkip = () => {
    onAddToCart({});
    setCustomizations({});
    onClose();
  };

  const getAvailableCustomizations = () => {
    return Object.entries(CUSTOMIZATION_OPTIONS).filter(([_, config]) =>
      config.categories.includes(item.category)
    );
  };

  const availableCustomizations = getAvailableCustomizations();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-stone-800 via-stone-800 to-stone-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-amber-800/50 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-100 transition z-10"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 border-b-2 border-amber-800/50 bg-stone-900/50">
          <div className="text-center mb-2">
            <span className="text-4xl">{item.category === 'coffee' || item.category === 'drip-coffee' ? '☕' :
                         item.category === 'cold-drinks' ? '🧊' :
                         item.category === 'specialty' ? '✨' :
                         item.category === 'food' ? '🍳' : '🥐'}</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-100 mb-2 text-center distressed-text">
            Customize Your Order
          </h2>
          <p className="text-xl text-amber-400 font-bold text-center">{item.name}</p>
          <p className="text-stone-300 text-sm text-center mt-1">{item.description}</p>
        </div>

        {/* Customization options */}
        <div className="p-6 space-y-6">
          {availableCustomizations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-stone-300 mb-4">No customizations available for this item</p>
            </div>
          ) : (
            availableCustomizations.map(([key, config]) => (
              <div key={key}>
                <label className="block text-stone-100 font-bold mb-3 text-sm uppercase tracking-wide">
                  {config.label}
                </label>

                {config.type === 'textarea' ? (
                  <textarea
                    value={customizations[key] || ''}
                    onChange={(e) => handleCustomizationChange(key, e.target.value)}
                    placeholder="e.g., Extra hot, no foam..."
                    className="w-full bg-stone-900 border-2 border-stone-700 rounded-lg px-4 py-3 text-stone-100 focus:border-amber-600 focus:outline-none resize-none"
                    rows={3}
                  />
                ) : config.multiple ? (
                  <div className="grid grid-cols-2 gap-2">
                    {config.options!.map((option) => {
                      const isSelected = (customizations[key] || '').split(', ').filter(Boolean).includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => handleMultipleCustomizationToggle(key, option)}
                          className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm border-2 ${
                            isSelected
                              ? 'bg-amber-700 text-white border-amber-600'
                              : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-amber-700'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {config.options!.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleCustomizationChange(key, option)}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm border-2 ${
                          customizations[key] === option
                            ? 'bg-amber-700 text-white border-amber-600'
                            : 'bg-stone-900 text-stone-300 border-stone-700 hover:border-amber-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer buttons */}
        <div className="p-6 border-t-2 border-amber-800/50 bg-stone-900/50 flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 px-6 py-4 rounded-xl font-bold text-stone-300 bg-stone-700 hover:bg-stone-600 transition-all border-2 border-stone-600"
          >
            Skip Customization
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg border-2 border-amber-900"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add to Cart
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

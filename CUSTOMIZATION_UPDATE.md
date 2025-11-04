# Cart Customization Feature - Manual Updates

I've added a customization system for menu items! Here's what's been completed and what you need to manually update:

## ✅ Completed

1. **Cart Store Updated** ([cartStore.ts](customer-frontend/src/store/cartStore.ts))
   - Added `cartItemId` field to track unique cart items
   - Items with different customizations are now separate cart entries
   - Updated `removeItem` and `updateQuantity` to use `cartItemId`

2. **Customization Modal Created** ([CustomizationModal.tsx](customer-frontend/src/components/CustomizationModal.tsx))
   - Beautiful modal with category-specific options
   - Milk types, sizes, sweetness, temperature
   - Extras like syrups and whipped cream
   - Special instructions textarea
   - "Skip" or "Add with Customization" buttons

## 🔧 Manual Updates Needed

### 1. Update MenuPage.tsx

Add the import at the top:
```typescript
import CustomizationModal from '../components/CustomizationModal';
```

Add state for customizing item (around line 20):
```typescript
const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
```

Replace the `handleAddToCart` function (around line 40):
```typescript
const handleCustomize = (item: MenuItem) => {
  setCustomizingItem(item);
};

const handleAddToCart = (item: MenuItem, customizations: Record<string, string> = {}) => {
  addItem({
    id: item.id,
    name: item.name,
    price: item.price,
    customizations: Object.keys(customizations).length > 0 ? customizations : undefined,
  });

  // Show feedback
  setAddedItems(prev => new Set(prev).add(item.id));
  setTimeout(() => {
    setAddedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(item.id);
      return newSet;
    });
  }, 2000);
};
```

Replace the "Add to Cart" button section (around line 288-315) with:
```typescript
{item.available ? (
  <div className="flex gap-2">
    <button
      onClick={() => handleCustomize(item)}
      className="flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all duration-300 shadow-lg text-xs sm:text-sm border-2 bg-gradient-to-r from-stone-700 to-stone-800 text-white border-stone-900 hover:from-stone-600 hover:to-stone-700 active:scale-95"
    >
      <span className="flex items-center justify-center gap-1">
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span className="hidden sm:inline font-extrabold">Customize</span>
      </span>
    </button>
    <button
      onClick={() => handleAddToCart(item)}
      className={`flex-[2] py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all duration-300 shadow-lg text-xs sm:text-sm border-2 relative overflow-hidden group/btn ${
        addedItems.has(item.id)
          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white border-green-800 scale-105 shadow-green-500/50'
          : 'bg-gradient-to-r from-amber-700 to-amber-800 text-white border-amber-900 hover:from-amber-600 hover:to-amber-700 hover:border-amber-700 active:scale-95 hover:shadow-amber-600/50'
      }`}
    >
      {/* Ripple effect on click */}
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200"></div>

      {addedItems.has(item.id) ? (
        <span className="flex items-center justify-center gap-2 relative z-10 celebrate">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-extrabold">Added!</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2 relative z-10">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-extrabold">Quick Add</span>
        </span>
      )}
    </button>
  </div>
)
```

Add the modal before the closing div (before line 402):
```typescript
{/* Customization Modal */}
{customizingItem && (
  <CustomizationModal
    item={customizingItem}
    isOpen={!!customizingItem}
    onClose={() => setCustomizingItem(null)}
    onAddToCart={(customizations) => handleAddToCart(customizingItem, customizations)}
  />
)}
```

### 2. Update CartPage.tsx

Change the key attribute (around line 144):
```typescript
key={item.cartItemId}  // was: key={item.id}
```

Add customization display after the item name (around line 152):
```typescript
<h3 className="text-sm sm:text-lg font-bold text-stone-100 mb-1">
  {item.name}
</h3>
{item.customizations && Object.keys(item.customizations).length > 0 && (
  <div className="text-xs text-amber-400 mb-1 space-y-0.5">
    {Object.entries(item.customizations).map(([key, value]) => (
      value && <div key={key}><span className="font-semibold capitalize">{key}:</span> {value}</div>
    ))}
  </div>
)}
<p className="text-stone-300 font-semibold text-xs sm:text-sm">
  ${item.price.toFixed(2)} each
</p>
```

Update quantity controls (around line 162, 172):
```typescript
onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}  // was: item.id
// and
onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}  // was: item.id
```

Update remove button (around line 186):
```typescript
onClick={() => removeItem(item.cartItemId)}  // was: item.id
```

## 🎯 Features Added

### Customization Options by Category:

**Coffee & Drip Coffee:**
- Milk type (Whole, Skim, 2%, Oat, Almond, Soy, Coconut, None)
- Size (Small, Medium, Large)
- Sweetness level
- Temperature (Hot, Extra Hot, Iced)
- Extras (Extra shot, syrups, whipped cream, extra foam)

**Cold Drinks:**
- Size
- Sweetness level
- Extras

**Specialty Drinks:**
- Milk type
- Size
- Sweetness
- Temperature
- Extras

**Pastries & Food:**
- Toasted level
- Spread type (cream cheese, butter, jam, etc.)

**All Categories:**
- Special instructions (free text)

## 🧪 Testing

After applying these updates:

1. Start the app: `npm run dev`
2. Go to menu page
3. Click "Customize" button on any item
4. Select options in the modal
5. Click "Add to Cart"
6. Go to cart page
7. See customizations displayed under item name
8. Test quantity controls and remove button

## 🎨 UI Features

- Beautiful dark-themed modal
- Category-specific options
- Multi-select for extras (can choose multiple syrups)
- "Skip Customization" for quick add
- Customizations shown in amber text in cart
- Same item with different customizations = separate cart entries

Enjoy the enhanced ordering experience! ☕

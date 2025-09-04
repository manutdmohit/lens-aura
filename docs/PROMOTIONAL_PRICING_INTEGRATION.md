# Promotional Pricing Integration Guide

This guide explains how to integrate the new promotional pricing system into your existing codebase to replace hardcoded promotional prices.

## 🎯 Overview

The promotional pricing system automatically:

- **Checks for active promotions** in the database
- **Applies promotional pricing** to products based on their category (Signature/Essential)
- **Replaces hardcoded prices** with dynamic promotional pricing
- **Falls back to regular pricing** when no promotions are active

## 🏗️ Architecture

### Core Components

1. **`lib/services/promotional-pricing.ts`** - Service layer for fetching promotional pricing
2. **`hooks/usePromotionalPricing.ts`** - React hooks for using promotional pricing
3. **`components/PromotionalPricingDisplay.tsx`** - Component for displaying promotional pricing
4. **`components/ProductCardWithPromotions.tsx`** - Enhanced product card with promotional pricing
5. **`components/PromotionalBanner.tsx`** - Banner component for displaying active promotions
6. **`lib/utils/product-category.ts`** - Utilities for determining product categories

## 🔧 Integration Steps

### 1. Replace Hardcoded Promotional Prices

**Before (Hardcoded):**

```tsx
// Old way - hardcoded promotional prices
const promotionalPrice = 79; // $79 for signature
const promotionalPrice = 39; // $39 for essential
```

**After (Dynamic):**

```tsx
// New way - dynamic promotional pricing
import { useCategoryPromotionalPricing } from '@/hooks/usePromotionalPricing';

const { categoryPricing, hasPromotions } =
  useCategoryPromotionalPricing('signature');
const price = hasPromotions ? categoryPricing.promotionalPrice : regularPrice;
```

### 2. Update Product Cards

**Replace existing product cards:**

```tsx
// Old: Regular product card
<ProductCard product={product} />

// New: Product card with promotional pricing
<ProductCardWithPromotions product={product} />
```

### 3. Add Promotional Banners

**Add to page headers:**

```tsx
import PromotionalBanner from '@/components/PromotionalBanner';

export default function ProductPage() {
  return (
    <div>
      <PromotionalBanner />
      {/* Rest of page content */}
    </div>
  );
}
```

### 4. Update Pricing Displays

**Use the promotional pricing display component:**

```tsx
import PromotionalPricingDisplay from '@/components/PromotionalPricingDisplay';

<PromotionalPricingDisplay
  category="signature"
  regularPrice={product.price}
  showPriceForTwo={true}
/>;
```

## 📍 Integration Points

### High Priority (Replace Hardcoded Prices)

1. **Product Cards** - `components/product-card.tsx`
2. **Cart Context** - `context/cart-context.tsx`
3. **Product Pages** - `app/products/[slug]/page.tsx`
4. **Cart Page** - `app/cart/page.tsx`
5. **Checkout Page** - `app/checkout/page.tsx`

### Medium Priority (Add Promotional Features)

1. **Homepage** - Add promotional banner
2. **Product Lists** - Update pricing displays
3. **Category Pages** - Add promotional indicators

### Low Priority (Enhancement)

1. **Search Results** - Highlight promotional products
2. **Related Products** - Show promotional pricing
3. **Wishlist** - Display promotional prices

## 🔄 Migration Strategy

### Phase 1: Core Integration

1. ✅ Create promotional pricing service
2. ✅ Create React hooks
3. ✅ Create promotional components
4. 🔄 Replace hardcoded prices in cart context
5. 🔄 Replace hardcoded prices in product cards

### Phase 2: Page Integration

1. 🔄 Update product pages
2. 🔄 Update cart page
3. 🔄 Update checkout page
4. 🔄 Add promotional banners

### Phase 3: Enhancement

1. 🔄 Update search and filtering
2. 🔄 Add promotional indicators throughout
3. 🔄 Optimize performance

## 💡 Usage Examples

### Basic Promotional Pricing

```tsx
import { useCategoryPromotionalPricing } from '@/hooks/usePromotionalPricing';

function ProductPricing({ product }) {
  const { categoryPricing, hasPromotions } =
    useCategoryPromotionalPricing('signature');

  if (hasPromotions) {
    return (
      <div>
        <span className="text-green-600 font-bold">
          ${categoryPricing.promotionalPrice}
        </span>
        <span className="line-through text-gray-500 ml-2">
          ${categoryPricing.originalPrice}
        </span>
      </div>
    );
  }

  return <span>${product.price}</span>;
}
```

### Promotional Banner

```tsx
import PromotionalBanner from '@/components/PromotionalBanner';

function Layout({ children }) {
  return (
    <div>
      <PromotionalBanner />
      {children}
    </div>
  );
}
```

### Enhanced Product Card

```tsx
import ProductCardWithPromotions from '@/components/ProductCardWithPromotions';

function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCardWithPromotions key={product._id} product={product} />
      ))}
    </div>
  );
}
```

## 🚀 Benefits

1. **Dynamic Pricing** - No more hardcoded promotional prices
2. **Easy Management** - Update promotions through admin panel
3. **Consistent Experience** - Same promotional pricing across the entire app
4. **Flexible** - Easy to add new promotional types
5. **Performance** - Cached promotional pricing with automatic updates

## 🔍 Testing

### Test Scenarios

1. **No Active Promotions** - Should show regular pricing
2. **Active Promotions** - Should show promotional pricing
3. **Product Categories** - Should apply correct promotional pricing
4. **Price for Two** - Should show promotional "buy 2" pricing
5. **Fallback** - Should gracefully handle errors

### Test Commands

```bash
# Test promotional pricing service
npm run test:promotional-pricing

# Test promotional components
npm run test:components

# Test integration
npm run test:integration
```

## 📝 Notes

- **Performance**: Promotional pricing is cached and only fetched when needed
- **Fallbacks**: System gracefully falls back to regular pricing if promotions fail
- **Categories**: Products are automatically categorized based on name/description
- **Updates**: Promotional pricing updates automatically when promotions change
- **Mobile**: All components are mobile-responsive

## 🆘 Troubleshooting

### Common Issues

1. **Promotional pricing not showing**

   - Check if promotions are active in admin panel
   - Verify product category detection
   - Check browser console for errors

2. **Performance issues**

   - Ensure promotional pricing is cached
   - Check for unnecessary re-renders
   - Verify API response times

3. **Styling issues**
   - Check Tailwind CSS classes
   - Verify component props
   - Check for CSS conflicts

### Debug Commands

```tsx
// Add to components for debugging
console.log('Promotional pricing:', categoryPricing);
console.log('Product category:', productCategory);
console.log('Has promotions:', hasPromotions);
```

## 🔮 Future Enhancements

1. **Multiple Promotions** - Support for multiple active promotions
2. **Time-based Promotions** - Automatic activation/deactivation
3. **User-specific Promotions** - Personalized promotional pricing
4. **Analytics** - Track promotional performance
5. **A/B Testing** - Test different promotional strategies

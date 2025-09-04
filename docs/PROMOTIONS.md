# Promotions System Documentation

## Overview

The Promotions System is a comprehensive solution for managing promotional offers in your e-commerce application. It allows administrators to create, manage, and display time-based promotions with different pricing tiers for signature and essential collections.

## Features

- **Time-based Promotions**: Set start and end dates for promotional offers
- **Dual Pricing Tiers**: Separate pricing for Signature and Essential collections
- **Flexible Pricing Structure**: Original price, discounted price, and "buy 2" pricing
- **Admin Management**: Full CRUD operations through admin interface
- **Automatic Validation**: Built-in validation for pricing logic and dates
- **Responsive Display**: Multiple display variants for different use cases
- **Real-time Status**: Automatic calculation of days remaining and expiry status

## Data Model

### Promotion Schema

```typescript
interface IPromotion {
  _id: string;
  offerName: string;
  offerValidFrom: Date;
  offerValidTo: Date;
  signature: IPricingTier;
  essential: IPricingTier;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IPricingTier {
  originalPrice: number;
  discountedPrice: number;
  priceForTwo: number;
}
```

### Field Descriptions

- **offerName**: Human-readable name for the promotion (max 100 characters)
- **offerValidFrom**: Start date when the promotion becomes active
- **offerValidTo**: End date when the promotion expires
- **signature**: Pricing information for the Signature collection
- **essential**: Pricing information for the Essential collection
- **isActive**: Boolean flag to enable/disable the promotion
- **createdAt/updatedAt**: Automatic timestamps

## API Endpoints

### Get All Promotions

```
GET /api/promotions
Query Parameters:
- isActive: boolean (filter by status)
- search: string (search by offer name)
- sort: string (sort field)
- order: 'asc' | 'desc'
- page: number
- limit: number
```

### Get Single Promotion

```
GET /api/promotions/[id]
```

### Create Promotion

```
POST /api/promotions
Body: Promotion data (validated)
Authorization: Admin required
```

### Update Promotion

```
PUT /api/promotions/[id]
Body: Updated promotion data (validated)
Authorization: Admin required
```

### Delete Promotion

```
DELETE /api/promotions/[id]
Authorization: Admin required
```

### Get Active Promotions

```
GET /api/promotions/active
Query Parameters:
- limit: number (default: 5)
```

## Server Actions

### Available Functions

```typescript
// CRUD Operations
createPromotion(data: any)
getPromotions(options?: any)
getPromotion(id: string)
updatePromotion(id: string, data: any)
deletePromotion(id: string)

// Utility Functions
getActivePromotions(limit?: number)
togglePromotionStatus(id: string)
getPromotionsByDateRange(startDate: Date, endDate: Date)
```

### Usage Example

```typescript
import { createPromotion, getActivePromotions } from '@/actions/promotions';

// Create a new promotion
const result = await createPromotion({
  offerName: 'Summer Sale 2025',
  offerValidFrom: new Date('2025-06-01'),
  offerValidTo: new Date('2025-08-31'),
  signature: {
    originalPrice: 299.99,
    discountedPrice: 249.99,
    priceForTwo: 449.99,
  },
  essential: {
    originalPrice: 199.99,
    discountedPrice: 169.99,
    priceForTwo: 299.99,
  },
  isActive: true,
});

// Get active promotions
const activePromos = await getActivePromotions(3);
```

## React Hooks

### usePromotions Hook

```typescript
import { usePromotions } from '@/hooks/usePromotions';

function MyComponent() {
  const {
    promotions,
    activePromotions,
    loading,
    error,
    fetchPromotions,
    fetchActivePromotions,
    refresh,
  } = usePromotions({ limit: 5, autoFetch: true });

  // Use the data...
}
```

### useActivePromotions Hook

```typescript
import { useActivePromotions } from '@/hooks/usePromotions';

function MyComponent() {
  const { activePromotions, loading, error, refresh } = useActivePromotions(3);

  // Use the data...
}
```

## Components

### PromotionCard

Display individual promotions with multiple variants:

```typescript
import PromotionCard from '@/components/PromotionCard';

<PromotionCard
  promotion={promotion}
  variant="featured" // 'default' | 'compact' | 'featured'
  showExpiry={true}
  className="custom-class"
/>;
```

### PromotionsList

Display multiple promotions with different layouts:

```typescript
import { PromotionsList, FeaturedPromotions, CompactPromotions } from '@/components/PromotionsList';

// Default list
<PromotionsList variant="default" limit={6} />

// Featured promotions (large cards)
<FeaturedPromotions limit={2} />

// Compact promotions (small cards)
<CompactPromotions limit={4} />
```

### PromotionBanner

Display promotional banners prominently:

```typescript
import { PromotionBanner, CompactPromotionBanner } from '@/components/PromotionBanner';

// Featured banner
<PromotionBanner limit={1} />

// Compact banner
<CompactPromotionBanner limit={2} />
```

### PromotionForm

Admin form for creating/editing promotions:

```typescript
import PromotionForm from '@/components/PromotionForm';

// Create new promotion
<PromotionForm mode="create" />

// Edit existing promotion
<PromotionForm mode="edit" promotionId="promotion-id" />
```

## Admin Pages

### Promotions Management

- **Route**: `/admin/promotions`
- **Features**: List all promotions, search, filter, pagination
- **Actions**: Edit, delete, toggle status

### Create Promotion

- **Route**: `/admin/promotions/new`
- **Features**: Form to create new promotions with validation

### Edit Promotion

- **Route**: `/admin/promotions/[id]/edit`
- **Features**: Form to edit existing promotions

## Validation Rules

### Business Logic

1. **Date Validation**:

   - `offerValidFrom` cannot be in the past
   - `offerValidTo` must be after `offerValidFrom`

2. **Pricing Validation**:

   - All prices must be positive numbers
   - Discounted prices cannot exceed original prices
   - "Price for Two" must be positive

3. **Required Fields**:
   - Offer name (1-100 characters)
   - Valid from/to dates
   - All pricing fields for both collections

### Schema Validation

Uses Zod schemas for runtime validation with detailed error messages.

## Database Features

### Indexes

- Date range queries (`offerValidFrom`, `offerValidTo`)
- Active status filtering (`isActive`)
- Text search on offer names

### Virtual Fields

- `isCurrentlyValid`: Calculates if promotion is currently active
- Automatic expiry detection

### Instance Methods

- `isValid()`: Check if promotion is currently valid
- `isExpired()`: Check if promotion has expired
- `getDaysRemaining()`: Calculate days left

### Static Methods

- `findActivePromotions()`: Find currently active promotions
- `findPromotionsByDateRange()`: Find promotions within date range

## Usage Examples

### Display Promotions on Homepage

```typescript
import PromotionBanner from '@/components/PromotionBanner';

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to Our Store</h1>

      {/* Featured promotion banner */}
      <PromotionBanner limit={1} className="mb-8" />

      {/* Other content */}
    </div>
  );
}
```

### Show Promotions in Product Pages

```typescript
import { CompactPromotions } from '@/components/PromotionsList';

export default function ProductPage() {
  return (
    <div>
      {/* Product details */}

      {/* Related promotions */}
      <section className="mt-8">
        <h2>Special Offers</h2>
        <CompactPromotions limit={2} />
      </section>
    </div>
  );
}
```

### Admin Management

```typescript
import AdminPromotionsPage from '@/app/admin/promotions/page';

// This page provides full CRUD operations
// for managing promotions
```

## Best Practices

### Performance

1. Use appropriate limits when fetching promotions
2. Leverage the `useActivePromotions` hook for frontend display
3. Use pagination for admin lists

### User Experience

1. Show expiry countdown for urgency
2. Use different variants for different contexts
3. Handle loading and error states gracefully

### Data Integrity

1. Always validate data before saving
2. Use the built-in validation schemas
3. Test date logic thoroughly

## Troubleshooting

### Common Issues

1. **Promotions not showing**:

   - Check if `isActive` is true
   - Verify dates are in the future
   - Check browser console for errors

2. **Validation errors**:

   - Ensure all required fields are filled
   - Check date format (YYYY-MM-DD)
   - Verify pricing logic

3. **Performance issues**:
   - Reduce the limit parameter
   - Use appropriate component variants
   - Check database indexes

### Debug Mode

Enable debug logging by checking the browser console and server logs for detailed error information.

## Future Enhancements

Potential improvements for the promotion system:

1. **Advanced Targeting**: Customer segment-based promotions
2. **A/B Testing**: Multiple promotion variants
3. **Analytics**: Track promotion performance
4. **Scheduling**: Automated promotion activation
5. **Templates**: Reusable promotion structures
6. **Integration**: Connect with email marketing systems

## Support

For technical support or questions about the promotion system, refer to the development team or check the project documentation.


# Product Pricing Update Scripts

This directory contains scripts to update product pricing for the Lens Aura e-commerce platform.

## Scripts

### 1. `update-product-pricing.js` - Basic Script

Simple script that updates sunglasses product pricing based on category.

**Features:**

- Updates signature category: $99 → $79
- Updates essentials category: $59 → $39
- Basic error handling and reporting

**Usage:**

```bash
node scripts/update-product-pricing.js
```

### 2. `update-product-pricing-advanced.js` - Advanced Script

Comprehensive script with advanced features and safety measures.

**Features:**

- Dry-run mode for previewing changes
- Validation of pricing configuration
- Detailed reporting and error handling
- Graceful process termination handling
- Product count summaries

**Usage:**

**Preview mode (recommended first):**

```bash
node scripts/update-product-pricing-advanced.js --dry-run
```

**Live update mode:**

```bash
node scripts/update-product-pricing-advanced.js
```

## Prerequisites

1. **Environment Variables**: Since you're using Next.js, ensure you have a `.env.local` file with:

   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

2. **Dependencies**: Make sure you have the required packages installed:
   ```bash
   npm install
   ```

## What the Scripts Do

The scripts will update all **sunglasses** products with the following pricing:

### Signature Category

- **Price**: $99
- **Discounted Price**: $79

### Essentials Category

- **Price**: $59
- **Discounted Price**: $39

## Safety Features

- **Dry-run mode**: Always run with `--dry-run` first to preview changes
- **Validation**: Checks that discounted prices are less than regular prices
- **Error handling**: Graceful error handling and reporting
- **Database safety**: Proper connection management and cleanup

## Example Output

```
🕶️  Product Pricing Update Script
=====================================
Mode: Preview (dry-run)

✅ Connected to MongoDB
✅ Pricing configuration validated

📊 Current Product Counts:
  signature: 5 products
  essentials: 3 products

🔍 PREVIEW MODE - No changes will be made

SIGNATURE Category (5 products):
  - Classic Aviator
    Current: $120 → $95
    New:     $99 → $79
    📝 Will be updated
  - Premium Wayfarer
    Current: $99 → $79
    New:     $99 → $79
    ✅ Already up to date

ESSENTIALS Category (3 products):
  - Sport Sunglasses
    Current: $75 → $55
    New:     $59 → $39
    📝 Will be updated

💡 To apply changes, run without --dry-run flag
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Check your `MONGODB_URI` environment variable
   - Ensure MongoDB is running and accessible

2. **No Products Found**

   - Verify that products exist with the specified categories
   - Check that products have `productType: 'sunglasses'`
   - Ensure products have `status: 'active'`

3. **Permission Errors**
   - Ensure your MongoDB user has write permissions
   - Check database and collection access rights

### Getting Help

If you encounter issues:

1. Run in dry-run mode first to identify problems
2. Check the console output for specific error messages
3. Verify your database connection and permissions
4. Ensure all required environment variables are set

## Backup Recommendation

Before running the live update script, consider backing up your products collection:

```bash
# MongoDB backup command (adjust as needed)
mongodump --uri="your_mongodb_uri" --collection=products --db=your_database_name
```

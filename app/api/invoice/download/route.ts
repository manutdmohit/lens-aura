import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Order from '@/models/Order';
import { Product } from '@/models';
import {
  calculateSeptember2025Pricing,
  calculatePromotionalPricing,
} from '@/lib/utils/discount';
import fs from 'fs';
import path from 'path';

// Import the appropriate puppeteer package based on environment
const isProduction = process.env.NODE_ENV === 'production';

let puppeteer: any;
let chromium: any;

if (isProduction) {
  // Use puppeteer-core with @sparticuz/chromium for Vercel
  puppeteer = require('puppeteer-core');
  chromium = require('@sparticuz/chromium');
} else {
  // Use regular puppeteer for local development
  puppeteer = require('puppeteer');
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  imageUrl?: string;
  productType?: string;
  category?: string;
  originalPrice?: number;
  isPromotional?: boolean;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal?: number;
  shipping?: number;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  amount_total: number;
  customer_details?: {
    name: string;
    email: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
  // Alternative structure for Order model
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    console.log('Invoice download API called');

    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const { orderDetails, sessionId } = body;

    if (!orderDetails) {
      console.log('No order details provided');
      return NextResponse.json(
        { error: 'Order details are required' },
        { status: 400 }
      );
    }

    console.log('Order details received:', {
      hasOrderNumber: !!orderDetails.orderNumber,
      hasId: !!orderDetails.id,
      hasItems: !!orderDetails.items,
      orderNumber: orderDetails.orderNumber,
      id: orderDetails.id,
    });

    // Validate order details structure
    let completeOrderDetails = orderDetails;
    if (!orderDetails.items || !Array.isArray(orderDetails.items)) {
      console.log(
        'Items array missing, attempting to fetch complete order data from database'
      );

      try {
        console.log('Connecting to database...');
        await connectToDatabase();
        console.log('Database connected successfully');

        // Test database connection by checking if we can query the Order collection
        const orderCount = await Order.countDocuments();
        console.log('Total orders in database:', orderCount);

        // Try to find the order by orderNumber or orderId
        let order = null;
        console.log('Searching for order with:', {
          orderNumber: orderDetails.orderNumber,
          id: orderDetails.id,
        });

        if (orderDetails.orderNumber) {
          console.log('Searching by orderNumber:', orderDetails.orderNumber);
          order = await Order.findOne({
            orderNumber: orderDetails.orderNumber,
          });
          console.log('Order found by orderNumber:', order ? 'Yes' : 'No');

          // If not found, try case-insensitive search
          if (!order) {
            console.log('Trying case-insensitive search...');
            order = await Order.findOne({
              orderNumber: {
                $regex: new RegExp(`^${orderDetails.orderNumber}$`, 'i'),
              },
            });
            console.log(
              'Order found by case-insensitive search:',
              order ? 'Yes' : 'No'
            );
          }
        } else if (orderDetails.id) {
          console.log('Searching by id:', orderDetails.id);
          order = await Order.findById(orderDetails.id);
          console.log('Order found by id:', order ? 'Yes' : 'No');
        }

        if (!order) {
          console.error('Order not found in database:', {
            orderNumber: orderDetails.orderNumber,
            id: orderDetails.id,
          });

          // Let's also try to see what orders exist
          const allOrders = await Order.find(
            {},
            { orderNumber: 1, _id: 1 }
          ).limit(5);
          console.log('Sample orders in database:', allOrders);

          return NextResponse.json(
            {
              error: 'Order not found in database',
              details: {
                searchedOrderNumber: orderDetails.orderNumber,
                searchedId: orderDetails.id,
                sampleOrders: allOrders,
              },
            },
            { status: 404 }
          );
        }

        // Transform the order data to match our expected format
        completeOrderDetails = {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail || '',
          items: order.items.map((item: any) => ({
            productId: item.productId || '',
            name: item.name,
            price: item.price, // Keep price as is from database (in dollars)
            quantity: item.quantity,
            color: item.color,
            imageUrl: item.imageUrl,
            productType: item.productType,
            category: item.category || item.product?.category || 'N/A',
            originalPrice: item.originalPrice, // Keep original price as is from database (in dollars)
            priceForTwo: item.priceForTwo, // Include priceForTwo from database
          })),
          subtotal: order.subtotal, // Keep subtotal as is from database (in dollars)
          shipping: order.shipping, // Keep shipping as is from database (in dollars)
          totalAmount: order.totalAmount, // Keep total as is from database (in dollars)
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt.toISOString(),
          amount_total: order.totalAmount, // Keep total as is from database (in dollars)
          shippingAddress: order.shippingAddress,
        };

        console.log('Successfully fetched complete order data from database');
        console.log('Order details:', {
          id: completeOrderDetails.id,
          orderNumber: completeOrderDetails.orderNumber,
          itemsCount: completeOrderDetails.items.length,
          totalAmount: completeOrderDetails.totalAmount,
        });
        console.log(
          'Sample item category data:',
          completeOrderDetails.items[0]?.category
        );
        console.log(
          'Sample item product data:',
          completeOrderDetails.items[0]?.product
        );
        console.log(
          'Sample item product category:',
          completeOrderDetails.items[0]?.product?.category
        );
        console.log(
          'Sample item product type:',
          completeOrderDetails.items[0]?.product?.productType
        );
      } catch (error) {
        console.error('Error fetching order from database:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : undefined,
        });

        // Check if it's a database connection error
        if (error instanceof Error && error.message.includes('connection')) {
          return NextResponse.json(
            {
              error: 'Database connection failed',
              details: error.message,
            },
            { status: 500 }
          );
        }

        // Check if it's a model/query error
        if (
          error instanceof Error &&
          (error.message.includes('model') || error.message.includes('query'))
        ) {
          return NextResponse.json(
            {
              error: 'Database query failed',
              details: error.message,
            },
            { status: 500 }
          );
        }

        return NextResponse.json(
          {
            error: 'Failed to fetch order data from database',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
          { status: 500 }
        );
      }
    }

    if (
      !completeOrderDetails.customer_details &&
      !completeOrderDetails.shippingAddress
    ) {
      console.error(
        'Invalid order details - customer details missing:',
        completeOrderDetails
      );
      return NextResponse.json(
        { error: 'Customer details are required for invoice generation' },
        { status: 400 }
      );
    }

    // If we have shippingAddress but no customer_details, create customer_details from shippingAddress
    if (
      !completeOrderDetails.customer_details &&
      completeOrderDetails.shippingAddress
    ) {
      completeOrderDetails.customer_details = {
        name: `${completeOrderDetails.shippingAddress.firstName || ''} ${
          completeOrderDetails.shippingAddress.lastName || ''
        }`.trim(),
        email: completeOrderDetails.customerEmail || '',
        address: {
          line1: completeOrderDetails.shippingAddress.street || '',
          line2: '',
          city: completeOrderDetails.shippingAddress.city || '',
          state: completeOrderDetails.shippingAddress.state || '',
          postal_code: completeOrderDetails.shippingAddress.postalCode || '',
          country: completeOrderDetails.shippingAddress.country || '',
        },
      };
    }

    console.log(
      'Generating HTML invoice for order:',
      completeOrderDetails.orderNumber
    );
    console.log('Order details validation passed:', {
      itemsCount: completeOrderDetails.items.length,
      hasCustomerDetails: !!completeOrderDetails.customer_details,
      hasShippingAddress: !!completeOrderDetails.shippingAddress,
      orderNumber: completeOrderDetails.orderNumber,
    });

    // Generate PDF invoice
    const pdfBuffer = await generateInvoicePDF(completeOrderDetails);

    console.log('PDF invoice generated successfully');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${completeOrderDetails.orderNumber}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating invoice:', error);

    // Provide more specific error messages
    let errorMessage = 'Failed to generate invoice';
    let errorDetails = 'Unknown error';

    if (error instanceof Error) {
      errorDetails = error.message;
      if (error.message.includes('PDFKit')) {
        errorMessage = 'PDF generation library error';
      } else if (error.message.includes('Order items')) {
        errorMessage = 'Invalid order data';
      } else if (error.message.includes('Customer details')) {
        errorMessage = 'Missing customer information';
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

async function generateInvoicePDF(orderDetails: OrderDetails): Promise<Buffer> {
  const { customer_details, items, orderNumber, createdAt, amount_total } =
    orderDetails;

  console.log('Generating PDF for order details:', {
    orderNumber,
    items: items ? items.length : 'undefined',
    customer_details: customer_details ? 'present' : 'undefined',
    amount_total,
  });

  // Validate required fields
  if (!items || !Array.isArray(items)) {
    console.error('Items array is missing or invalid:', items);
    throw new Error('Order items are required for invoice generation');
  }

  // Handle both customer_details (Stripe format) and shippingAddress (Order model format)
  const customerInfo = customer_details || orderDetails.shippingAddress;
  if (!customerInfo) {
    console.error('Customer details are missing');
    throw new Error('Customer details are required for invoice generation');
  }

  let browser;
  let page;

  try {
    // Generate HTML content
    const htmlContent = generateInvoiceHTML(orderDetails);
    console.log('HTML content generated, length:', htmlContent.length);

    // Launch browser with environment-specific configuration
    console.log('Launching browser...');

    if (isProduction) {
      // Vercel production configuration
      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: { width: 1920, height: 1080 },
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else {
      // Local development configuration
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    console.log('Browser launched successfully');

    // Create new page
    page = await browser.newPage();
    console.log('New page created');

    // Set content and wait for it to load
    console.log('Setting page content...');
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000, // 30 second timeout
    });
    console.log('Page content set successfully');

    // Wait a bit more to ensure everything is rendered
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate PDF
    console.log('Generating PDF...');
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      printBackground: true,
      timeout: 30000, // 30 second timeout
    });
    console.log('PDF generated successfully, size:', pdfBuffer.length);

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF with Puppeteer:', error);

    // Handle specific Puppeteer errors
    if (error instanceof Error) {
      if (error.message.includes('Target closed')) {
        throw new Error(
          'PDF generation failed: Browser target was closed unexpectedly. This may be due to memory constraints or timeout issues.'
        );
      } else if (error.message.includes('Protocol error')) {
        throw new Error(
          'PDF generation failed: Protocol error occurred during PDF generation. This may be due to browser communication issues.'
        );
      } else if (error.message.includes('Navigation timeout')) {
        throw new Error(
          'PDF generation failed: Page navigation timed out. The HTML content may be too complex or contain errors.'
        );
      } else if (error.message.includes('executablePath')) {
        throw new Error(
          'PDF generation failed: Chrome executable not found. Please ensure Chrome is installed or the executable path is correct.'
        );
      } else if (error.message.includes('waitForTimeout is not a function')) {
        throw new Error(
          'PDF generation failed: Puppeteer API compatibility issue. The waitForTimeout method is not available in this version of Puppeteer.'
        );
      }
    }

    throw new Error(
      `PDF generation failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  } finally {
    // Ensure browser is closed even if there's an error
    try {
      if (page) {
        await page.close();
        console.log('Page closed');
      }
      if (browser) {
        await browser.close();
        console.log('Browser closed');
      }
    } catch (closeError) {
      console.error('Error closing browser:', closeError);
    }
  }
}

function getLogoBase64(): string {
  try {
    const logoPath = path.join(
      process.cwd(),
      'public',
      'images',
      'lens-aura-logo.jpg'
    );
    const logoBuffer = fs.readFileSync(logoPath);
    return logoBuffer.toString('base64');
  } catch (error) {
    console.error('Error reading logo file:', error);
    // Return empty string if logo can't be loaded
    return '';
  }
}

function generateInvoiceHTML(orderDetails: OrderDetails): string {
  const {
    customer_details,
    items,
    orderNumber,
    createdAt,
    amount_total,
    subtotal,
    shipping,
  } = orderDetails;

  // Ensure customer_details exists for the HTML generation
  if (!customer_details) {
    throw new Error('Customer details are required for invoice generation');
  }

  // Calculate line items with proper promotional pricing
  const processedItems = items.map((item, index) => {
    const itemQuantity = item.quantity || 0;
    // Price is already in dollars from the database
    let effectivePrice = item.price || 0;
    let actualTotal = effectivePrice * itemQuantity;
    let promotionalNote = '';

    // For sunglasses with quantity >= 2, we need to apply the "buy two" promotion logic
    if (
      item.productType === 'sunglasses' &&
      item.category &&
      itemQuantity >= 2
    ) {
      const category = item.category as 'signature' | 'essentials';

      // Get the current discounted price from the database
      let currentDiscountedPrice = effectivePrice;
      if (item.originalPrice && item.originalPrice > 0) {
        currentDiscountedPrice = item.originalPrice || 0;
      }

      // Calculate promotional pricing
      const promo = calculatePromotionalPricing(
        currentDiscountedPrice,
        category
      );

      // For exactly 2 items, apply the "buy two" promotion
      if (itemQuantity === 2) {
        // Show the promotional pair pricing
        actualTotal = promo.twoForPrice;
        effectivePrice = actualTotal / itemQuantity;
        promotionalNote = ` - Buy 2 for $${promo.twoForPrice.toFixed(2)}`;
      } else if (itemQuantity > 2) {
        // For quantities > 2, calculate mixed pricing
        const promotionalPairs = Math.floor(itemQuantity / 2);
        const remainingItems = itemQuantity - promotionalPairs * 2;

        const promotionalPrice = promotionalPairs * promo.twoForPrice;
        const regularPrice = remainingItems * currentDiscountedPrice;
        actualTotal = promotionalPrice + regularPrice;
        effectivePrice = actualTotal / itemQuantity;

        promotionalNote = ` - Buy 2 Promotion: ${promotionalPairs} pair(s) at $${promo.twoForPrice.toFixed(
          2
        )} + ${remainingItems} individual at $${currentDiscountedPrice.toFixed(
          2
        )}`;
      }
    } else if (item.isPromotional) {
      // Handle items that already have promotional structure
      promotionalNote = ' - Buy 2 Promotion Applied';
      const originalPrice = (item.originalPrice || 0) / 100;
      if (originalPrice > effectivePrice) {
        promotionalNote += ` (was $${originalPrice.toFixed(2)} each)`;
      }
    } else if (item.productType === 'sunglasses' && item.category) {
      // Check if this item has current promotional pricing
      if (item.originalPrice && item.originalPrice > 0) {
        const originalPrice = (item.originalPrice || 0) / 100;
        if (Math.abs(originalPrice - effectivePrice) > 0.01) {
          promotionalNote = ' - Current Offer';
        }
      }
    }

    return {
      ...item,
      processedPrice: effectivePrice,
      processedTotal: actualTotal,
      promotionalNote,
    };
  });

  // Debug logging
  console.log(
    'Processed items for invoice:',
    processedItems.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      processedPrice: item.processedPrice,
      processedTotal: item.processedTotal,
      total: item.processedTotal,
    }))
  );

  const calculatedTotal = processedItems.reduce(
    (sum, item) => sum + item.processedTotal,
    0
  );
  console.log('Calculated total from line items:', calculatedTotal);
  console.log('Actual amount total:', amount_total);

  const itemsHTML = processedItems
    .map((item, index) => {
      const itemQuantity = item.quantity || 0;
      const effectivePrice = item.processedPrice;
      const actualTotal = item.processedTotal;
      const promotionalNote = item.promotionalNote;

      // The promotional logic is already handled in processedItems above

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${
            item.name || 'Unknown Product'
          }${promotionalNote}<br><small style="color: #666;">Type: ${
        (item.productType || 'N/A').charAt(0).toUpperCase() +
        (item.productType || 'N/A').slice(1)
      } | Category: ${
        (item.category || 'N/A').charAt(0).toUpperCase() +
        (item.category || 'N/A').slice(1)
      }</small></td>
          <td>${item.color || 'N/A'}</td>
          <td>${itemQuantity}</td>
          <td>$${effectivePrice.toFixed(2)}</td>
          <td>$${actualTotal.toFixed(2)}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice - ${orderNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          max-width: 120px;
          height: auto;
          margin-bottom: 10px;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .company-tagline {
          font-size: 12px;
          color: #666;
          margin-bottom: 10px;
        }
        .company-info {
          font-size: 10px;
          color: #666;
        }
        .invoice-title {
          font-size: 20px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
        }
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .invoice-info, .customer-info {
          flex: 1;
        }
        .invoice-info h3, .customer-info h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
        }
        .invoice-info p, .customer-info p {
          margin: 5px 0;
          font-size: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 12px;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .total {
          text-align: right;
          font-size: 14px;
          font-weight: bold;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 10px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${
          getLogoBase64()
            ? `<img src="data:image/jpeg;base64,${getLogoBase64()}" alt="Lens Aura Logo" class="logo">`
            : ''
        }
        <div class="company-name">LENS AURA</div>
        <div class="company-tagline">Where Vision Meets Aura</div>
        <div class="company-info">
          Phone: 02 9051 0054 | Email: info@lensaura.com.au
        </div>
      </div>
      
      <div class="invoice-title">INVOICE</div>
      
      <div class="invoice-details">
        <div class="invoice-info">
          <h3>Invoice Details</h3>
          <p><strong>Invoice Number:</strong> ${orderNumber}</p>
          <p><strong>Date:</strong> ${new Date(
            createdAt
          ).toLocaleDateString()}</p>
          <p><strong>Status:</strong> Paid</p>
        </div>
        <div class="customer-info">
          <h3>Bill To</h3>
          <p>${customer_details.name || 'N/A'}</p>
          <p>${customer_details.email || 'N/A'}</p>
          <p>${customer_details.address?.line1 || 'N/A'}</p>
          ${
            customer_details.address?.line2
              ? `<p>${customer_details.address.line2}</p>`
              : ''
          }
          <p>${customer_details.address?.city || 'N/A'}, ${
    customer_details.address?.state || 'N/A'
  } ${customer_details.address?.postal_code || 'N/A'}</p>
          <p>${customer_details.address?.country || 'N/A'}</p>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>Color</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
      
      <div style="text-align: right; margin-top: 20px;">
        <div style="margin-bottom: 10px;">
          <strong>Subtotal:</strong> $${
            subtotal ? subtotal.toFixed(2) : calculatedTotal.toFixed(2)
          }
        </div>
        ${
          shipping !== undefined
            ? `
        <div style="margin-bottom: 10px;">
          <strong>Shipping:</strong> $${
            shipping === 0 ? '0.00 (Free)' : shipping.toFixed(2)
          }
        </div>
        `
            : ''
        }
        <div style="margin-bottom: 10px;">
          <strong>Total:</strong> $${(
            calculatedTotal + (shipping || 0)
          ).toFixed(2)}
        </div>
      </div>
      
      <div class="footer">
        <p>Thank you for your purchase!</p>
        <p>For any questions, please contact us at info@lensaura.com.au</p>
        <p>This invoice was generated automatically.</p>
      </div>
    </body>
    </html>
  `;
}

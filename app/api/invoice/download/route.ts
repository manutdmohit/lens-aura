import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Order from '@/models/Order';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import {
  calculateSeptember2025Pricing,
  calculatePromotionalPricing,
} from '@/lib/utils/discount';

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
          }).populate('items.product');
          console.log('Order found by orderNumber:', order ? 'Yes' : 'No');

          // If not found, try case-insensitive search
          if (!order) {
            console.log('Trying case-insensitive search...');
            order = await Order.findOne({
              orderNumber: {
                $regex: new RegExp(`^${orderDetails.orderNumber}$`, 'i'),
              },
            }).populate('items.product');
            console.log(
              'Order found by case-insensitive search:',
              order ? 'Yes' : 'No'
            );
          }
        } else if (orderDetails.id) {
          console.log('Searching by id:', orderDetails.id);
          order = await Order.findById(orderDetails.id).populate(
            'items.product'
          );
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
            price: item.price * 100, // Convert to cents
            quantity: item.quantity,
            color: item.color,
            imageUrl: item.imageUrl,
            productType: item.productType,
            category: item.product?.category || item.category || 'N/A',
            originalPrice: item.originalPrice
              ? item.originalPrice * 100
              : undefined, // Convert to cents
          })),
          totalAmount: order.totalAmount * 100, // Convert to cents
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt.toISOString(),
          amount_total: order.totalAmount * 100, // Convert to cents
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
        });
        return NextResponse.json(
          { error: 'Failed to fetch order data from database' },
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

  try {
    // Generate HTML content
    const htmlContent = generateInvoiceHTML(orderDetails);

    // Launch browser with Vercel-compatible configuration
    const isProduction = process.env.NODE_ENV === 'production';

    const browser = await puppeteer.launch({
      args: isProduction
        ? chromium.args
        : [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
          ],
      defaultViewport: { width: 1920, height: 1080 },
      executablePath: isProduction
        ? await chromium.executablePath()
        : undefined,
      headless: true,
    });

    const page = await browser.newPage();

    // Set content and wait for it to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      printBackground: true,
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF with Puppeteer:', error);
    throw new Error(
      `PDF generation failed: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

function generateInvoiceHTML(orderDetails: OrderDetails): string {
  const { customer_details, items, orderNumber, createdAt, amount_total } =
    orderDetails;

  // Ensure customer_details exists for the HTML generation
  if (!customer_details) {
    throw new Error('Customer details are required for invoice generation');
  }

  // Calculate line items with proper promotional pricing
  const processedItems = items.map((item, index) => {
    const itemQuantity = item.quantity || 0;
    let effectivePrice = (item.price || 0) / 100;
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
        currentDiscountedPrice = (item.originalPrice || 0) / 100;
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
  console.log('Actual amount total:', amount_total / 100);

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
        <div class="company-name">LENS AURA</div>
        <div class="company-tagline">Where Vision Meets Aura</div>
        <div class="company-info">
          Phone: +61 402 564 501 | Email: info@lensaura.com.au
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
          <strong>Subtotal:</strong> $${calculatedTotal.toFixed(2)}
        </div>
        <div style="margin-bottom: 10px;">
          <strong>Total:</strong> $${(amount_total / 100).toFixed(2)}
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

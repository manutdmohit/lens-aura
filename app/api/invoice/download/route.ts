import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Order from '@/models/Order';
import puppeteer from 'puppeteer';
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

    // Validate order details structure
    let completeOrderDetails = orderDetails;
    if (!orderDetails.items || !Array.isArray(orderDetails.items)) {
      console.log(
        'Items array missing, attempting to fetch complete order data from database'
      );

      try {
        await connectToDatabase();

        // Try to find the order by orderNumber or orderId
        let order = null;
        if (orderDetails.orderNumber) {
          order = await Order.findOne({
            orderNumber: orderDetails.orderNumber,
          });
        } else if (orderDetails.id) {
          order = await Order.findById(orderDetails.id);
        }

        if (!order) {
          console.error('Order not found in database:', {
            orderNumber: orderDetails.orderNumber,
            id: orderDetails.id,
          });
          return NextResponse.json(
            { error: 'Order not found in database' },
            { status: 404 }
          );
        }

        // Transform the order data to match our expected format
        completeOrderDetails = {
          id: order._id.toString(),
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail || '',
          items: order.items.map((item) => ({
            productId: item.productId || '',
            name: item.name,
            price: item.price * 100, // Convert to cents
            quantity: item.quantity,
            color: item.color,
            imageUrl: item.imageUrl,
            productType: item.productType,
            category: item.product?.category || item.category,
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
      } catch (error) {
        console.error('Error fetching order from database:', error);
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

    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
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

    return pdfBuffer;
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

  const itemsHTML = items
    .map((item, index) => {
      const itemQuantity = item.quantity || 0;
      let effectivePrice = (item.price || 0) / 100;
      let actualTotal = effectivePrice * itemQuantity;
      let promotionalNote = '';

      // Handle promotional pricing
      if (
        item.productType === 'sunglasses' &&
        item.category &&
        item.originalPrice &&
        itemQuantity >= 2
      ) {
        const originalPrice = (item.originalPrice || 0) / 100;
        const septemberPricing = calculateSeptember2025Pricing(
          originalPrice,
          item.category as 'signature' | 'essentials'
        );

        if (septemberPricing.isActive) {
          const promo = calculatePromotionalPricing(
            septemberPricing.promotionalPrice,
            item.category as 'essentials' | 'signature'
          );

          const promotionalPairs = Math.min(1, Math.floor(itemQuantity / 2));
          const remainingItems = itemQuantity - promotionalPairs * 2;

          if (promotionalPairs > 0 && remainingItems > 0) {
            const promotionalPrice = promotionalPairs * promo.twoForPrice;
            const regularPrice =
              remainingItems * septemberPricing.promotionalPrice;
            actualTotal = promotionalPrice + regularPrice;
            effectivePrice = actualTotal / itemQuantity;
            promotionalNote = ` (Mixed pricing)`;
          } else if (promotionalPairs > 0) {
            actualTotal = promotionalPairs * promo.twoForPrice;
            effectivePrice = actualTotal / itemQuantity;
          }

          if (septemberPricing.savings > 0) {
            promotionalNote += ` - ${septemberPricing.saleMonth} Sale`;
          }
        }
      }

      return `
        <tr>
          <td>${index + 1}</td>
          <td>${item.name || 'Unknown Product'}${promotionalNote}</td>
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
          <p>${customer_details.name}</p>
          <p>${customer_details.email}</p>
          <p>${customer_details.address.line1}</p>
          ${
            customer_details.address.line2
              ? `<p>${customer_details.address.line2}</p>`
              : ''
          }
          <p>${customer_details.address.city}, ${
    customer_details.address.state
  } ${customer_details.address.postal_code}</p>
          <p>${customer_details.address.country}</p>
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
      
      <div class="total">
        Total: $${(amount_total / 100).toFixed(2)}
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

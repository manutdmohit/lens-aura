import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Order from '@/models/Order';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  imageUrl?: string;
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

    // Generate HTML invoice
    const htmlContent = generateInvoiceHTML(completeOrderDetails);

    console.log('HTML invoice generated successfully');

    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="invoice-${completeOrderDetails.orderNumber}.html"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate invoice',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(orderDetails: OrderDetails): string {
  const { customer_details, items, orderNumber, createdAt, amount_total } =
    orderDetails;

  console.log('Generating HTML for order details:', {
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

  const itemsHTML = items
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.name || 'Unknown Product'}</td>
          <td>${item.quantity || 0}</td>
          <td>$${((item.price || 0) / 100).toFixed(2)}</td>
          <td>$${(((item.price || 0) * (item.quantity || 0)) / 100).toFixed(
            2
          )}</td>
        </tr>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${orderNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .company-name {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        .company-tagline {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }
        .company-info {
          font-size: 12px;
          color: #888;
        }
        .invoice-title {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin: 30px 0;
          color: #333;
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
          color: #333;
          font-size: 16px;
        }
        .invoice-info p, .customer-info p {
          margin: 5px 0;
          color: #666;
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #333;
        }
        .total {
          text-align: right;
          font-size: 18px;
          font-weight: bold;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #333;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          color: #666;
          font-size: 12px;
        }
        @media print {
          body {
            background-color: white;
          }
          .invoice-container {
            box-shadow: none;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
                 <div class="header">
           <div class="company-name">LENS AURA</div>
           <div class="company-tagline">Your Vision, Our Passion</div>
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
             <p><strong>${customer_details.name}</strong></p>
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
              <th>Item</th>
              <th>Description</th>
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
      </div>
    </body>
    </html>
  `;
}

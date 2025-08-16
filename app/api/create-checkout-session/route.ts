import { NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';
import { createPendingOrder } from '@/lib/order-service';
import { getProductById } from '@/lib/products';
import type { CartItem } from '@/context/cart-context';

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Validate stock availability before creating checkout session
    for (const item of items) {
      const product = await getProductById(item.product._id);

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.product.name} not found` },
          { status: 400 }
        );
      }

      // Handle different product types for stock validation
      if (
        product.productType === 'glasses' ||
        product.productType === 'sunglasses'
      ) {
        // For glasses/sunglasses, check frameColorVariants
        if (
          !product.frameColorVariants ||
          product.frameColorVariants.length === 0
        ) {
          return NextResponse.json(
            { error: `No color variants found for ${product.name}` },
            { status: 400 }
          );
        }

        // If color is specified, check that specific variant
        if (item.color) {
          const colorName =
            typeof item.color === 'string' ? item.color : item.color.name;
          const variant = product.frameColorVariants.find((v) => {
            const variantColorName =
              typeof v.color === 'string' ? v.color : v.color.name;
            return variantColorName === colorName;
          });
          if (!variant) {
            return NextResponse.json(
              {
                error: `Color variant '${colorName}' not found for ${product.name}`,
              },
              { status: 400 }
            );
          }

          const currentStock = variant.stockQuantity ?? 0;
          if (currentStock < item.quantity) {
            return NextResponse.json(
              {
                error: `Insufficient stock for ${product.name} (${colorName}). Available: ${currentStock}, Requested: ${item.quantity}`,
              },
              { status: 400 }
            );
          }
        } else {
          // If no color specified, check if any variant has sufficient stock
          const availableStock = product.frameColorVariants.reduce(
            (total, variant) => total + (variant.stockQuantity ?? 0),
            0
          );
          if (availableStock < item.quantity) {
            return NextResponse.json(
              {
                error: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`,
              },
              { status: 400 }
            );
          }
        }
      } else {
        // For contacts/accessories, check main stockQuantity
        const currentStock = product.stockQuantity ?? 0;
        if (currentStock < item.quantity) {
          return NextResponse.json(
            {
              error: `Insufficient stock for ${product.name}. Available: ${currentStock}, Requested: ${item.quantity}`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Get the origin for success and cancel URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create success and cancel URLs
    const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/checkout/cancel`;

    // Create checkout session
    const session = await createCheckoutSession(
      items as CartItem[],
      successUrl,
      cancelUrl
    );

    // Create pending order in database
    await createPendingOrder(items as CartItem[], session.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Error in create-checkout-session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase } from '@/lib/api/db';
import { Product } from '@/models';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get total products count
    const totalProducts = await Product.countDocuments();

    // Get active products count
    const activeProducts = await Product.countDocuments({ status: 'active' });

    // Get low stock products count
    const lowStockProducts = await Product.aggregate([
      {
        $addFields: {
          totalStock: {
            $cond: {
              if: {
                $in: ['$productType', ['glasses', 'sunglasses']],
              },
              then: {
                $reduce: {
                  input: { $ifNull: ['$frameColorVariants', []] },
                  initialValue: 0,
                  in: {
                    $add: ['$$value', { $ifNull: ['$$this.stockQuantity', 0] }],
                  },
                },
              },
              else: { $ifNull: ['$stockQuantity', 0] },
            },
          },
        },
      },
      {
        $match: {
          totalStock: { $lte: 5 },
        },
      },
      {
        $count: 'count',
      },
    ]);

    // Calculate total inventory value
    const totalValue = await Product.aggregate([
      {
        $addFields: {
          totalStock: {
            $cond: {
              if: {
                $in: ['$productType', ['glasses', 'sunglasses']],
              },
              then: {
                $reduce: {
                  input: { $ifNull: ['$frameColorVariants', []] },
                  initialValue: 0,
                  in: {
                    $add: ['$$value', { $ifNull: ['$$this.stockQuantity', 0] }],
                  },
                },
              },
              else: { $ifNull: ['$stockQuantity', 0] },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: {
              $multiply: [{ $ifNull: ['$price', 0] }, '$totalStock'],
            },
          },
        },
      },
    ]);

    return NextResponse.json({
      totalProducts,
      activeProducts,
      lowStockProducts: lowStockProducts[0]?.count || 0,
      totalValue: totalValue[0]?.totalValue || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/api/db'
import Order from '@/models/Order'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/authOptions'

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Connect to database
    console.log('Connecting to database...')
    await connectToDatabase()
    console.log('Database connected successfully')

    // Get revenue data for the current year
    const currentYear = new Date().getFullYear()
    const yearStartDate = new Date(currentYear, 0, 1) // January 1st of current year
    yearStartDate.setHours(0, 0, 0, 0)

    console.log('Fetching revenue data from:', yearStartDate.toISOString())

    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: yearStartDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          amount: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]).exec()

    console.log('Raw revenue data:', revenueData)

    // Transform the data into the required format
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // Generate all months for the current year
    const allMonths = []
    const currentMonth = new Date().getMonth() // Get current month (0-11)
    
    // Add all months from January up to the current month
    for (let i = 0; i <= currentMonth; i++) {
      allMonths.push({
        year: currentYear,
        month: i + 1,
        monthName: months[i]
      })
    }

    // Create a map of existing data
    const revenueMap = new Map(
      revenueData.map(item => [
        `${item._id.year}-${item._id.month}`,
        item.amount
      ])
    )

    // Format the data with all months
    const formattedData = allMonths.map(({ year, month, monthName }) => {
      const key = `${year}-${month}`
      return {
        date: monthName,
        amount: revenueMap.get(key) || 0
      }
    })

    console.log('Formatted revenue data:', formattedData)

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error('Error fetching revenue data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch revenue data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 
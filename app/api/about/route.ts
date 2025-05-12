import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/api/db';
import { handleError } from '@/lib/api/middleware';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import AboutUs from '@/models/AboutUs';
import { AboutUsData, AboutUsResponse } from '@/types/about';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const aboutUs = await AboutUs.findOne();

    if (!aboutUs) {
      const defaultData: AboutUsData = {
        content: 'Welcome to Lens Aura, your premier destination for eyewear excellence.',
        mission: 'Our mission is to provide exceptional eyewear solutions.',
        vision: 'To be the leading eyewear provider in Australia.',
        values: [
          {
            title: 'Quality',
            description: 'We are committed to providing the highest quality eyewear.',
          },
        ],
      };
      return NextResponse.json({ success: true, data: defaultData });
    }

    const response: AboutUsResponse = {
      success: true,
      data: {
        content: aboutUs.content,
        mission: aboutUs.mission,
        vision: aboutUs.vision,
        values: aboutUs.values,
        updatedAt: aboutUs.updatedAt,
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching about us:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch about us data' },
      { status: 500 }
    );
  } finally {
    await disconnectFromDatabase();
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const data = await req.json();

    // Validate required fields
    const requiredFields = ['content', 'mission', 'vision', 'values'] as const;
    for (const field of requiredFields) {
      if (!data[field as keyof AboutUsData]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Get the latest version
    const latestVersion = await AboutUs.findOne().sort({ 'metadata.version': -1 });
    const newVersion = latestVersion ? latestVersion.metadata.version + 1 : 1;

    // Update or insert the about us content
    const aboutUs = await AboutUs.findOneAndUpdate(
      {}, // empty filter to match any document
      {
        ...data,
        metadata: {
          lastUpdatedBy: session.user.email || 'admin',
          version: newVersion,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: aboutUs });
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const data: AboutUsData = await req.json();

    // Log the received data
    console.log('Received data:', data);

    // Validate required fields
    const requiredFields = ['content', 'mission', 'vision', 'values'] as const;
    for (const field of requiredFields) {
      if (!data[field as keyof AboutUsData]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate values array
    if (!Array.isArray(data.values) || data.values.length === 0) {
      return NextResponse.json(
        { error: 'Values must be a non-empty array' },
        { status: 400 }
      );
    }

    // Create the update object
    const updateData = {
      content: data.content,
      mission: data.mission,
      vision: data.vision,
      values: data.values,
    };

    console.log('Update data:', updateData);

    // Update the about us content
    const aboutUs = await AboutUs.findOneAndUpdate(
      {}, // empty filter to match any document
      updateData,
      { upsert: true, new: true, runValidators: true }
    );

    if (!aboutUs) {
      console.error('Failed to update about us content');
      return NextResponse.json(
        { error: 'Failed to update content' },
        { status: 500 }
      );
    }

    console.log('Updated about us:', aboutUs);

    // Return the complete document
    const response: AboutUsResponse = {
      success: true,
      data: {
        content: aboutUs.content,
        mission: aboutUs.mission,
        vision: aboutUs.vision,
        values: aboutUs.values,
        updatedAt: aboutUs.updatedAt,
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating about us:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  } finally {
    await disconnectFromDatabase();
  }
} 
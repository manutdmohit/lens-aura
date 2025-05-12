import { NextResponse } from 'next/server';
import Settings from '@/models/Settings';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const settings = await Settings.findOne({});
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json();
    const { currentPassword, newPassword } = data;

    // Assume user ID is available from session (pseudo-code, replace with actual session logic)
    // const userId = getUserIdFromSession(request);
    // For demo, fetch the first admin user
    const user = await User.findOne({ role: { $in: ['admin', 'superadmin'] } }).select('+password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentPassword && newPassword) {
      // Validate current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      // Update the password
      user.password = newPassword; // Will be hashed by pre-save hook
      await user.save();
      return NextResponse.json({ success: true });
    }

    // If no password update, proceed with other settings updates (if needed)
    // ... (your settings update logic here, if any) ...
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
} 
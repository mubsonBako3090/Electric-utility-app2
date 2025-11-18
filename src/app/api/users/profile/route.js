import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { requireAuth } from '@/middleware/auth';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/utils';

export async function GET(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    
    return NextResponse.json(
      successResponse({
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          address: user.address,
          accountNumber: user.accountNumber,
          meterNumber: user.meterNumber,
          customerType: user.customerType,
          preferences: user.preferences,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          isVerified: user.isVerified
        }
      })
    );

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      errorResponse(error.message),
      { status: 401 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const user = await requireAuth(request);
    const updateData = await request.json();

    // Only allow specific fields to be updated
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'address', 'preferences'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json(
      successResponse({ user: updatedUser }, 'Profile updated successfully')
    );

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      errorResponse('Failed to update profile'),
      { status: 400 }
    );
  }
}
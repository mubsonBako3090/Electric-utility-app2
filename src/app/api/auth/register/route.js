import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';
import { generateToken, setTokenCookie } from '@/lib/auth';
import { handleError, successResponse, errorResponse } from '@/lib/utils';

export async function POST(request) {
  try {
    await connectDB();

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      customerType = 'residential'
    } = await request.json();

    // Validation
    if (!firstName || !lastName || !email || !password || !phone || !address) {
      return NextResponse.json(
        errorResponse('All fields are required'),
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        errorResponse('Password must be at least 6 characters'),
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        errorResponse('User already exists with this email'),
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      customerType
    });

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    await user.updateLastLogin();

    // Create response
    const response = NextResponse.json(
      successResponse({
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          accountNumber: user.accountNumber,
          meterNumber: user.meterNumber,
          customerType: user.customerType,
          address: user.address
        }
      }, 'Registration successful')
    );

    // Set cookie
    setTokenCookie(response, token);

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    
    const errorData = handleError(error);
    return NextResponse.json(
      errorResponse(errorData.error, errorData.details),
      { status: errorData.details ? 400 : 500 }
    );
  }
}
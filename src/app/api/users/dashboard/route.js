import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import User from '@/models/User';
import Bill from '@/models/Bill';
import { requireAuth } from '@/middleware/auth';

// GET /api/users/dashboard - Get dashboard data
export const GET = requireAuth(async (request) => {
  try {
    await connectToDatabase();
    
    const userId = request.user.userId;
    
    // Get user data
    const user = await User.findById(userId);
    
    // Get recent bills
    const bills = await Bill.find({ userId })
      .sort({ issueDate: -1 })
      .limit(5);
    
    // Get current balance (sum of pending bills)
    const currentBalance = await Bill.aggregate([
      { 
        $match: { 
          userId: user._id,
          status: { $in: ['pending', 'overdue'] }
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$amount' } 
        } 
      }
    ]);
    
    // Mock usage data (in real app, this would come from usage records)
    const usageData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Energy Usage (kWh)',
          data: [450, 420, 480, 510, 490, 530, 600, 580, 520, 480, 460, 440],
          borderColor: '#0066cc',
          backgroundColor: 'rgba(0, 102, 204, 0.1)'
        }
      ]
    };
    
    // Mock notifications
    const notifications = [
      {
        id: 1,
        type: 'info',
        title: 'Welcome to Your Dashboard',
        message: 'Get started by exploring your energy usage and bills.',
        time: '2 hours ago',
        read: false
      },
      {
        id: 2,
        type: 'success',
        title: 'Payment Received',
        message: 'Your payment of $125.50 has been processed.',
        time: '3 days ago',
        read: true
      }
    ];
    
    const dashboardData = {
      currentBalance: currentBalance[0]?.total || 0,
      monthlyUsage: '450 kWh',
      outageStatus: 'No outages reported',
      nextReading: '15th Jan',
      usageData,
      currentBill: bills[0] || null,
      notifications,
      stats: {
        totalDue: currentBalance[0]?.total || 0,
        usageTrend: '+5% from last month',
        outageCount: 0
      }
    };
    
    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
});
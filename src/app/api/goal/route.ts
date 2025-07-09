import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Goal from '@/models/Goal';

export async function GET() {
  try {
    await dbConnect();
    const goal = await Goal.findOne().sort({ createdAt: -1 });
    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json({ error: 'Failed to fetch goal' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { bankAmount, startDate } = body;

    if (!bankAmount || !startDate) {
      return NextResponse.json({ error: 'Bank amount and start date are required' }, { status: 400 });
    }

    await Goal.deleteMany({});

    const goal = new Goal({
      bankAmount,
      startDate: new Date(startDate),
    });

    await goal.save();
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}
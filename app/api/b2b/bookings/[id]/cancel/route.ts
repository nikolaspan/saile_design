import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('Booking ID extracted from path:', id);

    // Update the booking status to "Cancelled"
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'Cancelled' },
    });

    return NextResponse.json(
      { message: 'Booking cancelled successfully', booking: updatedBooking },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}

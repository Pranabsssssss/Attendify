import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connect';
import Holiday from '@/models/Holiday';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const month = searchParams.get('month'); // 0-11
        const year = searchParams.get('year');
        const academicYear = searchParams.get('academicYear');

        await dbConnect();

        let query: any = {};

        if (month && year) {
            const startDate = new Date(parseInt(year), parseInt(month), 1);
            const endDate = new Date(parseInt(year), parseInt(month) + 1, 0, 23, 59, 59); // Last day of month

            // Find holidays that overlap with the month
            query = {
                $or: [
                    { startDate: { $gte: startDate, $lte: endDate } }, // Starts in month
                    { endDate: { $gte: startDate, $lte: endDate } },   // Ends in month
                    { startDate: { $lte: startDate }, endDate: { $gte: endDate } } // Spans entire month
                ]
            };
        } else if (academicYear) {
            query.academicYear = academicYear;
        }

        const holidays = await Holiday.find(query).sort({ startDate: 1 });

        return NextResponse.json(holidays);
    } catch (error) {
        console.error('Error fetching holidays:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, startDate, endDate, description, academicYear } = body;

        if (!name || !startDate || !endDate || !academicYear) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await dbConnect();

        const sDate = new Date(startDate);
        const eDate = new Date(endDate);

        if (eDate < sDate) {
            return NextResponse.json({ error: 'End date cannot be before start date' }, { status: 400 });
        }

        const newHoliday = await Holiday.create({
            name,
            startDate: sDate,
            endDate: eDate,
            description,
            academicYear
        });

        return NextResponse.json(newHoliday, { status: 201 });
    } catch (error) {
        console.error('Error creating holiday:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Holiday ID is required' }, { status: 400 });
        }

        await dbConnect();
        await Holiday.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Holiday deleted successfully' });
    } catch (error) {
        console.error('Error deleting holiday:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { sendMeetingInvites } from '@/lib/email';
import { getUsers, getMeeting } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { meetingId, attendeeIds, organizerId } = body;

    if (!meetingId || !attendeeIds || !Array.isArray(attendeeIds) || attendeeIds.length === 0) {
      return NextResponse.json(
        { error: 'meetingId et attendeeIds sont requis' },
        { status: 400 }
      );
    }

    // Get meeting details
    const meeting = await getMeeting(meetingId);
    if (!meeting) {
      return NextResponse.json(
        { error: 'Réunion non trouvée' },
        { status: 404 }
      );
    }

    // Get all users to find emails
    const users = await getUsers();
    const organizer = users.find(u => u.id === organizerId);
    const organizerName = organizer?.name || 'Un organisateur';

    // Filter attendees (exclude organizer) and get their emails
    const attendeesToNotify = attendeeIds
      .filter((id: string) => id !== organizerId)
      .map((id: string) => users.find(u => u.id === id))
      .filter((user): user is NonNullable<typeof user> => user !== undefined)
      .map(user => ({
        to: user.email,
        recipientName: user.name,
      }));

    if (attendeesToNotify.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun participant à notifier',
        results: { successful: 0, failed: 0, total: 0 },
      });
    }

    // Send emails
    const results = await sendMeetingInvites(attendeesToNotify, {
      title: meeting.title,
      description: meeting.description,
      date: meeting.date,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      location: meeting.location,
      organizerName,
    });

    return NextResponse.json({
      success: true,
      message: `${results.successful} email(s) envoyé(s) sur ${results.total}`,
      results,
    });
  } catch (error) {
    console.error('Error sending meeting invites:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi des invitations' },
      { status: 500 }
    );
  }
}

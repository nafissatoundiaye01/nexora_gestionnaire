import { NextRequest, NextResponse } from 'next/server';
import { getTeamMembers, createTeamMember } from '@/lib/db';

export async function GET() {
  const members = await getTeamMembers();
  return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const member = await createTeamMember(body);
  return NextResponse.json(member, { status: 201 });
}

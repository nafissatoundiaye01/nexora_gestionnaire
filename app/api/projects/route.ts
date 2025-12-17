import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/db';

export async function GET() {
  const projects = await getProjects();
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const project = await createProject(body);
  return NextResponse.json(project, { status: 201 });
}

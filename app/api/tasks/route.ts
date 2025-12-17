import { NextRequest, NextResponse } from 'next/server';
import { getTasks, createTask } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const tasks = await getTasks(projectId || undefined);
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const task = await createTask(body);
  return NextResponse.json(task, { status: 201 });
}

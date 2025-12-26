import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'emails.json');

async function parseEmailFromRequest(req: Request) {
  const contentType = (req.headers.get('content-type') || '').toLowerCase();
  let email = '';

  if (contentType.includes('application/json')) {
    const body = await req.json().catch(() => ({}));
    email = body?.email || '';
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    email = params.get('email') || '';
  } else {
    try {
      const body = await req.json();
      email = body?.email || '';
    } catch (e) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      email = params.get('email') || '';
    }
  }

  return (typeof email === 'string') ? email.trim() : '';
}

export async function POST(req: Request) {
  try {
    const email = await parseEmailFromRequest(req);
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    await fs.promises.mkdir(DATA_DIR, { recursive: true });

    let arr: Array<any> = [];
    try {
      const existing = await fs.promises.readFile(DATA_FILE, 'utf8').catch(() => '');
      arr = existing ? JSON.parse(existing) : [];
      if (!Array.isArray(arr)) arr = [];
    } catch (err) {
      arr = [];
    }

    arr.push({ email, createdAt: new Date().toISOString() });
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('File storage error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

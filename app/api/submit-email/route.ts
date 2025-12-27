import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient as createRedisClient } from 'redis';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'emails.json');


let cachedRedis: any = null;
async function getRedis() {
  if (cachedRedis) return cachedRedis;
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    const client = createRedisClient({ url });
    // reuse existing connection across invocations when possible
    // serverless warm starts will preserve module scope in many runtimes
    if ((client as any).isOpen !== true) {
      await client.connect();
    }
    cachedRedis = client;
    return client;
  } catch (e) {
    console.error('Redis connection failed:', e);
    return null;
  }
}

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
    const item = { email, createdAt: new Date().toISOString() };

    // Try plain Redis (REDIS_URL) as a fallback
    const redis = await getRedis();
    if (redis) {
      try {
        // rPush is supported by node-redis v4
        if (typeof redis.rPush === 'function') {
          await redis.rPush('emails', JSON.stringify(item));
        } else if (typeof redis.lPush === 'function') {
          await redis.lPush('emails', JSON.stringify(item));
        } else {
          await redis.set(`emails:${Date.now()}:${Math.random().toString(36).slice(2,8)}`, JSON.stringify(item));
        }
        return NextResponse.json({ ok: true });
      } catch (e) {
        console.error('Redis write failed, falling back to file (if allowed):', e);
      }
    }
    
    // File fallback: only allow on non-Vercel environments (local/dev)
    if (process.env.VERCEL) {
      console.error('Running on Vercel without KV enabled; file writes are read-only.');
      return NextResponse.json({ error: 'Read-only filesystem on Vercel. Enable Vercel KV or configure Upstash.' }, { status: 500 });
    }

    await fs.promises.mkdir(DATA_DIR, { recursive: true });

    let arr: Array<any> = [];
    try {
      const existing = await fs.promises.readFile(DATA_FILE, 'utf8').catch(() => '');
      arr = existing ? JSON.parse(existing) : [];
      if (!Array.isArray(arr)) arr = [];
    } catch (err) {
      arr = [];
    }

    arr.push(item);
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(arr, null, 2), 'utf8');

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('File storage error:', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}

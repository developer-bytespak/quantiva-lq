import { createClient } from 'redis';

async function main() {
  const url = process.env.REDIS_URL || 'redis://default:XmiFUrQqP3kHoiUjVQGRXCShyrwkBl75@redis-19539.c239.us-east-1-2.ec2.cloud.redislabs.com:19539';
  console.log('Using REDIS_URL:', url.startsWith('redis://') ? url.replace(/:(.*)@/, ':*****@') : url);
  const client = createClient({ url });
  client.on('error', (err) => console.error('Redis client error', err));
  await client.connect();
  try {
    // Try LRANGE first
    const emails = await client.lRange('emails', 0, -1).catch(() => null);
    if (emails && emails.length) {
      console.log('Found', emails.length, 'emails:');
      emails.forEach((e, i) => console.log(i + 1, e));
    } else {
      console.log('No list entries found in key "emails". Trying SCAN for keys...');
      const keys = await client.scanIterator({ MATCH: 'emails*' });
      let found = false;
      for await (const k of keys) {
        found = true;
        const val = await client.get(k);
        console.log('Key:', k, 'Value:', val);
      }
      if (!found) console.log('No keys matching "emails*" found.');
    }
  } catch (err) {
    console.error('Query error:', err);
  } finally {
    await client.disconnect();
  }
}

main().catch(err => { console.error(err); process.exit(1); });

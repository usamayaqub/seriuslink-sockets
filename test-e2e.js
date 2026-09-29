const Redis = require('ioredis');
const { execSync } = require('child_process');
const path = require('path');

const redis = new Redis({
  host: 'turntable.proxy.rlwy.net',
  port: 53492,
  password: 'kcPKncTMPCyQtJzIyzXpBVQbTTmihmUa'
});

console.log('1. Subscribing to Redis channel "notification_event" on Railway...');

redis.subscribe('notification_event', (err, count) => {
  if (err) {
    console.error('Subscription failed:', err);
    process.exit(1);
  }
  console.log('2. Successfully subscribed to Railway Redis!');
  console.log('3. Triggering Laravel event via Artisan...');

  try {
    const laravelPath = path.resolve(__dirname, '..');
    const phpCode = `$user = ['id' => 99, 'name' => 'John Doe', 'message' => 'Hello from End-to-End Test']; event(new App\\Events\\NotificationsEvent($user));`;
    const cmd = `php artisan tinker --execute="${phpCode}"`;
    execSync(cmd, { cwd: laravelPath, stdio: 'inherit' });
    console.log('4. Laravel Artisan event command executed.');
  } catch (e) {
    console.error('Artisan error:', e);
  }
});

redis.on('message', (channel, message) => {
  console.log('\n====================================================');
  console.log('🎉 EVENT RECEIVED FROM LARAVEL VIA RAILWAY REDIS!');
  console.log('Channel:', channel);
  console.log('Data:', message);
  console.log('====================================================\n');
  console.log('✅ End-to-End Test PASSED SUCCESSFULLY!');
  process.exit(0);
});

setTimeout(() => {
  console.error('❌ Timed out waiting for message after 10 seconds.');
  process.exit(1);
}, 10000);

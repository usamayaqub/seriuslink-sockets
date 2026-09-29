const Redis = require('ioredis');

const redis = new Redis({
  host: 'turntable.proxy.rlwy.net',
  port: 53492,
  password: 'kcPKncTMPCyQtJzIyzXpBVQbTTmihmUa'
});

const channels = [
  "notification_event",
  "web_notifications",
  "project_closed",
  "accept_engangement",
  "decline_engangement",
  "like_project",
  "send_message",
  "announce_project",
  "send_engangement_request",
  "start_chat",
  "user_is_online",
  "user_blocked"
];

console.log('📡 Connecting to Railway Redis listener...');

redis.subscribe(...channels, (err, count) => {
  if (err) {
    console.error('❌ Failed to subscribe:', err.message);
    process.exit(1);
  }
  console.log(`✅ LIVE LISTENER READY! Listening to ${count} channels on Railway.`);
  console.log('👉 Now trigger the command on your PRODUCTION server...\n');
});

redis.on('message', (channel, message) => {
  const time = new Date().toLocaleTimeString();
  console.log(`\n====================================================`);
  console.log(`🔔 [${time}] EVENT RECEIVED FROM PRODUCTION!`);
  console.log(`Channel: ${channel}`);
  console.log(`Payload:`, JSON.stringify(JSON.parse(message), null, 2));
  console.log(`====================================================\n`);
});

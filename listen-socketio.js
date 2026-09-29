const io = require("socket.io-client");

const socket = io("https://seriuslink-sockets-production.up.railway.app", {
  transports: ["websocket", "polling"],
  timeout: 10000,
});

console.log("Connecting to live Railway Socket.IO server: https://seriuslink-sockets-production.up.railway.app ...");


socket.on("connect", () => {
  console.log("✅ CONNECTED TO RAILWAY SOCKET SERVER SUCCESSFULLY! Socket ID:", socket.id);
  console.log("📡 Listening for live events from production...\n");
});

socket.on("connect_error", (err) => {
  console.error("❌ Connection error:", err.message);
});

// Listen to notification_event
socket.on("notification_event:notification_event", (data) => {
  const time = new Date().toLocaleTimeString();
  console.log("\n====================================================");
  console.log(`🎉 [${time}] LIVE EVENT RECEIVED FROM PRODUCTION VIA WEBSOCKET!`);
  console.log("Event: notification_event:notification_event");
  console.log("Payload:", JSON.stringify(data, null, 2));
  console.log("====================================================\n");
});

// Wildcard / generic event logger
socket.onAny((event, ...args) => {
  const time = new Date().toLocaleTimeString();
  console.log(`\n🔔 [${time}] Generic Event Captured [${event}]:`, JSON.stringify(args, null, 2));
});

const express = require("express");
const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server, {
    cors: { origin: "*" },
});
require("dotenv").config();

const ioRedis = require("ioredis");
let redis;

const redisConfig = {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        const delay = Math.min(times * 500, 3000);
        return delay;
    },
};

if (process.env.REDIS_URL) {
    console.log("Connecting to Redis via REDIS_URL...");
    redis = new ioRedis(process.env.REDIS_URL, redisConfig);
} else {
    const host = process.env.REDIS_HOST || process.env.REDISHOST || "127.0.0.1";
    const port = parseInt(process.env.REDIS_PORT || process.env.REDISPORT || "6379", 10);
    const password = process.env.REDIS_PASSWORD || process.env.REDISPASSWORD || undefined;

    console.log(`Connecting to Redis at ${host}:${port}...`);
    redis = new ioRedis({
        host,
        port,
        password,
        ...redisConfig,
    });
}

redis.on("connect", () => {
    console.log("✅ Connected to Redis successfully.");
});

redis.on("error", (err) => {
    console.error("❌ Redis connection error:", err.message);
});

redis.subscribe(
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
);

redis.on("message", function (channel, message) {
    try {
        const parsed = JSON.parse(message);
        io.emit(channel + ":" + parsed.event, parsed.data);
    } catch (e) {
        console.error("Redis message parse error:", e);
    }
});

const PORT = process.env.PORT || process.env.BROADCAST_PORT || 6002;

server.listen(PORT, () => {
    console.log(`🚀 Socket.IO server running on port ${PORT}`);
});

const express = require("express");
const app = express();
const server = require("http").createServer(app);

app.use(express.json());

const io = require("socket.io")(server, {
    cors: { origin: "*" },
});
require("dotenv").config();

const ioRedis = require("ioredis");
let redis;

const redisConfig = {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        return Math.min(times * 500, 3000);
    },
};

// Initialize Redis if configured
if (process.env.REDIS_URL) {
    console.log("Connecting to Redis via REDIS_URL...");
    redis = new ioRedis(process.env.REDIS_URL, redisConfig);
} else if (process.env.REDIS_HOST || process.env.REDISHOST) {
    const host = process.env.REDIS_HOST || process.env.REDISHOST;
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

if (redis) {
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
            console.log(`📡 Broadcasted from Redis [${channel}:${parsed.event}]`);
        } catch (e) {
            console.error("Redis message parse error:", e);
        }
    });
}

// 🚀 HTTP Broadcast Endpoint (Works over standard HTTPS port 443 with zero firewall blocks)
app.post("/broadcast", (req, res) => {
    const secret = req.headers["x-socket-secret"] || req.query.secret;
    const expectedSecret = process.env.SOCKET_SECRET;

    if (expectedSecret && secret !== expectedSecret) {
        return res.status(401).json({ error: "Unauthorized: Invalid socket secret" });
    }

    const { channel, event, data } = req.body;

    if (!channel || !event) {
        return res.status(400).json({ error: "Missing channel or event in request body" });
    }

    // Broadcast live to all connected Socket.IO clients
    io.emit(`${channel}:${event}`, data);
    console.log(`📡 Broadcasted via HTTP POST [${channel}:${event}]`);

    return res.json({
        success: true,
        channel,
        event,
        data,
    });
});

app.get("/", (req, res) => {
    res.send("🚀 SiriusLink Socket Server is running live!");
});

const PORT = process.env.PORT || process.env.BROADCAST_PORT || 6002;

server.listen(PORT, () => {
    console.log(`🚀 Socket.IO server running on port ${PORT}`);
});

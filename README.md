# SiriusLink Sockets Server

Real-time WebSocket server using Express, Socket.IO, and Redis Pub/Sub.

## Environment Variables

- `PORT` - Port to listen on (assigned automatically by Railway)
- `REDIS_URL` - Full Redis connection string (recommended for Railway)
- `REDIS_HOST` - Redis host (optional fallback)
- `REDIS_PORT` - Redis port (optional fallback)
- `REDIS_PASSWORD` - Redis password (optional fallback)

## Deploy to Railway

1. In Railway, click **New Project** > **Deploy from GitHub repo**.
2. Select `Hashed-Systems/seriuslink-sockets`.
3. In the same project, click **+ New** > **Database** > **Redis**.
4. In your socket service, go to **Variables** and add:
   - `REDIS_URL` = `${{Redis.REDIS_URL}}`
5. Under **Settings > Networking**, click **Generate Domain** to get your public HTTPS/WSS URL.

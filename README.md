# Smart Courier Docker Setup

This project can now run locally or inside Docker with the same config files.

## What changed

- Config Server now uses the local `config-files/` folder through the native backend.
- Service configs use environment-variable placeholders, so they default to `localhost` on your machine and switch to Docker service names in containers.
- `tracking-service` stores uploaded files in a Docker volume.
- Docker build contexts ignore `target/`, IDE metadata, and crash logs.

## Run with Docker

From the project root:

```powershell
docker compose up --build
```

## Main URLs

- API Gateway: `http://localhost:8080`
- Auth Service: `http://localhost:8081`
- Delivery Service: `http://localhost:8082`
- Tracking Service: `http://localhost:8083`
- Admin Service: `http://localhost:8084`
- Eureka: `http://localhost:8761`
- Config Server: `http://localhost:8888`
- RabbitMQ UI: `http://localhost:15672`
- Zipkin: `http://localhost:9411`

## Notes

- Config Server reads from the mounted local folder `./config-files`; it no longer needs to clone config from GitHub at container startup.
- If a service starts before Config Server is fully ready, it can still boot with its local fallback config and reconnect.
- MySQL data is persisted in the `mysql-data` Docker volume.
- Tracking uploads are persisted in the `tracking-uploads` Docker volume.

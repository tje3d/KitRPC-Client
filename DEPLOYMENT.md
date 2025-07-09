# Production Deployment Guide

This guide explains how to deploy the KitRPC application using Docker and MySQL for production.

## Prerequisites

- Docker and Docker Compose installed
- Git (for cloning the repository)

## Quick Start

1. **Clone and navigate to the project:**
   ```bash
   git clone <your-repo-url>
   cd kitrpc
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.production .env
   # Edit .env with your production values
   ```

3. **Start the services:**
   ```bash
   docker-compose up -d
   ```

4. **Check the application:**
   - Application: http://localhost:3000
   - MySQL: localhost:3306

## Configuration

### Environment Variables

Edit the `.env` file with your production values:

```env
# Database Configuration
DATABASE_URL="mysql://kitrpc_user:userpassword@mysql:3306/kitrpc"

# MySQL Configuration
MYSQL_ROOT_PASSWORD=your-secure-root-password
MYSQL_DATABASE=kitrpc
MYSQL_USER=kitrpc_user
MYSQL_PASSWORD=your-secure-user-password

# Application Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
```

**⚠️ Security Note:** Always use strong, unique passwords in production!

## Database Management

### Initial Setup
The database will be automatically initialized when you first run `docker-compose up`.

### Running Migrations
```bash
# Run migrations manually
docker-compose exec app bunx prisma migrate deploy

# Generate Prisma client
docker-compose exec app bunx prisma generate
```

### Database Access
```bash
# Access MySQL shell
docker-compose exec mysql mysql -u kitrpc_user -p kitrpc

# Run Prisma Studio (development)
docker-compose exec app bunx prisma studio
```

## Useful Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app
docker-compose logs -f mysql

# Rebuild application
docker-compose build app
docker-compose up -d app

# Clean up (removes volumes - BE CAREFUL!)
docker-compose down -v
```

## Production Considerations

1. **Security:**
   - Change all default passwords
   - Use environment-specific secrets
   - Configure firewall rules
   - Enable SSL/TLS

2. **Backup:**
   - Set up regular MySQL backups
   - Consider using managed database services

3. **Monitoring:**
   - Add health checks
   - Set up logging aggregation
   - Monitor resource usage

4. **Scaling:**
   - Use a reverse proxy (nginx)
   - Consider container orchestration (Kubernetes)
   - Implement load balancing

## Troubleshooting

### Common Issues

1. **Database connection failed:**
   - Check if MySQL container is healthy: `docker-compose ps`
   - Verify DATABASE_URL format
   - Check network connectivity

2. **Application won't start:**
   - Check application logs: `docker-compose logs app`
   - Verify all environment variables are set
   - Ensure database migrations have run

3. **Port conflicts:**
   - Change port mappings in docker-compose.yml
   - Check if ports 3000 or 3306 are already in use

### Health Checks

```bash
# Check service health
docker-compose ps

# Test application endpoint
curl http://localhost:3000

# Test database connection
docker-compose exec mysql mysqladmin ping
```
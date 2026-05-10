# ============================================================
# Stage 1: Build con Node.js
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /build

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build Next.js
RUN npm run build

# ============================================================
# Stage 2: Runtime
# ============================================================
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar build del stage anterior
COPY --from=builder /build/.next ./.next
COPY --from=builder /build/public ./public

# Crear usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nextjs -G nodejs && \
    chown -R nextjs:nodejs /app

USER nextjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Comando de inicio
CMD ["npm", "start"]

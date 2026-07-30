# MaurisBarber

Plataforma de gestión para MaurisBarber (Montevideo, Uruguay): landing page + reservas online + CRM + estadísticas/finanzas + panel administrativo.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · PostgreSQL · Prisma · NextAuth · Recharts · Docker

## Desarrollo local

```bash
cp .env.example .env      # completar valores (o dejar los de dev)
docker compose up -d      # levanta PostgreSQL
npm install
npm run db:migrate        # crea las tablas
npm run db:seed           # carga datos iniciales de MaurisBarber + usuario admin
npm run dev                # http://localhost:3000
```

Panel admin: `http://localhost:3000/admin/login` con las credenciales de `ADMIN_EMAIL` / `ADMIN_PASSWORD` (`.env`).

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm run start` | Build y arranque de producción |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Aplica migraciones de Prisma |
| `npm run db:seed` | Carga datos iniciales |
| `npm run db:studio` | Prisma Studio (explorador de datos) |
| `./scripts/backup-db.sh` | Backup de la base de datos (ver sección Backups) |

## Despliegue con Docker (producción)

```bash
docker compose up -d postgres      # base de datos
docker build -t maurisbarber .
docker run -d --name maurisbarber --env-file .env -p 3000:3000 --network host maurisbarber
npx prisma migrate deploy          # aplica migraciones contra la base de producción
npm run db:seed                    # solo la primera vez
```

En producción, configurá `NEXTAUTH_URL` con el dominio real (https) y generá un `NEXTAUTH_SECRET` nuevo con `openssl rand -base64 32`.

## Backups

`scripts/backup-db.sh` hace un `pg_dump` comprimido y borra automáticamente los backups de más de 30 días. Para backups diarios automáticos, agregá al crontab del host:

```
0 3 * * * cd /ruta/a/maurisbarber && ./scripts/backup-db.sh ./backups >> ./backups/backup.log 2>&1
```

Restaurar: `gunzip -c backups/archivo.sql.gz | docker compose exec -T postgres psql -U maurisbarber -d maurisbarber`

## Recordatorios automáticos

Un scheduler interno (`src/instrumentation.ts`) llama a `GET /api/cron/reminders` cada `REMINDER_CHECK_INTERVAL_MINUTES` minutos (default 15) y envía un recordatorio por email a los clientes con turnos dentro de las próximas `REMINDER_HOURS_BEFORE` horas (default 24) que todavía no lo recibieron. También se envían avisos automáticos al confirmar una reserva y al cancelarla. Sin `SMTP_HOST` configurado, los emails se loguean en la consola en vez de enviarse (útil en desarrollo).

## Seguridad

- Rate limiting en memoria sobre el login admin, la creación de reservas públicas y la consulta de disponibilidad (pensado para una única instancia; una instancia multi-nodo necesitaría un store compartido como Redis).
- Contraseñas con bcrypt, sesiones JWT de NextAuth.
- Validación de tipo/tamaño de archivo en la subida de fotos de clientes (solo imágenes, máx. 8MB), con la extensión derivada del tipo MIME real y no del nombre del archivo.
- Headers de seguridad (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- Todas las Server Actions administrativas verifican la sesión antes de tocar la base de datos.

## PWA

La app es instalable (manifest + iconos + service worker mínimo). El service worker solo cachea una página de fallback offline — deliberadamente **no** cachea datos de disponibilidad, reservas ni el panel admin, para no mostrar información desactualizada sin conexión.

## Estado del proyecto

**Implementado:**
- Landing page mobile-first con reservas online y motor de disponibilidad (turnos consecutivos, frecuencia personalizada, horarios manuales, trabajo en paralelo).
- Panel admin: login, servicios, horarios/descansos/bloqueos, agenda tipo calendario (día/semana/mes) con drag&drop.
- CRM de clientes: ficha con notas privadas estructuradas, fotos de referencia, historial completo.
- Dashboard de estadísticas y finanzas: ingresos/egresos, ocupación, ranking de clientes, exportación a Excel y PDF.
- Recordatorios automáticos por email y avisos de cancelación.
- PWA instalable, Docker para desarrollo y producción, backups, hardening de seguridad básico.

**Preparado para escalar (arquitectura, no implementado todavía):** múltiples barberos (`Employee` ya modelado), múltiples sucursales, venta de productos, membresías, gift cards, puntos, Mercado Pago/Stripe, WhatsApp Business API, integración con Google Calendar.

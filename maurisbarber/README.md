# MaurisBarber

Plataforma de gestión para MaurisBarber (Montevideo, Uruguay): landing page + reservas online + panel administrativo.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · PostgreSQL · Prisma · NextAuth

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

## Estado del proyecto

**v1 (implementada):** landing page, motor de disponibilidad (turnos consecutivos, frecuencia personalizada, horarios manuales, trabajo en paralelo), reservas online, panel admin con login, gestión de servicios, horarios/descansos/bloqueos, y agenda tipo calendario (día/semana/mes) con drag&drop, creación manual y cambio de estado/pago.

**Próximas fases:** CRM de clientes con historial y fotos, dashboard de estadísticas y finanzas, recordatorios automáticos, PWA y hardening de producción.

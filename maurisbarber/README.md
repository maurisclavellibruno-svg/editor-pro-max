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

## Multi-barbero

Cada `Employee` puede tener su propio login (`/admin/empleados` → "Dar acceso al panel"). La reserva pública deja elegir barbero (o "cualquiera disponible", que asigna automáticamente al primero libre) y la agenda admin tiene un filtro por barbero. Todos los barberos comparten los mismos horarios/servicios del local en v1 — no hay agenda ni servicios por-barbero todavía.

## Productos, membresías, puntos y gift cards

- **Productos**: catálogo simple con stock opcional (`/admin/productos`), con un botón "Vender" que registra la venta y descuenta stock. Los ingresos por productos se suman a las estadísticas y a las exportaciones junto con los turnos.
- **Membresías**: planes prepagos con créditos (`/admin/membresias`). Al vender una, el precio completo se registra como ingreso inmediato; cada turno pagado con un crédito no genera un ingreso adicional (ya estaba cobrado).
- **Gift cards**: se emiten con un código único (`/admin/giftcards`) y se pueden usar como método de pago de un turno (descuentan del saldo; el saldo sobrante queda disponible para el futuro).
- **Puntos de fidelización**: se acreditan automáticamente (1 punto cada $100) al marcar un turno como pagado, sin importar el método de pago. Se canjean manualmente desde la ficha del cliente — el sistema no impone qué se obtiene a cambio, eso lo decide el barbero en el mostrador.

## Integraciones externas

Código real contra la API de cada proveedor (no mocks), pero **ninguna fue probada contra credenciales reales** — no tengo cuentas de Mercado Pago/Stripe/Meta/Google para verificarlas end-to-end. Probalas en modo sandbox/test antes de usarlas en producción. Todas son estrictamente opcionales: sin las variables de entorno correspondientes, el resto de la app funciona exactamente igual.

- **Mercado Pago y Stripe** (`src/lib/integrations/mercadopago.ts`, `stripe.ts`): generan un link de pago (Checkout Pro / Checkout Session) para un turno puntual. El botón "Link de pago" aparece en el detalle de cada turno impago en la agenda. Configurá `MERCADOPAGO_ACCESS_TOKEN` y/o `STRIPE_SECRET_KEY`. Cuando el cliente paga, marcá el turno como pagado manualmente (método Débito/Crédito/Mercado Pago) — no hay webhook automático de confirmación en v1.
- **WhatsApp Business (Meta Cloud API)** (`src/lib/integrations/whatsapp.ts`): expone `sendWhatsAppText` y `sendWhatsAppTemplate`, pero **no está conectado a los recordatorios automáticos**. Motivo: Meta solo permite mensajes de texto libre dentro de una ventana de 24hs desde que el cliente escribió por última vez; un recordatorio programado (business-initiated) casi siempre cae fuera de esa ventana y requiere un *message template* pre-aprobado en Meta Business Manager. Configurá `WHATSAPP_ACCESS_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID`, creá tu template, y llamá `sendWhatsAppTemplate` desde `src/lib/reminders.ts` cuando lo tengas.
- **Google Calendar** (`src/lib/integrations/google-calendar.ts`): sincroniza cada turno nuevo (reserva pública o manual) como evento en un calendario de Google, best-effort — si falla, solo queda un log, nunca bloquea la reserva. Necesita `GOOGLE_CALENDAR_CLIENT_ID/SECRET/REFRESH_TOKEN/CALENDAR_ID` (ver comentarios en el archivo para cómo generarlos).

## Estado del proyecto

**Implementado:**
- Landing page mobile-first con reservas online y motor de disponibilidad (turnos consecutivos, frecuencia personalizada, horarios manuales, trabajo en paralelo, multi-barbero).
- Panel admin: login, servicios, horarios/descansos/bloqueos, agenda tipo calendario (día/semana/mes) con drag&drop y filtro por barbero.
- CRM de clientes: ficha con notas privadas estructuradas, fotos de referencia, historial completo, puntos de fidelización.
- Productos, membresías y gift cards (ver sección arriba).
- Dashboard de estadísticas y finanzas: ingresos (turnos + productos), egresos, ocupación, ranking de clientes, exportación a Excel y PDF.
- Recordatorios automáticos por email y avisos de cancelación.
- PWA instalable, Docker para desarrollo y producción, backups, hardening de seguridad básico.
- Integraciones externas listas para activar (Mercado Pago, Stripe, WhatsApp, Google Calendar) — ver sección arriba.

**Preparado para escalar (arquitectura, no implementado todavía):** múltiples sucursales.

# Guía de despliegue: VPS de Hostinger + dominio + Resend

Esta guía asume que vas a correr todo con Docker en un VPS (no un plan de
hosting compartido/cPanel — ver Paso 0 para confirmar cuál tenés).

## Paso 0 — Confirmar que tu plan es un VPS

1. Entrá a [hPanel](https://hpanel.hostinger.com).
2. Mirá el menú de la izquierda:
   - Si ves una sección **"VPS"** con un botón "Administrar" que te lleva a
     un panel con IP, usuario root, y una consola del servidor → **tenés un
     VPS**, seguí con el Paso 1.
   - Si solo ves **"Sitios web" / "Hosting"** con administrador de archivos,
     bases de datos MySQL y cPanel → es hosting compartido o cloud, **no
     soporta Docker ni Node.js de larga duración**. Opciones:
     - Contratar un plan VPS de Hostinger (tienen planes desde pocos
       dólares/mes) y usar esta misma guía.
     - O usar una plataforma administrada como Railway/Render para la app,
       y dejar el dominio de Hostinger apuntando ahí (avisame si preferís
       este camino, la guía cambia).

El resto de esta guía asume VPS con Ubuntu (el sistema operativo que
Hostinger ofrece por defecto para sus VPS).

## Paso 1 — Acceso y setup inicial del servidor

En hPanel → VPS → tu servidor, vas a encontrar la IP y las credenciales
root (o podés generar una clave SSH ahí mismo).

```bash
ssh root@TU_IP_DEL_VPS
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh   # instala Docker + Compose
docker --version
docker compose version
apt install -y git nano
```

## Paso 2 — Clonar el proyecto

```bash
git clone https://github.com/maurisclavellibruno-svg/editor-pro-max.git
cd editor-pro-max/maurisbarber
git checkout claude/maurisbarber-web-app-lkro8p
```

(Una vez que el equipo mergee esta rama a la rama principal, acá alcanza con
`git checkout main` o la que corresponda — decime cuando eso pase y ajusto
esta guía.)

## Paso 3 — Cuenta de Resend (para que salgan los emails)

1. Creá una cuenta gratis en [resend.com](https://resend.com).
2. **Sin dominio verificado todavía**: podés probar ya mismo usando
   `onboarding@resend.dev` como remitente (funciona, pero se ve menos
   profesional y tiene límites).
3. **Para enviar como `no-reply@maurisbarber.com`** (recomendado): en Resend
   → Domains → Add Domain → `maurisbarber.com`. Te va a dar 2-3 registros
   DNS (TXT/CNAME) para verificar el dominio. Esos registros se agregan en
   hPanel → Dominios → tu dominio → DNS / Zona DNS. Tarda de minutos a un
   par de horas en propagarse.
4. En Resend → API Keys → creá una y copiala (empieza con `re_...`).

## Paso 4 — Configurar `.env`

```bash
cp .env.example .env
nano .env
```

Completá al menos esto. **Importante: sin comillas en los valores** — a
diferencia de Next.js en desarrollo, `docker run --env-file` no las saca, y
terminan siendo parte literal del valor (Prisma rechaza la URL con un error
confuso si eso pasa):

```bash
DATABASE_URL=postgresql://maurisbarber:maurisbarber@localhost:5432/maurisbarber?schema=public

NEXTAUTH_URL=https://maurisbarber.com          # tu dominio real, con https
NEXTAUTH_SECRET=…                                # generar con: openssl rand -base64 32

ADMIN_EMAIL=mauris@maurisbarber.com
ADMIN_PASSWORD=…                                 # contraseña real y fuerte, no la de ejemplo

SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=re_tu_api_key
SMTP_FROM_EMAIL=no-reply@maurisbarber.com         # o onboarding@resend.dev si todavía no verificaste el dominio
NOTIFICATION_EMAIL=mauris@maurisbarber.com        # a dónde te llegan los avisos de nuevas reservas

NEXT_PUBLIC_WHATSAPP_NUMBER=59898341762
```

El resto de las variables (recordatorios, integraciones opcionales) podés
dejarlas como están — todo funciona sin ellas.

## Paso 5 — Levantar la base de datos y migrar

```bash
docker compose up -d postgres
sleep 5

docker build --target builder -t maurisbarber:migrator .
docker run --rm --network host --env-file .env maurisbarber:migrator npx prisma migrate deploy
docker run --rm --network host --env-file .env maurisbarber:migrator npm run db:seed
```

`db:seed` carga los datos reales de MaurisBarber (dirección, teléfono,
Instagram, horarios y servicios de ejemplo) y crea tu usuario admin con el
`ADMIN_EMAIL`/`ADMIN_PASSWORD` del `.env`.

## Paso 6 — Build y arranque de la app

```bash
docker build -t maurisbarber .
docker run -d --name maurisbarber --env-file .env -p 3000:3000 \
  --network host --restart unless-stopped maurisbarber
```

Probá que responde localmente: `curl -I http://localhost:3000` (debería
devolver `200`). Si en cambio da "Failed to connect", revisá el log con
`docker logs maurisbarber`: si dice `Local: http://tu-hostname:3000` en vez
de `0.0.0.0`, confirmá que `HOSTNAME=0.0.0.0` esté en tu `.env` (ver Paso 4)
y recreá el contenedor.

## Paso 7 — DNS: apuntar el dominio al VPS

En hPanel → Dominios → `maurisbarber.com` → Zona DNS:

- Registro `A`, nombre `@`, valor = la IP de tu VPS.
- Registro `A` (o `CNAME`), nombre `www`, valor = la IP de tu VPS (o
  `maurisbarber.com.` si usás CNAME).

## Paso 8 — HTTPS con Caddy (reverse proxy automático)

Caddy consigue y renueva el certificado SSL solo, sin configuración manual.

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install -y caddy

cat > /etc/caddy/Caddyfile <<'EOF'
maurisbarber.com, www.maurisbarber.com {
    reverse_proxy localhost:3000
}
EOF

systemctl reload caddy
```

(Cambiá `maurisbarber.com` por tu dominio real en el Caddyfile si es
distinto. El DNS del Paso 7 tiene que estar propagado para que Caddy pueda
emitir el certificado.)

## Paso 9 — Verificar todo

- `https://maurisbarber.com` → landing page.
- `https://maurisbarber.com/reservar` → hacé una reserva de prueba y
  confirmá que te llega el email (revisá spam la primera vez).
- `https://maurisbarber.com/admin/login` → entrá con tu `ADMIN_EMAIL` /
  `ADMIN_PASSWORD`.

## Paso 10 — Backups automáticos

```bash
mkdir -p /root/backups
crontab -e
```

Agregá esta línea (backup diario a las 3am):

```
0 3 * * * cd /root/editor-pro-max/maurisbarber && ./scripts/backup-db.sh /root/backups >> /root/backups/backup.log 2>&1
```

## Actualizar la app cuando haya cambios nuevos

```bash
cd ~/editor-pro-max/maurisbarber
git pull
docker build --target builder -t maurisbarber:migrator .
docker run --rm --network host --env-file .env maurisbarber:migrator npx prisma migrate deploy
docker build -t maurisbarber .
docker stop maurisbarber && docker rm maurisbarber
docker run -d --name maurisbarber --env-file .env -p 3000:3000 --network host --restart unless-stopped maurisbarber
```

## Problemas comunes

| Síntoma | Causa probable |
|---|---|
| `docker: command not found` | El script de instalación no corrió bien — reintentá `curl -fsSL https://get.docker.com \| sh` |
| La app no responde en el dominio pero sí en `localhost:3000` | DNS todavía no propagó, o falta reiniciar Caddy (`systemctl reload caddy`) |
| Los emails no llegan | Revisá `SMTP_PASSWORD` (la API key de Resend), y que `SMTP_FROM_EMAIL` sea del dominio verificado en Resend (o usá `onboarding@resend.dev` mientras tanto) |
| `prisma migrate deploy` falla por conexión | Confirmá que `docker compose up -d postgres` esté corriendo (`docker ps`) y que `DATABASE_URL` use `localhost` (porque el contenedor de la app corre con `--network host`) |
| Prisma dice "the URL must start with the protocol postgresql://" | Tu `.env` tiene valores entre comillas — `docker run --env-file` no las saca (a diferencia de Next.js en desarrollo). Sacá todas las comillas del archivo: `sed -i 's/"//g' .env` |
| `curl -I http://localhost:3000` da "Failed to connect" pero `docker logs maurisbarber` dice "Ready" | Al servidor le falta `HOSTNAME=0.0.0.0` en el `.env` (ver nota en Paso 6) — sin eso, Next.js escucha solo en el hostname del VPS y no en todas las interfaces |

# Guía de Despliegue en AWS (Amplify + RDS) - Edición Segura

Esta guía está diseñada para un despliegue seguro, evitando credenciales en código y protegiendo el acceso a la base de datos.

## ⚠️ Regla de Oro
**NUNCA subas archivos `.env`, `.env.local` o credenciales a GitHub.** Configure todas las credenciales EXCLUSIVAMENTE en las "Environment Variables" de la consola de Amplify.

---

## 1. Preparación del Código (Ya realizado)

He actualizado `prisma/schema.prisma` para usar **PostgreSQL**.
Asegúrate de hacer push de este cambio:
`git add prisma/schema.prisma`
`git commit -m "chore: switch to postgresql for rds"`
`git push`

---

## 2. Crear Base de Datos Segura en AWS RDS

1. Ve a **RDS** en AWS Console -> **Create database**.
2. **Engine**: PostgreSQL.
3. **Template**: Free tier.
4. **Settings**:
   - Identifier: `bot-clientes-db`
   - Master username: `admin_bot` (evita 'admin' o 'postgres' por seguridad)
   - Master password: **Genera una contraseña larga y guárdala en un gestor de contraseñas. NO la guardes en ningún archivo de texto del proyecto.**
5. **Connectivity**:
   - **Public access**: **YES** (Necesario para Amplify).
   - **VPC Security Group**: Create new (`bot-clientes-sg2`).
6. Crear Base de Datos.

### Restringir Acceso (Security Groups)

Por seguridad, no dejaremos el acceso abierto a todo el mundo (`0.0.0.0/0`) si es posible evitarlo, pero Amplify usa IPs dinámicas.
**Opción Segura Recomendada para Amplify:**
AWS Amplify no tiene una IP fija. La forma estándar (y fácil) es permitir acceso público (`0.0.0.0/0`) PERO protegerlo con una contraseña extremadamente fuerte.
Si quieres máxima seguridad sin conectar tu PC:
1. Permite `0.0.0.0/0` en el Security Group (Port 5432) TEMPORALMENTE para el despliegue inicial.
2. Una vez desplegado, puedes restringirlo, pero ten en cuenta que los próximos builds de Amplify podrían fallar si no pueden contactar la BD para ejecutar migraciones (`prisma migrate`).
**Recomendación Práctica:** Deja `0.0.0.0/0` habilitado en el Security Group, pero confía en la fortaleza de tu contraseña maestra de RDS.

---

## 3. Configurar Secretos en AWS Amplify

NO pongas credenciales en tu código.

1. Ve a tu App en Amplify -> **Hosting** -> **Environment variables**.
2. Agrega las siguientes variables (Manage variables):

| Variable | Valor (Ejemplo) |
|----------|-----------------|
| `DATABASE_URL` | `postgresql://USUARIO:CONTRASEÑA@ENDPOINT_DE_RDS:5432/postgres` |
| `NEXTAUTH_SECRET` | (Genera uno nuevo con `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://main.dxxxxx.amplifyapp.com` (Tu URL de amplify) |
| `RESEND_API_KEY` | `re_123456...` |
| `EMAIL_FROM` | `noreply@midominio.com` |
| `EMAIL_FROM` | `noreply@midominio.com` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `AIzaSy...` |

**Nota:** Amplify inyectará estas variables de forma segura durante el build y en tiempo de ejecución. Nadie podrá verlas en el repositorio de Git.

### 🕵️‍♂️ ¿De dónde saco estos datos?

1.  **DATABASE_URL**:
    *   **Formato**: `postgresql://[USER]:[PASSWORD]@[ENDPOINT]:5432/[DB_NAME]`
    *   **USER y PASSWORD**: Los que definiste al crear la base de datos en RDS (Paso 2).
    *   **ENDPOINT**: Ve a la consola de AWS RDS > Databases > Haz clic en tu base (`bot-clientes-db`) > Copia el valor de **"Endpoint"** en la sección "Connectivity & security".
    *   **DB_NAME**: Usualmente es `postgres` si no cambiaste nada, o el nombre que hayas puesto en "Initial database name".
    *   *Ejemplo*: `postgresql://admin_bot:MiClaveSuperSegura123@bot-clientes-db.cx8q92.us-east-1.rds.amazonaws.com:5432/postgres`

2.  **NEXTAUTH_SECRET**:
    *   Es una clave criptográfica para asegurar las sesiones.
    *   **Generar**: Abre tu terminal y corre: `openssl rand -base64 32`
    *   Copia el resultado y pégalo.

3.  **NEXTAUTH_URL**:
    *   Es la URL raíz de tu sitio desplegado.
    *   Ve a la consola de Amplify > App settings > General > Copia la **"Production branch URL"** (ej. `https://main.d2x...amplifyapp.com`).
    *   *Nota*: Si compraste un dominio, usa ese dominio (ej. `https://tudominio.com`).

4.  **RESEND_API_KEY**:
    *   Ve a [Resend.com](https://resend.com) > API Keys > Create API Key.
    *   Copia la llave que empieza con `re_`.

5.  **EMAIL_FROM**:
    *   Debe ser un remitente verificado en Resend.
    *   Si no has verificado dominio, usa: `onboarding@resend.dev` (solo sirve para enviar al email de tu cuenta de Resend).
    *   Si verificaste dominio: `no-reply@tudominio.com`.

6.  **NEXT_PUBLIC_GOOGLE_MAPS_API_KEY**:
    *   Ve a [Google Cloud Console](https://console.cloud.google.com/).
    *   Crea un proyecto > APIs & Services > Credentials > Create Credentials > API Key.
    *   Asegúrate de habilitar **"Places API (New)"**, **"Maps JavaScript API"** y **"Geocoding API"**.

---

## 4. Despliegue de Esquema (Schema)

Como no quieres conectar tu PC local a la RDS, usaremos el proceso de Build de Amplify para aplicar los cambios en la base de datos.
Asegúrate de que tu `amplify.yml` (Build settings en la consola) tenga esto:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npx prisma generate
        - npx prisma db push --accept-data-loss # Esto aplicará el esquema a la RDS nueva
        - npm run build
```
*Nota: `prisma db push` es útil para prototipos. Para producción estricta se usa `prisma migrate deploy`, pero requiere que hayas creado migraciones locales, lo cual es difícil sin conexión a la BD. `db push` es la mejor opción para tu caso.*

¡Listo! Al hacer push a GitHub, Amplify detectará el cambio, usará las variables secretas y desplegará tu app conectada a RDS.

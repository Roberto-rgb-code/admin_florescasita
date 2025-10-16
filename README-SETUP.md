# 🌸 Admin Panel - La Casita de las Flores

Panel de administración para gestionar productos, órdenes e imágenes.

## 🚀 Setup Rápido

### 1️⃣ Instalar dependencias
```bash
npm install
```

### 2️⃣ Configurar credenciales

#### Opción A: Copiar desde archivo de referencia
1. Abre el archivo: `CREDENCIALES-ADMIN.txt`
2. Crea un archivo `.env.local` en la raíz del proyecto
3. Copia todo el contenido de `CREDENCIALES-ADMIN.txt` a `.env.local`
4. Completa los valores que faltan:
   - `NEXTAUTH_SECRET` → Genera con: `openssl rand -base64 32`
   - `SUPABASE_SERVICE_ROLE_KEY` → Obtén de Supabase Dashboard → Settings → API

#### Opción B: Crear manualmente
Crea el archivo `.env.local` con este contenido:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=tu-secret-generado-con-openssl

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://lautikiuizleznasrjta.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SG0yn...
STRIPE_SECRET_KEY=sk_test_51SG0yn...

# AWS S3
AWS_ACCESS_KEY_ID=tu-access-key-id-de-aws
AWS_SECRET_ACCESS_KEY=tu-secret-access-key-de-aws
AWS_REGION=us-east-2
AWS_S3_BUCKET_NAME=casita-flores-images
```

### 3️⃣ Verificar que Supabase esté configurado
1. Ve a [supabase.com](https://supabase.com) → Tu proyecto
2. Abre **SQL Editor**
3. Ejecuta el script: `supabase-setup.sql` (del proyecto e-commerce)
4. Verifica en **Table Editor** que existan las tablas: `products`, `orders`, `order_items`

### 4️⃣ Verificar que AWS S3 esté configurado
1. Ve a [console.aws.amazon.com/s3](https://console.aws.amazon.com/s3)
2. Verifica que exista el bucket: `casita-flores-images`
3. Verifica que el bucket sea **público** (Block Public Access: OFF)
4. Verifica que tenga una **Bucket Policy** para acceso público

### 5️⃣ Ejecutar localmente
```bash
npm run dev
```

Abre: http://localhost:3001

---

## 🔐 **Primer Login**

Por defecto, puedes usar estas credenciales para testing:
- **Email:** admin@casitaflores.com
- **Password:** admin123

⚠️ **Importante:** Cambia estas credenciales en producción.

---

## 📋 **Funcionalidades**

### Dashboard
- 📊 Vista general de ventas, productos y órdenes
- 📈 Gráficos de rendimiento
- 🔔 Notificaciones importantes

### Productos
- ➕ Crear nuevos productos
- ✏️ Editar productos existentes
- 🗑️ Eliminar productos
- 📸 Subir imágenes a AWS S3
- 🔄 Activar/desactivar productos

### Órdenes
- 📦 Ver todas las órdenes
- 🔍 Filtrar por estado
- ✅ Cambiar estado de órdenes
- 👤 Ver detalles del cliente

---

## 🚀 **Deploy a Vercel**

### Preparar repositorio
```bash
git init
git add .
git commit -m "Initial commit - Admin Panel"
git remote add origin https://github.com/TU-USUARIO/flores-admin.git
git push -u origin main
```

⚠️ **IMPORTANTE:** El repositorio debe ser **PRIVADO**

### Deploy en Vercel
1. Ve a [vercel.com/new](https://vercel.com/new)
2. Import repository: `flores-admin`
3. Settings → Environment Variables
4. Agrega **TODAS** las variables de `.env.local`
   - ⚠️ Cambia `NEXTAUTH_URL` a tu dominio de Vercel
5. Deploy

---

## 🆘 **Troubleshooting**

### Error: "Missing NEXTAUTH_SECRET"
→ Genera uno: `openssl rand -base64 32` y agrégalo al `.env.local`

### Error: "Could not connect to Supabase"
→ Verifica las credenciales de Supabase en `.env.local`

### Error: "AWS credentials not configured"
→ Verifica las variables `AWS_*` en `.env.local`

### Error: "Failed to upload image"
→ Verifica que el bucket S3 sea público y tenga la Bucket Policy correcta

### No puedo hacer login
→ Usa las credenciales por defecto: `admin@casitaflores.com` / `admin123`

---

## 📁 **Estructura del Proyecto**

```
flores-admin/
├── app/                    # Páginas de Next.js
│   ├── admin/             # Rutas del admin
│   ├── api/               # API routes
│   └── page.tsx           # Login page
├── components/            # Componentes React
│   ├── AdminLayout.tsx
│   ├── Dashboard.tsx
│   └── products/
├── lib/                   # Utilidades
│   ├── auth.ts           # Configuración NextAuth
│   ├── s3.ts             # Cliente AWS S3
│   └── supabase.ts       # Cliente Supabase
└── types/                # TypeScript types

```

---

## 🔗 **Enlaces Útiles**

- 📚 [Documentación completa](../SETUP-AWS-S3.md)
- ⚡ [Guía rápida de deploy](../PASOS-RAPIDOS-DEPLOY.md)
- 🌐 [E-commerce](../flores_ecomerce/)

---

¡Listo para administrar tu tienda! 🎉


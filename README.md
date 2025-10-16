# 🌸 Panel Administrador - La Casita de las Flores

Panel de administración completo para gestionar productos, órdenes y configuraciones del e-commerce de flores.

---

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
cd admin
npm install
```

### 2. Configurar Base de Datos (Supabase)
1. Ve a `supabase-setup.sql`
2. Copia TODO el contenido
3. Ejecuta el script en Supabase SQL Editor
4. Verifica que se crearon las tablas

### 3. Configurar variables de entorno
Crea un archivo `.env.local` con tus credenciales:

```env
# NextAuth (Genera con: openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=genera-una-clave-secreta-larga-aqui

# Supabase (YA CONFIGURADO)
NEXT_PUBLIC_SUPABASE_URL=https://lautikiuizleznasrjta.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=obtener-de-supabase-settings

# Stripe (YA CONFIGURADO)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SG0ynFwb2jZSLczSW0...
STRIPE_SECRET_KEY=sk_test_51SG0ynFwb2jZSLczdTrZ8AuOZ...

# AWS S3 (PENDIENTE - el sistema funciona sin esto)
AWS_ACCESS_KEY_ID=pendiente
AWS_SECRET_ACCESS_KEY=pendiente
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=pendiente
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

✅ El panel estará disponible en: **http://localhost:3001**

---

## 🔐 Credenciales de Acceso

**Email:** `admin@lacasitadelasflores.com`  
**Contraseña:** `admin123`

---

## 📖 Instrucciones Detalladas

👉 **Lee el archivo `SETUP-INSTRUCTIONS.md` para instrucciones completas paso a paso**

---

## 📁 Estructura del Proyecto

```
admin/
├── app/                    # App Router de Next.js
│   ├── admin/             # Rutas protegidas del admin
│   │   ├── dashboard/     # Dashboard principal
│   │   ├── products/      # Gestión de productos
│   │   ├── orders/        # Gestión de órdenes
│   │   └── settings/      # Configuraciones
│   └── api/               # API routes
├── components/            # Componentes reutilizables
│   ├── admin/            # Componentes específicos del admin
│   └── ui/               # Componentes de UI
├── lib/                  # Utilidades y configuraciones
│   ├── auth.ts          # Configuración de autenticación
│   ├── supabase.ts      # Cliente de Supabase
│   └── s3.ts            # Configuración de AWS S3
└── types/               # Tipos de TypeScript
```

## 🛠️ Funcionalidades

### ✅ Implementadas
- [x] Autenticación con NextAuth
- [x] Dashboard con métricas
- [x] Layout responsive
- [x] Navegación lateral
- [x] Sistema de rutas protegidas

### 🚧 En Desarrollo
- [ ] CRUD de productos
- [ ] Subida de imágenes a S3
- [ ] Gestión de órdenes
- [ ] Configuraciones del sistema

## 🔧 Tecnologías

- **Next.js 15** - Framework de React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **NextAuth.js** - Autenticación
- **Supabase** - Base de datos
- **AWS S3** - Almacenamiento de imágenes
- **React Query** - Gestión de estado del servidor

## 📦 Scripts Disponibles

- `npm run dev` - Ejecutar en desarrollo (puerto 3001)
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar en producción
- `npm run lint` - Ejecutar linter

## 🌐 Deploy

### Vercel (Recomendado)
1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático

### Otras plataformas
- **Railway**
- **DigitalOcean App Platform**
- **AWS Amplify**

## 🔒 Seguridad

- Autenticación requerida para todas las rutas `/admin/*`
- Variables de entorno para credenciales sensibles
- Row Level Security en Supabase
- Validación de formularios
- Sanitización de inputs

## 📞 Soporte

Para soporte técnico o preguntas sobre el panel de administración, contacta al equipo de desarrollo.

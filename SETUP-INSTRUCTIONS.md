# 📋 Instrucciones de Configuración - Panel Admin

## 🗄️ **Paso 1: Configurar Supabase**

### 1.1 Crear Base de Datos
1. Ve a tu proyecto en [supabase.com](https://supabase.com)
2. Navega a **SQL Editor** en el menú lateral
3. Abre el archivo `supabase-setup.sql`
4. Copia TODO el contenido del archivo
5. Pégalo en el editor de Supabase
6. Haz clic en **RUN** para ejecutar el script
7. ✅ Verifica que se crearon las tablas:
   - `products`
   - `orders`
   - `order_items`

### 1.2 Obtener Credenciales
1. Ve a **Project Settings** > **API**
2. Copia estos valores:
   - **URL**: `https://lautikiuizleznasrjta.supabase.co`
   - **anon public**: La clave que ya tienes
   - **service_role**: Búscala en la misma página (solo para admin)

---

## 🔐 **Paso 2: Crear archivo .env.local**

En la carpeta `admin/` crea un archivo llamado `.env.local` con este contenido:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=tu-clave-secreta-super-larga-y-aleatoria-min-32-chars

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://lautikiuizleznasrjta.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdXRpa2l1aXpsZXpuYXNyanRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NDEzODAsImV4cCI6MjA3NjExNzM4MH0.kX78AK7Y5f2pV1wK_YkCAXGAhit2rqOQSGa5UEAjOH8
SUPABASE_SERVICE_ROLE_KEY=tu-clave-de-servicio-aqui

# Stripe (Pagos)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu-stripe-publishable-key
STRIPE_SECRET_KEY=tu-stripe-secret-key

# AWS S3 (Cuando tengas las credenciales)
AWS_ACCESS_KEY_ID=pendiente
AWS_SECRET_ACCESS_KEY=pendiente
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=pendiente
AWS_CLOUDFRONT_DOMAIN=pendiente
```

### ⚠️ IMPORTANTE:
- **NEXTAUTH_SECRET**: Genera uno con: `openssl rand -base64 32`
- **SUPABASE_SERVICE_ROLE_KEY**: Búscala en Supabase > Settings > API
- **AWS**: Déjalas como "pendiente" por ahora (el sistema funcionará sin S3)

---

## 📦 **Paso 3: Instalar y Ejecutar**

```bash
# Navegar a la carpeta admin
cd admin

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

✅ El panel debería estar en: `http://localhost:3001`

---

## 🔐 **Paso 4: Iniciar Sesión**

Credenciales de prueba:
- **Email**: `admin@lacasitadelasflores.com`
- **Contraseña**: `admin123`

---

## ✅ **Paso 5: Probar Funcionalidades**

### 5.1 Crear Producto (Sin AWS S3)
1. Ve a **Productos** en el sidebar
2. Clic en **Nuevo Producto**
3. Llena el formulario:
   - Nombre: "Rosas Rojas Premium"
   - Descripción: "Hermoso ramo de 12 rosas rojas"
   - Precio: 1299
   - Categoría: "Best sellers"
   - Stock: 10
4. ⚠️ **NO subas imagen todavía** (espera AWS)
5. Clic en **Crear Producto**
6. ✅ Deberías ver el producto en la lista

### 5.2 Ver Producto en E-commerce
1. El producto se guardó en Supabase
2. Ve a tu e-commerce (puerto 3000)
3. El producto debería aparecer allí

---

## ☁️ **Paso 6: Configurar AWS S3 (Cuando tengas credenciales)**

### 6.1 Actualizar .env.local
```env
AWS_ACCESS_KEY_ID=tu-access-key-real
AWS_SECRET_ACCESS_KEY=tu-secret-key-real
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=tu-bucket-name
AWS_CLOUDFRONT_DOMAIN=tu-cloudfront.net
```

### 6.2 Probar Subida de Imágenes
1. Reinicia el servidor: `npm run dev`
2. Crea o edita un producto
3. Sube una imagen
4. ✅ La imagen se guardará en S3 y se mostrará en tu producto

---

## 🚀 **Paso 7: Deploy a Vercel**

### 7.1 Preparar para Deploy
```bash
# Construir el proyecto
npm run build

# Probar producción local
npm run start
```

### 7.2 Deploy a Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Importa el repositorio
3. **Root Directory**: `admin`
4. Agrega TODAS las variables de entorno
5. Deploy!

---

## 🔗 **Conectar con E-commerce**

El e-commerce leerá los productos de la misma base de datos de Supabase.

### En el e-commerce (puerto 3000):
1. Actualiza `data/products.ts` para leer de Supabase
2. O usa ISR/SSG para generar páginas estáticas

---

## ✅ **Checklist de Verificación**

- [ ] Base de datos creada en Supabase
- [ ] Archivo .env.local configurado
- [ ] Dependencias instaladas
- [ ] Panel corriendo en localhost:3001
- [ ] Puedes iniciar sesión
- [ ] Puedes crear productos (sin imagen)
- [ ] Productos aparecen en la lista
- [ ] AWS S3 configurado (opcional)
- [ ] Subida de imágenes funciona
- [ ] Deploy a Vercel

---

## 🆘 **Troubleshooting**

### Error: "Missing env.NEXT_PUBLIC_SUPABASE_URL"
- Verifica que `.env.local` esté en la carpeta `admin/`
- Reinicia el servidor después de crear el archivo

### Error: "No autorizado"
- Verifica que `NEXTAUTH_SECRET` esté configurado
- Cierra sesión y vuelve a iniciar

### Error: "Error al obtener los productos"
- Verifica que las tablas existan en Supabase
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` sea correcta

### Las imágenes no se suben
- Es normal sin AWS S3 configurado
- El sistema funcionará sin imágenes por ahora
- Configura AWS S3 cuando tengas las credenciales

---

## 📝 **Notas Importantes**

1. **Seguridad**: NUNCA subas `.env.local` a Git
2. **Producción**: Cambia las credenciales de admin en producción
3. **AWS**: El sistema funciona sin S3, solo sin imágenes
4. **Supabase**: Las políticas RLS están configuradas correctamente

---

## 🎉 **¡Listo!**

Tu panel de administración está configurado y funcionando. Ahora puedes:
- ✅ Crear productos
- ✅ Editar productos
- ✅ Eliminar productos
- ✅ Ver órdenes (próximamente)
- ✅ Subir imágenes (cuando configures AWS)

**¿Necesitas ayuda?** Revisa los logs en la terminal para más detalles.

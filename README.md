# 🪵 Bonetto SEO Manager

<div align="center">

**Optimiza tus fichas de productos WooCommerce con inteligencia artificial**

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://bonetto-seo-manager.vercel.app)
[![Framework](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![AI](https://img.shields.io/badge/Z.ai-GLM-4129A8?style=for-the-badge)](https://z.ai)

**[🌐 Probar la aplicación →](https://bonetto-seo-manager.vercel.app)**

</div>

---

## 📖 ¿Qué es Bonetto SEO Manager?

Una herramienta diseñada para **Bonetto con Amor** (artesanos de madera en Colombia) que automatiza la creación de contenido SEO optimizado para WooCommerce, siguiendo los estándares de **Yoast SEO**.

### ✨ Características principales

- 🔐 **Autenticación completa** - Email/contraseña, Google y modo invitado
- 📝 **Contenido SEO con IA** - Títulos, meta descripciones y descripciones largas optimizadas
- 🖼️ **Optimización de imágenes** - Compresión automática a WebP
- 🎨 **Prompt para imagen publicitaria** - Listo para usar en servicios de imagen-a-imagen
- 📦 **Exportación ZIP** - Todo listo para importar a WooCommerce
- ⚙️ **Configuración persistente** - Guarda tus preferencias por usuario

---

## 🚀 Demo en vivo

**👉 [https://bonetto-seo-manager.vercel.app](https://bonetto-seo-manager.vercel.app)**

---

## 🛠️ Tecnologías utilizadas

| Categoría | Tecnología |
|-----------|------------|
| **Framework** | Next.js 16 + TypeScript |
| **Estilos** | Tailwind CSS + shadcn/ui |
| **Autenticación** | Firebase Authentication |
| **Base de datos** | Firebase Firestore |
| **IA** | Z.ai (GLM-5 + VLM) |
| **Despliegue** | Vercel |
| **Compresión** | Canvas API + WebP |

---

## 🤖 Consumo de la API de IA

El proyecto utiliza **Z.ai** con dos modelos de lenguaje:

### 1. GLM-5 (Generación de texto SEO)

Se usa para generar contenido SEO optimizado siguiendo las reglas de Yoast SEO:

```
POST /api/seo/generate
```

**Características del contenido generado:**
- ✅ Meta descripción entre 120-155 caracteres
- ✅ Descripción larga de +300 palabras
- ✅ Uso de voz activa (100%)
- ✅ Palabras de transición (+30%)
- ✅ Enlaces a Wikipedia relevantes
- ✅ Frase clave con densidad 5-7 veces
- ✅ Estructura HTML con H2/H3
- ✅ Textos ALT para imágenes

### 2. VLM (Análisis de imágenes)

Se usa para analizar las fotos del producto y extraer información visual:

```
POST /api/image/analyze
```

**Información extraída:**
- Colores exactos del producto
- Forma y estructura
- Textura y acabado
- Veteadura de la madera
- Entorno natural de uso
- Detalles constructivos

Esta información se usa para generar un **prompt personalizado** para servicios de imagen-a-imagen (Midjourney, DALL-E, Leonardo AI, etc.).

---

## 🔥 Firebase: Autenticación y Persistencia

### Autenticación

El proyecto soporta 3 métodos de autenticación:

| Método | Descripción |
|--------|-------------|
| **Email/Contraseña** | Registro e inicio de sesión tradicional |
| **Google** | Autenticación con cuenta de Google |
| **Invitado** | Sin registro, datos guardados en localStorage |

### Persistencia de configuración

Cada usuario registrado tiene su propia configuración guardada en **Firestore**:

```
/firestore/
  /users/
    /{userId}/
      settings:
        - unit: "cm" | "mm" | "in" | "m"
        - brandName: string
        - brandDescription: string
        - categories: string[]
        - materials: string[]
```

### Reglas de seguridad

Las reglas de Firestore aseguran que cada usuario solo acceda a **su propia configuración**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🖼️ Optimización de Imágenes

### Proceso de compresión

Las imágenes se optimizan directamente en el navegador usando **Canvas API**:

| Parámetro | Valor |
|-----------|-------|
| **Formato de salida** | WebP |
| **Calidad** | 78% |
| **Dimensión máxima** | 1800px (mantiene proporción) |
| **Fondo** | Blanco (para transparencias) |
| **Suavizado** | Alta calidad |

### Beneficios

- 📉 Reducción de tamaño hasta **80%**
- ⚡ Procesamiento local (sin servidor)
- 🔒 Privacidad (imágenes no salen del navegador)
- 📱 Compatible con todos los navegadores modernos

### Nombres de archivo optimizados

Los archivos se renombran automáticamente con esta estructura:

```
ref-{REFERENCIA}-{NOMBRE}-{CATEGORIA}-{MATERIAL}-{MARCA}-{NUMERO}.webp
```

Ejemplo: `ref-9049-caja-baul-decoracion-pino-bonetto-con-amor-001.webp`

---

## 📦 Contenido del ZIP

Al finalizar el procesamiento, se descarga un archivo ZIP con:

```
bonetto-{referencia}.zip
├── ref-XXXX-imagen-001.webp     # Imágenes optimizadas
├── ref-XXXX-imagen-002.webp
├── seo-copy.txt                  # Contenido SEO + Prompt publicitario
├── prompt-imagen-publicitaria.txt # Prompt separado
└── metadata-import.json          # Metadatos para importación
```

---

## 🏃‍♂️ Inicio rápido

### Requisitos

- Node.js 18+ o Bun
- Cuenta de Firebase (para autenticación)
- API key de Z.ai (incluida en el SDK)

### Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/cestrad5/bonetto-seo-manager.git

# Entrar al directorio
cd bonetto-seo-manager

# Instalar dependencias
bun install

# Iniciar servidor de desarrollo
bun run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

### Variables de entorno

El proyecto no requiere variables de entorno adicionales. Las credenciales de Firebase están configuradas y el SDK de Z.ai funciona out-of-the-box.

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── seo/generate/route.ts    # Generación SEO con IA
│   │   └── image/analyze/route.ts   # Análisis de imágenes con VLM
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                          # Componentes shadcn/ui
│   └── wizard/                      # Componentes del flujo principal
│       ├── AuthView.tsx             # Autenticación
│       ├── SettingsView.tsx         # Configuración
│       ├── ProductForm.tsx          # Formulario de producto
│       ├── ProcessingView.tsx       # Procesamiento
│       └── ResultsView.tsx          # Resultados
├── contexts/
│   ├── AuthContext.tsx              # Estado de autenticación
│   └── AppContext.tsx               # Estado global
└── lib/
    └── firebase.ts                  # Configuración Firebase
```

---

## 🎯 Flujo de uso

```
1. Iniciar sesión (o modo invitado)
        ↓
2. Configurar preferencias (marca, categorías, materiales)
        ↓
3. Ingresar datos del producto
   - Nombre y referencia
   - Dimensiones
   - Categorías y materiales
   - Fotos del producto
        ↓
4. Procesar con IA
   - Generar contenido SEO
   - Analizar imágenes
   - Comprimir imágenes
   - Crear prompt publicitario
        ↓
5. Revisar y descargar ZIP
```

---

## 🌐 Despliegue en Vercel

Este proyecto está optimizado para Vercel:

1. Fork del repositorio
2. Importar en [vercel.com/new](https://vercel.com/new)
3. Deploy automático

No requiere configuración adicional de variables de entorno.

---

## 👨‍💻 Créditos

Desarrollado para **[Bonetto con Amor](https://bonettoconamor.com.co)** - Artesanos de madera en Colombia.

---

## 📄 Licencia

MIT License - Libre para uso personal y comercial.

---

<div align="center">

**[🌐 Probar la aplicación →](https://bonetto-seo-manager.vercel.app)**

Hecho con ❤️ para los artesanos colombianos

</div>

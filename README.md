# Portfolio Web - Andree Aarom Sosa Ardiles

Sitio web profesional tipo portfolio/CV construido con React, Vite y Tailwind CSS.

## Requisitos

- [Node.js](https://nodejs.org/) v18 o superior
- npm (incluido con Node.js)

## Instalacion

```bash
cd WebPage
npm install
```

## Desarrollo Local

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## Construir para Produccion

```bash
npm run build
```

La carpeta `dist/` contiene los archivos listos para deploy.

## Vista Previa del Build

```bash
npm run preview
```

---

## Personalizacion

### Cambiar datos del CV

Edita los archivos JSON en `src/data/`:

- **`profile.json`** - Datos personales, experiencia, educacion, habilidades
- **`certificates.json`** - Lista de certificaciones
- **`documents.json`** - Documentos acreditativos

### Agregar tu foto de perfil

1. Coloca tu imagen en `public/photo.jpg`
2. La seccion Hero la mostrara automaticamente

### Agregar redes sociales

Edita `src/data/profile.json`, seccion `social`:

```json
{
  "social": {
    "linkedin": "https://linkedin.com/in/tu-perfil",
    "github": "https://github.com/tu-usuario",
    "website": "https://tu-sitio.com"
  }
}
```

### Agregar certificados/documentos

1. Coloca el archivo PDF o imagen en `public/documents/`
2. Edita `src/data/documents.json` agregando una entrada:

```json
{
  "id": 5,
  "title": "Nombre del Certificado",
  "institution": "Institucion",
  "date": "Mes Anio",
  "file": "/documents/nombre-archivo.pdf",
  "type": "pdf",
  "description": "Descripcion breve.",
  "verifyUrl": ""
}
```

3. Reconstruye: `npm run build`

### Agregar proyectos (cuando esten listos)

Edita `src/components/Projects.jsx` para reemplazar los placeholders con proyectos reales.

---

## Deploy

### Vercel (Recomendado)

1. Sube tu codigo a GitHub
2. Ve a [vercel.com](https://vercel.com) e importa el repositorio
3. Framework preset: **Vite**
4. Haz click en Deploy

### Netlify

1. Arrastra la carpeta `dist/` a [app.netlify.com/drop](https://app.netlify.com/drop)
2. O conecta tu repositorio GitHub

### GitHub Pages

1. Instala: `npm install -D gh-pages`
2. Agrega en `package.json`:
```json
{
  "homepage": "https://tu-usuario.github.io/tu-repo",
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
```
3. En `vite.config.js` agrega `base: '/tu-repo/'`
4. Ejecuta: `npm run build && npm run deploy`

### Hosting Compartido (cPanel, etc.)

Sube el contenido de la carpeta `dist/` al directorio `public_html/` de tu hosting.

---

## Stack Tecnologico

| Tecnologia | Version | Uso |
|---|---|---|
| React | 19 | Framework UI |
| Vite | 8 | Bundler |
| Tailwind CSS | 4 | Estilos |
| Framer Motion | - | Animaciones |
| Phosphor Icons | - | Iconos |

## Estructura del Proyecto

```
WebPage/
├── public/
│   ├── documents/           <- Tus certificados PDF
│   └── CV_ANDREE_SOSA.pdf   <- Tu CV descargable
├── src/
│   ├── components/          <- Componentes React
│   ├── data/                <- Datos JSON editables
│   ├── App.jsx              <- Componente principal
│   ├── index.css            <- Estilos globales
│   └── main.jsx             <- Punto de entrada
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

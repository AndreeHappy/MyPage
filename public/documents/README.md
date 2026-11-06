# Documentos y Certificados

Coloca aqui tus archivos PDF o imagenes de certificados.

## Como agregar un nuevo documento:

1. Copia el archivo PDF o imagen a esta carpeta
2. Edita el archivo `src/data/documents.json`
3. Agrega una nueva entrada con el formato:

```json
{
  "id": 5,
  "title": "Nombre del certificado",
  "institution": "Institucion que lo otorga",
  "date": "Mes Anio",
  "file": "/documents/nombre-del-archivo.pdf",
  "type": "pdf",
  "description": "Breve descripcion del certificado.",
  "verifyUrl": "https://url-de-verificacion-si-existe.com"
}
```

4. Ejecuta `npm run build` para regenerar el sitio
5. Sube la carpeta `dist/` a tu hosting

## Tipos de archivo soportados:
- `pdf` - Archivos PDF (se abren en nueva ventana)
- `image` - Imagenes JPG/PNG (se muestran en lightbox)

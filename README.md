# Portal del Comedor Escolar - CEIP Mendia HLHI

Este proyecto es una web moderna, bilingüe (Euskera / Castellano) y adaptable, diseñada para las familias del comedor del **CEIP Mendia HLHI**, con un módulo especial enfocado en la acogida de los comensales de 2 años de cara a la reunión del 22 de junio.

El portal incluye un sistema de administración local simplificado que permite subir menús, documentos en formato PDF y noticias sin tener que editar una sola línea de código.

---

## Estructura del Proyecto

*   **`index.html`**: Estructura principal de la web (HTML5 semántico).
*   **`styles.css`**: Estilos premium basados en HSL (tonos tierra y menta), soporte nativo de modo oscuro/claro y adaptabilidad móvil.
*   **`app.js`**: Lógica de cliente (cambio de idioma, menús interactivos, acordeones de FAQ y carga dinámica de datos).
*   **`data.json`**: Base de datos local que contiene las noticias, documentos y menús cargados.
*   **`documentos/`**: Carpeta donde se almacenan físicamente los PDFs subidos (menús, circulares, etc.).
*   **`admin.py`**: Servidor local ligero escrito en Python para gestionar la administración.
*   **`admin_panel.html`**: Panel visual para subir contenidos y actualizar la web fácilmente.

---

## Cómo Ejecutar en Local

### 1. Ver la Web
Simplemente haz doble clic sobre el archivo `index.html` en tu navegador, o abre el panel de administración, que servirá ambos archivos en red local.

### 2. Ejecutar el Panel de Administración (Subir noticias o PDFs)
Para abrir el panel administrativo, ejecuta el script de Python desde tu terminal:

```bash
python admin.py
```

Esto hará dos cosas automáticamente:
1. Iniciará un servidor web local en el puerto `8080`.
2. Abrirá en tu navegador predeterminado la dirección: [http://localhost:8080/admin_panel.html](http://localhost:8080/admin_panel.html).

Desde esta interfaz visual podrás:
*   **Publicar Noticias:** Introduce el título y descripción en ambos idiomas y selecciona la fecha.
*   **Subir Agiriak (Documentos):** Selecciona el archivo PDF, escribe el título y descripción en euskera y castellano, y elige un icono representativo. El script copiará el archivo a la carpeta `documentos/` y lo enlazará automáticamente en la sección de agiriak.
*   **Subir Menuak (Menús):** Selecciona el menú PDF mensual, ponle nombre bilingüe, y se enlazará dinámicamente en la sección de menús.

---

## Cómo Publicar Online Gratis (Sitio Seguro)

Una vez que tengas la web lista y con los documentos iniciales cargados en tu máquina local, puedes subirla a internet de forma 100% gratuita y con certificado de seguridad SSL automático utilizando cualquiera de estas opciones:

### Opción A: Netlify (La más rápida mediante Drag-and-Drop)
1. Entra en [Netlify](https://www.netlify.com/) y regístrate gratis (puedes usar tu cuenta de GitHub o tu correo).
2. Ve a la pestaña **Sites**.
3. En la parte inferior verás un recuadro que dice: *"Want to deploy a new site without connecting to Git? Drag and drop your site folder here"*.
4. Arrastra la carpeta completa `comedor-mendia` de tu ordenador a ese recuadro.
5. ¡Listo! En 5 segundos tendrás una URL pública y segura (ej. `https://comedor-mendia.netlify.app`) para compartir con las familias.
6. **Para actualizarla:** Si añades una nueva noticia o documento localmente, solo tienes que volver a arrastrar la carpeta a Netlify (sección *Deploys*) y se actualizará al instante.

### Opción B: GitHub Pages (Si deseas control de versiones)
Si decides inicializar un repositorio Git en la carpeta `comedor-mendia` y subirlo a tu cuenta de GitHub:
1. Ve a los ajustes de tu repositorio en GitHub (*Settings*).
2. Ve a la sección **Pages** (en la barra lateral).
3. Selecciona la rama `main` (o `master`) y la carpeta `/ (root)`.
4. Guarda los cambios. Tu web estará publicada de forma segura en `https://tu-usuario.github.io/comedor-mendia`.

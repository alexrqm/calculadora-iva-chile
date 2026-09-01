# Calculadora IVA Chile

Una calculadora web gratuita para calcular precios netos, IVA 19% y valores finales en pesos chilenos.

## Descripción
Aplicación estática (HTML/CSS/JS) para agregar múltiples productos o conceptos y obtener automáticamente Neto, IVA y Total. Soporta entrada de valores en Neto o en Total (con IVA), manejo de cantidades, persistencia en `localStorage` y copia de totales al portapapeles.

## Funciones
- Agregar y eliminar líneas (producto, cantidad, valor ingresado, tipo).
- Calcular automáticamente Neto, IVA (19%) y Total por línea considerando cantidad.
- Totales superiores y resumen inferior actualizados en tiempo real.
- Persistencia automática en el navegador mediante `localStorage`.
- Botón para copiar los totales al portapapeles (con mensaje de confirmación).
- Botón para limpiar la vista y otro para borrar datos guardados (con confirmación).

## Tecnologías
- HTML5
- CSS3
- JavaScript (vanilla)

## Cómo usar
1. Abrir `index.html` en cualquier navegador moderno (Chrome, Edge, Firefox, Safari).
2. Usar `+ Agregar precio` para añadir filas.
3. Ingresar `Valor ingresado` en pesos chilenos (sin decimales). Puede ingresar un valor neto o un total según `Tipo de valor`.
4. Ajustar `Cantidad` según corresponda.
5. Los totales se actualizan automáticamente.

### Formato
Se utiliza el formato CLP a la visualización: `Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })`.

## Validaciones y accesibilidad
- Campos vacíos equivalen a 0.
- Cantidad mínima 1.
- Se evita números negativos.
- Soporta navegación por teclado y mensajes en `aria-live`.

## Ejecutar localmente
1. Descargar o clonar el repositorio.
2. Abrir `index.html` en el navegador (doble clic o `Abrir con...`).

No se requiere servidor ni instalación.

## Publicar en GitHub Pages
1. Crear un repositorio en GitHub llamado `calculadora-iva-chile` (o el nombre deseado).
2. Subir los archivos del proyecto.
3. En GitHub, entrar a `Settings` del repositorio.
4. Ir a `Pages`.
5. En `Source` seleccionar `Deploy from a branch`.
6. Seleccionar la rama `main`.
7. Seleccionar la carpeta `/ (root)`.
8. Guardar.

La página quedará disponible aproximadamente en:

```
https://USUARIO.github.io/calculadora-iva-chile/
```

Reemplace `USUARIO` por su usuario de GitHub.

## Comandos Git (sugeridos)
```bash
git init
git add .
git commit -m "Initial version of Calculadora IVA Chile"
git branch -M main
git remote add origin https://github.com/USUARIO/calculadora-iva-chile.git
git push -u origin main
```

No ejecute `git push` si no ha configurado el repositorio remoto.

## Licencia
Proyecto con licencia MIT (archivo LICENSE incluido).

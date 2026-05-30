#!/bin/bash

echo "================================================="
echo "   SUBIENDO ACTUALIZACIONES A GITHUB (PAGES)     "
echo "================================================="
echo ""

# Ir a la carpeta del proyecto
cd "$(dirname "$0")"

# Añadir los cambios
git add .

# Crear un commit con la fecha actual
fecha=$(date +'%d/%m/%Y %H:%M')
git commit -m "Actualización de contenidos: $fecha"

# Subir a GitHub
echo "Subiendo código a GitHub..."
git push origin main

echo ""
echo "================================================="
echo " ¡LISTO! El código se ha subido a GitHub."
echo " GitHub Pages compilará y actualizará la web"
echo " automáticamente en unos segundos."
echo "================================================="
read -p "Presiona ENTER para salir..."

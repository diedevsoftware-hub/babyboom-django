#!/usr/bin/env bash
# Exit on error
set -o errexit

# Instalar las dependencias
pip install -r requirements.txt

# Recolectar todos los archivos estáticos (CSS, JS, etc.) en una sola carpeta
python manage.py collectstatic --no-input

# Aplicar las migraciones de la base de datos
python manage.py migrate
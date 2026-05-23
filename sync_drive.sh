#!/bin/bash
# Script de sincronización espejo desde Google Drive a la carpeta local del comedor

RCLONE_BIN="/usr/bin/rclone"
ORIGEN="gdrive:"
DESTINO="/home/asierruiz/Proyectos/drive_comedor"
LOG_FILE="/home/asierruiz/Proyectos/comedor-mendia/sync_drive.log"

# Asegurar que se guarde la fecha y hora de inicio de la sincronización
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando sincronización en espejo..." >> "$LOG_FILE"

# Ejecutar rclone sync.
# El flag --delete-during asegura que los archivos eliminados en Drive se eliminen también localmente durante el proceso.
"$RCLONE_BIN" sync "$ORIGEN" "$DESTINO" --delete-during --verbose --log-file="$LOG_FILE" 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sincronización finalizada." >> "$LOG_FILE"
echo "--------------------------------------------------" >> "$LOG_FILE"

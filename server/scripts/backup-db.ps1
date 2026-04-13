$ErrorActionPreference = "Stop"

$backupDir = Join-Path $PSScriptRoot "..\..\backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$filename = Join-Path $backupDir "board-studio-$timestamp.sql"

if (-not $env:MYSQLDUMP_PATH) {
  Write-Error "Set MYSQLDUMP_PATH to your mysqldump executable."
}

& $env:MYSQLDUMP_PATH `
  --host=$env:DB_HOST `
  --port=$env:DB_PORT `
  --user=$env:DB_USER `
  --password=$env:DB_PASSWORD `
  $env:DB_NAME | Out-File -FilePath $filename -Encoding utf8

Write-Output "Backup written to $filename"

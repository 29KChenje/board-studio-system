$ErrorActionPreference = "Stop"

param(
  [Parameter(Mandatory = $true)]
  [string]$BackupFile
)

if (-not $env:MYSQL_PATH) {
  Write-Error "Set MYSQL_PATH to your mysql executable."
}

Get-Content $BackupFile | & $env:MYSQL_PATH `
  --host=$env:DB_HOST `
  --port=$env:DB_PORT `
  --user=$env:DB_USER `
  --password=$env:DB_PASSWORD `
  $env:DB_NAME

Write-Output "Restore completed from $BackupFile"

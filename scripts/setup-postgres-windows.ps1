#Requires -Version 5.1
<#
.SYNOPSIS
    Creates PostgreSQL user and database from api/.env.development on Windows.

.PARAMETER AdminPassword
    Password for the local postgres superuser (set during PostgreSQL install).

.PARAMETER EnvFile
    Path to the environment file with DB_* variables.
#>
param(
    [Parameter(Mandatory = $true)]
    [string]$AdminPassword,

    [string]$EnvFile = (Join-Path $PSScriptRoot "..\api\.env.development")
)

$ErrorActionPreference = "Stop"

function Get-EnvValue {
    param([string]$Name, [hashtable]$Values)
    if ($Values.ContainsKey($Name) -and -not [string]::IsNullOrWhiteSpace($Values[$Name])) {
        return $Values[$Name]
    }
    return $null
}

function Find-Psql {
    $candidates = @(
        "C:\Program Files\PostgreSQL\18\bin\psql.exe",
        "C:\Program Files\PostgreSQL\17\bin\psql.exe",
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe"
    )

    foreach ($path in $candidates) {
        if (Test-Path $path) { return $path }
    }

    $psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlCmd) { return $psqlCmd.Source }

    throw "psql.exe not found. Install PostgreSQL or add its bin folder to PATH."
}

Write-Host "Reading environment from: $EnvFile"
if (-not (Test-Path $EnvFile)) {
    throw "Environment file not found: $EnvFile"
}

$envValues = @{}
Get-Content $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq "" -or $line.StartsWith("#")) { return }
    $parts = $line -split "=", 2
    if ($parts.Count -eq 2) {
        $envValues[$parts[0].Trim()] = $parts[1].Trim()
    }
}

$dbHost = Get-EnvValue "DB_HOST" $envValues
if (-not $dbHost) { $dbHost = "localhost" }

$dbPort = Get-EnvValue "DB_PORT" $envValues
if (-not $dbPort) { $dbPort = "5432" }

$dbUser = Get-EnvValue "DB_USER" $envValues
if (-not $dbUser) { throw "DB_USER is missing in $EnvFile" }

$dbPassword = Get-EnvValue "DB_PASSWORD" $envValues
if (-not $dbPassword) { throw "DB_PASSWORD is missing in $EnvFile" }

$dbName = Get-EnvValue "DB_NAME" $envValues
if (-not $dbName) { throw "DB_NAME is missing in $EnvFile" }

$dbSslMode = Get-EnvValue "DB_SSL_MODE" $envValues
if (-not $dbSslMode) { $dbSslMode = "disable" }

$service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq "Running" } | Select-Object -First 1
if (-not $service) {
    $service = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($service -and $service.Status -ne "Running") {
        Write-Host "Starting PostgreSQL service: $($service.Name)"
        Start-Service $service.Name
    }
}

if (-not $service) {
    throw "PostgreSQL Windows service not found."
}

Write-Host "PostgreSQL service: $($service.Name) ($($service.Status))"

$psql = Find-Psql
Write-Host "Using psql: $psql"

# SECURITY-REVIEW: admin password used only for local DB bootstrap via psql.
$escapedPassword = $dbPassword.Replace("'", "''")
$escapedUser = $dbUser.Replace("'", "''")
$escapedDb = $dbName.Replace("'", "''")

$sql = @"
DO `$`$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$escapedUser') THEN
        CREATE ROLE $escapedUser WITH LOGIN PASSWORD '$escapedPassword';
    ELSE
        ALTER ROLE $escapedUser WITH LOGIN PASSWORD '$escapedPassword';
    END IF;
END
`$`$;
"@

$tempSql = Join-Path $env:TEMP "setup-postgres-$escapedDb-role.sql"
Set-Content -Path $tempSql -Value $sql -Encoding UTF8

$env:PGPASSWORD = $AdminPassword
& $psql -U postgres -h $dbHost -p $dbPort -d postgres -v ON_ERROR_STOP=1 -f $tempSql
if ($LASTEXITCODE -ne 0) {
    Remove-Item $tempSql -Force -ErrorAction SilentlyContinue
    throw "Failed to create role. Check postgres superuser password."
}

$dbExists = & $psql -U postgres -h $dbHost -p $dbPort -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$escapedDb';"
if ($dbExists.Trim() -ne "1") {
    & $psql -U postgres -h $dbHost -p $dbPort -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE $escapedDb OWNER $escapedUser;"
    if ($LASTEXITCODE -ne 0) {
        Remove-Item $tempSql -Force -ErrorAction SilentlyContinue
        throw "Failed to create database."
    }
}

& $psql -U postgres -h $dbHost -p $dbPort -d postgres -v ON_ERROR_STOP=1 -c "GRANT ALL PRIVILEGES ON DATABASE $escapedDb TO $escapedUser;"
if ($LASTEXITCODE -ne 0) {
    Remove-Item $tempSql -Force -ErrorAction SilentlyContinue
    throw "Failed to grant database privileges."
}

$schemaSql = @"
GRANT ALL ON SCHEMA public TO $escapedUser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $escapedUser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $escapedUser;
"@

$tempSchemaSql = Join-Path $env:TEMP "setup-postgres-$escapedDb-schema.sql"
Set-Content -Path $tempSchemaSql -Value $schemaSql -Encoding UTF8

& $psql -U postgres -h $dbHost -p $dbPort -d $dbName -v ON_ERROR_STOP=1 -f $tempSchemaSql
if ($LASTEXITCODE -ne 0) {
    Remove-Item $tempSql, $tempSchemaSql -Force -ErrorAction SilentlyContinue
    throw "Failed to grant schema privileges."
}

Remove-Item $tempSql, $tempSchemaSql -Force -ErrorAction SilentlyContinue
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue

$dbconfigPath = Join-Path $PSScriptRoot "..\api\dbconfig.yml"
$escapedDbPassword = $dbPassword.Replace("'", "''")
$dbconfig = @"
development:
  dialect: postgres
  datasource: host=$dbHost port=$dbPort user=$dbUser password=$dbPassword dbname=$dbName sslmode=$dbSslMode
  dir: migrations
  table: schema_migrations

production:
  dialect: postgres
  datasource: `${DATABASE_URL}
  dir: migrations
  table: schema_migrations
"@

Set-Content -Path $dbconfigPath -Value $dbconfig -Encoding UTF8
Write-Host "Wrote migration config: $dbconfigPath"

$env:PGPASSWORD = $dbPassword
& $psql -U $dbUser -h $dbHost -p $dbPort -d $dbName -c "SELECT current_database() AS database, current_user AS user;"
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue

if ($LASTEXITCODE -ne 0) {
    throw "Database created but app user connection test failed."
}

Write-Host ""
Write-Host "PostgreSQL setup complete."
Write-Host "  Host:     $dbHost"
Write-Host "  Port:     $dbPort"
Write-Host "  User:     $dbUser"
Write-Host "  Database: $dbName"
Write-Host ""
Write-Host "pgAdmin connection:"
Write-Host "  Host: localhost"
Write-Host "  Port: $dbPort"
Write-Host "  Username: $dbUser"
Write-Host "  Database: $dbName"

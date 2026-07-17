param(
    [Parameter(Mandatory = $true)]
    [int]$Port
)

$conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1

if ($null -ne $conn -and $conn.OwningProcess -gt 0) {
    Write-Host "Stopping PID $($conn.OwningProcess)..."
    Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "Port $Port is free."
}

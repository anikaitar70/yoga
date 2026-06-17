# Stop Next.js / Node dev processes so Prisma can regenerate on Windows.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/stop-dev.ps1

$currentPid = $PID

Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
  Where-Object { $_.ProcessId -ne $currentPid } |
  ForEach-Object {
    Write-Host "Stopping node.exe (PID $($_.ProcessId))"
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }

Start-Sleep -Seconds 2
Write-Host "Done. You can now run: npx prisma generate"

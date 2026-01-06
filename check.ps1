Write-Host "Checking for running Node processes..." -ForegroundColor Cyan
Write-Host ""

$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node process(es):" -ForegroundColor Yellow
    Write-Host ""
    $nodeProcesses | Format-Table Id, ProcessName, StartTime, CPU, WorkingSet -AutoSize
    Write-Host ""
    Write-Host "To kill all Node processes, run: .\stop.ps1" -ForegroundColor Red
} else {
    Write-Host "No Node processes are currently running" -ForegroundColor Green
}

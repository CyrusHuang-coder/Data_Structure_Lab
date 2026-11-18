$ErrorActionPreference = 'Stop'
$workspace = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$pidFile = Join-Path $workspace 'user-data\server.pid'
if (-not (Test-Path -LiteralPath $pidFile)) { Write-Host 'No launcher-managed process found.'; exit 0 }
$studyPid = [int](Get-Content -LiteralPath $pidFile -Raw)
$process = Get-CimInstance Win32_Process -Filter ("ProcessId = " + $studyPid)
if (-not $process) { Write-Host 'The server is already stopped.'; exit 0 }
$expectedEntry = Join-Path $workspace 'upstream\algorithm-visualizer\study-server\server.mjs'
if ($process.Name -ne 'node.exe' -or -not $process.CommandLine -or $process.CommandLine.IndexOf($expectedEntry,[StringComparison]::OrdinalIgnoreCase) -lt 0) {
    throw 'Process identity does not match this workspace. No process was stopped.'
}
& taskkill.exe /PID ([string]$studyPid) /T /F
if ($LASTEXITCODE -ne 0) { throw 'Could not stop the study server.' }
Write-Host 'Study platform stopped. Saved data is unchanged.'

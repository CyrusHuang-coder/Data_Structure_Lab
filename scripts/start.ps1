param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$workspace = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$project = Join-Path $workspace 'upstream\algorithm-visualizer'
$dataPath = Join-Path $workspace 'user-data'
foreach ($toolPath in @('D:\Node.js','C:\CLionToolchains\mingw64\bin')) {
    if (Test-Path -LiteralPath $toolPath) { $env:PATH = $toolPath + ';' + $env:PATH }
}
Set-Location -LiteralPath $project
function Test-StudyServer {
    try {
        $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
        $null = Invoke-RestMethod -Uri 'http://127.0.0.1:4174/api/session' -WebSession $session -TimeoutSec 2
        $health = Invoke-RestMethod -Uri 'http://127.0.0.1:4174/api/health' -WebSession $session -TimeoutSec 3
        return ($health.runner -eq 'native' -and $health.compiler)
    } catch { return $false }
}
if (Test-StudyServer) {
    Write-Host 'The study platform is already running: http://127.0.0.1:4174'
    if (-not $NoBrowser) { Start-Process 'http://127.0.0.1:4174' }
    exit 0
}
if (-not (Test-Path -LiteralPath (Join-Path $project 'node_modules'))) {
    & npm.cmd ci
    if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
}
& npm.cmd run doctor
if ($LASTEXITCODE -ne 0) { throw 'GCC/GDB environment check failed. Configure DS_GCC and DS_GDB.' }
& npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed.' }
New-Item -ItemType Directory -Force -Path $dataPath | Out-Null
$entry = Join-Path $project 'study-server\server.mjs'
$nodePath = (Get-Command node.exe -ErrorAction Stop).Source
$serverProcess = Start-Process -FilePath $nodePath -ArgumentList @(('"' + $entry + '"')) -WorkingDirectory $project -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $dataPath 'server.log') -RedirectStandardError (Join-Path $dataPath 'server-error.log')
Set-Content -LiteralPath (Join-Path $dataPath 'server.pid') -Value $serverProcess.Id -Encoding ASCII
$ready = $false
for ($attempt=0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 350
    if (Test-StudyServer) { $ready=$true; break }
    if ($serverProcess.HasExited) { break }
}
if (-not $ready) { throw ('Startup failed. Check ' + (Join-Path $dataPath 'server-error.log')) }
Write-Host 'Ready: http://127.0.0.1:4174'
if (-not $NoBrowser) { Start-Process 'http://127.0.0.1:4174' }

param()

$ErrorActionPreference = "Stop"

Write-Host "Creating clean build package..."

$sourceDir = (Get-Location).Path
$zipPath = Join-Path $sourceDir "next_build.zip"

if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

$tempFolder = Join-Path $env:TEMP ("build_pkg_" + (Get-Random))
New-Item -ItemType Directory -Path $tempFolder | Out-Null

try {
    # Copy .next folder (excluding dev cache)
    $nextDest = Join-Path $tempFolder ".next"
    New-Item -ItemType Directory -Path $nextDest | Out-Null
    
    Get-ChildItem -Path (Join-Path $sourceDir ".next") -Exclude "dev" | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $nextDest -Recurse -Force
    }
    
    # Copy public folder
    Copy-Item -Path (Join-Path $sourceDir "public") -Destination (Join-Path $tempFolder "public") -Recurse -Force
    
    # Copy config and entry files
    Copy-Item -Path (Join-Path $sourceDir "package.json") -Destination $tempFolder -Force
    Copy-Item -Path (Join-Path $sourceDir "next.config.mjs") -Destination $tempFolder -Force
    Copy-Item -Path (Join-Path $sourceDir "server.js") -Destination $tempFolder -Force
    
    Write-Host "Compressing to $zipPath ..."
    Compress-Archive -Path (Join-Path $tempFolder "*") -DestinationPath $zipPath -Force
    
    $fileInfo = Get-Item $zipPath
    Write-Host "Done! next_build.zip created: $([math]::Round($fileInfo.Length / 1MB, 2)) MB"
}
finally {
    if (Test-Path $tempFolder) {
        Remove-Item $tempFolder -Recurse -Force -ErrorAction SilentlyContinue
    }
}

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
    # Copy .next folder (excluding dev and compiler cache)
    $nextDest = Join-Path $tempFolder ".next"
    New-Item -ItemType Directory -Path $nextDest | Out-Null
    
    Get-ChildItem -Path (Join-Path $sourceDir ".next") | Where-Object { $_.Name -ne "dev" -and $_.Name -ne "cache" } | ForEach-Object {
        Copy-Item -Path $_.FullName -Destination $nextDest -Recurse -Force
    }
    
    # Remove sourcemap files from .next (they are only for browser debugging and bloat the production package)
    Get-ChildItem -Path $nextDest -Filter "*.map" -Recurse | Remove-Item -Force -ErrorAction SilentlyContinue

    # Copy complete public folder (all assets, images, icons)
    Copy-Item -Path (Join-Path $sourceDir "public") -Destination (Join-Path $tempFolder "public") -Recurse -Force
    
    # Copy config and entry files
    Copy-Item -Path (Join-Path $sourceDir "package.json") -Destination $tempFolder -Force
    Copy-Item -Path (Join-Path $sourceDir "next.config.mjs") -Destination $tempFolder -Force
    Copy-Item -Path (Join-Path $sourceDir "server.js") -Destination $tempFolder -Force
    
    Write-Host "Compressing to $zipPath ..."
    Compress-Archive -Path (Join-Path $tempFolder "*") -DestinationPath $zipPath -Force
    
    $fileInfo = Get-Item $zipPath
    Write-Host "Done! next_build.zip created: $([math]::Round($fileInfo.Length / 1MB, 2)) MB"

    # Copy to user Downloads and Desktop for quick access
    $downloadsDir = "C:\Users\PMLS\Downloads"
    if (Test-Path $downloadsDir) {
        Copy-Item -Path $zipPath -Destination (Join-Path $downloadsDir "next_build.zip") -Force
        Write-Host "Copied to $downloadsDir\next_build.zip"
    }
    $desktopDir = "C:\Users\PMLS\Desktop"
    if (Test-Path $desktopDir) {
        Copy-Item -Path $zipPath -Destination (Join-Path $desktopDir "next_build.zip") -Force
        Write-Host "Copied to $desktopDir\next_build.zip"
    }
}
finally {
    if (Test-Path $tempFolder) {
        Remove-Item $tempFolder -Recurse -Force -ErrorAction SilentlyContinue
    }
}

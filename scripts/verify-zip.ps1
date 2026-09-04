Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead((Join-Path (Get-Location) "next_build.zip"))
Write-Host "Total entries in next_build.zip:" $z.Entries.Count

$topDirs = $z.Entries | ForEach-Object { ($_.FullName -split '[/\\\\]')[0] } | Select-Object -Unique
Write-Host "Top-level folders:" ($topDirs -join ", ")

$imageEntries = $z.Entries | Where-Object { $_.FullName -like "*images*" -or $_.FullName -like "*hero*" }
Write-Host "Image entries count:" $imageEntries.Count
if ($imageEntries.Count -gt 0) {
    Write-Host "Sample image path:" $imageEntries[0].FullName
}

$z.Dispose()

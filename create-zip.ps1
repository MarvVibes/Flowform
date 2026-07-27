$source = "c:\Users\NEW\Downloads\flowforn-main\flowforn-main"
$destZip = "c:\Users\NEW\Downloads\flowforn-project.zip"
$tempDir = "c:\Users\NEW\Downloads\flowforn-zip-staging"

# Clean up
if (Test-Path $destZip) { Remove-Item $destZip -Force }
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }

# Create staging dir
New-Item $tempDir -ItemType Directory -Force | Out-Null

# Copy everything except node_modules, .output, .vinxi, .git
$excludes = @("node_modules", ".output", ".vinxi", ".git", "create-zip.ps1", "flowforn-project.zip")
Get-ChildItem -Path $source -Force | Where-Object { $excludes -notcontains $_.Name } | ForEach-Object {
    if ($_.PSIsContainer) {
        Copy-Item $_.FullName -Destination (Join-Path $tempDir $_.Name) -Recurse -Force
    } else {
        Copy-Item $_.FullName -Destination (Join-Path $tempDir $_.Name) -Force
    }
}

# Create zip
Compress-Archive -Path (Join-Path $tempDir "*") -DestinationPath $destZip -Force -CompressionLevel Optimal

# Clean up staging
Remove-Item $tempDir -Recurse -Force

# Report
Write-Host "DONE"
$size = [math]::Round((Get-Item $destZip).Length / 1MB, 2)
Write-Host "Zip created at: $destZip"
Write-Host "Size: $size MB"

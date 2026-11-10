# Build frontend + backend into one runnable JAR for MySQL deployment.
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "==> Building frontend..."
Set-Location "$root\frontend"
npm install
npm run build

$staticDir = "$root\backend\src\main\resources\static"
if (Test-Path $staticDir) {
    Remove-Item $staticDir -Recurse -Force
}
New-Item -ItemType Directory -Path $staticDir | Out-Null
Copy-Item -Path "$root\frontend\dist\*" -Destination $staticDir -Recurse -Force

Write-Host "==> Packaging Spring Boot JAR..."
Set-Location "$root\backend"
mvn -DskipTests package

$jar = Get-ChildItem "$root\backend\target\billing-*.jar" |
    Where-Object { $_.Name -notlike "*.original" } |
    Select-Object -First 1

Write-Host ""
Write-Host "Build complete: $($jar.FullName)"
Write-Host "Start with:"
Write-Host "  java -jar `"$($jar.FullName)`""
Write-Host "Then open http://localhost:8080"
Write-Host "On the shop LAN, use http://<this-pc-ip>:8080"

# Quick script to manually set Android SDK path
# Use this if you have Android SDK installed in a custom location

param(
    [Parameter(Mandatory=$false)]
    [string]$SdkPath = ""
)

Write-Host "=== Android SDK Path Configuration ===" -ForegroundColor Cyan
Write-Host ""

if (-not $SdkPath) {
    Write-Host "Enter your Android SDK path (or press Enter to use default):" -ForegroundColor Yellow
    Write-Host "Default: $env:LOCALAPPDATA\Android\Sdk" -ForegroundColor Gray
    $SdkPath = Read-Host "SDK Path"
    
    if (-not $SdkPath) {
        $SdkPath = "$env:LOCALAPPDATA\Android\Sdk"
    }
}

# Normalize path
$SdkPath = $SdkPath.Trim('"').Trim("'")

# Check if path exists
if (-not (Test-Path $SdkPath)) {
    Write-Host "[X] Path does not exist: $SdkPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Android SDK first:" -ForegroundColor Yellow
    Write-Host "1. Download Android Studio: https://developer.android.com/studio"
    Write-Host "2. Or use Expo Go app instead (no SDK needed)"
    exit 1
}

# Check for platform-tools
$platformToolsPath = Join-Path $SdkPath "platform-tools"
if (-not (Test-Path $platformToolsPath)) {
    Write-Host "[X] platform-tools not found at: $platformToolsPath" -ForegroundColor Red
    Write-Host "Please install Android SDK Platform-Tools" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Android SDK found at: $SdkPath" -ForegroundColor Green

# Set for current session
$env:ANDROID_HOME = $SdkPath
$env:ANDROID_SDK_ROOT = $SdkPath
$env:PATH = "$platformToolsPath;$env:PATH"

Write-Host ""
Write-Host "[OK] Environment variables set for current session" -ForegroundColor Green
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"

# Set permanently
try {
    [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $SdkPath, [System.EnvironmentVariableTarget]::User)
    [System.Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $SdkPath, [System.EnvironmentVariableTarget]::User)
    
    # Update PATH
    $userPath = [System.Environment]::GetEnvironmentVariable("PATH", [System.EnvironmentVariableTarget]::User)
    if ($userPath -notlike "*$platformToolsPath*") {
        $userPath += ";$platformToolsPath"
        [System.Environment]::SetEnvironmentVariable("PATH", $userPath, [System.EnvironmentVariableTarget]::User)
        Write-Host "[OK] PATH updated permanently" -ForegroundColor Green
        Write-Host "[!] Restart your terminal for PATH changes to take effect" -ForegroundColor Yellow
    }
    
    Write-Host "[OK] Environment variables set permanently" -ForegroundColor Green
} catch {
    Write-Host "[X] Failed to set permanent variables: $_" -ForegroundColor Red
}

# Test adb
Write-Host ""
Write-Host "Testing adb..." -ForegroundColor Yellow
try {
    $adbOutput = & adb version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] adb is working!" -ForegroundColor Green
        Write-Host $adbOutput
    }
} catch {
    Write-Host "[X] adb test failed - you may need to restart terminal" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Configuration Complete ===" -ForegroundColor Green
Write-Host "You can now run: npm run android" -ForegroundColor Cyan

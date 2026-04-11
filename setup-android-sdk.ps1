# Android SDK Setup Script for Expo
# This script helps configure ANDROID_HOME and PATH for Android development

Write-Host "=== Android SDK Setup for Expo ===" -ForegroundColor Cyan
Write-Host ""

# Common Android SDK locations to check
$possiblePaths = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\AppData\Local\Android\Sdk",
    "$env:ProgramFiles\Android\Sdk",
    "$env:ProgramFiles(x86)\Android\android-sdk"
)

$sdkPath = $null

# Check if ANDROID_HOME is already set
if ($env:ANDROID_HOME) {
    Write-Host "ANDROID_HOME is already set to: $env:ANDROID_HOME" -ForegroundColor Yellow
    if (Test-Path $env:ANDROID_HOME) {
        $sdkPath = $env:ANDROID_HOME
        Write-Host "[OK] Android SDK found at: $sdkPath" -ForegroundColor Green
    } else {
        Write-Host "[X] Android SDK not found at: $env:ANDROID_HOME" -ForegroundColor Red
    }
}

# Search for Android SDK
if (-not $sdkPath) {
    Write-Host "Searching for Android SDK..." -ForegroundColor Yellow
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $sdkPath = $path
            Write-Host "[OK] Found Android SDK at: $sdkPath" -ForegroundColor Green
            break
        }
    }
}

if (-not $sdkPath) {
    Write-Host ""
    Write-Host "[X] Android SDK not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Android SDK using one of these methods:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Install Android Studio (Recommended)" -ForegroundColor Cyan
    Write-Host "  1. Download from: https://developer.android.com/studio"
    Write-Host "  2. Install Android Studio"
    Write-Host "  3. Open Android Studio > More Actions > SDK Manager"
    Write-Host "  4. Install Android SDK Platform-Tools and Android SDK Build-Tools"
    Write-Host "  5. Note the SDK location (usually: $env:LOCALAPPDATA\Android\Sdk)"
    Write-Host ""
    Write-Host "Option 2: Install Command Line Tools Only" -ForegroundColor Cyan
    Write-Host "  1. Download from: https://developer.android.com/studio#command-tools"
    Write-Host "  2. Extract to a folder (e.g., C:\Android\Sdk)"
    Write-Host "  3. Run this script again after installation"
    Write-Host ""
    Write-Host "After installation, run this script again to configure environment variables." -ForegroundColor Yellow
    exit 1
}

# Verify platform-tools exist
$platformToolsPath = Join-Path $sdkPath "platform-tools"
if (-not (Test-Path $platformToolsPath)) {
    Write-Host "[X] platform-tools not found at: $platformToolsPath" -ForegroundColor Red
    Write-Host "Please install Android SDK Platform-Tools from Android Studio SDK Manager" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] platform-tools found" -ForegroundColor Green

# Set environment variables for current session
$env:ANDROID_HOME = $sdkPath
$env:ANDROID_SDK_ROOT = $sdkPath

# Add to PATH if not already there
$platformToolsPath = Join-Path $sdkPath "platform-tools"
$toolsPath = Join-Path $sdkPath "tools"
$toolsBinPath = Join-Path $sdkPath "tools\bin"

$pathsToAdd = @($platformToolsPath, $toolsPath, $toolsBinPath)
$currentPath = $env:PATH -split ';'

foreach ($pathToAdd in $pathsToAdd) {
    if (Test-Path $pathToAdd) {
        if ($currentPath -notcontains $pathToAdd) {
            $env:PATH += ";$pathToAdd"
            Write-Host "[OK] Added to PATH: $pathToAdd" -ForegroundColor Green
        } else {
            Write-Host "[OK] Already in PATH: $pathToAdd" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "=== Environment Variables Set for Current Session ===" -ForegroundColor Green
Write-Host "ANDROID_HOME: $env:ANDROID_HOME"
Write-Host "ANDROID_SDK_ROOT: $env:ANDROID_SDK_ROOT"
Write-Host ""

# Test adb
Write-Host "Testing adb command..." -ForegroundColor Yellow
try {
    $adbVersion = & adb version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] adb is working!" -ForegroundColor Green
        Write-Host $adbVersion
    } else {
        Write-Host "[X] adb test failed" -ForegroundColor Red
    }
} catch {
    Write-Host "[X] adb not found in PATH" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Setting Permanent Environment Variables ===" -ForegroundColor Cyan
Write-Host ""

# Set permanent environment variables
try {
    [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkPath, [System.EnvironmentVariableTarget]::User)
    [System.Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $sdkPath, [System.EnvironmentVariableTarget]::User)
    Write-Host "[OK] Set ANDROID_HOME permanently" -ForegroundColor Green
    
    # Update PATH permanently
    $userPath = [System.Environment]::GetEnvironmentVariable("PATH", [System.EnvironmentVariableTarget]::User)
    $pathUpdated = $false
    
    foreach ($pathToAdd in $pathsToAdd) {
        if (Test-Path $pathToAdd) {
            if ($userPath -notlike "*$pathToAdd*") {
                $userPath += ";$pathToAdd"
                $pathUpdated = $true
            }
        }
    }
    
    if ($pathUpdated) {
        [System.Environment]::SetEnvironmentVariable("PATH", $userPath, [System.EnvironmentVariableTarget]::User)
        Write-Host "[OK] Updated PATH permanently" -ForegroundColor Green
        Write-Host ""
        Write-Host "[!] IMPORTANT: Please restart your terminal/PowerShell for PATH changes to take effect!" -ForegroundColor Yellow
    } else {
        Write-Host "[OK] PATH already contains Android SDK paths" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "[X] Failed to set permanent environment variables: $_" -ForegroundColor Red
    Write-Host "You may need to run PowerShell as Administrator" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your terminal/PowerShell if PATH was updated"
Write-Host "2. Run: npm run android (or expo run:android)"
Write-Host ""

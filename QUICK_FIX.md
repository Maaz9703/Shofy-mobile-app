# Quick Fix for Android SDK Error

## Option 1: Use Expo Go (No Android SDK Needed) ⚡ FASTEST

You can run your app immediately without installing Android SDK:

1. **Install Expo Go** on your Android phone from Google Play Store
2. **Start Expo dev server:**
   ```powershell
   npm start
   ```
3. **Scan the QR code** with Expo Go app
4. Your app will load on your phone!

**Pros:** No installation needed, works immediately  
**Cons:** Requires physical device, some native features may be limited

---

## Option 2: Install Android SDK (For Emulator)

### Quick Install Steps:

1. **Download Android Studio:**
   - Go to: https://developer.android.com/studio
   - Download and install Android Studio

2. **During Installation:**
   - Make sure "Android SDK" is checked
   - Note the SDK location (usually: `C:\Users\RT MAAZ\AppData\Local\Android\Sdk`)

3. **After Installation:**
   - Open Android Studio
   - Go to **More Actions** → **SDK Manager**
   - Install:
     - ✅ Android SDK Platform-Tools
     - ✅ Android SDK Build-Tools
     - ✅ Android SDK Platform (API 33 or 34 recommended)

4. **Configure Environment:**
   ```powershell
   cd mobile-app
   .\setup-android-sdk.ps1
   ```

5. **Restart your terminal** and run:
   ```powershell
   npm run android
   ```

---

## Option 3: Install Command Line Tools Only (Lighter)

If you don't want full Android Studio:

1. **Download Command Line Tools:**
   - Go to: https://developer.android.com/studio#command-tools
   - Download Windows ZIP

2. **Extract to a folder:**
   ```powershell
   # Create folder
   New-Item -ItemType Directory -Path "C:\Android\Sdk" -Force
   
   # Extract command-line-tools to: C:\Android\Sdk\cmdline-tools\latest
   ```

3. **Install SDK components:**
   ```powershell
   cd C:\Android\Sdk\cmdline-tools\latest\bin
   .\sdkmanager.bat "platform-tools" "platforms;android-34" "build-tools;34.0.0"
   ```

4. **Set environment variables:**
   ```powershell
   $env:ANDROID_HOME = "C:\Android\Sdk"
   [System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android\Sdk", "User")
   [System.Environment]::SetEnvironmentVariable("PATH", $env:PATH + ";C:\Android\Sdk\platform-tools", "User")
   ```

5. **Restart terminal** and run:
   ```powershell
   npm run android
   ```

---

## Recommended: Use Expo Go for Now

For development, **Expo Go is the fastest option**. You can install Android SDK later when you need to test native modules or use an emulator.

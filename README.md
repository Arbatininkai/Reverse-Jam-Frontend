# Reverse Jam

Reverse singing game. Join or create a lobby where you sing a selected reversed song. Person with the highest accuracy wins.

## Clone Repository

To clone the repository, run:

```bash
git clone https://github.com/Arbatininkai/Reverse-Jam-Frontend.git
```

## Install Dependencies

Write

```bash
npm install
```

in the terminal to install the dependencies.

## Run Project

### Prerequisites:

1. **Android development build** must be installed on your device/emulator
2. **OR** Build it first using one of the methods below

Download an emulator from Android Studio: https://developer.android.com/studio

Follow the tutorial for setting up emulator: https://docs.expo.dev/workflow/android-studio-emulator/

Project will not run properly in web or expo go app because of google sign in does not work in the app and a different google sign in method is needed for web.

### Method 1: Build Development Build

```bash
# Build Android development build
npx expo run:android

# Then start the project
npx expo start --android
```

### Method 2: Use EAS Build

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Build for Android
eas build --platform android --profile development

# Download the APK and install on your device, then run:
npx expo start --android
```

# Error fix

If while running the app, you get an error:
`Error: could not connect to TCP port 5562: cannot connect to 127.0.0.1:5562: No connection could be made because the target machine actively refused it. (10061)`

To resolve the issue, run the following command in PowerShell:

```bash
adb kill-server
```

then click `a` to run the app again.

If you don't have abd intalled, you can install it from powerShell with these commands:

For windows:

```bash
choco install adb
choco install android-sdk
```

For Mac OS:

```bash
brew install android-platform-tools
```

For linux:

```bash
sudo apt-get install android-tools-adb
```

# Signing in with Google

To sign in with Google, make sure you have the backend API running on your machine

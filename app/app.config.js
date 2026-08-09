const path = require("path");

const defaultGoogleServicesJson = path.join(
  __dirname,
  "..",
  "configs",
  "google-services.json",
);
const defaultGoogleServiceInfoPlist = path.join(
  __dirname,
  "..",
  "configs",
  "GoogleService-Info.plist",
);

module.exports = {
  expo: {
    name: "app",
    slug: "app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "app",
    userInterfaceStyle: "automatic",
    ios: {
      icon: "./assets/expo.icon",
      bundleIdentifier: "com.apnagate",
      googleServicesFile:
        process.env.GOOGLE_SERVICE_INFO_PLIST ?? defaultGoogleServiceInfoPlist,
      supportsTablet: true,
      config: {
        usesNonExemptEncryption: false,
      },
      infoPlist: {
        NSCameraUsageDescription:
          "This app uses the camera to scan QR codes for authentication purposes.",
        NSPhotoLibraryUsageDescription:
          "This app requires access to the photo library to allow users to select images for authentication purposes.",
      },
    },
    android: {
      package: "com.apnagate",
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? defaultGoogleServicesJson,
      softwareKeyboardLayoutMode: "resize",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      predictiveBackGestureEnabled: false,
      permissions: [
        "android.permission.CAMERA",
        "android.permission.POST_NOTIFICATIONS",
      ],
    },
    web: {
      output: "static",
      bundler: "metro",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-dev-client",
        {
          launchMode: "most-recent",
        },
      ],
      [
        "expo-splash-screen",
        {
          backgroundColor: "#208AEF",
          android: {
            image: "./assets/images/splash-icon.png",
            imageWidth: 76,
          },
        },
      ],
      [
        "expo-secure-store",
        {
          configureAndroidBackup: true,
          faceIDPermission:
            "Allow $(PRODUCT_NAME) to access Face ID for secure authentication.",
        },
      ],
      [
        "expo-notifications",
        {
          color: "#208AEF",
          defaultChannel: "default",
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission:
            "Allow $(PRODUCT_NAME) to use the camera for QR scanning and verification.",
          recordAudioAndroid: false,
          barcodeScannerEnabled: true,
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow $(PRODUCT_NAME) to access photos to scan QR codes from your gallery.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: "88a4d420-1da7-492a-bcd1-3e5ccf5f4fd1",
      },
    },
    owner: "itsmepankaj",
  },
};

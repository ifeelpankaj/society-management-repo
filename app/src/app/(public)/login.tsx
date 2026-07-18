import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { SymbolView } from "expo-symbols";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useToast } from "@/components/ui";
import { getApiMessage } from "@/features/auth/api-error";
import { useCompleteAuth } from "@/features/auth/use-complete-auth";
import { usePostV1AuthLoginMutation } from "@/lib/api/generated-api";
import { Redirect, useRouter } from "expo-router";

import { useAuth } from "@/features/auth/use-auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = usePostV1AuthLoginMutation();
  const completeAuth = useCompleteAuth();
  const { homeRoute, status } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  if (status === "authenticated" && homeRoute) {
    return <Redirect href={homeRoute} />;
  }

  const handleForget = () => {
    // Navigate to the forget password screen
    router.push("/forget");
  };
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showToast({
        title: "Missing details",
        message: "Enter your email and password.",
        variant: "error",
      });
      return;
    }

    try {
      const response = await login({
        modelsLoginRequest: {
          email: email.trim().toLowerCase(),
          password,
        },
      }).unwrap();

      await completeAuth(response.data ?? undefined);
    } catch (error) {
      showToast({
        title: "Sign in failed",
        message: getApiMessage(error, "Check your email and password."),
        variant: "error",
      });
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.screen}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <Image
              source={require("../../../assets/images/public/soc_img_two.png")}
              contentFit="cover"
              contentPosition="center"
              style={StyleSheet.absoluteFill}
            />
            <LinearGradient
              colors={["rgba(23,17,15,0.05)", "rgba(23,17,15,0.78)"]}
              style={[StyleSheet.absoluteFill, styles.noPointerEvents]}
            />
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>APNA GATE</Text>
              <Text style={styles.heroSubtitle}>
                Modern Security for Modern Societies.
              </Text>
            </View>
          </View>

          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back to Apna Gate</Text>
              <Text style={styles.subtitle}>
                Continue securely to your community.
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.notice}>
              <Text style={styles.noticeIcon}>{"\u24D8"}</Text>
              <View style={styles.noticeCopy}>
                <Text style={styles.noticeTitle}>New here?</Text>
                <Text style={styles.helper}>
                  Residents can login after their flat claim is approved.
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  cursorColor="#ff6a1a"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="#aaa19a"
                  selectionColor="#ffc39a"
                  style={styles.input}
                  value={email}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    autoCapitalize="none"
                    cursorColor="#ff6a1a"
                    onChangeText={setPassword}
                    placeholder="Enter password"
                    placeholderTextColor="#aaa19a"
                    secureTextEntry={!showPassword}
                    selectionColor="#ffc39a"
                    style={styles.passwordInput}
                    value={password}
                  />
                  <Pressable
                    accessibilityLabel={
                      showPassword ? "Hide password" : "Show password"
                    }
                    accessibilityRole="button"
                    onPress={() => setShowPassword((current) => !current)}
                    style={styles.eyeButton}
                  >
                    <SymbolView
                      name={
                        showPassword
                          ? {
                              ios: "eye.slash",
                              android: "visibility_off",
                              web: "visibility_off",
                            }
                          : {
                              ios: "eye",
                              android: "visibility",
                              web: "visibility",
                            }
                      }
                      size={18}
                      tintColor="#81766f"
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={handleForget}
                style={styles.forgotLink}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
            </View>

            <View style={styles.secureNote}>
              <Text style={styles.secureIcon}>{"\u{1F6E1}\uFE0F"}</Text>
              <View style={styles.secureCopy}>
                <Text style={styles.secureTitle}>Secure login</Text>
                <Text style={styles.helper}>
                  Your information is encrypted.
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={isLoading}
              onPress={handleLogin}
              style={[styles.button, isLoading && styles.buttonDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Secure Sign In</Text>
              )}
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.help}>
              <Text style={styles.helpTitle}>Need help?</Text>
              <Text style={styles.helper}>
                Contact your society administrator.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#ff6a1a",
    borderRadius: 16,
    boxShadow: "0 10px 20px rgba(255, 106, 26, 0.18)",
    justifyContent: "center",
    minHeight: 54,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    flexGrow: 1,
  },
  divider: {
    backgroundColor: "#eee7e2",
    height: 1,
  },
  eyeButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    height: 52,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  eyeText: {
    color: "#81766f",
    fontSize: 13,
    fontWeight: "600",
  },
  field: {
    gap: 8,
  },
  forgotLink: {
    alignSelf: "flex-end",
    paddingVertical: 2,
  },
  forgotText: {
    color: "#ff6a1a",
    fontSize: 13,
    fontWeight: "600",
  },
  form: {
    gap: 14,
  },
  header: {
    gap: 8,
  },
  helper: {
    color: "#81766f",
    fontSize: 13,
    lineHeight: 19,
  },
  help: {
    alignItems: "center",
    gap: 5,
  },
  helpTitle: {
    color: "#211714",
    fontSize: 14,
    fontWeight: "700",
  },
  hero: {
    height: 260,
    overflow: "hidden",
  },
  heroCopy: {
    alignItems: "center",
    bottom: 34,
    gap: 10,
    left: 24,
    position: "absolute",
    right: 24,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textAlign: "center",
    textTransform: "uppercase",
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#e4dcd6",
    borderRadius: 14,
    borderWidth: 1,
    color: "#211714",
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 15,
  },
  label: {
    color: "#211714",
    fontSize: 14,
    fontWeight: "600",
  },
  noPointerEvents: {
    pointerEvents: "none",
  },
  notice: {
    flexDirection: "row",
    gap: 12,
  },
  noticeCopy: {
    flex: 1,
    gap: 3,
  },
  noticeIcon: {
    color: "#ff6a1a",
    fontSize: 20,
    lineHeight: 24,
  },
  noticeTitle: {
    color: "#211714",
    fontSize: 15,
    fontWeight: "700",
  },
  passwordInput: {
    color: "#211714",
    flex: 1,
    fontSize: 15,
    minHeight: 52,
    paddingLeft: 15,
  },
  passwordRow: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e4dcd6",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
  },
  screen: {
    backgroundColor: "#ffffff",
    flex: 1,
  },
  secureCopy: {
    flex: 1,
    gap: 3,
  },
  secureIcon: {
    fontSize: 20,
    lineHeight: 24,
  },
  secureNote: {
    backgroundColor: "#fff7f1",
    borderRadius: 14,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  secureTitle: {
    color: "#211714",
    fontSize: 15,
    fontWeight: "700",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    boxShadow: "0 -10px 24px rgba(0, 0, 0, 0.1)",
    flexGrow: 1,
    gap: 22,
    marginTop: -24,
    paddingBottom: 28,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  subtitle: {
    color: "#625852",
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    color: "#211714",
    fontSize: 28,
    fontWeight: "600",
    lineHeight: 34,
  },
});

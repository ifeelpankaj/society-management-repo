import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const images = [
  require("../../assets/images/public/soc_img_one.png"),
  require("../../assets/images/public/soc_img_two.png"),
];

const features = [
  ["\u{1F6E1}\uFE0F", "Secure Entry", "Approve visitors in seconds."],
  ["\u{1F4F1}", "Digital Access", "QR-based entry for residents and guests."],
  [
    "\u{1F465}",
    "Community Management",
    "Manage residents, staff, and visitors from one place.",
  ],
] as const;

export default function Index() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const carouselRef = useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => {
        const next = (current + 1) % images.length;
        carouselRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [width]);

  return (
    <SafeAreaView className="flex-1 bg-[#17110f]">
      <StatusBar style="light" />
      <ScrollView bounces={false} contentContainerClassName="flex-grow">
        <View className="relative h-[340px] overflow-hidden bg-[#17110f]">
          <ScrollView
            ref={carouselRef}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) =>
              setActiveSlide(
                Math.round(event.nativeEvent.contentOffset.x / width),
              )
            }
          >
            {images.map((source, index) => (
              <Image
                key={index}
                source={source}
                contentFit="cover"
                contentPosition="center"
                style={{ width, height: "100%" }}
              />
            ))}
          </ScrollView>

          <LinearGradient
            colors={[
              "rgba(23,17,15,0.04)",
              "rgba(23,17,15,0.46)",
              "rgba(23,17,15,0.88)",
            ]}
            locations={[0, 0.48, 1]}
            style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}
          />

          <View
            className="absolute left-6 right-6 gap-2"
            style={{ bottom: 76 }}
          >
            <Text
              className="text-[27px] font-medium leading-9 text-white"
              style={{
                textShadowColor: "rgba(0, 0, 0, 0.45)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 6,
              }}
            >
              APNA GATE
            </Text>
            <Text
              className="text-xs font-semibold uppercase tracking-widest text-white/90"
              style={{
                textShadowColor: "rgba(0, 0, 0, 0.45)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 5,
              }}
            >
              Modern Security for Modern Societies.
            </Text>
          </View>

          <View
            className="absolute left-0 right-0 items-center"
            style={{ bottom: 42 }}
          >
            <View className="flex-row justify-center gap-2 rounded-full bg-black/35 px-3 py-2">
              {images.map((_, index) => (
                <View
                  key={index}
                  className={[
                    "h-2 rounded-full",
                    activeSlide === index ? "w-6 bg-white" : "w-2 bg-white/55",
                  ].join(" ")}
                />
              ))}
            </View>
          </View>
        </View>

        <View
          className="-mt-5 flex-grow gap-6 rounded-t-[28px] bg-white px-6 pb-8 pt-8"
          style={{ boxShadow: "0 -10px 24px rgba(0, 0, 0, 0.1)" }}
        >
          <View className="gap-2">
            <Text className="text-[25px] font-medium leading-8 text-[#211714]">
              Welcome to Apna Gate
            </Text>
            <Text className="text-[15px] leading-6 text-[#211714]">
              A smarter way to welcome visitors and keep your community secure.
            </Text>
          </View>

          <View className="h-px bg-[#eee7e2]" />

          <View className="gap-5">
            {features.map(([icon, title, description]) => (
              <View key={title} className="flex-row items-start gap-3.5">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#fff1e8]">
                  <Text className="text-lg">{icon}</Text>
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-[15px] font-semibold text-[#211714]">
                    {title}
                  </Text>
                  <Text className="text-sm leading-5 text-[#81766f]">
                    {description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View className="h-px bg-[#eee7e2]" />

          <View className="gap-4">
            <Text className="text-center text-xs font-medium uppercase tracking-wide text-[#a89e97]">
              Trusted by modern residential communities.
            </Text>
            <Pressable
              accessibilityRole="button"
              className="min-h-14 items-center justify-center rounded-2xl bg-[#ff6a1a] active:opacity-90"
              onPress={() => router.push("/login")}
              style={{ boxShadow: "0 10px 20px rgba(255, 106, 26, 0.18)" }}
            >
              <Text className="text-base font-semibold text-white">
                Continue to your community.
              </Text>
            </Pressable>
            <View className="flex-row justify-center gap-2">
              <Text className="text-xs text-[#a89e97]">Terms</Text>
              <Text className="text-xs text-[#c9c1bb]">{"\u2022"}</Text>
              <Text className="text-xs text-[#a89e97]">Privacy</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const trialMonths = Number(process.env.NEXT_PUBLIC_TRIAL_MONTHS ?? 3);
const pricePerFlat = Number(process.env.NEXT_PUBLIC_PRICE_PER_FLAT ?? 30);

export const appConfig = {
  logoText: "Gatezy",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  swaggerDocsUrl:
    process.env.NEXT_PUBLIC_SWAGGER_DOCS_URL ||
    "http://localhost:8000/swagger/doc.json",
  trialMonths: Number.isFinite(trialMonths) ? trialMonths : 3,
  pricePerFlat: Number.isFinite(pricePerFlat) ? pricePerFlat : 30,
  demoVideoUrl:
    process.env.NEXT_PUBLIC_DEMO_VIDEO_URL ||
    "https://www.youtube.com/watch?v=A-SEUNcjSyQ&t=7s",
  demoVideoTitle:
    process.env.NEXT_PUBLIC_DEMO_VIDEO_TITLE || "Gatezy platform walkthrough",
  supportWhatsAppDigits:
    process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/\D/g, "") || "",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "billing@gatezy.app",
  supportPhoneDisplay:
    process.env.NEXT_PUBLIC_SUPPORT_PHONE_DISPLAY || "+91 98765 43210",
  supportPhoneTel: process.env.NEXT_PUBLIC_SUPPORT_PHONE_TEL || "+919876543210",
  playStoreUrl: process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? "#",
  appStoreUrl: process.env.NEXT_PUBLIC_APP_STORE_URL ?? "#",
};

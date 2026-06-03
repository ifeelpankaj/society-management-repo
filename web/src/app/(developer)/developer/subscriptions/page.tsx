import { SubscriptionsClient } from "@/features/developer/subscriptions";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Subscriptions",
  "Track society subscriptions, trials, and renewals.",
);

export default function DeveloperSubscriptionsPage() {
  return <SubscriptionsClient />;
}
//create a subscription detail page where user can perform
//postV1SocietiesBySocietyIdSubscriptionsPlansAndPlanIdPending to mark subscription as pending
//getV1Subscriptions to get all subscription details like trial end date, current period end date, subscription status and all other details
//GetallSocietiesandinslecto[tionand get theeir subscription details using ]getV1SubscriptionsLookup
//postV1SubscriptionsBySubscriptionIdActivate to activate subscription
//postV1SubscriptionsBySubscriptionIdCancel to cancel subscription
//postV1SubscriptionsBySubscriptionIdExpire to expire subscription as per society level
//postV1SubscriptionsBySubscriptionIdRenew to renew subscription as per society level
//postV1SubscriptionsBySubscriptionIdPlansAndPlanId chnage subscription plan as per society level

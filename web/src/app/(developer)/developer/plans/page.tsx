import { PlansClient } from "@/features/developer/plans";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Plans",
  "Create and manage subscription plans.",
);

export default function DeveloperPlansPage() {
  return <PlansClient />;
}

// create a plan detail page where user can perform
//getV1Plans to get all plan
//postV1Plans to create plan
//getV1PlansLookup to get plan details by plan id
//patchV1PlansByPlanId to update plan details like name, price and all other details
//postV1PlansByPlanIdActivate to activate plan
//postV1PlansByPlanIdDeactivate to deactivate plan

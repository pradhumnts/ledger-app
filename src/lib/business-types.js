import {
  Camera,
  Dumbbell,
  Gem,
  Glasses,
  GraduationCap,
  MoreHorizontal,
  Scissors,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Stethoscope,
  UtensilsCrossed,
} from "lucide-react";

/** Business types shown during onboarding (single-select). */
export const BUSINESS_TYPES = [
  { id: "salon", labelKey: "onboarding.types.salon", Icon: Scissors },
  { id: "beauty", labelKey: "onboarding.types.beauty", Icon: Sparkles },
  { id: "clinic", labelKey: "onboarding.types.clinic", Icon: Stethoscope },
  { id: "education", labelKey: "onboarding.types.education", Icon: GraduationCap },
  { id: "fitness", labelKey: "onboarding.types.fitness", Icon: Dumbbell },
  { id: "photographer", labelKey: "onboarding.types.photographer", Icon: Camera },
  { id: "retail", labelKey: "onboarding.types.retail", Icon: ShoppingBag },
  { id: "restaurant", labelKey: "onboarding.types.restaurant", Icon: UtensilsCrossed },
  { id: "jewellery", labelKey: "onboarding.types.jewellery", Icon: Gem },
  { id: "eyeglasses", labelKey: "onboarding.types.eyeglasses", Icon: Glasses },
  { id: "mobiles", labelKey: "onboarding.types.mobiles", Icon: Smartphone },
  { id: "other", labelKey: "onboarding.types.other", Icon: MoreHorizontal },
];

export function isValidBusinessType(id) {
  return BUSINESS_TYPES.some((type) => type.id === id);
}

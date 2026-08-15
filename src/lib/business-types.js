/** Business types shown during onboarding (single-select). */
export const BUSINESS_TYPES = [
  { id: "salon", labelKey: "onboarding.types.salon" },
  { id: "beauty", labelKey: "onboarding.types.beauty" },
  { id: "clinic", labelKey: "onboarding.types.clinic" },
  { id: "education", labelKey: "onboarding.types.education" },
  { id: "fitness", labelKey: "onboarding.types.fitness" },
  { id: "photographer", labelKey: "onboarding.types.photographer" },
  { id: "retail", labelKey: "onboarding.types.retail" },
  { id: "kirana", labelKey: "onboarding.types.kirana" },
  { id: "restaurant", labelKey: "onboarding.types.restaurant" },
  { id: "cafe", labelKey: "onboarding.types.cafe" },
  { id: "toys", labelKey: "onboarding.types.toys" },
  { id: "other", labelKey: "onboarding.types.other" },
];

export function isValidBusinessType(id) {
  return BUSINESS_TYPES.some((type) => type.id === id);
}

export const AR_CONFIG = {
  targetSrc: './assets/targets/tracker.mind',
  targetIndex: 0,

  // Чем выше значения — тем меньше сглаживания и меньше "плавания",
  // но может стать больше мелкой дрожи.
  filterMinCF: 0.01,
  filterBeta: 10,
}

export const AR_CONFIG = {
  targetSrc: './assets/targets/tracker.mind',
  targetIndex: 0,

  // MindAR tracking smoothing.
  // Меньше filterMinCF = меньше мелкой дрожи.
  // Больше filterBeta = быстрее догоняет движение камеры.
  filterMinCF: 0.001,
  filterBeta: 1000,

  // Сколько кадров подряд нужно для уверенного появления таргета.
  warmupTolerance: 5,

  // Сколько кадров можно "терять" таргет, прежде чем сцена спрячется.
  // Помогает от микропропаданий и дерганий.
  missTolerance: 10,
}

export function calculateCreatorTokenPrice({
    growthScore,     // 0 to 1, Neynar score
    supply,
    basePrice = 0.01,
    scoreExponent = 2.5,        // NEW: flattens mid scores
    supplyExponent = 1.2
  }) {
    const adjustedScore = Math.pow(growthScore, scoreExponent);
    const price = basePrice * adjustedScore * Math.pow(supply, supplyExponent);
    return Number(price.toFixed(2));
  }
  
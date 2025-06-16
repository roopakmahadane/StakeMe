export function calculateCreatorTokenPrice({
  growthScore,
  supply,
  basePriceUSD = 0.01,       // Base price per token in USD
  scoreExponent = 2.5,
  supplyExponent = 1.2,
  minPriceUSD = 0.005,       // Optional floor price
}) {
  const adjustedScore = Math.pow(growthScore, scoreExponent);
  const supplyFactor = Math.pow(supply + 1, supplyExponent); // +1 to avoid zero
  const rawPriceUSD = basePriceUSD * adjustedScore * supplyFactor;

  const finalPriceUSD = Math.max(rawPriceUSD, minPriceUSD);
  return Number(finalPriceUSD.toFixed(4)); // USD/token
}

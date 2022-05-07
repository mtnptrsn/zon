export const round = (value: number, decimals: number = 0): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

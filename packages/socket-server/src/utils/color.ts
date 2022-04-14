const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getRandomPlayerColor = (exclude: string[]) => {
  const colors = {
    orange: "#FFB600",
    red: "#FF563D",
    pink: "#B13DAC",
    blue: "#5847FF",
    brown: "#825D27",
    blueGrey: "#34495E",
  };
  const availableColors = Object.values(colors).filter(
    (color) => !exclude.includes(color)
  );
  const color = availableColors[getRandomNumber(0, availableColors.length - 1)];

  console.log({ color });

  return color;
};

const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getRandomPlayerColor = (takenColors: string[]) => {
  const colors = [
    "#FFB600",
    "#FF563D",
    "#B13DAC",
    "#5847FF",
    "#825D27",
    "#00BBF2",
  ];

  const availableColors = colors.filter(
    (color) => !takenColors.includes(color)
  );
  return availableColors[getRandomNumber(0, availableColors.length - 1)];
};

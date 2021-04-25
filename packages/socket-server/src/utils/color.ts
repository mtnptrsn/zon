const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getRandomPlayerColor = (takenColors: string[]) => {
  const colors = [
    "#9C27B0",
    "#673AB7",
    "#3F51B5",
    "#2196F3",
    "#009688",
    "#4CAF50",
    "#FFC107",
    "#607D8B",
  ];

  const availableColors = colors.filter(
    (color) => !takenColors.includes(color)
  );
  return availableColors[getRandomNumber(0, availableColors.length - 1)];
};

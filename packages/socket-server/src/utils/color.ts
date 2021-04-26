const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getRandomPlayerColor = (takenColors: string[]) => {
  const colors = [
    "#9C27B0", // purple
    "#2196F3", // blue
    "#4CAF50", // green
    "#FFC107", // amber
    "#231F20", // dark gray
    "#F4A460", // sandy brown
    "#FFD700", // golden
  ];

  const availableColors = colors.filter(
    (color) => !takenColors.includes(color)
  );
  return availableColors[getRandomNumber(0, availableColors.length - 1)];
};

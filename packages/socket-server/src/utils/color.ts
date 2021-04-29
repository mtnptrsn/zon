const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getRandomPlayerColor = (takenColors: string[]) => {
  const colors = [
    "#8e44ad", // wisteria
    "#2c3e50", // midnight blue
    "#f39c12", // orange
    "#2ecc71", // green
    "#1abc9c", // turqoise,
    "#825D27", // brown
  ];

  const availableColors = colors.filter(
    (color) => !takenColors.includes(color)
  );
  return availableColors[getRandomNumber(0, availableColors.length - 1)];
};

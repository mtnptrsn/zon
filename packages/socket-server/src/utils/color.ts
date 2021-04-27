const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const getRandomPlayerColor = (takenColors: string[]) => {
  const colors = [
    "#A330C9", // dark magenta,
    "#FF7C0A", // orange
    "#AAD372", // green
    "#F48CBA", // pink
    "#FFFFFF", //white
    "#FFF468", // yellow
    "#8788EE", // purple
    "#C69B6D", // tan
  ];

  const availableColors = colors.filter(
    (color) => !takenColors.includes(color)
  );
  return availableColors[getRandomNumber(0, availableColors.length - 1)];
};

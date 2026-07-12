export const health = (_: any, res: any) => {
  res.json({
    success: true,
    message: "Server health is OK",
  });
};
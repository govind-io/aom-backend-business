export const getUserData = (req, res) => {
  res.status(200).send(req.user);
};

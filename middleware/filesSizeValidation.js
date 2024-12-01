exports.validateSize = (req, res, next) => {
  const { size } = req.file;
  console.log(size);
  next();
};

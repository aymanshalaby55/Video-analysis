

exports.validateSize = (req, res, next) => {
    const { file } = req.file;
    const size = file.size;
    console.log(size);
    next();
}
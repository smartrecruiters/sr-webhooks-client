module.exports = {
    isAuthorized: (req, res, next) => {
        if (req.params.id === req.user.id) {
            return next()
        } else {
            res.status(403).send()
        }
    }
}

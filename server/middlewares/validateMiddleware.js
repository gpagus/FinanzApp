const formatZodErrors = (err) =>
    err.errors.reduce((acc, cur) => {
        acc[cur.path[0]] = cur.message;
        return acc;
    }, {});

module.exports = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ errors: formatZodErrors(result.error) });
    }
    req.validatedBody = result.data;
    next();
};

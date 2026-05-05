const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
    try {
        if (schema.body) {
            req.body = schema.body.parse(req.body);
        }
        if (schema.query) {
            req.query = schema.query.parse(req.query);
        }
        if (schema.params) {
            req.params = schema.params.parse(req.params);
        }
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            const errors = error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message
            }));
            // Return a clean error string for the frontend, or the detailed array if needed
            return res.status(400).json({ error: errors[0].message, details: errors });
        }
        next(error);
    }
};

module.exports = { validate };

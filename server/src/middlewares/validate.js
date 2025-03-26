import {logger} from "../helpers/logger.js";

export const validate = (schema) => async (req, res, next) => {
    try {
        await schema.validate({
            body: req.body,
            query: req.query,
            params: req.params,
        }, { abortEarly: false, strict: true });

        return next();
    } catch (error) {
        const errors = error.inner.reduce((acc, err) => {
            const path = err.path.replace('body.', '');
            acc[path] = err.message;
            return acc;
        }, {});

        return res.status(400).json({ errors });
    }
};

export const validateFormData = (schema) => async (req, res, next) => {
    try {
        // Validate the fields in req.body
        // Update req.body with validated data
        req.body = await schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        return next();
    } catch (error) {
        logger.error("Validation error:", error);
        const errors = error.inner.reduce((acc, err) => {
            acc[err.path] = err.message;
            return acc;
        }, {});

        return res.status(400).json({ errors });
    }
};
import passport from 'passport';

export const authenticateJWT = passport.authenticate('jwt', { session: false });

export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
};
export const authenticateAPIKey = (req, res, next) => {
    const apiKey = req.header('X-API-KEY');
    const validApiKey = process.env.X_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({ message: 'Unauthorized: Invalid API key' });
    }
    next();
};
import dotenv from "dotenv";
dotenv.config();

export const CheckAuthIOT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    if (token !== process.env.IOT_API_TOKEN) {
        return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }

    next();
};

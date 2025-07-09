
export default async function allowedOrigin(req, res) {
    const allowedOrigin = 'http://18.162.49.28:3000/';

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.status(200).end();
        return;
    }

    const origin = req.headers.referer;

    console.log("origin", origin);
    console.log("allowedOrigin", allowedOrigin);

    if (origin !== allowedOrigin) {
        return res.status(403).json({ message: 'Access denied' });
    }
}
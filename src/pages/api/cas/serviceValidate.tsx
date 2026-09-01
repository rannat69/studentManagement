// pages/api/cas/login.js
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    _req: NextApiRequest,
    res: NextApiResponse
) {
    // The URL the CAS server will redirect back to after login

    console.log(_req.body);

    const getServiceValidate = async () => {
        const response = await axios.get(
            'https://cas.ust.hk/cas/serviceValidate?service=' +
                process.env.NEXT_PUBLIC_BASE_URL +
                '/cas' +
                '&ticket=' +
                _req.body.ticket
        ); // URL of the HTML page
        //res.send(response.data);

        return response.data;
    };
    const resServiceValidate = await getServiceValidate();
    console.log(resServiceValidate);
    res.status(200).json({ message: resServiceValidate });
}

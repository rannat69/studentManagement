import cookie from 'cookie';

export default function authenticate(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token;

  if (!token) {
    console.log("cookie error");
    res.status(401).json({ message: 'Error' });
  } else {
    // Vérifiez la validité du token ici
    console.log("cookie ok");

    res.status(200).json({ message: 'OK' });
  }
}
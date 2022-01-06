import { https, logger } from "firebase-functions"
// import { auth } from "firebase-admin"
import cors from "cors"
import fetch from "node-fetch"

const corsOptions: cors.CorsOptions = { origin: true }
const corsMiddleware = cors(corsOptions);

export const dishful_function_fetch_html = https.onRequest((request, response) => {
  corsMiddleware(request, response, async () => {
    const url = request.body.data
    logger.info("URL: " + url)

    const fetchResponse = await fetch(url);
    const data = await fetchResponse.text();

    response.send({ data })
  })
})

// const validateFirebaseIdToken = async (req, res, next) => {
//   logger.log('Check if request is authorized with Firebase ID token');

//   if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
//       !(req.cookies && req.cookies.__session)) {
//     res.status(403).send('Unauthorized');
//     return;
//   }

//   let idToken;
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
//     logger.log('Found "Authorization" header');
//     // Read the ID Token from the Authorization header.
//     idToken = req.headers.authorization.split('Bearer ')[1];
//   } else if(req.cookies) {
//     logger.log('Found "__session" cookie');
//     // Read the ID Token from cookie.
//     idToken = req.cookies.__session;
//   } else {
//     // No cookie
//     res.status(403).send('Unauthorized');
//     return;
//   }

//   try {
//     const decodedIdToken = await auth().verifyIdToken(idToken);
//     logger.log('ID Token correctly decoded', decodedIdToken);
//     req.user = decodedIdToken;
//     return;
//   } catch (error) {
//     logger.error('Error while verifying Firebase ID token:', error);
//     res.status(403).send('Unauthorized');
//     return;
//   }
// };
import { HttpStatusError, BadRequestError, ForbiddenError, InternalServerError } from "http-status-errors"
import { https } from "firebase-functions"
import { auth } from "firebase-admin"
import cors from "cors"
import fetch from "node-fetch"

const corsOptions: cors.CorsOptions = { origin: true }
const corsMiddleware = cors(corsOptions);

export const dishful_function_fetch_html = https.onRequest((request, response) => {
  corsMiddleware(request, response, async () => {
    try {
      const token = getToken(request)
      const claims = await getClaims(token)

      if (!claims.uid) throw new ForbiddenError("Unauthorized")

      const url = getUrl(request)
      const text = await getText(url)
      const html = await getHtml(text);

      response.send({ "data": html })
    } catch (error) {
      const { message, status } = error as HttpStatusError

      response.status(status).send({ "data": message })
    }
  })
})

const getUrl = (request: https.Request) => {
  const url = request.body.data
  if (!url) throw new BadRequestError("Request body.data must be defined.")
  if (typeof url != "string") throw new BadRequestError("Request body.data must be a string.")

  return url
}

const getToken = (request: https.Request) => {
  const token = request.headers.authorization?.split("Bearer ")?.[1]
  if (!token) throw new BadRequestError("Request headers.authorization is either undefined or incorrectly formatted.")

  return token
}

const getClaims = async (token: string) => {
  const { verifyIdToken } = auth()

  try {
    return await verifyIdToken(token)
  } catch (error) {
    throw new InternalServerError("An error occurred while verifying token.")
  }
}

const getText = async (url: string) => {
  try {
    const { text } = await fetch(url);
    return text
  } catch (error) {
    throw new InternalServerError("An error occurred while fetching URL.")
  }
}

const getHtml = async (text: () => Promise<string>) => {
  try {
    return await text();
  } catch (error) {
    throw new InternalServerError("An error occurred while getting HTML.")
  }
}
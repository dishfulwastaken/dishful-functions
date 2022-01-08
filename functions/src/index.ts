import { HttpStatusError, BadRequestError, ForbiddenError, InternalServerError } from "http-status-errors"
import { https, logger } from "firebase-functions"
import { auth, initializeApp } from "firebase-admin"
import cors from "cors"
import fetch from "node-fetch"

const app = initializeApp()
const corsOptions: cors.CorsOptions = { origin: true }
const corsMiddleware = cors(corsOptions);

export const dishful_function_fetch_html = https.onRequest((request, response) => {
  corsMiddleware(request, response, async () => {
    try {
      const token = getToken(request)
      const claims = await getClaims(token)

      if (!claims.uid) throw new ForbiddenError("Unauthorized")

      const url = getUrl(request)
      const fetchResponse = await getResponse(url)
      const html = await getHtml(fetchResponse);

      response.send({ "data": html })
    } catch (error) {
      const { message, status } = error as HttpStatusError

      response.status(status ?? 500).send({ "data": message ?? "An unknown error occurred." })
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
  const authService = auth(app)

  try {
    return await authService.verifyIdToken(token)
  } catch (error) {
    logger.error(error)
    throw new InternalServerError("An error occurred while verifying token.")
  }
}

const getResponse = async (url: string) => {
  try {
    return await fetch(url);
  } catch (error) {
    logger.error(error)
    throw new InternalServerError("An error occurred while fetching URL.")
  }
}

const getHtml = async (response: fetch.Response) => {
  try {
    return await response.text();
  } catch (error) {
    logger.error(error)
    throw new InternalServerError("An error occurred while getting HTML.")
  }
}
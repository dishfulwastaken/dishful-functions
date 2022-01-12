import { firestore as functionsFirestore } from "firebase-functions"
import { firestore as adminFirestore } from "firebase-admin"

const db = adminFirestore()
const recipeIterationsPath = "dishful_firebase_storage_recipe_meta/{recipeMetaId}/dishful_firebase_storage_recipe_iteration/{recipeIterationId}"

const updateRecipeIterationCount = ({recipeMetaId, increment}: {recipeMetaId: any, increment: 1 | -1}) => {
  const recipeMetaRef = db.collection("dishful_firebase_storage_recipe_meta").doc(recipeMetaId)
  recipeMetaRef.update({iterationCount: adminFirestore.FieldValue.increment(increment)})
}

export const onRecipeIterationsCreate = functionsFirestore.document(recipeIterationsPath).onCreate((_, context) => {
  const recipeMetaId = context.params.recipeMetaId
  updateRecipeIterationCount({ recipeMetaId, increment: 1 })
})

export const onRecipeIterationsDelete = functionsFirestore.document(recipeIterationsPath).onDelete((_, context) => {
  const recipeMetaId = context.params.recipeMetaId
  updateRecipeIterationCount({ recipeMetaId, increment: -1 })
})
import { firestore as functionsFirestore } from "firebase-functions"
import { firestore as adminFirestore } from "firebase-admin"

enum CollectionName {
  User = "dishful_firebase_storage_user_meta",
  Recipe = "dishful_firebase_storage_recipe_meta",
  RecipeIteration = "dishful_firebase_storage_recipe_iteration",
}

const db = adminFirestore()
const recipeIterationsPath = `${CollectionName.User}/{userId}/${CollectionName.Recipe}/{recipeMetaId}/${CollectionName.RecipeIteration}/{recipeIterationId}`

const updateRecipeIterationCount = ({userId, recipeMetaId, increment}: {userId: any, recipeMetaId: any, increment: 1 | -1}) => {
  const recipeMetaRef = db.collection(`${CollectionName.User}/${userId}/${CollectionName.Recipe}`).doc(recipeMetaId)
  recipeMetaRef.update({iterationCount: adminFirestore.FieldValue.increment(increment)})
}

export const onRecipeIterationsCreate = functionsFirestore.document(recipeIterationsPath).onCreate((_, context) => {
  const { userId, recipeMetaId } = context.params
  updateRecipeIterationCount({ userId, recipeMetaId, increment: 1 })
})

export const onRecipeIterationsDelete = functionsFirestore.document(recipeIterationsPath).onDelete((_, context) => {
  const { userId, recipeMetaId } = context.params
  updateRecipeIterationCount({ userId, recipeMetaId, increment: -1 })
})
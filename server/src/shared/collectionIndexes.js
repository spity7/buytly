/** MongoDB error code when a command targets a collection that does not exist. */
const NAMESPACE_NOT_FOUND = 26;

/**
 * Index list of a collection, or [] when the collection does not exist yet
 * (on an empty database `listIndexes` fails with NamespaceNotFound).
 */
export async function listCollectionIndexes(collection) {
  try {
    return await collection.indexes();
  } catch (error) {
    if (error?.code === NAMESPACE_NOT_FOUND) return [];
    throw error;
  }
}

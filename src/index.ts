type ApiFunction = (...args: any[]) => Promise<any>
type ErrorHandler = (error: any) => void

interface MapFetchActionsOptions<T> {
  stateProperty: keyof T
  apiFunction: ApiFunction
  errorHandler?: ErrorHandler
}
type ActionFunction<T> = (this: T, ...args: any[]) => Promise<void>

export const mapFetchActions = <T>(
  actionsMapping: Record<string, MapFetchActionsOptions<T>>,
  errorHandler?: ErrorHandler
): Record<string, ActionFunction<T>> => {
  const actions: Record<string, ActionFunction<T>> = {}

  for (const [actionName, options] of Object.entries(actionsMapping)) {
    actions[actionName] = async function (this: any, ...args: any[]) {
      try {
        this[options.stateProperty as string] = await options.apiFunction(...args)
      } catch (error) {
        if (options.errorHandler != null) {
          options.errorHandler(error)
        } else if (errorHandler != null) {
          errorHandler(error)
        } else {
          throw error
        }
      }
    }
  }

  return actions
}

function generateNamesFromKey(key: string | number | symbol): [string, string] {
  let keyStr: string

  if (typeof key === 'symbol') {
    const description = Symbol.keyFor(key)
    if (description == null) {
      throw new Error('Cannot generate names from a symbol without a description')
    }
    keyStr = description
  } else {
    keyStr = key.toString()
  }

  const actionName = `get${keyStr.charAt(0).toUpperCase()}${keyStr.slice(1)}`
  const apiFunctionName = `fetch${keyStr.charAt(0).toUpperCase()}${keyStr.slice(1)}`

  return [actionName, apiFunctionName]
}

export const simplifiedMapFetchActions = <T>(
  stateProperties: Array<keyof T>,
  api: Record<string, ApiFunction>,
  errorHandler?: ErrorHandler
): Record<string, ActionFunction<T>> => {
  const actionsOptions: Record<string, MapFetchActionsOptions<T>> = {}

  for (const stateProperty of stateProperties) {
    const [actionName, apiFunctionName] = generateNamesFromKey(stateProperty)

    const apiFunction = api[apiFunctionName]

    actionsOptions[actionName] = {
      stateProperty,
      apiFunction,
    }
  }

  return mapFetchActions(actionsOptions, errorHandler)
}

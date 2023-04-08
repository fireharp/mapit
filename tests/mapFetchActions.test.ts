import { mapFetchActions } from '../src/'

interface TestState {
  data: null | { message: string }
}

interface ApiResponse {
  message: string
}

describe('mapFetchActions', () => {
  test('should create a mapped action', async () => {
    const state: TestState = {
      data: null,
    }

    const apiFunction = async (): Promise<ApiResponse> => {
      return { message: 'Hello, World!' }
    }

    const actionsMapping = {
      fetchData: {
        stateProperty: 'data' as const,
        apiFunction,
      },
    }

    const actions = mapFetchActions<TestState>(actionsMapping)

    await actions.fetchData.call(state)

    expect(state.data).toEqual({ message: 'Hello, World!' })
  })

  test('should handle errors', async () => {
    const state: TestState = {
      data: null,
    }

    const apiFunction = async (): Promise<ApiResponse> => {
      throw new Error('API Error')
    }

    const errorHandler = jest.fn()

    const actionsMapping = {
      fetchData: {
        stateProperty: 'data' as const,
        apiFunction,
        errorHandler,
      },
    }

    const actions = mapFetchActions<TestState>(actionsMapping)

    await actions.fetchData.call(state)

    expect(errorHandler).toHaveBeenCalledWith(new Error('API Error'))
  })
})

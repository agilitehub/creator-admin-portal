import State from './state'
import Enums from './resources/enums'

const reducer = (state = State, action) => {
  let data = []

  switch (action.type) {
    case Enums.reducers.SET_RECORDS:
      data = action.payload

      return {
        ...state,
        data
      }
    default:
      return state
  }
}

export default reducer

import Thunk from 'redux-thunk'
import { legacy_createStore as createStore, combineReducers, applyMiddleware } from 'redux'
import { initCustomReducers } from './agilite-react-setup'
import { composeWithDevTools } from 'redux-devtools-extension'

// Reducers
import agiliteReactReducer from './agilite-react/reducer'
const customReducers = initCustomReducers()

const initialState = {}
const devTools =
  process.env.NODE_ENV === 'production' ? applyMiddleware(Thunk) : composeWithDevTools(applyMiddleware(Thunk))

export const store = createStore(
  combineReducers({
    agiliteReact: agiliteReactReducer,
    ...customReducers
  }),
  initialState,
  devTools
)

export default store

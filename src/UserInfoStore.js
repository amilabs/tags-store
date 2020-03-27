import ReduceStore from 'flux/lib/FluxReduceStore'
import dispatcher from './dispatcher'
import localStore from './localStore'
import {
  UPDATE_USERNAME,
  RESET_FROM_STORE,
  CLEAR_DATABASE,
  RESET_FROM_DATA,
} from './actions'
import appStore from './AppStore'

const lastLogin = Date.now()

const INITIAL_STATE = {}

class UserInfoStore extends ReduceStore {

  get key () {
    return 'userInfo'
  }

  get actions () {
    return {
      [RESET_FROM_STORE]: this.handleResetFromStore,
      [UPDATE_USERNAME]: this.handleUpdateUsername,
      [CLEAR_DATABASE]: this.handleClearDatabase,
      [RESET_FROM_DATA]: this.handleResetFromData,
    }
  }

  getInitialState () {
    const state = localStore.store(this.key) || INITIAL_STATE
    if (!state.dateCreated) {
      state.dateCreated = Date.now()
    }
    if (lastLogin > state.lastLogin) {
      state.lastLogin = lastLogin
    }
    return state
  }

  getExportJSON () {
    const state = this.getState()
    return {
      userInfo: {
        userName: state.userName,
      }
    }
  }

  reduce (state, action) {
    if (action.type && typeof this.actions[action.type] === 'function') {
      return this.actions[action.type](state, action)
    }

    return state
  }

  handleResetFromData = (state, action) => {
    this.getDispatcher().waitFor([
      appStore.getDispatchToken(),
    ])

    const data = action.payload

    if (data.userInfo) {
      return {
        userName: data.userInfo.userName,
      }
    }

    return INITIAL_STATE
  }

  handleClearDatabase = (state) => {
    this.getDispatcher().waitFor([
      appStore.getDispatchToken(),
    ])

    return {
      ...state,
    }
  }

  handleResetFromStore = () => {
    this.getDispatcher().waitFor([
      appStore.getDispatchToken(),
    ])

    return this.getInitialState()
  }

  handleUpdateUsername = (state, action) => {
    return {
      ...state,
      userName: action.payload,
    }
  }
}

export default new UserInfoStore(dispatcher)

import ReduceStore from 'flux/lib/FluxReduceStore'
import dispatcher from './dispatcher'
import localStore from './localStore'
import {
  CLEAR_DATABASE,
  RESET_FROM_DATA,
  RESET_FROM_STORE,
  TOGGLE_PUSH_CHANGES,
  TOGGLE_SHOW_DIALOG_HELP,
  TOGGLE_SYNC_TAGS_AND_NOTES,
  UPDATE_LAST_SYNC_TIME,
  UPDATE_LAST_SYNC_CALL,
  UPDATE_NOTIFICATION_CHANNELS,
} from './actions'

class AppStore extends ReduceStore {

  get key () {
    return 'app'
  }

  get actions () {
    return {
      [CLEAR_DATABASE]: this.handleClearDatabase,
      [RESET_FROM_DATA]: this.handleResetFromData,
      [RESET_FROM_STORE]: this.handleResetFromStore,
      [TOGGLE_PUSH_CHANGES]: this.handleTogglePushChanges,
      [TOGGLE_SHOW_DIALOG_HELP]: this.handleToggleShowDialogHelp,
      [TOGGLE_SYNC_TAGS_AND_NOTES]: this.handleToggleSyncTagsAndNotes,
      [UPDATE_LAST_SYNC_TIME]: this.handleUpdateLastSyncTime,
      [UPDATE_LAST_SYNC_CALL]: this.handleUpdateLastSyncCall,
      [UPDATE_NOTIFICATION_CHANNELS]: this.handleUpdateNotificationChannels,
    }
  }

  getInitialState () {
    const state = {
      ...localStore.store(this.key)
    }

    if (state.showDialogHelp === undefined) {
      state.showDialogHelp = true
    }

    if (state.pushChanges === undefined) {
      state.pushChanges = true
    }

    if (state.lastSyncedAt === undefined) {
      state.lastSyncedAt = 1
    }

    if (state.lastSyncCall === undefined) {
      state.lastSyncCall = 0
    }

    if (state.syncTagsAndNotes === undefined) {
      state.syncTagsAndNotes = true
    }

    if (!Array.isArray(state.notificationChannels)) {
      state.notificationChannels = []
    }

    return state
  }

  getStoreState () {
    return this.getState()
  }

  canSyncTagsAndNotes () {
    return this.getState().syncTagsAndNotes
  }

  canShowDialogHelp () {
    return this.getState().showDialogHelp
  }

  canPushChanges () {
    return this.getState().pushChanges
  }

  getLastSyncedAt () {
    return this.getState().lastSyncedAt || 1
  }

  getLastSyncCall () {
    return this.getState().lastSyncCall || 0
  }

  getNotificationChannels () {
    return this.getState().notificationChannels || []
  }

  reduce (state, action) {
    if (action.type && typeof this.actions[action.type] === 'function') {
      return this.actions[action.type](state, action)
    }

    return state
  }

  handleResetFromData = (state) => {
    return state
    // return {
    //   ...state,
    //   lastSyncedAt: 1,
    // }
  }

  handleResetFromStore = () => {
    return this.getInitialState()
  }

  handleTogglePushChanges = (state, action) => {
    return {
      ...state,
      // при обновоении признака возможна ситуации когда прилетела обновленная дата,
      // которая не была сохранена в сторе, но есть в локал сторадже
      ...this.getInitialState(),
      pushChanges: typeof (action.payload) === 'boolean' ? action.payload : !state.pushChanges,
    }
  }

  handleUpdateLastSyncTime = (state, action) => {
    if (state.lastSyncedAt === action.payload) {
      return state
    }

    return {
      ...state,
      lastSyncedAt: action.payload,
    }
  }

  handleUpdateLastSyncCall = (state) => {
    return {
      ...state,
      lastSyncCall: Date.now(),
    }
  }

  handleClearDatabase = (state) => {
    return {
      ...state,
      lastSyncedAt: 1,
    }
  }

  handleToggleShowDialogHelp = (state, action) => {
    return {
      ...state,
      showDialogHelp: Boolean(action.payload),
    }
  }

  handleToggleSyncTagsAndNotes = (state, action) => {
    return {
      ...state,
      syncTagsAndNotes: Boolean(action.payload),
    }
  }

  handleUpdateNotificationChannels = (state, action) => {
    if (Array.isArray(action.payload)) {
      return {
        ...state,
        notificationChannels: action.payload,
      }
    }

    return state
  }
}

export default new AppStore(dispatcher)

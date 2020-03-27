import ReduceStore from 'flux/lib/FluxReduceStore'
import dispatcher from './dispatcher'
import localStore from './localStore'
import { isEmpty, omit, pickBy, mapValues } from './utils'
import {
  CLEAR_DATABASE,
  MARK_ALL_AS_DIRTY,
  REMOVE_TX,
  REPLACE_TX_NOTE,
  RESET_FROM_DATA,
  RESET_FROM_STORE,
  SYNC_CHANGES,
  UPDATE_DIRTY_STATUS,
} from './actions'
import appStore from './AppStore'

const INITIAL_STATE = {
  items: {},
  tmpRemoved: {},
}

class UserTxsStore extends ReduceStore {

  get key () {
    return 'userTxs'
  }

  get actions () {
    return {
      [CLEAR_DATABASE]: this.handleClearDatabase,
      [MARK_ALL_AS_DIRTY]: this.handleMarkAllAsDirty,
      [REMOVE_TX]: this.handleRemoveTx,
      [REPLACE_TX_NOTE]: this.handleReplaceTxNote,
      [RESET_FROM_DATA]: this.handleResetFromData,
      [RESET_FROM_STORE]: this.handleResetFromStore,
      [SYNC_CHANGES]: this.handleSyncChanges,
      [UPDATE_DIRTY_STATUS]: this.handleUpdateDirtyStatus,
    }
  }

  createKey (data) {
    return String(data).toLowerCase()
  }

  getInitialState () {
    return localStore.store(this.key) || INITIAL_STATE
  }

  getStoreState () {
    const { items } = this.getState()
    return { items }
  }

  getExportJSON () {
    const state = this.getState()
    return {
      userTxs: {
        items: Object.values(state.items)
          .filter(item => !item.removed)
          .map(item => ({
            txHash: item.txHash,
            txUserNote: item.txUserNote,
            createdTime: item.createdTime,
            updatedTime: item.updatedTime,
          }))
      }
    }
  }

  getItems () {
    const state = this.getState()
    return [].concat(
      Object.values(state?.items ?? {}).filter(item => !item.removed),
      Object.values(state?.tmpRemoved ?? {}),
    )
  }

  getTxNote (tx) {
    const state = this.getState()
    const data = state?.items?.[ this.createKey(tx) ]
    return data && !data.removed && data.txUserNote || ''
  }

  getAllTxsCount () {
    const state = this.getState()
    let cnt = 0
    for (const tx in state.items) {
      const data = state.items[tx]
      if (data && !data.removed) {
        cnt += 1
      }
    }
    return cnt
  }

  getChanges () {
    const state = this.getState()
    const remove = Object.values(
      mapValues(pickBy(state.items, item => item.removed), (item, txHash) => ({
        txHash,
      }))
    )
    const insert = Object.values(
      mapValues(pickBy(state.items, item => (
        item.dirty === 1 &&
        !item.removed
      )), item => ({
        txHash: item.txHash,
        txUserNote: item.txUserNote,
        createdTime: item.createdTime,
        updatedTime: item.updatedTime,
      }))
    )
    const update = Object.values(
      mapValues(pickBy(state.items, item => (
        item.dirty === 2 &&
        !item.removed
      )), item => ({
        txHash: item.txHash,
        txUserNote: item.txUserNote,
        createdTime: item.createdTime,
        updatedTime: item.updatedTime,
      }))
    )

    if (isEmpty(remove) && isEmpty(insert) && isEmpty(update)) {
      return
    }

    return {
      userTx: {
        update,
        insert,
        remove,
      }
    }
  }

  reduce (state, action) {
    if (action.type && typeof this.actions[action.type] === 'function') {
      return this.actions[action.type](state, action)
    }

    return state
  }

  /**
   * Импорт данных из файла
   */
  handleResetFromData = (state, action) => {
    this.getDispatcher().waitFor([
      appStore.getDispatchToken(),
    ])

    const data = action.payload

    if (data.userTxs) {
      const now = Date.now()

      return {
        tmpRemoved: {},
        items: data.userTxs.items.reduce((out, item) => {
          out[this.createKey(item.txHash)] = {
            txHash: item.txHash,
            txUserNote: item.txUserNote,
            createdTime: item.createdTime || now,
            updatedTime: item.updatedTime || now,
            dirty: 1,
          }
          return out
        }, {})
      }
    }

    return INITIAL_STATE
  }

  handleClearDatabase = () => {
    this.getDispatcher().waitFor([
      appStore.getDispatchToken(),
    ])

    return INITIAL_STATE
  }

  handleResetFromStore = () => {
    this.getDispatcher().waitFor([
      appStore.getDispatchToken(),
    ])

    return this.getInitialState()
  }

  handleMarkAllAsDirty = (state) => {
    const items = {}
    for (const key in state.items) {
      items[key] = {
        ...state.items[key],
        dirty: state.items[key]?.dirty ?? 1
      }
    }

    return {
      ...state,
      items,
    }
  }

  handleSyncChanges = (state, action) => {
    if (isEmpty(action?.payload?.userTx)) {
      return state
    }

    const {
      created,
      updated,
      deleted,
      update,
      insert,
      remove,
    } = action.payload.userTx

    if (!isEmpty(deleted) || !isEmpty(remove)) {
      const keys = (deleted || remove).map(item => this.createKey(item?.txHash ?? item))
      state = {
        ...state,
        items: omit(state.items, keys)
      }
    }

    if (isEmpty(created) && isEmpty(insert) && isEmpty(updated) && isEmpty(update)) {
      return state
    }

    const keys = [].concat(
      (created || insert)?.map?.(item => this.createKey(item.txHash)) ?? [],
      (updated || update)?.map?.(item => this.createKey(item.txHash)) ?? [],
    )

    state = {
      ...state,
      tmpRemoved: omit(state.tmpRemoved, keys),
      items: {
        ...state?.items,
        ...(created || insert)?.reduce?.((out, item) => Object.assign(out, { [ this.createKey(item.txHash) ]: item }), {}),
        ...(updated || update)?.reduce?.((out, item) => Object.assign(out, { [ this.createKey(item.txHash) ]: item }), {}),
      },
    }

    return state
  }

  handleReplaceTxNote = (state, action) => {
    const now = Date.now()
    const data = action.payload
    const key = this.createKey(data.txHash)
    let prevData = state?.items?.[key]
    prevData = prevData && !prevData.removed ? prevData : undefined

    if (!data.note) {
      if (!prevData) {
        return state
      }

      const item = {
        createdTime: now,
        ...prevData,
        txHash: data.txHash,
        txUserNote: data.note,
        removed: true,
        updatedTime: now,
      }

      return {
        ...state,
        tmpRemoved: { ...state?.tmpRemoved, [key]: item },
        items: prevData?.dirty === 1 ?
          omit(state.items, [key]) :
          { ...state?.items, [key]: item },
      }
    }

    const item = {
      createdTime: now,
      ...prevData,
      txHash: data.txHash,
      txUserNote: data.note,
      dirty: prevData ? (prevData.dirty || 2) : 1,
      removed: false,
      updatedTime: now,
    }

    return {
      ...state,
      tmpRemoved: omit(state?.tmpRemoved, [ key ]),
      items: { ...state?.items, [key]: item },
    }
  }

  handleRemoveTx = (state, action) => {
    const key = this.createKey(action.payload)
    const prevData = state?.items?.[key]
    const item = { ...prevData, removed: true }

    return {
      ...state,
      tmpRemoved: { ...state?.tmpRemoved, [key]: item },
      items: prevData?.dirty === 1 ?
        omit(state.items, [key]) :
        { ...state?.items, [key]: item },
    }
  }

  handleUpdateDirtyStatus = (state, action) => {
    const txs = action?.payload?.txs ?? []
    const from = action?.payload?.from
    const to = action?.payload?.to

    if (isEmpty(txs) || !from || !to) {
      return state
    }

    const items = {}
    for (const key in state.items) {
      const dirty = state.items[key]?.dirty
      if (dirty === from && txs.indexOf(key) !== -1) {
        items[key] = {
          ...state.items[key],
          dirty: to
        }
      } else {
        items[key] = state.items[key]
      }
    }

    return {
      ...state,
      items,
    }
  }

}

export default new UserTxsStore(dispatcher)

import ReduceStore from 'flux/lib/FluxReduceStore'
import dispatcher from './dispatcher'
import localStore from './localStore'
import { isEmpty, isEqual, pick, omit, pickBy, mapValues, uniqBy, differenceBy, intersectionBy, validate } from './utils'
import {
  ADD_TX_TAG,
  CLEAR_DATABASE,
  MARK_ALL_AS_DIRTY,
  MERGE_DATA,
  REMOVE_TX_TAG,
  REMOVE_TX,
  REPLACE_TX_TAGS_AND_NOTE,
  REPLACE_TX_NOTE,
  RESET_FROM_DATA,
  RESET_FROM_STORE,
  SYNC_CHANGES,
  UPDATE_DIRTY_STATUS,
} from './actions'
import appStore from './AppStore'
import userTagsStore from './UserTagsStore'

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
      [ADD_TX_TAG]: this.handleAddTxTag,
      [CLEAR_DATABASE]: this.handleClearDatabase,
      [MARK_ALL_AS_DIRTY]: this.handleMarkAllAsDirty,
      [MERGE_DATA]: this.handleMergeData,
      [REMOVE_TX_TAG]: this.handleRemoveTxTag,
      [REMOVE_TX]: this.handleRemoveTx,
      [REPLACE_TX_TAGS_AND_NOTE]: this.handleReplaceTxTagsAndNote,
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

  validateValue (item) {
    return {
      txHash: item.txHash,
      txTags: Array.isArray(item.txTags) ? item.txTags : [],
      txUserNote: String(item.txUserNote || ''),
      createdTime: item.createdTime,
      updatedTime: item.updatedTime,
    }
  }

  setDescriptor (data) {
    this.descriptor = data
  }

  getInitialState () {
    return localStore.store(this.key) || INITIAL_STATE
  }

  getStoreState () {
    const { items } = this.getState()
    return { items }
  }

  getExportJSON ({ types }) {
    const ignore = []
    if (Array.isArray(types)) {
      if (types.indexOf('tags') === -1) {
        ignore.push('txTags')
      }
      if (types.indexOf('notes') === -1) {
        ignore.push('txUserNote')
      }
    }

    const state = this.getState()
    return {
      userTxs: {
        items: Object.values(state.items)
          .filter(item => !item.removed)
          .map(item => omit(this.validateValue(item), ignore))
          .filter(item => !this.isEmptyTx(item))
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

  getTxTags (tx, withRemoved) {
    const state = this.getState()
    const data = state?.items?.[ this.createKey(tx) ]
    return data && (withRemoved || !data.removed) && data.txTags || []
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

  getItemStatus (tx) {
    const key = this.createKey(tx)
    const state = this.getState()
    const data = state?.items?.[ key ] || {}
    return {
      updatedTime: data.updatedTime || 0,
      isExists: Boolean(state && state.items && Object.hasOwnProperty.call(state.items, key)),
      isInserted: !data.removed && data.dirty === 1,
      isUpdated: !data.removed && data.dirty === 2,
      isRemoved: !!data.removed,
      isWatching: false,
    }
  }

  canRemove (tx) {
    const key = this.createKey(tx)
    const state = this.getState()
    const data = state?.items?.[ key ]

    if (!data || data.removed) {
      return false
    }

    return true
  }

  getAllTxTagsCount () {
    const state = this.getState()
    let cnt = 0
    for (const tx in state.items) {
      const data = state.items?.[tx]
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
      )), item => this.validateValue(item))
    )
    const update = Object.values(
      mapValues(pickBy(state.items, item => (
        item.dirty === 2 &&
        !item.removed
      )), item => this.validateValue(item))
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

  isEmptyTx (data) {
    return (
      isEmpty(data.txTags) &&
      isEmpty(data.txUserNote)
    )
  }

  handleMergeData = (state, action) => {
    this.getDispatcher().waitFor([
      userTagsStore.getDispatchToken(),
    ])

    let data = action?.payload?.data?.userTxs?.items || []
    data = Array.isArray(data) ? data : []

    if (isEmpty(data)) {
      return state
    }

    const now = Date.now()
    const isTargetPriority = action.payload.isTargetPriority
    let items = data.reduce((out, item) => {
      const key = this.createKey(item.txHash)
      const currentData = state?.items?.[key]
      const nextData = this.validateValue({
        txHash: item.txHash,
        txTags: uniqBy([].concat(currentData?.txTags ?? [], item.txTags), tag => userTagsStore.createKey(tag)),
        txUserNote: isTargetPriority ? (currentData?.txUserNote || item.txUserNote) : (item.txUserNote || currentData?.txUserNote),
        createdTime: isTargetPriority ?
          (currentData?.createdTime || item.createdTime || now) :
          ((item.createdTime && item.updatedTime) ? item.createdTime : (currentData?.createdTime || now)),
        updatedTime: isTargetPriority ?
          (currentData?.updatedTime || item.updatedTime || now) :
          ((item.createdTime && item.updatedTime) ? item.updatedTime : (currentData?.updatedTime || now)),
      })

      if (!currentData) {
        nextData.dirty = 1
      } else if (!isEqual(
        pick(currentData, ['txTags', 'txUserNote', 'createdTime', 'updatedTime']),
        pick(nextData, ['txTags', 'txUserNote', 'createdTime', 'updatedTime'])
      )) {
        nextData.dirty = 2
      }

      out[key] = nextData
      return out
    }, {})

    if (this.descriptor) {
      items = Object.values(items)
        .map(item => ({
          ...item,
          txTags: Array.isArray(item.txTags) ?
            item.txTags.filter(item => userTagsStore.hasTag(item)) : [],
        }))
        .filter(item => validate(item, this.descriptor))
        .reduce((out, item) => {
          out[this.createKey(item.txHash)] = item
          return out
        }, {})
    }

    return {
      ...state,
      tmpRemoved: omit(state?.tmpRemoved, Object.keys(items)),
      items: { ...state?.items, ...items },
    }
  }

  /**
   * Импорт данных из файла
   */
  handleResetFromData = (state, action) => {
    this.getDispatcher().waitFor([
      appStore.getDispatchToken(),
      userTagsStore.getDispatchToken(),
    ])

    let data = action.payload?.userTxs?.items || []
    data = Array.isArray(data) ? data : []

    data = data.map(item => ({
      ...item,
      txTags: Array.isArray(item.txTags) ?
        item.txTags.filter(item => userTagsStore.hasTag(item)) : [],
    }))

    if (this.descriptor) {
      data = data.filter(item => validate(item, this.descriptor))
    }

    const prevData = Object.values(state.items || {})
    const created = differenceBy(data, prevData, item => this.createKey(item.txHash))
    const removed = differenceBy(prevData, data, item => this.createKey(item.txHash))
    const updated = intersectionBy(data, prevData, item => this.createKey(item.txHash))
    const now = Date.now()
    const create = item => ({
      ...this.validateValue(item),
      createdTime: item.createdTime || now,
      updatedTime: item.updatedTime || now,
    })

    return {
      tmpRemoved: {},
      items: {
        ...(created.reduce((out, item) => {
          out[this.createKey(item.txHash)] = {
            ...create(item),
            dirty: 1,
          }
          return out
        }, {})),

        ...(updated.reduce((out, item) => {
          out[this.createKey(item.txHash)] = {
            ...create(item),
            dirty: 2,
          }
          return out
        }, {})),

        ...(removed.reduce((out, item) => {
          out[this.createKey(item.txHash)] = {
            ...create(item),
            removed: true,
          }
          return out
        }, {})),
      },
    }
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

  handleRemoveTxTag = (state, action) => {
    const now = Date.now()
    const data = action.payload
    const keyTag = userTagsStore.createKey(data.tag)
    const keyTx = this.createKey(data.txHash)
    const prevData = state?.items?.[keyTx] ?? state?.tmpRemoved?.[keyTx]
    const prevDataActive = prevData && !prevData.removed ? prevData : undefined
    const txTags = (prevData?.txTags ?? []).filter(item => userTagsStore.createKey(item) !== keyTag)
    const nextData = {
      createdTime: now,
      ...prevData,
      txHash: data.txHash,
      txTags,
      updatedTime: now,
    }

    if (this.isEmptyTx(nextData)) {
      if (nextData.removed || !prevDataActive) {
        return state
      }

      nextData.removed = true

      return {
        ...state,
        tmpRemoved: { ...state?.tmpRemoved, [ keyTx ]: nextData },
        items: prevDataActive?.dirty === 1 ?
          omit(state.items, [ keyTx ]) :
          { ...state?.items, [ keyTx ]: nextData },
      }
    }

    if (
      prevDataActive &&
      isEqual(prevDataActive.txTags, nextData.txTags)
    ) {
      return state
    }

    nextData.dirty = prevDataActive ? (prevDataActive.dirty || 2) : 1
    nextData.removed = false

    return {
      ...state,
      tmpRemoved: omit(state?.tmpRemoved, [ keyTx ]),
      items: { ...state?.items, [ keyTx ]: nextData },
    }
  }

  handleAddTxTag = (state, action) => {
    this.getDispatcher().waitFor([
      userTagsStore.getDispatchToken(),
    ])

    const data = action.payload
    const keyTag = userTagsStore.createKey(data.tag)
    const keyTx = this.createKey(data.txHash)
    const prevData = state?.items?.[keyTx] ?? state?.tmpRemoved?.[keyTx]
    const prevDataActive = prevData && !prevData.removed ? prevData : undefined
    const txTags = uniqBy((prevData?.txTags ?? []).concat(data.tag), item => userTagsStore.createKey(item))
    const now = Date.now()

    return {
      ...state,
      tmpRemoved: omit(state?.tmpRemoved, [ keyTx ]),
      items: {
        ...state?.items,
        [ keyTx ]: {
          createdTime: now,
          ...prevData,
          txHash: data.txHash,
          txTags,
          dirty: prevDataActive ? (prevDataActive.dirty || 2) : 1,
          removed: false,
          updatedTime: now,
        },
      },
    }
  }

  handleReplaceTxTagsAndNote = (state, action) => {
    this.getDispatcher().waitFor([
      userTagsStore.getDispatchToken(),
    ])

    const data = action.payload
    const keyTx = this.createKey(data.txHash)
    const prevData = state?.items?.[keyTx] ?? state?.tmpRemoved?.[keyTx]
    const prevDataActive = prevData && !prevData.removed ? prevData : undefined
    const txTags = uniqBy(data.tags, item => userTagsStore.createKey(item))
    const now = Date.now()
    const nextData = {
      createdTime: now,
      ...prevData,
      txHash: data.txHash,
      txTags,
      txUserNote: data.note,
      updatedTime: now,
    }

    if (this.isEmptyTx(nextData)) {
      if (nextData.removed || !prevDataActive) {
        return state
      }

      nextData.removed = true

      return {
        ...state,
        tmpRemoved: { ...state?.tmpRemoved, [ keyTx ]: nextData },
        items: prevDataActive?.dirty === 1 ?
          omit(state.items, [ keyTx ]) :
          { ...state?.items, [ keyTx ]: nextData },
      }
    }

    if (
      prevDataActive &&
      isEqual(prevDataActive.txTags, nextData.txTags) &&
      isEqual(prevDataActive.txUserNote, nextData.txUserNote)
    ) {
      return state
    }

    nextData.dirty = prevDataActive ? (prevDataActive.dirty || 2) : 1
    nextData.removed = false

    return {
      ...state,
      tmpRemoved: omit(state?.tmpRemoved, [ keyTx ]),
      items: { ...state?.items, [ keyTx ]: nextData },
    }
  }

  handleSyncChanges = (state, action) => {
    this.getDispatcher().waitFor([
      userTagsStore.getDispatchToken(),
    ])

    if (!action?.payload?.userTx) {
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

    const keys = [].concat(
      (created || insert)?.map?.(item => this.createKey(item.txHash)) ?? [],
      (updated || update)?.map?.(item => this.createKey(item.txHash)) ?? [],
    )

    state = {
      ...state,
      tmpRemoved: omit(state.tmpRemoved, keys),
      items: {
        ...state?.items,
        ...(created || insert)?.reduce?.((out, item) => Object.assign(out, {
          [ this.createKey(item.txHash) ]: {
            ...item,
            createdTime: item.clientCreatedTime || item.createdTime,
            updatedTime: item.clientUpdatedTime || item.updatedTime,
          }
        }), {}),
        ...(updated || update)?.reduce?.((out, item) => Object.assign(out, {
          [ this.createKey(item.txHash) ]: {
            ...item,
            createdTime: item.clientCreatedTime || item.createdTime,
            updatedTime: item.clientUpdatedTime || item.updatedTime,
          }
        }), {}),
      },
    }

    return state
  }

  handleReplaceTxNote = (state, action) => {
    const now = Date.now()
    const data = action.payload
    const key = this.createKey(data.txHash)
    const prevData = state?.items?.[key] ?? state?.tmpRemoved?.[key]
    const prevDataActive = prevData && !prevData.removed ? prevData : undefined
    const nextData = {
      createdTime: now,
      ...prevData,
      txHash: data.txHash,
      txUserNote: data.note,
      updatedTime: now,
    }

    if (this.isEmptyTx(nextData)) {
      if (nextData.removed || !prevDataActive) {
        return state
      }

      nextData.removed = true

      return {
        ...state,
        tmpRemoved: { ...state?.tmpRemoved, [ key ]: nextData },
        items: prevDataActive?.dirty === 1 ?
          omit(state.items, [ key ]) :
          { ...state?.items, [ key ]: nextData },
      }
    }

    if (
      prevDataActive &&
      isEqual(prevDataActive.txUserNote, nextData.txUserNote)
    ) {
      return state
    }

    nextData.dirty = prevDataActive ? (prevDataActive.dirty || 2) : 1
    nextData.removed = false

    return {
      ...state,
      tmpRemoved: omit(state?.tmpRemoved, [ key ]),
      items: { ...state?.items, [ key ]: nextData },
    }
  }

  handleRemoveTx = (state, action) => {
    const key = this.createKey(action.payload)
    const prevData = state?.items?.[key]

    if (!prevData || prevData.removed) {
      return state
    }

    const item = {
      ...prevData,
      removed: true,
      updatedTime: Date.now(),
    }

    return {
      ...state,
      tmpRemoved: { ...state?.tmpRemoved, [key]: item },
      items: prevData?.dirty === 1 ?
        omit(state.items, [key]) :
        { ...state?.items, [key]: item },
    }
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

  handleUpdateDirtyStatus = (state, action) => {
    let txs = action?.payload?.txs ?? []
    const from = action?.payload?.from
    const to = action?.payload?.to

    if (isEmpty(txs) || !from || !to) {
      return state
    }

    txs = txs.map(item => this.createKey(item))

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

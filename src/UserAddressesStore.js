import ReduceStore from 'flux/lib/FluxReduceStore'
import dispatcher from './dispatcher'
import localStore from './localStore'
import { isEmpty, isEqual, pick, omit, pickBy, mapValues, uniqBy, differenceBy, intersectionBy, validate, compact } from './utils'
import {
  ADD_ADDRESS_TAG,
  CLEAR_DATABASE,
  MARK_ALL_AS_DIRTY,
  MERGE_DATA,
  REMOVE_ADDRESS_TAG,
  REMOVE_ADDRESS,
  RESET_FROM_DATA,
  RESET_FROM_STORE,
  SYNC_CHANGES,
  UPDATE_DIRTY_STATUS,
  REPLACE_ADDRESS_TAGS_AND_NOTE,
  REPLACE_ADDRESS_WATCH,
} from './actions'
import appStore from './AppStore'
import userTagsStore from './UserTagsStore'

const INITIAL_STATE = {
  items: {},
  tmpRemoved: {},
}

class UserAddressesStore extends ReduceStore {

  get key () {
    return 'userAddresses'
  }

  get actions () {
    return {
      [ADD_ADDRESS_TAG]: this.handleAddAddressTag,
      [CLEAR_DATABASE]: this.handleClearDatabase,
      [MARK_ALL_AS_DIRTY]: this.handleMarkAllAsDirty,
      [MERGE_DATA]: this.handleMergeData,
      [REMOVE_ADDRESS_TAG]: this.handleRemoveAddressTag,
      [REMOVE_ADDRESS]: this.handleRemoveAddress,
      [REPLACE_ADDRESS_TAGS_AND_NOTE]: this.handleReplaceAddressTagsAndNote,
      [REPLACE_ADDRESS_WATCH]: this.handleReplaceAddressWatch,
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
      address: item.address,
      addressTags: Array.isArray(item.addressTags) ? item.addressTags : [],
      addressUserNote: String(item.addressUserNote || ''),
      isWatchingDisabled: Boolean(item.isWatchingDisabled),
      watching: Array.isArray(item.watching) ? item.watching : [],
      watchingChannels: Array.isArray(item.watchingChannels) ? item.watchingChannels : [],
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

  getExportJSON () {
    const state = this.getState()
    return {
      userAddresses: {
        items: Object.values(state.items)
          .filter(item => !item.removed)
          .map(item => this.validateValue(item))
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

  getAddressNote (address) {
    const state = this.getState()
    const data = state?.items?.[ this.createKey(address) ]
    return data && !data.removed && data.addressUserNote || ''
  }

  getAddressTags (address) {
    const state = this.getState()
    const data = state?.items?.[ this.createKey(address) ]
    return data && !data.removed && data.addressTags || []
  }

  getAddressWatch (address) {
    const state = this.getState()
    const data = state?.items?.[ this.createKey(address) ]
    return data && !data.removed && {
      isWatchingDisabled: !!data.isWatchingDisabled,
      watching: Array.isArray(data.watching) ? data.watching : [],
      watchingChannels: Array.isArray(data.watchingChannels) ? data.watchingChannels : [],
    } || {
      isWatchingDisabled: false,
      watching: [],
      watchingChannels: [],
    }
  }

  getItemStatus (address) {
    const state = this.getState()
    const data = state?.items?.[ this.createKey(address) ] || {}
    return {
      updatedTime: data.updatedTime || 0,
      isInserted: !data.removed && data.dirty === 1,
      isUpdated: !data.removed && data.dirty === 2,
      isRemoved: !!data.removed,
      isWatching: Boolean(
        !data.isWatchingDisabled &&
        !isEmpty(data.watching) &&
        !isEmpty(data.watchingChannels)
      ),
    }
  }

  getAllAddressTagsCount () {
    const state = this.getState()
    let cnt = 0
    for (const addr in state.items) {
      const data = state.items?.[addr]
      if (data && !data.removed) {
        cnt += 1
      }
    }
    return cnt
  }

  getChanges (/* timestamp */) {
    const state = this.getState()
    const remove = Object.values(
      mapValues(pickBy(state.items, item => item.removed), (item, address) => ({
        address,
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
      userAddress: {
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

  isEmptyAddress (data) {
    return (
      !data.isWatchingDisabled &&
      isEmpty(data.watching) &&
      isEmpty(data.watchingChannels) &&
      isEmpty(data.addressTags) &&
      isEmpty(data.addressUserNote)
    )
  }

  handleMergeData = (state, action) => {
    this.getDispatcher().waitFor([
      userTagsStore.getDispatchToken(),
    ])

    let data = action?.payload?.data?.userAddresses?.items || []
    data = Array.isArray(data) ? data : []

    if (isEmpty(data)) {
      return state
    }

    const now = Date.now()
    const isTargetPriority = action.payload.isTargetPriority
    let items = data.reduce((out, item) => {
      const key = this.createKey(item.address)
      const currentData = state?.items?.[key]
      const nextData = {
        address: item.address,
        addressTags: uniqBy([].concat(currentData?.addressTags ?? [], item.addressTags), tag => userTagsStore.createKey(tag)),
        addressUserNote: isTargetPriority ? (currentData?.addressUserNote || item.addressUserNote) : (item.addressUserNote || currentData?.addressUserNote),
        isWatchingDisabled: isTargetPriority ? (currentData?.isWatchingDisabled ?? item.isWatchingDisabled) : (item?.isWatchingDisabled ?? currentData?.isWatchingDisabled),
        watching: isTargetPriority ? (currentData?.watching || item.watching) : (item.watching || currentData?.watching),
        watchingChannels: isTargetPriority ? (currentData?.watchingChannels || item.watchingChannels) : (item.watchingChannels || currentData?.watchingChannels),
        createdTime: isTargetPriority ?
          (currentData?.createdTime || item.createdTime || now) :
          ((item.createdTime && item.updatedTime) ? item.createdTime : (currentData?.createdTime || now)),
        updatedTime: isTargetPriority ?
          (currentData?.updatedTime || item.updatedTime || now) :
          ((item.createdTime && item.updatedTime) ? item.updatedTime : (currentData?.updatedTime || now)),
      }

      if (!currentData) {
        nextData.dirty = 1
      } else if (!isEqual(
        pick(currentData, ['addressTags', 'addressUserNote', 'isWatchingDisabled', 'watching', 'watchingChannels', 'createdTime', 'updatedTime']),
        pick(nextData, ['addressTags', 'addressUserNote', 'isWatchingDisabled', 'watching', 'watchingChannels', 'createdTime', 'updatedTime'])
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
          addressTags: Array.isArray(item.addressTags) ?
            item.addressTags.filter(item => userTagsStore.hasTag(item)) : [],
        }))
        .filter(item => validate(item, this.descriptor))
        .reduce((out, item) => {
          out[this.createKey(item.address)] = item
          return out
        }, {})
    }

    return {
      ...state,
      tmpRemoved: omit(state?.tmpRemoved, Object.keys(items)),
      items: { ...state?.items, ...items },
    }
  }

  handleResetFromData = (state, action) => {
    this.getDispatcher().waitFor([
      appStore.getDispatchToken(),
      userTagsStore.getDispatchToken(),
    ])

    let data = action.payload?.userAddresses?.items || []
    data = Array.isArray(data) ? data : []

    data = data.map(item => ({
      ...item,
      addressTags: Array.isArray(item.addressTags) ?
        item.addressTags.filter(item => userTagsStore.hasTag(item)) : [],
    }))

    if (this.descriptor) {
      data = data.filter(item => validate(item, this.descriptor))
    }

    const prevData = Object.values(state.items || {})
    const created = differenceBy(data, prevData, item => this.createKey(item.address))
    const removed = differenceBy(prevData, data, item => this.createKey(item.address))
    const updated = intersectionBy(data, prevData, item => this.createKey(item.address))
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
          out[this.createKey(item.address)] = {
            ...create(item),
            dirty: 1,
          }
          return out
        }, {})),

        ...(updated.reduce((out, item) => {
          out[this.createKey(item.address)] = {
            ...create(item),
            dirty: 2,
          }
          return out
        }, {})),

        ...(removed.reduce((out, item) => {
          out[this.createKey(item.address)] = {
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

  handleRemoveAddressTag = (state, action) => {
    const now = Date.now()
    const data = action.payload
    const keyTag = userTagsStore.createKey(data.tag)
    const keyAddress = this.createKey(data.address)
    const prevData = state?.items?.[keyAddress] ?? state?.tmpRemoved?.[keyAddress]
    const prevDataActive = prevData && !prevData.removed ? prevData : undefined
    const addressTags = (prevData?.addressTags ?? []).filter(item => userTagsStore.createKey(item) !== keyTag)
    const nextData = {
      createdTime: now,
      ...prevData,
      address: data.address,
      addressTags,
      updatedTime: now,
    }

    if (this.isEmptyAddress(nextData)) {
      if (nextData.removed) {
        return state
      }

      nextData.removed = true

      return {
        ...state,
        tmpRemoved: { ...state?.tmpRemoved, [ keyAddress ]: nextData },
        items: prevDataActive?.dirty === 1 ?
          omit(state.items, [ keyAddress ]) :
          { ...state?.items, [ keyAddress ]: nextData },
      }
    }

    if (
      prevDataActive &&
      isEqual(prevDataActive.addressTags, nextData.addressTags)
    ) {
      return state
    }

    nextData.dirty = prevDataActive ? (prevDataActive.dirty || 2) : 1
    nextData.removed = false

    return {
      ...state,
      tmpRemoved: omit(state?.tmpRemoved, [ keyAddress ]),
      items: { ...state?.items, [ keyAddress ]: nextData },
    }
  }

  handleAddAddressTag = (state, action) => {
    this.getDispatcher().waitFor([
      userTagsStore.getDispatchToken(),
    ])

    const data = action.payload
    const keyTag = userTagsStore.createKey(data.tag)
    const keyAddress = this.createKey(data.address)
    const prevData = state?.items?.[keyAddress] ?? state?.tmpRemoved?.[keyAddress]
    const prevDataActive = prevData && !prevData.removed ? prevData : undefined
    const addressTags = uniqBy((prevData?.addressTags ?? []).concat(data.tag), item => userTagsStore.createKey(item))
    const now = Date.now()

    return {
      ...state,
      tmpRemoved: omit(state?.tmpRemoved, [ keyAddress ]),
      items: {
        ...state?.items,
        [ keyAddress ]: {
          createdTime: now,
          ...prevData,
          address: data.address,
          addressTags,
          dirty: prevDataActive ? (prevDataActive.dirty || 2) : 1,
          removed: false,
          updatedTime: now,
        },
      },
    }
  }

  handleReplaceAddressTagsAndNote = (state, action) => {
    this.getDispatcher().waitFor([
      userTagsStore.getDispatchToken(),
    ])

    const data = action.payload
    const keyAddress = this.createKey(data.address)
    const prevData = state?.items?.[keyAddress] ?? state?.tmpRemoved?.[keyAddress]
    const prevDataActive = prevData && !prevData.removed ? prevData : undefined
    const addressTags = uniqBy(data.tags, item => userTagsStore.createKey(item))
    const now = Date.now()
    const nextData = {
      createdTime: now,
      ...prevData,
      address: data.address,
      addressTags,
      addressUserNote: data.note,
      updatedTime: now,
    }

    if (this.isEmptyAddress(nextData)) {
      if (nextData.removed) {
        return state
      }

      nextData.removed = true

      return {
        ...state,
        tmpRemoved: { ...state?.tmpRemoved, [ keyAddress ]: nextData },
        items: prevDataActive?.dirty === 1 ?
          omit(state.items, [ keyAddress ]) :
          { ...state?.items, [ keyAddress ]: nextData },
      }
    }

    if (
      prevDataActive &&
      isEqual(prevDataActive.addressTags, nextData.addressTags) &&
      isEqual(prevDataActive.addressUserNote, nextData.addressUserNote)
    ) {
      return state
    }

    nextData.dirty = prevDataActive ? (prevDataActive.dirty || 2) : 1
    nextData.removed = false

    return {
      ...state,
      tmpRemoved: omit(state?.tmpRemoved, [ keyAddress ]),
      items: { ...state?.items, [ keyAddress ]: nextData },
    }
  }

  handleReplaceAddressWatch = (state, action) => {
    const data = action.payload
    const keyAddress = this.createKey(data.address)
    const isWatchingDisabled = Boolean(data.isWatchingDisabled)
    const watching = Array.isArray(data.watching) ? compact(data.watching) : []
    const watchingChannels = Array.isArray(data.watchingChannels) ? compact(data.watchingChannels) : []
    const now = Date.now()
    const prevData = state?.items?.[keyAddress] ?? state?.tmpRemoved?.[keyAddress]
    const prevDataActive = prevData && !prevData.removed ? prevData : undefined
    const nextData = {
      createdTime: now,
      ...prevData,
      isWatchingDisabled,
      watching,
      watchingChannels,
      address: data.address,
      updatedTime: now,
    }

    if (this.isEmptyAddress(nextData)) {
      if (nextData.removed) {
        return state
      }

      nextData.removed = true

      return {
        ...state,
        tmpRemoved: { ...state?.tmpRemoved, [ keyAddress ]: nextData },
        items: prevDataActive?.dirty === 1 ?
          omit(state.items, [ keyAddress ]) :
          { ...state?.items, [ keyAddress ]: nextData },
      }
    }

    if (
      prevDataActive &&
      nextData.isWatchingDisabled === prevDataActive.isWatchingDisabled &&
      isEqual(prevDataActive.watching, nextData.watching) &&
      isEqual(prevDataActive.watchingChannels, nextData.watchingChannels)
    ) {
      return state
    }

    nextData.dirty = prevDataActive ? (prevDataActive.dirty || 2) : 1
    nextData.removed = false

    return {
      ...state,
      tmpRemoved: omit(state?.tmpRemoved, [ keyAddress ]),
      items: { ...state?.items, [ keyAddress ]: nextData },
    }
  }

  handleRemoveAddress = (state, action) => {
    const keyAddress = this.createKey(action.payload)
    const prevData = state?.items?.[keyAddress]

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
      tmpRemoved: { ...state?.tmpRemoved, [ keyAddress ]: item },
      items: prevData?.dirty === 1 ?
        omit(state.items, [ keyAddress ]) :
        { ...state?.items, [ keyAddress ]: item },
    }
  }

  handleSyncChanges = (state, action) => {
    this.getDispatcher().waitFor([
      userTagsStore.getDispatchToken(),
    ])

    if (!action?.payload?.userAddress) {
      return state
    }

    const {
      created,
      updated,
      deleted,
      update,
      insert,
      remove,
    } = action.payload.userAddress

    if (!isEmpty(deleted) || !isEmpty(remove)) {
      const keys = (deleted || remove).map(item => this.createKey(item?.address ?? item))
      state = {
        ...state,
        items: omit(state.items, keys)
      }
    }

    const keys = [].concat(
      (created || insert)?.map?.(item => this.createKey(item.address)) ?? [],
      (updated || update)?.map?.(item => this.createKey(item.address)) ?? [],
    )

    state = {
      ...state,
      tmpRemoved: omit(state.tmpRemoved, keys),
      items: {
        ...state?.items,
        ...(created || insert)?.reduce?.((out, item) => Object.assign(out, {
          [ this.createKey(item.address) ]: {
            ...item,
            createdTime: item.clientCreatedTime || item.createdTime,
            updatedTime: item.clientUpdatedTime || item.updatedTime,
          }
        }), {}),
        ...(updated || update)?.reduce?.((out, item) => Object.assign(out, {
          [ this.createKey(item.address) ]: {
            ...item,
            createdTime: item.clientCreatedTime || item.createdTime,
            updatedTime: item.clientUpdatedTime || item.updatedTime,
          }
        }), {}),
      },
    }

    return state
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
    let addresses = action?.payload?.addresses ?? []
    const from = action?.payload?.from
    const to = action?.payload?.to

    if (isEmpty(addresses) || !from || !to) {
      return state
    }

    addresses = addresses.map(item => this.createKey(item))

    const items = {}
    for (const key in state.items) {
      const dirty = state.items[key]?.dirty
      if (dirty === from && addresses.indexOf(key) !== -1) {
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

export default new UserAddressesStore(dispatcher)

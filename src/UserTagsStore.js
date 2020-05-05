import ReduceStore from 'flux/lib/FluxReduceStore'
import localStore from './localStore'
import dispatcher from './dispatcher'
import { isEmpty, omit, pickBy, mapValues, differenceBy, intersectionBy, validate } from './utils'
import {
  ADD_ADDRESS_TAG,
  CLEAR_DATABASE,
  MARK_ALL_AS_DIRTY,
  MERGE_DATA,
  REPLACE_ADDRESS_TAGS_AND_NOTE,
  RESET_FROM_DATA,
  RESET_FROM_STORE,
  SYNC_CHANGES,
  UPDATE_DIRTY_STATUS,
} from './actions'
import appStore from './AppStore'

const INITIAL_STATE = {
  items: {},
}

class UserTagsStore extends ReduceStore {

  get key () {
    return 'userTags'
  }

  get actions () {
    return {
      [ADD_ADDRESS_TAG]: this.handleAddAddressTag,
      [CLEAR_DATABASE]: this.handleClearDatabase,
      [MARK_ALL_AS_DIRTY]: this.handleMarkAllAsDirty,
      [MERGE_DATA]: this.handleMergeData,
      [REPLACE_ADDRESS_TAGS_AND_NOTE]: this.handleReplaceAddressTagsAndNote,
      [RESET_FROM_DATA]: this.handleResetFromData,
      [RESET_FROM_STORE]: this.handleResetFromStore,
      [SYNC_CHANGES]: this.handleSyncChanges,
      [UPDATE_DIRTY_STATUS]: this.handleUpdateDirtyStatus,
    }
  }

  createKey (data) {
    return String(data).toLowerCase()
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
      userTags: {
        items: Object.values(state.items)
          .filter(item => !item.removed)
          .map(item => ({
            tagName: item.tagName,
            tagUserNote: item.tagUserNote,
          }))
      }
    }
  }

  getTags () {
    const state = this.getState()
    return Object.values(state.items)
      .map(item => item.tagName)
      .sort()
  }

  getTag (key) {
    key = this.createKey(key)
    const state = this.getState()
    return Object.values(state.items).find(item => this.createKey(item.tagName) === key)
  }

  getChanges (/* timestamp */) {
    const state = this.getState()
    const remove = Object.values(
      mapValues(pickBy(state.items, item => item.removed), item => ({
        tagName: item.tagName,
      }))
    )
    const insert = Object.values(
      mapValues(pickBy(state.items, item => (
        item.dirty === 1 &&
        !item.removed
      )), item => ({
        tagName: item.tagName,
        tagUserNote: item.tagUserNote,
      }))
    )
    const update = Object.values(
      mapValues(pickBy(state.items, item => (
        item.dirty === 2 &&
        !item.removed
      )), item => ({
        tagName: item.tagName,
        tagUserNote: item.tagUserNote,
      }))
    )

    if (isEmpty(remove) && isEmpty(insert) && isEmpty(update)) {
      return
    }

    return {
      userTag: {
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

  handleMergeData = (state, action) => {
    if (isEmpty(action?.payload?.data?.userTags?.items)) {
      return state
    }

    let items = action.payload.data.userTags.items.reduce((out, item) => {
      const key = this.createKey(item.tagName)
      out[key] = {
        tagName: item.tagName,
        tagUserNote: item.tagUserNote,
        dirty: state?.items?.[key] ? 2 : 1,
      }
      return out
    }, {})

    if (this.descriptor) {
      items = Object.values(items)
        .filter(item => validate(item, this.descriptor))
        .reduce((out, item) => {
          out[this.createKey(item.tagName)] = item
          return out
        }, {})
    }

    return {
      ...state,
      items: { ...state?.items, ...items },
    }
  }

  handleResetFromData = (state, action) => {
    this.getDispatcher().waitFor([
      appStore.getDispatchToken(),
    ])

    let data = action.payload?.userTags?.items || []
    if (this.descriptor) {
      data = data.filter(item => validate(item, this.descriptor))
    }

    const prevData = Object.values(state.items || {})
    const created = differenceBy(data, prevData, item => this.createKey(item.tagName))
    const removed = differenceBy(prevData, data, item => this.createKey(item.tagName))
    const updated = intersectionBy(data, prevData, item => this.createKey(item.tagName))
    const create = item => ({
      tagName: item.tagName,
      tagUserNote: item.tagUserNote,
    })

    return {
      tmpRemoved: {},
      items: {
        ...(created.reduce((out, item) => {
          out[this.createKey(item.tagName)] = {
            ...create(item),
            dirty: 1,
          }
          return out
        }, {})),

        ...(updated.reduce((out, item) => {
          out[this.createKey(item.tagName)] = {
            ...create(item),
            dirty: 2,
          }
          return out
        }, {})),

        ...(removed.reduce((out, item) => {
          out[this.createKey(item.tagName)] = {
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

  handleAddAddressTag = (state, action) => {
    const tagName = action.payload.tag
    const key = this.createKey(tagName)
    let prevData = state?.items?.[key]
    prevData = prevData && !prevData.removed ? prevData : undefined

    return {
      ...state,
      items: {
        ...state?.items,
        [key]: {
          tagName,
          tagUserNote: undefined,
          dirty: prevData ? (prevData.dirty || 2) : 1,
          removed: false,
        },
      },
    }
  }

  handleReplaceAddressTagsAndNote = (state, action) => {
    if (!action?.payload?.tags) {
      return state
    }

    const tags = action.payload.tags.reduce((out, tagName) => {
      const key = this.createKey(tagName)
      let prevData = state?.items?.[key]
      prevData = prevData && !prevData.removed ? prevData : undefined

      out[key] = {
        tagName,
        tagUserNote: undefined,
        dirty: prevData ? (prevData.dirty || 2) : 1,
        removed: false,
      }
      return out
    }, {})

    return {
      ...state,
      items: {
        ...state?.items,
        ...tags,
      },
    }
  }

  handleSyncChanges = (state, action) => {
    if (!action?.payload?.userTag) {
      return state
    }

    const {
      created,
      updated,
      deleted,
      update,
      insert,
      remove,
    } = action.payload.userTag

    if (!isEmpty(deleted) || !isEmpty(remove)) {
      const keys = (deleted || remove).map(item => this.createKey(item.tagName))
      state = {
        ...state,
        items: omit(state.items, keys)
      }
    }

    state = {
      ...state,
      items: {
        ...state?.items,
        ...(created || insert)?.reduce?.((out, item) => Object.assign(out, {
          [ this.createKey(item.tagName) ]: item
        }), {}),
        ...(updated || update)?.reduce?.((out, item) => Object.assign(out, {
          [ this.createKey(item.tagName) ]: item
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
    const tags = action?.payload?.tags ?? []
    const from = action?.payload?.from
    const to = action?.payload?.to

    if (isEmpty(tags) || !from || !to) {
      return state
    }

    const items = {}
    for (const key in state.items) {
      const dirty = state.items[key]?.dirty
      if (dirty === from && tags.indexOf(key) !== -1) {
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

export default new UserTagsStore(dispatcher)

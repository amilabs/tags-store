import dispatcher from './dispatcher'

export const ADD_TX_TAG = 'add_tx_tag'
export const ADD_ADDRESS_TAG = 'address_tag_add'
export const CLEAR_DATABASE = 'clear_database'
export const MARK_ALL_AS_DIRTY = 'mark_all_as_dirty'
export const MERGE_DATA = 'merge_data'
export const REMOVE_ADDRESS = 'address_remove'
export const REMOVE_ADDRESS_TAG = 'address_tag_remove'
export const REMOVE_TX = 'remove_tx'
export const REMOVE_TX_TAG = 'remove_tx_tag'
export const REPLACE_TX_TAGS_AND_NOTE = 'replace_tx_tags_and_notes'
export const REPLACE_ADDRESS_TAGS_AND_NOTE = 'address_tags_and_note_replace'
export const REPLACE_ADDRESS_WATCH = 'replace_address_watch'
export const REPLACE_TX_NOTE = 'replace_tx_note'
export const RESET_FROM_DATA = 'reset_from_data'
export const RESET_FROM_STORE = 'reset_from_store'
export const SYNC_CHANGES = 'sync_changes'
export const TOGGLE_PUSH_CHANGES = 'toggle_push_changes'
export const TOGGLE_SHOW_DIALOG_HELP = 'toggle_show_dialog_help'
export const TOGGLE_SYNC_TAGS_AND_NOTES = 'toggle_sync_tags_and_notes'
export const UPDATE_DIRTY_STATUS = 'update_dirty_status'
export const UPDATE_LAST_SYNC_TIME = 'update_last_sync_time'
export const UPDATE_LAST_SYNC_CALL = 'update_last_sync_call'
export const UPDATE_NOTIFICATION_CHANNELS = 'update_notification_channels'
export const UPDATE_USERNAME = 'userinfo_username_update'


export const updateLastSyncCall = () => ({
  type: UPDATE_LAST_SYNC_CALL,
})

export const boundUpdateLastSyncCall = () => (
  dispatcher.dispatch(updateLastSyncCall())
)

export const replaceTxNote = (txHash, note) => ({
  type: REPLACE_TX_NOTE,
  payload: { txHash, note },
})

export const boundReplaceTxNote = (txHash, note) => (
  dispatcher.dispatch(replaceTxNote(txHash, note))
)

export const removeTx = (tx) => ({
  type: REMOVE_TX,
  payload: tx,
})

export const boundRemoveTx = (tx) => (
  dispatcher.dispatch(removeTx(tx))
)

export const replaceAddressTagsAndNote = (address, data) => ({
  type: REPLACE_ADDRESS_TAGS_AND_NOTE,
  payload: { address, tags: data.tags, note: data.note },
})

export const boundReplaceAddressTagsAndNote = (address, data) => (
  dispatcher.dispatch(replaceAddressTagsAndNote(address, data))
)

export const replaceTxTagsAndNote = (txHash, data) => ({
  type: REPLACE_TX_TAGS_AND_NOTE,
  payload: { txHash, tags: data.tags, note: data.note },
})

export const boundReplaceTxTagsAndNote = (txHash, data) => (
  dispatcher.dispatch(replaceTxTagsAndNote(txHash, data))
)

export const replaceAddressWatch = (address, data) => ({
  type: REPLACE_ADDRESS_WATCH,
  payload: { address, isWatchingDisabled: data.isWatchingDisabled, watching: data.watching, watchingChannels: data.watchingChannels },
})

export const boundReplaceAddressWatch = (address, data) => (
  dispatcher.dispatch(replaceAddressWatch(address, data))
)

export const addAddressTag = (address, tag) => ({
  type: ADD_ADDRESS_TAG,
  payload: { address, tag },
})

export const boundAddAddressTag = (address, tag) => (
  dispatcher.dispatch(addAddressTag(address, tag))
)

export const addTxTag = (txHash, tag) => ({
  type: ADD_TX_TAG,
  payload: { txHash, tag },
})

export const boundAddTxTag = (txHash, tag) => (
  dispatcher.dispatch(addTxTag(txHash, tag))
)

export const removeAddressTag = (address, tag) => ({
  type: REMOVE_ADDRESS_TAG,
  payload: { address, tag },
})

export const boundRemoveAddressTag = (address, tag) => (
  dispatcher.dispatch(removeAddressTag(address, tag))
)

export const removeTxTag = (txHash, tag) => ({
  type: REMOVE_TX_TAG,
  payload: { txHash, tag },
})

export const boundRemoveTxTag = (txHash, tag) => (
  dispatcher.dispatch(removeTxTag(txHash, tag))
)

export const removeAddress = (address) => ({
  type: REMOVE_ADDRESS,
  payload: address,
})

export const boundRemoveAddress = (address) => (
  dispatcher.dispatch(removeAddress(address))
)

export const updateUserName = (username) => ({
  type: UPDATE_USERNAME,
  payload: username,
})

export const boundUpdateUserName = (username) => (
  dispatcher.dispatch(updateUserName(username))
)

export const togglePushChanges = (toggle) => ({
  type: TOGGLE_PUSH_CHANGES,
  payload: toggle,
})

export const syncChanges = (changes) => ({
  type: SYNC_CHANGES,
  payload: changes,
})

export const boundSyncChanges = (changes) => {
  dispatcher.dispatch(togglePushChanges(false))
  dispatcher.dispatch(syncChanges(changes))
  dispatcher.dispatch(togglePushChanges(true))
}

export const resetFromStore = () => ({
  type: RESET_FROM_STORE,
})

export const boundResetFromStore = () => {
  dispatcher.dispatch(togglePushChanges(false))
  dispatcher.dispatch(resetFromStore())
  dispatcher.dispatch(togglePushChanges(true))
}

export const resetFromData = (data) => ({
  type: RESET_FROM_DATA,
  payload: data,
})

export const boundResetFromData = (data) => {
  dispatcher.dispatch(togglePushChanges(false))
  dispatcher.dispatch(resetFromData(data))
  dispatcher.dispatch(togglePushChanges(true))
}

export const mergeData = (data, isTargetPriority) => ({
  type: MERGE_DATA,
  payload: {
    data,
    isTargetPriority,
  }
})

export const boundMergeData = (data, isTargetPriority) => {
  dispatcher.dispatch(togglePushChanges(false))
  dispatcher.dispatch(mergeData(data, isTargetPriority))
  dispatcher.dispatch(togglePushChanges(true))
}

export const updateLastSyncTime = (timestamp) => ({
  type: UPDATE_LAST_SYNC_TIME,
  payload: timestamp,
})

export const boundUpdateLastSyncTime = (timestamp) => (
  dispatcher.dispatch(updateLastSyncTime(timestamp))
)

export const clearDatabase = () => ({
  type: CLEAR_DATABASE,
})

export const boundClearDatabase = () => {
  dispatcher.dispatch(togglePushChanges(false))
  dispatcher.dispatch(clearDatabase())
  dispatcher.dispatch(togglePushChanges(true))
}

export const markAllAsDirty = () => ({
  type: MARK_ALL_AS_DIRTY,
})

export const boundMarkAllAsDirty = () => {
  dispatcher.dispatch(togglePushChanges(false))
  dispatcher.dispatch(markAllAsDirty())
  dispatcher.dispatch(togglePushChanges(true))
}

export const toggleShowDialogHelp = (value) => ({
  type: TOGGLE_SHOW_DIALOG_HELP,
  payload: value,
})

export const boundToggleShowDialogHelp = (value) => (
  dispatcher.dispatch(toggleShowDialogHelp(value))
)

export const updateDirtyStatus = (from, to, targets) => ({
  type: UPDATE_DIRTY_STATUS,
  payload: {
    ...targets,
    from,
    to,
  },
})

export const boundUpdateDirtyStatus = (from, to, targets) => (
  dispatcher.dispatch(updateDirtyStatus(from, to, targets))
)

export const toggleSyncTagsAndNotes = (value) => ({
  type: TOGGLE_SYNC_TAGS_AND_NOTES,
  payload: value,
})

export const boundToggleSyncTagsAndNotes = (value) => (
  dispatcher.dispatch(toggleSyncTagsAndNotes(value))
)

export const updateNotificationChannels = (value) => ({
  type: UPDATE_NOTIFICATION_CHANNELS,
  payload: value,
})

export const boundUpdateNotificationChannels = (value) => (
  dispatcher.dispatch(updateNotificationChannels(value))
)

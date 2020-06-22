import dispatcher from './dispatcher'
import * as actions from './actions'
import localStore from './localStore'
import userAddressesStore from './UserAddressesStore'
import userInfoStore from './UserInfoStore'
import userTagsStore from './UserTagsStore'
import userTxsStore from './UserTxsStore'
import loggerStore from './LoggerStore'
import appStore from './AppStore'
import { syncChanges, syncOptions, syncChangesQueue } from './sync'
import { isEmpty, get, differenceWith, difference } from './utils'

let storageBinding

export function initDatabase (namespace, options) {
  return new Promise(resolve => {
    if (options) {
      syncOptions(options)
    }

    let prevStore
    if (options?.mergeWithCurrent) {
      prevStore = exportStoreToJSON()
    }

    if (options?.descriptors?.userAddresses) {
      userAddressesStore.setDescriptor(options?.descriptors?.userAddresses)
    }

    if (options?.descriptors?.userTxs) {
      userTxsStore.setDescriptor(options?.descriptors?.userTxs)
    }

    if (options?.descriptors?.userTags) {
      userTagsStore.setDescriptor(options?.descriptors?.userTags)
    }

    localStore.switch(namespace)
    actions.boundResetFromStore()
    storageBinding?.cancel()
    storageBinding = bindStorage()

    if (options?.mergeWithCurrent) {
      syncChangesQueue()
        .then(() => {
          actions.boundMergeData(prevStore, true)
          resolve()
        })
    } else {
      resolve()
    }
  })
}

export function registerStore (store, sync) {
  store.addListener(() => {
    localStore.store(store.key, store.getStoreState())
    if (sync) {
      syncChanges()
    }
  })
}

export function exportStoreToJSON () {
  return {
    ...userTagsStore.getExportJSON(),
    ...userAddressesStore.getExportJSON(),
    ...userInfoStore.getExportJSON(),
    ...userTxsStore.getExportJSON(),
  }
}

export function importStoreFromJSON (data, isMerge, isTargetPriority) {
  if (isMerge) {
    actions.boundMergeData(data, isTargetPriority)
  } else {
    actions.boundResetFromData(data)
  }

  syncChanges()
}

export function differenceStore (target, value) {
  const txNotes = differenceWith(
    get(value, 'userTxs.items', []).filter(item => item.txUserNote),
    get(target, 'userTxs.items', []).filter(item => item.txUserNote),
    (a, b) => (a.txHash === b.txHash)
  ).length

  const addressNotes = differenceWith(
    get(value, 'userAddresses.items', []).filter(item => item.addressUserNote),
    get(target, 'userAddresses.items', []).filter(item => item.addressUserNote),
    (a, b) => (a.address === b.address)
  ).length

  const valueAddresses = get(value, 'userAddresses.items', []).filter(item => !isEmpty(item.addressTags))
  const targetAddresses = get(target, 'userAddresses.items', []).filter(item => !isEmpty(item.addressTags))

  let tags = 0
  for (let i = 0; i < valueAddresses.length; i++) {
    const valueAddress = valueAddresses[i].address
    const valueTags = valueAddresses[i].addressTags
    const targetAddress = targetAddresses.find(item => item.address === valueAddress)
    if (!targetAddress) {
      tags += valueTags.length
    } else {
      tags += difference(valueTags, targetAddress.addressTags).length
    }
  }

  return (txNotes || addressNotes || tags) ? {
    txNotes,
    addressNotes,
    tags,
  } : null
}

registerStore(appStore)
registerStore(userInfoStore, true)
registerStore(userAddressesStore, true)
registerStore(userTagsStore, true)
registerStore(userTxsStore, true)

function bindStorage () {
  let lazy = 0
  const handleStorage = event => {
    if (
      event &&
      event.key === 'ethpuuid' &&
      event.newValue &&
      JSON.parse(event.newValue) !== JSON.parse(event.oldValue)
    ) {
      localStore.switch(JSON.parse(event.newValue))
    }

    clearTimeout(lazy)
    lazy = setTimeout(() => {
      if (
        appStore.getLastSyncedAt() < (localStore.store('app')?.lastSyncedAt ?? 1) ||
        document.visibilityState !== 'visible'
      ) {
        actions.boundResetFromStore()
      }
    }, 100)
  }

  window.addEventListener('storage', handleStorage, false)
  return {
    cancel () {
      clearTimeout(lazy)
      window.removeEventListener('storage', handleStorage, false)
    }
  }
}

export {
  syncChanges,
  syncChangesQueue,
  actions,
  dispatcher,
  localStore,
  appStore,
  userInfoStore,
  userTagsStore,
  userTxsStore,
  userAddressesStore,
}

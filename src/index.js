import dispatcher from './dispatcher'
import * as actions from './actions'
import localStore from './localStore'
import userAddressesStore from './UserAddressesStore'
import userInfoStore from './UserInfoStore'
import userTagsStore from './UserTagsStore'
import userTxsStore from './UserTxsStore'
import loggerStore from './LoggerStore'
import appStore from './AppStore'


let storageBinding

export function initDatabase (namespace) {
  localStore.switch(namespace)
  actions.boundResetFromStore()
  storageBinding?.cancel()
  storageBinding = bindStorage()
}

export function registerStore (store) {
  store.addListener(() => {
    localStore.store(store.key, store.getState())
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

export function importStoreFromJSON (data) {
  localStore.reset()
  actions.boundResetFromData(data)
}

registerStore(appStore)
registerStore(userInfoStore)
registerStore(userAddressesStore)
registerStore(userTagsStore)
registerStore(userTxsStore)

function bindStorage () {
  let lazy = 0
  const handleStorage = event => {
    if (
      event &&
      event.key === 'ethpuuid' &&
      event.newValue &&
      JSON.parse(event.newValue) !== JSON.parse(event.oldValue)
    ) {
      localStore.reset(JSON.parse(event.newValue))
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
  actions,
  dispatcher,
  localStore,
  appStore,
  userInfoStore,
  userTagsStore,
  userTxsStore,
  userAddressesStore,
}

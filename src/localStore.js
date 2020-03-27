import { v4 as uuidv4 } from 'uuid'
import store from 'store2'

class LocalStore {
  constructor () {
    const uuid = uuidv4()
    const ethpuuid = store('ethpuuid') || (store('ethpuuid', uuid), uuid)
    this._store = store.namespace(ethpuuid)
  }

  store (...args) {
    return this._store(...args)
  }

  userId () {
    return this._store.namespace()
  }

  reset (uuid = uuidv4()) {
    const prevStore = this._store
    store('ethpuuid', uuid)
    this._store = store.namespace(uuid)
    prevStore.clearAll()
  }

  clear () {
    this._store.clearAll()
  }

  switch (uuid) {
    if (uuid) {
      store('ethpuuid', uuid)
      this._store = store.namespace(uuid)
    }
  }
}

export default new LocalStore()

import ReduceStore from 'flux/lib/FluxReduceStore'
import dispatcher from './dispatcher'

class LoggerStore extends ReduceStore {
  getInitialState() {
    return null
  }

  reduce(state, action) {
    // console.log(Date.now(), action)
    return state
  }
}

export default new LoggerStore(dispatcher)

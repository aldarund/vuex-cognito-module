import state from './state'
import getters from './getters'
import mutations from './mutations'
import actions from './actions'

export default (store, config, namespace = 'cognito') => {
  store.registerModule(namespace, {
    namespaced: true,
    actions,
    getters,
    mutations,
    state
  })

  store.dispatch(`${namespace}/init`, config)
}

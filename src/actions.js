import Amplify, { Auth } from 'aws-amplify'

export default {
  fetchSession: ({ commit }) =>
    new Promise((resolve, reject) => {
      Auth.currentSession().then(session => {
        Auth.currentUserPoolUser()
          .then(user => {
            commit('setUser', user)
            commit('setSession', session)
            resolve(session)
          }).catch(reject)
      }).catch(reject)
    }),
  signInUser: ({ commit }, credentials) =>
    new Promise((resolve, reject) => {
      Auth.signIn(credentials.username, credentials.password).then((user) => {
        commit('setUser', user)
        commit('setSession', user.signInUserSession)

        if (localStorage) localStorage.setItem('USER', JSON.stringify(user))

        resolve(user)
      }).catch(reject)
    }),
  registerUser: ({ commit }, credentials) =>
    new Promise((resolve, reject) => {
      // TODO: Ensure I'm attribute agnostic
      Auth.signUp({
        username: credentials.username,
        password: credentials.password,
        attributes: credentials.attributes
      }).then((user) => {
        commit('setUser', user)
        commit('setSession', user.signInUserSession)

        if (localStorage) localStorage.setItem('USER', user)

        resolve(user)
      }).catch(reject)
    }),
  confirmUser: (context, data) =>
    new Promise((resolve, reject) => {
      Auth.confirmSignUp(data.username, data.code)
        .then(resolve)
        .catch(reject)
    }),
  resendConfirmation: (context, data) =>
    new Promise((resolve, reject) => {
      Auth.resendSignUp(data.username)
        .then(resolve)
        .catch(reject)
    }),
  forgotPassword: ({ commit }, data) =>
    new Promise((resolve, reject) => {
      Auth.forgotPassword(data.username)
        .then(resolve)
        .catch(reject)
    }),
  changePassword: ({ commit }, data) =>
    new Promise((resolve, reject) => {
      Auth.forgotPasswordSubmit(
        data.username,
        data.code,
        data.newPassword
      )
        .then(resolve)
        .catch(reject)
    }),
  signOut: ({ commit, getters, state }, data) =>
    new Promise((resolve, reject) => {
      if (!getters.isLoggedIn) {
        // reject({
        //   message: 'User not logged in.'
        // })
      }

      Auth.signOut()
        .then(result => {
          commit('setUser', {})
          commit('setSession', {})

          resolve(result)
        })
        .catch(reject)

      if (localStorage) localStorage.removeItem('USER')
    }),
  init ({ commit }, config) {
    if (![
      'UserPoolId',
      'IdentityPoolId',
      'ClientId',
      'Region'
    ].every(opt => Boolean(config[opt]))) {
      throw new Error('UserPoolId, IdentityPoolId, ClientId and Region are required in the config object.')
    }

    Amplify.configure({
      Auth: {
        // REQUIRED - Amazon Cognito Identity Pool ID
        identityPoolId: config.IdentityPoolId,
        // REQUIRED - Amazon Cognito Region
        region: config.Region,
        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: config.UserPoolId,
        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: config.ClientId,
        // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
        mandatorySignIn: false
      }
    })

    commit('setConfig', () => config)
  }
}

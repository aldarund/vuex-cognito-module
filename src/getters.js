export default {
  // TODO: ensure best method to verify this
  isLoggedIn: store => Boolean(
    store.session &&
    store.session.accessToken &&
    store.session.accessToken.jwtToken
  )
}

import CognitoUserPool from 'infrastructure/cognito'

const userGroups = Object.freeze({
  user: 'user',
  editor: 'editor',
  admin: 'admin',
})

export default class AuthenticationService {
  constructor(userPool) {
    this.userPool = userPool
  }

  static build() {
    return new AuthenticationService(CognitoUserPool.build(process.env.USER_POOL_ID, process.env.COGNITO_CLIENT_ID))
  }

  login(phoneNumber, password) {
    return this.userPool.login(phoneNumber, password)
  }

  async signup(phoneNumber, password, name) {
    const newUser = await this.userPool.signup(
      phoneNumber,
      password,
      [
        { Name: 'name', Value: name },
        { Name: 'phone_number', Value: phoneNumber },
      ],
    )
    await this.userPool.assignUserToGroup(newUser.username, userGroups.user)
    return newUser
  }

  signupConfirm(phoneNumber, confirmationCode) {
    return this.userPool.signupConfirm(phoneNumber, confirmationCode)
  }

  resendConfirmationCode(phoneNumber) {
    return this.userPool.resendConfirmationCode(phoneNumber)
  }

  async profile(accessToken) {
    const cognitoUser = await this.userPool.user(accessToken)
    const cognitoUserGroup = await this.userPool.userGroup(cognitoUser.sub)
    return { ...cognitoUser, role: cognitoUserGroup }
  }

  logout(accessToken) {
    return this.userPool.logout(accessToken)
  }

  passwordChange(accessToken, oldPassword, newPassword) {
    return this.userPool.passwordChange(accessToken, oldPassword, newPassword)
  }

  passwordForgot(phoneNumber) {
    return this.userPool.passwordForgot(phoneNumber)
  }

  passwordForgotConfirm(phoneNumber, newPassword, confirmationCode) {
    return this.userPool.passwordForgotConfirm(phoneNumber, newPassword, confirmationCode)
  }

  refreshSession(refreshToken) {
    return this.userPool.refreshSession(refreshToken)
  }
}

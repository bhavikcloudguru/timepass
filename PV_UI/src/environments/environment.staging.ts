export const environment = {
  production: true,
  oktaBaseURL: 'https://swirecnco.okta.com',
  environmentName: 'staging',
  oktaConfig: {
    issuer: 'https://swirecnco.okta.com',
    redirectUri:
      'https://productmanagerstage.swiredigital-s3-staging.com/assets/callback.html',
    clientId: '0oa3qoxfv8P62gsO1357',
    scope: 'openid email profile'
  },
  keycloak: {
    // Url of the Identity Provider
    issuer: 'https://uatiam.swiredigital.com/auth/',

    // Realm
    realm: 'ProductManagerRealm',

    // The SPA's id.
    // The SPA is registerd with this id  at the auth-serverß
    clientId: 'pm-stage',
    ccmId: 'ccm-stage',
    itmsId: 'itms-stage'
  },
  itms: {
    url: 'https://itmsstage.swiredigital-s3-staging.com/'
  },
  ccm: {
    url: 'https://cclstage.swiredigital-s3-staging.com/'
  }
};

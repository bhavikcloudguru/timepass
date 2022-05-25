export const environment = {
  production: true,
  oktaBaseURL: 'https://swirecnco.okta.com',
  environmentName: 'staging',
  oktaConfig: {
    issuer: 'https://swirecnco.okta.com',
    redirectUri: 'https://productmanager.swirecnco.com/assets/callback.html',
    clientId: '0oa58iafveZoIdntJ357',
    scope: 'openid email profile'
  },
  keycloak: {
    // Url of the Identity Provider
    issuer: 'https://iam.swiredigital.com/auth/',

    // Realm
    realm: 'ProductManagerRealm',

    // The SPA's id.
    // The SPA is registerd with this id  at the auth-serverß
    clientId: 'pm-prod',
    ccmId: 'ccm-prod',
    itmsId: 'itms-prod'
  },
  itms: {
    url: 'https://intermodal.swiredigital.com/'
  },
  ccm: {
    url: 'https://customsclearance.swiredigital.com/'
  }
};

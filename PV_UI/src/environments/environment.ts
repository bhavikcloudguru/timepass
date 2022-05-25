// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  oktaBaseURL: 'https://swirecnco.okta.com',
  oktaConfig: {
    issuer: 'https://swirecnco.okta.com',
    redirectUri:
      'https://productmanagerdev.swiredigital-s3-staging.com/assets/callback.html',
    clientId: '0oa3pdmhgncLtp5ny357',
    scope: 'openid email profile'
  },
  keycloak: {
    // Url of the Identity Provider
    issuer: 'https://deviam.swiredigital.com/auth/',

    // Realm
    realm: 'ProductManagerRealm',

    // The SPA's id.
    // The SPA is registerd with this id  at the auth-serverß
    clientId: 'pm-dev',
    ccmId: 'ccm-dev',
    itmsId: 'itms-dev'
  },
  itms: {
    url: 'https://itmsdev.swiredigital-s3-staging.com/'
  },
  ccm: {
    url: 'https://ccdev.swiredigital-s3-staging.com/'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

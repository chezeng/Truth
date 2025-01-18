import { Auth0Client } from '@auth0/auth0-spa-js';

export const auth0 = new Auth0Client({
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!,
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
  },
  // Auth0 控制台中配置 Google 作为身份提供商后，
  // 可以直接使用，不需要额外代码
}); 
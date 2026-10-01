/**
 * Environment helpers and schemas for Tavonza AI applications
 */

export type AppEnvironment = 'development' | 'test' | 'staging' | 'production' | 'live';

export function getAppEnvironment(): AppEnvironment {
  const env = (process.env.APP_ENV || process.env.NODE_ENV || 'development').toLowerCase();
  if (env === 'live' || env === 'production' || env === 'prod') {
    return 'production';
  }
  if (env === 'staging' || env === 'stage') {
    return 'staging';
  }
  if (env === 'test' || env === 'testing') {
    return 'test';
  }
  return 'development';
}

export function isProduction(): boolean {
  return getAppEnvironment() === 'production';
}

export function isDevelopment(): boolean {
  return getAppEnvironment() === 'development';
}

export {}
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ENV: 'acc' | 'dev' | 'test'
      BASEURL: string
      LOGLEVEL: 'info' | 'debug'
      USERNAME: string
      PASSWORD: string
      TOKEN: string
      INVALID_ACCESS_USERNAME: string
      UNAUTHORIZED_TOKEN: string
      ACTIVE_MAINTENANCE_BANNER_ID: string
    }
  }
}

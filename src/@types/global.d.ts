export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_ID: string
      API_HASH: string
      TAP_MODE?: string
    }
  }
}

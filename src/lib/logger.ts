type LogFn = (...args: unknown[]) => void

const noop: LogFn = () => {
  // intentional no-op in production
}

const isDev = process.env['NODE_ENV'] === 'development'

export const logger = {
  /** Debug-level: no-op in production */
  debug: isDev ? (console.debug.bind(console) as LogFn) : noop,
  /** Info-level: no-op in production */
  info: isDev ? (console.info.bind(console) as LogFn) : noop,
  /** Warn-level: always active */
  warn: console.warn.bind(console) as LogFn,
  /** Error-level: always active */
  error: console.error.bind(console) as LogFn,
}

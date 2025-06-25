const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
};

export default logger;

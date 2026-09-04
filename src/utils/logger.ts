export const logError = (error: unknown, context: string): void => {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`[${context}] ${message}`);
};

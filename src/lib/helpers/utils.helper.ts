let date = Date.now();
export const generateId = (): string => (++date).toString(36);

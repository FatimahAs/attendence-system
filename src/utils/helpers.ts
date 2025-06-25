export const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
export const dev = process.env.NODE_ENV !== 'production';

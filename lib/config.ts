// Configuration for static vs dynamic deployment
export const IS_STATIC_EXPORT = process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

export const API_BASE_URL = IS_STATIC_EXPORT ? '' : '';

export const STORAGE_TYPE = IS_STATIC_EXPORT ? 'client' : 'server'; 
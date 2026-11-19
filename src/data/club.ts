import club from './club.json';
export const CLUB = club;
export const url = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
export interface ClubEvent { title: string; date: string; location: string; source: string }
export const events: ClubEvent[] = [];

import axios from 'axios';

const base = axios.create({ baseURL: '/api/rsvp' });

export const rsvpApi = {
  get: async (token: string) => {
    const { data } = await base.get(`/${token}`);
    return data;
  },
  submit: async (
    token: string,
    payload: {
      response: 'YES' | 'NO' | 'MAYBE';
      plusOneCount?: number;
      dietaryPreferences?: string;
      message?: string;
    }
  ) => {
    const { data } = await base.post(`/${token}`, payload);
    return data;
  },
};

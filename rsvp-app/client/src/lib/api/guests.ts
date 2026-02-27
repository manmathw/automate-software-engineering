import { apiClient } from './client';

export interface Guest {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  invitationToken: string;
  plusOneAllowed: boolean;
  rsvp?: {
    response: string;
    plusOneCount: number;
    dietaryPreferences?: string;
    message?: string;
  };
}

export const guestsApi = {
  list: async (eventId: string, page = 1, limit = 20, rsvpResponse?: string) => {
    const { data } = await apiClient.get(`/events/${eventId}/guests`, {
      params: { page, limit, rsvpResponse },
    });
    return data;
  },
  add: async (eventId: string, payload: { firstName: string; lastName: string; email: string; plusOneAllowed?: boolean }): Promise<Guest> => {
    const { data } = await apiClient.post(`/events/${eventId}/guests`, payload);
    return data;
  },
  import: async (eventId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post(`/events/${eventId}/guests/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  update: async (eventId: string, guestId: string, payload: Partial<Guest>) => {
    const { data } = await apiClient.patch(`/events/${eventId}/guests/${guestId}`, payload);
    return data;
  },
  delete: async (eventId: string, guestId: string) => {
    await apiClient.delete(`/events/${eventId}/guests/${guestId}`);
  },
};

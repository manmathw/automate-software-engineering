import { useQuery, useMutation } from '@tanstack/react-query';
import { rsvpApi } from '../lib/api/rsvp';

export function useRsvp(token: string) {
  return useQuery({
    queryKey: ['rsvp', token],
    queryFn: () => rsvpApi.get(token),
    enabled: !!token,
  });
}

export function useSubmitRsvp(token: string) {
  return useMutation({
    mutationFn: (data: Parameters<typeof rsvpApi.submit>[1]) => rsvpApi.submit(token, data),
  });
}

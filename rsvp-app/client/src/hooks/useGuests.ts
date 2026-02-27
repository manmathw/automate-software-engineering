import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guestsApi } from '../lib/api/guests';
import toast from 'react-hot-toast';

export function useGuests(eventId: string, page = 1, rsvpResponse?: string) {
  return useQuery({
    queryKey: ['guests', eventId, page, rsvpResponse],
    queryFn: () => guestsApi.list(eventId, page, 20, rsvpResponse),
    enabled: !!eventId,
  });
}

export function useAddGuest(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof guestsApi.add>[1]) => guestsApi.add(eventId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['guests', eventId] });
      toast.success('Guest added!');
    },
    onError: () => toast.error('Failed to add guest'),
  });
}

export function useImportGuests(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => guestsApi.import(eventId, file),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['guests', eventId] });
      toast.success(`Imported ${data.imported} guests (${data.skipped} skipped)`);
    },
    onError: () => toast.error('Failed to import guests'),
  });
}

export function useDeleteGuest(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (guestId: string) => guestsApi.delete(eventId, guestId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['guests', eventId] });
      toast.success('Guest removed');
    },
    onError: () => toast.error('Failed to remove guest'),
  });
}

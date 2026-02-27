import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGuests, useAddGuest, useDeleteGuest, useImportGuests } from '../../hooks/useGuests';
import { useEvent } from '../../hooks/useEvents';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Plus, Upload, Trash2, UserCheck } from 'lucide-react';

const rsvpVariant: Record<string, 'green' | 'red' | 'yellow' | 'gray'> = {
  YES: 'green',
  NO: 'red',
  MAYBE: 'yellow',
  PENDING: 'gray',
};

export function GuestListPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const { data: event } = useEvent(eventId!);
  const [page, setPage] = useState(1);
  const [rsvpFilter, setRsvpFilter] = useState('');
  const { data, isLoading } = useGuests(eventId!, page, rsvpFilter || undefined);
  const addGuest = useAddGuest(eventId!);
  const deleteGuest = useDeleteGuest(eventId!);
  const importGuests = useImportGuests(eventId!);

  const [showAddModal, setShowAddModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [plusOneAllowed, setPlusOneAllowed] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addGuest.mutate(
      { firstName, lastName, email, plusOneAllowed },
      {
        onSuccess: () => {
          setShowAddModal(false);
          setFirstName(''); setLastName(''); setEmail(''); setPlusOneAllowed(false);
        },
      }
    );
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importGuests.mutate(file);
    e.target.value = '';
  };

  const guests = data?.guests ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Guests</h1>
          {event && <p className="text-gray-500 text-sm mt-1">{event.title}</p>}
        </div>
        <div className="flex gap-2">
          <label className="cursor-pointer inline-flex items-center h-8 px-3 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
            <Upload size={16} className="mr-1" /> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus size={16} className="mr-1" /> Add Guest
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {['', 'YES', 'NO', 'MAYBE', 'PENDING'].map((f) => (
          <button
            key={f}
            onClick={() => { setRsvpFilter(f); setPage(1); }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              rsvpFilter === f ? 'bg-primary-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : guests.length === 0 ? (
        <div className="bg-white rounded-lg border p-10 text-center">
          <UserCheck size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No guests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border divide-y">
          {guests.map((guest: { id: string; firstName: string; lastName: string; email: string; rsvp?: { response: string } }) => (
            <div key={guest.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{guest.firstName} {guest.lastName}</p>
                <p className="text-sm text-gray-500">{guest.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={rsvpVariant[guest.rsvp?.response ?? 'PENDING'] ?? 'gray'}>
                  {guest.rsvp?.response ?? 'PENDING'}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (confirm('Remove guest?')) deleteGuest.mutate(guest.id);
                  }}
                >
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="flex items-center text-sm text-gray-600">Page {page} of {data.totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Guest">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input id="firstName" label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Input id="lastName" label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={plusOneAllowed} onChange={(e) => setPlusOneAllowed(e.target.checked)} />
            Allow plus one
          </label>
          <Button type="submit" isLoading={addGuest.isPending} className="w-full">Add Guest</Button>
        </form>
      </Modal>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useCreateEvent } from '../../hooks/useEvents';
import { EventForm } from '../../components/events/EventForm';

export function CreateEventPage() {
  const navigate = useNavigate();
  const createEvent = useCreateEvent();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Event</h1>
      <div className="bg-white rounded-lg border p-6">
        <EventForm
          onSubmit={(data) =>
            createEvent.mutate(data as Parameters<typeof createEvent.mutate>[0], {
              onSuccess: (event) => navigate(`/events/${event.id}`),
            })
          }
          isLoading={createEvent.isPending}
          submitLabel="Create Event"
        />
      </div>
    </div>
  );
}

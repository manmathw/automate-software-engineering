import { useNavigate, useParams } from 'react-router-dom';
import { useEvent, useUpdateEvent } from '../../hooks/useEvents';
import { EventForm } from '../../components/events/EventForm';

export function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading } = useEvent(id!);
  const updateEvent = useUpdateEvent();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      <div className="bg-white rounded-lg border p-6">
        <EventForm
          initialData={event}
          showStatus
          onSubmit={(data) =>
            updateEvent.mutate(
              { id: id!, data },
              { onSuccess: () => navigate(`/events/${id}`) }
            )
          }
          isLoading={updateEvent.isPending}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}

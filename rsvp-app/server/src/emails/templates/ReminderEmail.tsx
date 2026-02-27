import React from 'react';
import { Text, Button, Section } from '@react-email/components';
import { BaseLayout } from '../components/BaseLayout';

const occasionTheme: Record<string, { primary: string; emoji: string }> = {
  BIRTHDAY: { primary: '#f59e0b', emoji: '🎂' },
  ANNIVERSARY: { primary: '#ec4899', emoji: '💍' },
  WEDDING: { primary: '#8b5cf6', emoji: '💒' },
  GRADUATION: { primary: '#10b981', emoji: '🎓' },
  CORPORATE: { primary: '#3b82f6', emoji: '💼' },
  BABY_SHOWER: { primary: '#f472b6', emoji: '👶' },
  RETIREMENT: { primary: '#f97316', emoji: '🌅' },
  HOLIDAY_PARTY: { primary: '#ef4444', emoji: '🎄' },
  OTHER: { primary: '#6366f1', emoji: '🎉' },
};

interface ReminderEmailProps {
  guestFirstName: string;
  eventTitle: string;
  occasionType: string;
  eventDate: string;
  venue?: string;
  rsvpUrl: string;
  timeUntilEvent: string;
}

export function ReminderEmail({
  guestFirstName,
  eventTitle,
  occasionType,
  eventDate,
  venue,
  rsvpUrl,
  timeUntilEvent,
}: ReminderEmailProps) {
  const theme = occasionTheme[occasionType] || occasionTheme.OTHER;

  return (
    <BaseLayout primaryColor={theme.primary}>
      <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
        ⏰ Reminder: {theme.emoji} {eventTitle}
      </Text>
      <Text style={{ color: '#374151', fontSize: '16px' }}>
        Hi {guestFirstName}, just a friendly reminder that <strong>{eventTitle}</strong> is coming up in <strong>{timeUntilEvent}</strong>!
      </Text>
      <Section style={{ backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '16px', margin: '16px 0' }}>
        <Text style={{ margin: 0, color: '#111827' }}>
          <strong>📅 Date:</strong> {eventDate}
        </Text>
        {venue && (
          <Text style={{ margin: '8px 0 0', color: '#111827' }}>
            <strong>📍 Venue:</strong> {venue}
          </Text>
        )}
      </Section>
      <Text style={{ color: '#374151' }}>Haven't RSVP'd yet? There's still time:</Text>
      <Button
        href={rsvpUrl}
        style={{
          backgroundColor: theme.primary,
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '6px',
          textDecoration: 'none',
          display: 'inline-block',
          fontWeight: 'bold',
        }}
      >
        RSVP Now
      </Button>
    </BaseLayout>
  );
}

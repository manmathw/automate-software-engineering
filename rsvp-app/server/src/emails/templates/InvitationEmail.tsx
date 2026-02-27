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

interface InvitationEmailProps {
  guestFirstName: string;
  eventTitle: string;
  occasionType: string;
  eventDate: string;
  venue?: string;
  description?: string;
  rsvpUrl: string;
  organizerName: string;
}

export function InvitationEmail({
  guestFirstName,
  eventTitle,
  occasionType,
  eventDate,
  venue,
  description,
  rsvpUrl,
  organizerName,
}: InvitationEmailProps) {
  const theme = occasionTheme[occasionType] || occasionTheme.OTHER;

  return (
    <BaseLayout primaryColor={theme.primary}>
      <Text style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>
        {theme.emoji} Dear {guestFirstName},
      </Text>
      <Text style={{ color: '#374151', fontSize: '16px' }}>
        You are cordially invited to <strong>{eventTitle}</strong>!
      </Text>
      {description && (
        <Text style={{ color: '#6b7280', fontSize: '14px' }}>{description}</Text>
      )}
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
      <Text style={{ color: '#374151' }}>Please let us know if you can make it:</Text>
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
      <Text style={{ color: '#6b7280', fontSize: '14px', marginTop: '24px' }}>
        With warm regards,<br />{organizerName}
      </Text>
    </BaseLayout>
  );
}

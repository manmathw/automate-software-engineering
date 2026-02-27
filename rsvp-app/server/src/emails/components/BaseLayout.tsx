import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from '@react-email/components';

interface BaseLayoutProps {
  children: React.ReactNode;
  primaryColor?: string;
}

export function BaseLayout({ children, primaryColor = '#6366f1' }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Section
            style={{
              backgroundColor: primaryColor,
              borderRadius: '8px 8px 0 0',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              🎉 You're Invited!
            </Text>
          </Section>
          <Section
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '0 0 8px 8px',
              padding: '30px',
            }}
          >
            {children}
          </Section>
          <Hr />
          <Text style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center' }}>
            This email was sent by RSVP App. If you have questions, reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

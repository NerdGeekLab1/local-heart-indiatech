/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import {
  brand,
  button,
  card,
  container,
  eyebrow,
  footer,
  h1,
  main,
  rowValue,
  text,
} from './theme.ts'

interface Props {
  hostName?: string
  city?: string
  loginUrl?: string
  onboardingUrl?: string
}

const Email = ({
  hostName,
  city,
  loginUrl = `${brand.siteUrl}/login/host`,
  onboardingUrl = `${brand.siteUrl}/host-onboarding`,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're approved to host on {brand.siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>Application approved</Text>
        <Heading style={h1}>
          {hostName ? `Welcome aboard, ${hostName}!` : 'Welcome aboard!'}
        </Heading>
        <Text style={text}>
          Your host application{city ? ` for ${city}` : ''} has been approved. Your host portal is
          unlocked — sign in to finish onboarding and publish your first listing.
        </Text>

        <Section style={card}>
          <Text style={{ ...rowValue, margin: '0 0 8px' }}>Next steps</Text>
          <Text style={{ ...text, margin: '0 0 6px' }}>1. Complete your host profile and photos</Text>
          <Text style={{ ...text, margin: '0 0 6px' }}>2. Add stay, transport, food or experiences</Text>
          <Text style={{ ...text, margin: '0' }}>3. Set pricing and availability, then go live</Text>
        </Section>

        <Button style={button} href={loginUrl}>
          Sign in to your host portal
        </Button>

        <Hr style={{ borderColor: brand.border, margin: '28px 0 0' }} />
        <Text style={footer}>
          Track your onboarding progress any time at {onboardingUrl}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: `You're approved to host on ${brand.siteName}`,
  displayName: 'Host acceptance',
  previewData: { hostName: 'Ravi Sharma', city: 'Jaipur' },
} satisfies TemplateEntry

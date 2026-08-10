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
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { brand, button, container, eyebrow, footer, h1, main, text } from './theme.ts'

interface Props {
  name?: string
  role?: string
  dashboardUrl?: string
}

const Email = ({ name, role = 'traveler', dashboardUrl }: Props) => {
  const url =
    dashboardUrl ??
    (role === 'host' ? `${brand.siteUrl}/dashboard/host` : `${brand.siteUrl}/dashboard/traveler`)
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Welcome to {brand.siteName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>Welcome</Text>
          <Heading style={h1}>{name ? `Namaste, ${name}!` : 'Namaste!'}</Heading>
          <Text style={text}>
            Your {brand.siteName} account is ready. {role === 'host'
              ? 'Set up your listings and start welcoming travelers from around the world.'
              : 'Discover local hosts, join traveler-led trips, and share your stories in the feed.'}
          </Text>
          <Button style={button} href={url}>
            Open your dashboard
          </Button>
          <Hr style={{ borderColor: brand.border, margin: '28px 0 0' }} />
          <Text style={footer}>Happy travels — the {brand.siteName} team.</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: `Welcome to ${brand.siteName}`,
  displayName: 'Welcome',
  previewData: { name: 'Aditi', role: 'traveler' },
} satisfies TemplateEntry

'use client';

import { BusinessCard } from '@/components/BusinessCard';
import { SAMPLE_LEADS } from '@/lib/sample-leads';

/** The real lead card, rendered with the sample Kokapet cafe. */
export function ExampleLead() {
  return <BusinessCard business={SAMPLE_LEADS[0]} onStatusChange={() => {}} preview />;
}

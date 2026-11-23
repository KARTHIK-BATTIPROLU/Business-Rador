import type { Business } from '@/lib/types';

// Default scripts, used when the dossier has no AI-drafted version.

export function whatsappPitch(b: Business): string {
  return (
    b.dossier?.whatsapp_pitch ||
    `Hi ${b.name} team! Congratulations on opening in ${b.area}. I noticed you don't have a website or an online menu yet. We build fast, mobile-first sites for local shops. Can I send you a one-minute demo?`
  );
}

export function callScript(b: Business): string {
  return (
    b.dossier?.cold_call_script ||
    `Hi, am I speaking with the owner of ${b.name}? Congratulations on the new place in ${b.area}. My name is [your name]. People searching for you on Google can't find a website yet, so we sketched a quick one for you. Do you have two minutes this week to look at it?`
  );
}

export function emailPitch(b: Business): string {
  return (
    b.dossier?.cold_email_pitch ||
    `Subject: A website for ${b.name}?

Hi ${b.name} team,

Congratulations on opening in ${b.area}.

I came across your shop while looking at new places in the area. Your Instagram is picking up, but there's no website or direct ordering page yet, so anyone who searches for you lands on a map pin and stops there.

We help new shops with three things:
1. A fast mobile website, no commission on orders
2. A proper Google Business Profile and a way to collect reviews
3. Local search, so people in ${b.area} find you first

Would you like to see a two-page draft we put together for ${b.name}? No charge for the draft.

Best regards,
[Your name]`
  );
}

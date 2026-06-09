import type { LeadForm, Report } from './types';

/** GetResponse: add contact + tags. No-op if no key. */
export async function pushToGetResponse(form: LeadForm, reportId: string): Promise<void> {
  const apiKey = process.env.GETRESPONSE_API_KEY;
  const campaignId = process.env.GETRESPONSE_CAMPAIGN_ID;
  if (!apiKey || !campaignId) return;
  try {
    await fetch('https://api.getresponse.com/v3/contacts', {
      method: 'POST',
      headers: {
        'X-Auth-Token': `api-key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: form.email,
        name: form.name,
        campaign: { campaignId },
        tags: [
          { tag: 'novem-audyt-ai' },
          { tag: `goal_${form.goal}` },
          { tag: `budget_${form.budget}` },
          { tag: `measurement_${form.measurement}` },
        ],
        customFieldValues: [
          { customFieldId: process.env.GR_FIELD_URL_ID || '', value: [form.url] },
          { customFieldId: process.env.GR_FIELD_REPORT_ID || '', value: [reportId] },
        ].filter((f) => f.customFieldId),
      }),
    });
  } catch {
    /* swallow — lead is saved locally regardless */
  }
}

/** Supabase: persist report. No-op if no key. */
export async function persistReport(report: Report): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(url, key);
    await sb.from('audits').insert({
      id: report.id,
      created_at: report.createdAt,
      email: report.form.email,
      name: report.form.name,
      url: report.form.url,
      goal: report.form.goal,
      budget: report.form.budget,
      measurement: report.form.measurement,
      report,
    });
  } catch {
    /* swallow */
  }
}

/** Optional Slack notification to Novem. */
export async function notifySlack(form: LeadForm, reportId: string): Promise<void> {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🟢 Nowy audyt AI: *${form.name}* (${form.email})\nStrona: ${form.url}\nCel: ${form.goal} · Budżet: ${form.budget}\nRaport: /report/${reportId}`,
      }),
    });
  } catch {
    /* swallow */
  }
}

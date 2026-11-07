import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface NotificationItem {
  id: string;
  recordId: string;
  title: string;
  message: string;
  time: string;
  type: 'verified' | 'published' | 'governance' | 'grant';
  href: string;
}

export async function GET() {
  try {
    const db = await getDb();
    const rows = (
      await db.execute(`
      SELECT a.id as audit_id, a.record_id, a.action, a.actor_name, a.created_at as event_at,
             r.title, r.region, r.work_type, r.verification_level
      FROM audit_events a
      LEFT JOIN records r ON r.id = a.record_id
      WHERE r.id IS NOT NULL AND r.sensitivity != 'restricted'
      ORDER BY a.created_at DESC
      LIMIT 15
    `)
    ).rows;

    const notifications: NotificationItem[] = rows.map((row: any) => {
      let title = 'Registry Update';
      let message = `${row.title} updated in registry.`;
      let type: NotificationItem['type'] = 'published';

      if (row.action === 'approve' || row.action === 'verify') {
        title = 'Cultural Work Verified';
        message = `${row.title} has been reviewed and verified by community custodians.`;
        type = 'verified';
      } else if (row.action === 'create') {
        title = 'New Cultural Work Published';
        message = `${row.title} is now published in the Kerala Living Heritage Registry.`;
        type = 'published';
      } else if (row.action === 'flag') {
        title = 'Community Notice';
        message = `A community inquiry was raised on ${row.title}.`;
        type = 'governance';
      } else if (row.action === 'resolve') {
        title = 'Dispute Resolved';
        message = `Heritage attribution update for ${row.title} has been completed.`;
        type = 'governance';
      } else if (row.action === 'grant_issued') {
        title = 'Reuse Permission Issued';
        message = `A new certified reuse grant has been recorded for ${row.title}.`;
        type = 'grant';
      }

      return {
        id: `notif-${row.audit_id}`,
        recordId: String(row.record_id),
        title,
        message,
        time: String(row.event_at),
        type,
        href: `/r/${row.record_id}`,
      };
    });

    return NextResponse.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, notifications: [] },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase/client';
import { sendEmail, templates } from '@/lib/email/service';

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = getServiceRoleClient();

    // 1. Find users whose heartbeat has expired
    const { data: expiredUsers, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('transmission_triggered', false)
        .lt('last_heartbeat_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Simplified for now

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    for (const user of expiredUsers) {
        const lastHeartbeat = new Date(user.last_heartbeat_at).getTime();
        const intervalDays = user.heartbeat_interval_days;
        const graceDays = user.grace_period_days;
        const now = Date.now();

        const expirationTime = lastHeartbeat + (intervalDays * 24 * 60 * 60 * 1000);
        const finalDeadline = expirationTime + (graceDays * 24 * 60 * 60 * 1000);

        if (now > finalDeadline) {
            // TRIGGER TRANSMISSION
            await supabase
                .from('profiles')
                .update({ transmission_triggered: true })
                .eq('id', user.id);

            await sendEmail(user.email, templates.transmissionTriggered(user.full_name).subject, templates.transmissionTriggered(user.full_name).html);

            // Notify Heirs logic would go here
            console.log(`Transmission triggered for user ${user.id}`);
        } else if (now > expirationTime) {
            // SEND REMINDER
            await sendEmail(user.email, templates.heartbeatReminder(user.full_name).subject, templates.heartbeatReminder(user.full_name).html);
        }
    }

    return NextResponse.json({ processed: expiredUsers.length });
}

import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { RekordboxTimestampsWidget } from '@/components/tools/rekordbox-timestamps-widget';

export default function Welcome() {
    return (
        <AppLayout>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <RekordboxTimestampsWidget />
            </div>
        </AppLayout>
    );
}

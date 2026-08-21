import * as Sentry from '@sentry/nextjs';

Sentry.init({
    dsn: 'https://f1416d0a2ec8a50ce5b1b26ef81024a4@o4507665778868224.ingest.us.sentry.io/4507695227011072',
    // telemetry: false,
    tracesSampleRate: 1.0,
    // options: {
    //     telemetry: false
    // }
});
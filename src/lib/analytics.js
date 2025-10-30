import posthog from 'posthog-js';

posthog.init('phc_XZSAUQbnoAWAZiIUyaGu1mCnzVwhIO5huxXC7tv2ldA', {
  api_host: 'https://app.posthog.com',
  ui_host: 'https://us-assets.i.posthog.com',
  autocapture: true,
  capture_pageview: true,
  disable_session_recording: false,
  loaded: (ph) => console.log('✅ PostHog Analytics carregado:', ph.config.api_host)
});

window.AlshamAnalytics = {
  track(eventName, properties = {}) {
    if (window.posthog) {
      posthog.capture(eventName, properties);
    }
  },
  identify(userId, traits = {}) {
    if (window.posthog) {
      posthog.identify(userId, traits);
    }
  },
  isFeatureEnabled(flagName) {
    if (window.posthog) {
      return posthog.isFeatureEnabled(flagName);
    }
    return false;
  },
  trackError(error, context = {}) {
    if (window.posthog) {
      posthog.capture('error_occurred', {
        error_message: error.message,
        error_stack: error.stack,
        page: window.location.pathname,
        context
      });
    }
  },
  reset() {
    if (window.posthog) {
      posthog.reset();
    }
  }
};

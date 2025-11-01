import posthog from 'posthog-js';

let isInitialized = false;

export function initializeAnalytics(options = {}) {
  if (isInitialized) {
    return { client: posthog, wasInitialized: false };
  }

  if (typeof posthog?.init === 'function') {
    const config = {
      api_host: 'https://us.i.posthog.com',
      autocapture: true,
      capture_pageview: false,
      disable_session_recording: false,
      ui_host: 'https://us-assets.i.posthog.com',
      ...options
    };

    posthog.init('phc_XZSAUQbnoAWAZiIUyaGu1mCnzVwhIO5huxXC7tv2ldA', config);
    isInitialized = true;

    if (typeof window !== 'undefined') {
      window.posthog = posthog;
      window.__ALSHAM_POSTHOG_INITIALIZED__ = true;
    }

    return { client: posthog, wasInitialized: true };
  }

  return { client: null, wasInitialized: false };
}

function withAnalytics(callback) {
  const { client } = initializeAnalytics();
  if (client && typeof callback === 'function') {
    callback(client);
  }
}

const AlshamAnalytics = {
  track(eventName, properties = {}) {
    withAnalytics((client) => client.capture(eventName, properties));
  },
  identify(userId, traits = {}) {
    withAnalytics((client) => client.identify(userId, traits));
  },
  isFeatureEnabled(flagName) {
    const { client } = initializeAnalytics();
    if (client) {
      return client.isFeatureEnabled(flagName);
    }
    return false;
  },
  trackError(error, context = {}) {
    withAnalytics((client) => {
      client.capture('error_occurred', {
        error_message: error?.message,
        error_stack: error?.stack,
        page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
        context
      });
    });
  },
  reset() {
    withAnalytics((client) => client.reset());
  }
};

if (typeof window !== 'undefined') {
  window.AlshamAnalytics = AlshamAnalytics;
}

export default AlshamAnalytics;

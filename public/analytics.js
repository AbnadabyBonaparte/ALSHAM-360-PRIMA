/**
 * PostHog Analytics - ALSHAM 360° PRIMA
 * @version 1.0.0
 * @description Tracking de eventos, analytics e feature flags
 */

// PostHog Initialization Script
!function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init hi $r kr ui wr Er capture Ri calculateEventProperties Ir register register_once register_for_session unregister unregister_for_session Fr getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Cr Tr createPersonProfile Or yr Mr opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing Pr debug L Rr getPageViewId captureTraceFeedback captureTraceMetric gr".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

// Initialize PostHog
posthog.init('phc_eOd3UJXy8cwTdodbF4zMazJFepembQnBmKpVGrZwR4J', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    disable_session_recording: false,
    enable_recording_console_log: true,
    session_recording: {
        recordCanvas: false,
        recordCrossOriginIframes: false
    }
});

// Helper functions para uso global
window.AlshamAnalytics = {
    track: function(eventName, properties) {
        properties = properties || {};
        if (window.posthog) {
            posthog.capture(eventName, properties);
        }
    },

    identify: function(userId, traits) {
        traits = traits || {};
        if (window.posthog) {
            posthog.identify(userId, traits);
        }
    },

    isFeatureEnabled: function(flagName) {
        if (window.posthog) {
            return posthog.isFeatureEnabled(flagName);
        }
        return false;
    },

    trackError: function(error, context) {
        context = context || {};
        if (window.posthog) {
            posthog.capture('error_occurred', {
                error_message: error.message,
                error_stack: error.stack,
                page: window.location.pathname,
                context: context
            });
        }
    },

    reset: function() {
        if (window.posthog) {
            posthog.reset();
        }
    }
};

console.log('✅ PostHog Analytics carregado - ALSHAM 360° PRIMA');

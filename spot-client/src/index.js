import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

import 'common/css';
import { analytics } from 'common/analytics';
import { globalDebugger } from 'common/debugging';
import { LoggingService } from 'common/logger';
import reducers, {
    getAnalyticsAppKey,
    getDesktopSharingFramerate,
    getLoggingEndpoint,
    setDefaultValues
} from 'common/app-state';
import {
    RemoteControlServiceSubscriber,
    remoteControlService
} from 'common/remote-control';
import {
    getDeviceId,
    getPersistedState,
    setPersistedState
} from 'common/utils';

import App from './app';
import PostToEndpoint from './common/logger/post-to-endpoint';

const store = createStore(
    reducers,
    {
        config: {
            ...setDefaultValues(window.JitsiMeetSpotConfig)
        },
        ...getPersistedState()
    },
    applyMiddleware(thunk)
);
const remoteControlServiceSubscriber = new RemoteControlServiceSubscriber();

globalDebugger.register('store', store);

store.subscribe(() => {
    setPersistedState(store);
    remoteControlServiceSubscriber.onUpdate(store);
});

const reduxState = store.getState();
const deviceId = getDeviceId();

const analyticsAppKey = getAnalyticsAppKey(reduxState);

if (analyticsAppKey) {
    analytics.init({
        appKey: analyticsAppKey,
        deviceId
    });
}

const loggingEndpoint = getLoggingEndpoint(reduxState);

if (loggingEndpoint) {
    const loggingService = new LoggingService(loggingEndpoint);

    loggingService.addHandler(
        new PostToEndpoint({
            deviceId,
            endpointUrl: loggingEndpoint
        })
    );

    loggingService.start();
}

remoteControlService.configureWirelessScreensharing({
    desktopSharingFrameRate: getDesktopSharingFramerate(reduxState)
});

render(
    <Provider store = { store }>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);

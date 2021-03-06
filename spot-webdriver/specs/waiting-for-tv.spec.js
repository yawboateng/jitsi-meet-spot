const SpotSession = require('../user/spot-session');
const spotSessionStore = require('../user/spotSessionStore');

describe('The "waiting for the Spot TV to connect" message', () => {
    const session = spotSessionStore.createSession();

    it('should appear if no Spot TV and disappear when it connects', () => {
        if (!SpotSession.isBackendEnabled()) {
            pending();

            return;
        }

        session.startSpotTv();

        const joinCode = session.getSpotTV().getShortLivedPairingCode();

        session.getSpotTV().stop();

        const remote = session.getSpotRemote();

        session.startSpotRemote(joinCode);

        const waitingForSpotTvLabel = remote.getRemoteControlPage().getWaitingForSpotTvLabel();

        waitingForSpotTvLabel.waitForVisible();

        session.startSpotTv();

        waitingForSpotTvLabel.waitForHidden();
    });
    it('should appear if Spot TV disconnects while Spot Remote is disconnected', () => {
        if (!SpotSession.isBackendEnabled()) {
            pending();

            return;
        }

        session.startSpotTv();
        session.startPermanentSpotRemote();

        const remote = session.getSpotRemote();

        remote.setNetworkOffline();
        remote.stopP2PConnection();

        remote.getLoadingScreen().waitForLoadingToAppear();

        session.getSpotTV().stop();

        remote.setNetworkOnline();
        remote.getRemoteControlPage()
            .getWaitingForSpotTvLabel()
            .waitForVisible();
    });
});

'use strict';

module.exports = class TimeManager {
    constructor() {
    }

    start() {
        this.hour = airplanebattle.config.world.time.hour;
        this.minute = airplanebattle.config.world.time.minute;

        setInterval(this.syncTime, 1875, this);
    }

    /* NOTE: setInterval callback, don't use _this_ in here. */
    syncTime(timeManager) {
        let min = airplanebattle.utils.clamp(0, timeManager.minute++, 59);
        let hour = 0;
        if (min === 59) {
            hour = airplanebattle.utils.clamp(0, timeManager.hour++, 23);
            if (hour === 23)
                timeManager.hour = 0;

            timeManager.minute = 0;
        }

        // update the players every 30 minute in the hour
        if (min === 30 || min === 59) {
            jcmp.players.forEach(p => {
                timeManager.updatePlayer(p);
            });
        }
    }

    updatePlayer(player) {
        if (typeof player.airplanebattle !== 'undefined' && !player.airplanebattle.custom_time_set) {
            this.setTimeForPlayer(player, this.hour, this.minute);
        }
    }

    setTimeForPlayer(player, hour, minute) {
        jcmp.events.CallRemote('airplanebattle_set_time', player, hour, minute);
    }
}

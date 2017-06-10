'use strict';

jcmp.events.Add('chat_message', (player, message) => {
    if (typeof player.airplanebattle === 'undefined')
        return `${player.escapedNametagName}: ${message}`;

    console.log(`${player.escapedNametagName}: ${message}`);
    //return `${airplanebattle.utils.isAdmin(player) ? '<div class="admin-logo"></div>' : ''}[${player.airplanebattle.colour}] ${player.escapedNametagName}[#FFFFFF]: ${message}`;
    //return `[${player.airplanebattle.colour}] ${player.escapedNametagName}[#FFFFFF]: ${message}`;

    var message = `[${player.airplanebattle.colour}] ${player.escapedNametagName}[#FFFFFF]: ${message}`;
    if(airplanebattle.utils.isAdmin(player)) {
      message = '[Admin]' + message;
    }


    console.log(message);

    return message;
});

jcmp.events.AddRemoteCallable('chat_ready', player => {
    airplanebattle.chat.send(player, 'Spawning might take a while. Please wait and enjoy the view.', airplanebattle.config.colours.purple);


    if (airplanebattle.bans.has(player.client.steamId)) {
        airplanebattle.chat.send(player, 'You are banned from the server until the next server restart. You will get kicked shortly.', airplanebattle.config.colours.red);
        const done = airplanebattle.workarounds.watchPlayer(player, setTimeout(() => {
            done();
            player.Kick('banned')
        }, 15000));
    }
});

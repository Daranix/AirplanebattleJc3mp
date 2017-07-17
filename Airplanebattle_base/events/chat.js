'use strict';

jcmp.events.Add('chat_message', (player, message) => {
    if (typeof player.airplanebattle === 'undefined')
        return `${player.escapedNametagName}: ${message}`;

    console.log(`${player.escapedNametagName}: ${message}`);
    //return `${airplanebattle.utils.isAdmin(player) ? '<div class="admin-logo"></div>' : ''}[${player.airplanebattle.colour}] ${player.escapedNametagName}[#FFFFFF]: ${message}`;
    //return `[${player.airplanebattle.colour}] ${player.escapedNametagName}[#FFFFFF]: ${message}`;

    var message = `[${player.airplanebattle.colour}] ${player.escapedNametagName}[#FFFFFF]: ${message}`;
    if (airplanebattle.utils.isAdmin(player)) {
        message = '[Admin]' + message;
    }


    console.log(message);

    return message;
});

'use strict';

module.exports = ({ Command, manager }) => {
  manager.category('admin', 'commands for administration purposes')

  .add(new Command('tphere').parameter('target', 'string', 'networkId or (part of) name').description('Summon player to youre position').handler(function(player, target) {

    if(!airplanebattle.utils.isAdmin(player)) {
      return airplanebattle.chat.send(player, "You're not allowed to use this command", airplanebattle.config.colours.red);
    }

    const res = airplanebattle.utils.getPlayer(target);
    if(res.length === 0 || res.length > 1) {
      return airplanebattle.chat.send(player, "No / too many matching players!", airplanebattle.config.colours.red);
    }

    // TP

    res[0].position = player.position;
    airplanebattle.chat.send(res[0], player.escapedNametagName + " TP you to his position");
    airplanebattle.chat.send(player, res[0].escapedNametagName + "Has been taken to your position");
  }))

  .add(new Command('apromote').parameter('target', 'string', 'networkId or (part of) name').description('Promotes someone to admin').handler(function(player, target) {

    if(!airplanebattle.utils.isAdmin(player)) {
      return airplanebattle.chat.send(player, "You're not allowed to use this command", airplanebattle.config.colours.red);
    }

    const res = airplanebattle.utils.getPlayer(target);
    if(res.length === 0 || res.length > 1) {
      return airplanebattle.chat.send(player, "No / too many matching players!", airplanebattle.config.colours.red);
    }

    // Add to config admins THIS IS TEMP

    airplanebattle.config.admins.push(res[0].client.steamId);
    airplanebattle.chat.send(player, "You promoted " + res[0].escapedNametagName + " to admin");
    airplanebattle.chat.send(res[0], "You've promoted to admin by " + player.escapedNametagName);
  }))



  .add(new Command('tp').parameter('target', 'string', 'networkId or (part of) name').description('tp urself to a player').handler(function(player, target) {

    if(!airplanebattle.utils.isAdmin(player)) {
      return airplanebattle.chat.send(player, "You're not allowed to use this command", airplanebattle.config.colours.red);
    }

    const res = airplanebattle.utils.getPlayer(target);
    if(res.length === 0 || res.length > 1) {
      return airplanebattle.chat.send(player, "No / too many matching players!", airplanebattle.config.colours.red);
    }

    player.position = res[0].position;
    airplanebattle.chat.send(player, "You've been TP to player " + res[0].escapedNametagName);

  }))
  .add(new Command('startbattle').description('Start a battle').handler(function(player) {

    if(!airplanebattle.utils.isAdmin(player)) {
      return airplanebattle.chat.send(player, "You're not allowed to use this command", airplanebattle.config.colours.red);
    }
    jcmp.events.Call('airplanebattle_start_battle');
    airplanebattle.chat.send(player, "Battle Start");

  }));



}

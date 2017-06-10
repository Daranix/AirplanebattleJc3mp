'use strict';

const utility = require('../gm/utility');

module.exports = ({ Command, manager }) => {
  const weathers = [
    'base',
    'rain',
    'overcast',
    'thunderstorm',
    'fog',
    'snow'
  ];

  manager.category('world', 'world related commands')
  // /localtime [hour] [minute]
  .add(new Command('localtime')
    .parameter('hour', 'number', 'hour (0-24)')
    .parameter('minute', 'number', 'minute (0-59)')
    .description('sets the local time. use /resetTime to reset it')
    if(!airplanebattle.utils.isAdmin(player)) {
      return airplanebattle.chat.send(player, "You're not allowed to use this command", airplanebattle.config.colours.red);
    }
    .handler((player, hour, minute) => {
      if (hour < 0 || hour > 24 || minute < 0 || minute > 60) {
        return 'usage';
      }

      airplanebattle.timeManager.setTimeForPlayer(player, hour, minute);
      player.airplanebattle.custom_time_set = true;

      let formattedTime = airplanebattle.utils.timeFormat(hour, minute);
      airplanebattle.chat.send(player, `Set your time to ${formattedTime}.`, airplanebattle.config.colours.command_success);
  }))

    // /weather [preset name]
    .add(new Command('weather')
        .parameter('weather', 'string', 'available presets: base, rain, overcast, thunderstorm, fog, snow', {
        hints: ['base', 'rain', 'overcast', 'thunderstorm', 'fog', 'snow'] })
        .description('sets the global weather preset')
        .timeout(180000)
        .handler((player, weather) => {
          if(!airplanebattle.utils.isAdmin(player)) {
            return airplanebattle.chat.send(player, "You're not allowed to use this command", airplanebattle.config.colours.red);
          }
            const idx = weathers.indexOf(weather);
            if (idx === -1) {
                return 'usage';
            }

            // assign the weather to all players
            jcmp.players.forEach(p => {
                if (typeof p.airplanebattle !== 'undefined' && p.airplanebattle.custom_weather_set) {
                    return;
                }
                jcmp.events.CallRemote('airplanebattle_set_weather', p, idx);
            });

            airplanebattle.config.world.weather = idx;
            airplanebattle.chat.broadcast(`${player.escapedNametagName} has set the weather to '${weather}'!`, airplanebattle.config.colours.orange);
        }))


  // /localweather [preset name]
  .add(new Command('localweather')
    .parameter('weather', 'string', 'available presets: base, rain, overcast, thunderstorm, fog, snow', {
    hints: ['base', 'rain', 'overcast', 'thunderstorm', 'fog', 'snow'] })
    .description('sets the local weather preset')
    .handler((player, weather) => {
      if(!airplanebattle.utils.isAdmin(player)) {
        return airplanebattle.chat.send(player, "You're not allowed to use this command", airplanebattle.config.colours.red);
      }
      const idx = weathers.indexOf(weather);
      if (idx === -1) {
        return 'usage';
      }

      player.airplanebattle.custom_weather_set = true;
      jcmp.events.CallRemote('airplanebattle_set_weather', player, idx);
      airplanebattle.chat.send(player, `Set your weather to ${weather}.`, airplanebattle.config.colours.command_success);
  }))

  .add(new Command('resettime')
    .description('resets your local time')
    .handler(player => {
      if(!airplanebattle.utils.isAdmin(player)) {
        return airplanebattle.chat.send(player, "You're not allowed to use this command", airplanebattle.config.colours.red);
      }
      if (typeof player.airplanebattle !== 'undefined' && player.airplanebattle.custom_time_set) {
        player.airplanebattle.custom_time_set = false;
        airplanebattle.timeManager.updatePlayer(player);

        let formattedTime = airplanebattle.utils.timeFormat(airplanebattle.timeManager.hour, airplanebattle.timeManager.minute);
        airplanebattle.chat.send(player, `Resetting your time to ${formattedTime}`, airplanebattle.config.colours.command_success);
      }
    }))

  .add(new Command('resetweather')
    .description('resets your local weather')
    .handler(player => {
      if(!airplanebattle.utils.isAdmin(player)) {
        return airplanebattle.chat.send(player, "You're not allowed to use this command", airplanebattle.config.colours.red);
      }
      if (typeof player.airplanebattle !== 'undefined' && player.airplanebattle.custom_weather_set) {
        player.airplanebattle.custom_weather_set = false;
        jcmp.events.CallRemote('airplanebattle_set_weather', player, airplanebattle.config.world.weather);

        airplanebattle.chat.send(player, `Resetting your weather.`, airplanebattle.config.colours.command_success);
      }
    }));
};

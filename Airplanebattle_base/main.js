

global.airplanebattle = {
    commands: jcmp.events.Call('get_command_manager')[0],
    chat: jcmp.events.Call('get_chat')[0],
    config: require('./gm/config'),
    utils: require('./gm/utility'),
    workarounds: require('./gm/_workarounds'),
    workarounds2: require('./gm/_workarounds2.js'),

    //timeManager: new (require('./gm/timeManager'))(13, 0),
    BRGame: require('./gm/BRGame.js'),
    game: {
      players: {
        onlobby: [],
        ingame: []
      },
      toStart: false,
      StartTimer: null,
      TimerArea : 2,
      games: [],
      gamesCount: 0,
      arenaList: require('./gm/arenaList.js'),
      timeToStart: 0,
      battleduration: 5
    },
    
};




process.on('uncaughtException', e => console.error(e.stack || e));


// load all commands from the 'commands' directory
airplanebattle.commands.loadFromDirectory(`${__dirname}/commands`, (f, ...a) => require(f)(...a));
// load all event files from the 'events' directory
airplanebattle.utils.loadFilesFromDirectory(`${__dirname}/events`);

setInterval(function() {
  jcmp.events.Call('airplanebattle_updates');
}, 500);

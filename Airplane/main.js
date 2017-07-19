
global.airplanebattle = {
    commands: jcmp.events.Call('get_command_manager')[0],
    chat: jcmp.events.Call('get_chat')[0],
    config: require('./gm/config'),
    utils: require('./gm/utility'),
    colours: require('./vendor/randomColor'),
    workarounds: require('./gm/_workarounds'),
    bans: new Set(),
    timeManager: new (require('./gm/timeManager'))(13, 0),
    poiManager: new (require('./gm/poiManager'))(),
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
      gamesCount: 1,
      battleduration: 1
    },
    arena:{
      volcano: require('./arena/volcano.js'),
      city: require('./arena/city.js')
    }
};

function main() {


  process.on('uncaughtException', e => console.error(e.stack || e));


  // load all commands from the 'commands' directory
  airplanebattle.commands.loadFromDirectory(`${__dirname}/commands`, (f, ...a) => require(f)(...a));
  // load all event files from the 'events' directory
  airplanebattle.utils.loadFilesFromDirectory(`${__dirname}/events`);

  airplanebattle.timeManager.start();

  setInterval(function() {
    jcmp.events.Call("airplanebattle_updates");
  }, 1000) //every second call this event
  setInterval(function() {
    jcmp.events.Call("airplanebattle_player_outarea");
  }, 1000) //every second call this event

}


main();

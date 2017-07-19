'use strict';
// UI
const ui = new WebUIWindow('airplanebattle_ui', 'package://airplanebattle/ui/index.html', new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));

ui.autoResize = true;
//Nametag

 // TODO: Render texture to make appear the limit , better timer appear for out of the area , loading screen , leaderboard only show people on you're dimension
const up = new Vector3f(0, 1, 0);
const scaleFactor = new Vector3f(0.0001, 0.0001, 0.0001);
const minScale = new Vector3f(0.001, 0.001, 0.001);
const maxScale = new Vector3f(0.008, 0.008, 0.008);
const maxScaleGroup = new Vector3f(0.014, 0.014, 0.014);
const nameTagTextSize = new Vector2f(100000, 1000000);
// colours
const white = new RGBA(255, 255, 255, 255);
const black = new RGBA(0, 0, 0, 255);
const red = new RGBA(255, 0, 0, 255);
const darkred = new RGBA(40, 0, 0, 255);
const playersCache = [];
//POI
let pois = [];
// player
let playeringame = false;
let centerc = new Vector3f(0, 0, 0);
jcmp.localPlayer.healthEffects.regenRate = 0;
// function
function createCache(id, name, colour) {
    playersCache[id] = {
        id: id,
        name: name,
        colour: colour,
        colour_rgb: hex2rgba(colour),
        isAdmin: false,
        stats: {
            kills: 0,
            deaths: 0
        },

        nametag: {
            textMetric: null,
            textPos: null,
            shadowPos: null,
            iconPos: null,

        }
    };
    return playersCache[id];
}

function hex2rgba(colour) {
    colour = colour.replace('#', '');
    const r = parseInt(colour.substring(0, 2), 16);
    const g = parseInt(colour.substring(2, 4), 16);
    const b = parseInt(colour.substring(4, 6), 16);
    return new RGBA(r, g, b, 255);
}

function GetDistanceBetweenPoints(v1, v2) {
        let dx = v1.x - v2.x;
        let dy = v1.y - v2.y;
        let dz = v1.z - v2.z;

        return Math.sqrt( dx * dx + dy * dy + dz * dz );
    }

function GetDistanceBetweenPointsXY(v1, v2) {
      let v13f = new Vector3f(v1.x, v1.y, 0.0);
      let v14f = new Vector3f(v2.x, v2.y, 0.0);
      return GetDistanceBetweenPoints(v13f, v14f);
    }

function IsPointInCircle(v1, v2, radius) {
      if(GetDistanceBetweenPointsXY(v1, v2) <= radius) return true;
      return false;
    }
    jcmp.events.AddRemoteCallable('outarea_toggle',function(toggle) {
      jcmp.ui.CallEvent('outarea_toggle', toggle);
  });

  jcmp.events.AddRemoteCallable('airplanebattle_player_created', function(data) {
    data = JSON.parse(data);
    const playerCache = createCache(data.id, data.name, data.colour);
    playerCache.isAdmin = data.isAdmin;
    playersCache[data.id] = playerCache;
    jcmp.ui.CallEvent('airplanebattle_scoreboard_addplayer', JSON.stringify({
        id: data.id,
        name: data.name,
        colour: data.colour,
        kills: 0,
        deaths: 0,
        isAdmin: data.isAdmin,
        isLocalPlayer: data.id === jcmp.localPlayer.networkId
    }));

  });
  jcmp.ui.AddEvent('airplanebattle_toggle_cursor', (toggle) => {
      jcmp.localPlayer.controlsEnabled = !toggle;
  });




    jcmp.events.AddRemoteCallable('airplanebattle_playeringame_true', function() {
      playeringame = true ;
    });

    jcmp.events.AddRemoteCallable('airplanebattle_playeringame_false', function() {
      playeringame = false ;
    });

  jcmp.events.AddRemoteCallable('airplanebattle_distance_player_center_server', function(center) {
    //calcul distance between player and center of the area

    let c = JSON.parse(center);
    centerc = new Vector3f(c.x, c.y, c.z);

});



    jcmp.events.AddRemoteCallable('airplanebattle_outarea_timer_client', function(timer) {
        let times = 60;
        times = timer;
        jcmp.ui.CallEvent('airplanebattle_outarea_timer_html',times);
      });

      jcmp.events.AddRemoteCallable('airplanebattle_UI_Show', function() {
        jcmp.ui.CallEvent('limitareavisible',true);
      });

      jcmp.events.AddRemoteCallable('airplanebattle_UI_Hide', function() {
        jcmp.ui.CallEvent('limitareavisible',false);
      });

      jcmp.events.AddRemoteCallable('airplanebattle_deathui_show', () => {
        jcmp.ui.CallEvent('airplanebattle_deathui_toggle', true);
      });

      jcmp.events.AddRemoteCallable('airplanebattle_deathui_hide', () => {
        jcmp.ui.CallEvent('airplanebattle_deathui_toggle', false);
      });

      jcmp.events.Add('GameTeleportInitiated', () => {
        jcmp.events.CallRemote('airplanebattle_player_spawning');
      });

      jcmp.events.Add('GameTeleportCompleted', () => {
        jcmp.events.CallRemote('airplanebattle_player_spawned');
      });

      jcmp.ui.AddEvent('airplanebattle_ready', () => {
       jcmp.events.CallRemote('airplanebattle_UI_ready');
       jcmp.print("airplanebattle_UI_ready");
     });

      jcmp.events.AddRemoteCallable('airplanebattle_init', (data) => {
        data = JSON.parse(data);
            data.players.forEach(p => {
              jcmp.print("player:" + p);
                const playerCache = createCache(p.id, p.name, p.colour);
                playerCache.stats.kills = p.kills;
                playerCache.stats.deaths = p.deaths;
                playerCache.isAdmin = p.isAdmin;

                jcmp.ui.CallEvent('airplanebattle_scoreboard_addplayer', JSON.stringify({
                    id: p.id,
                    name: p.name,
                    colour: p.colour,
                    kills: p.kills,
                    deaths: p.deaths,
                    isAdmin: p.isAdmin,
                    isLocalPlayer: p.id === jcmp.localPlayer.networkId
                }));
            });

        jcmp.ui.CallEvent('airplanebattle_initialised');
      });





      jcmp.events.AddRemoteCallable('airplanebattle_set_time', (hour, minute) => {
        jcmp.world.SetTime(hour, minute, 0);
      });

      jcmp.events.AddRemoteCallable('airplanebattle_set_weather', weather => {
        jcmp.world.weather = weather;
      });

      jcmp.events.AddRemoteCallable('airplanebattle_player_destroyed', (networkId) => {
        jcmp.ui.CallEvent('airplanebattle_scoreboard_removeplayer', networkId);
        if (playersCache[networkId] !== null)
        delete playersCache[networkId];
      });

      jcmp.events.AddRemoteCallable('airplanebattle_die_client_appear', (kill) => {
        jcmp.ui.CallEvent('airplanebattle_die_update', kill);
        jcmp.ui.CallEvent('airplanebattle_die_list', true);
      });

      jcmp.events.AddRemoteCallable('airplanebattle_die_client_remove', () => {
        jcmp.ui.CallEvent('airplanebattle_die_list', false);
      });

      jcmp.events.AddRemoteCallable('airplanebattle_playerneed_client', (data) => {
        let playersneed = 0;
        let c = JSON.parse(data);
        playersneed = c.need - c.ingame ;
        jcmp.ui.CallEvent('airplanebattle_playerneed_launch', playersneed);
      });


jcmp.events.AddRemoteCallable('airplanebattle_area_reduced_client_true', () => {
  jcmp.ui.CallEvent('airplanebattle_area_reduced', true);
});
jcmp.events.AddRemoteCallable('airplanebattle_area_reduced_client_false', () => {
  jcmp.ui.CallEvent('airplanebattle_area_reduced', false);
});

jcmp.events.AddRemoteCallable('airplanebattle_kill', (kill) => {
  jcmp.ui.CallEvent('airplanebattle_kill_made', kill);
});

jcmp.events.AddRemoteCallable('airplanebattle_winner_client_true', () => {
  jcmp.ui.CallEvent('airplanebattle_winner_toggle', true);
});
jcmp.events.AddRemoteCallable('airplanebattle_winner_client_false', () => {
  jcmp.ui.CallEvent('airplanebattle_winner_toggle', false);
});
jcmp.events.AddRemoteCallable('airplanebattle_winner_client_name', (playername) => {
  jcmp.ui.CallEvent('airplanebattle_win_playername', playername);
});

jcmp.events.AddRemoteCallable('airplanebattle_winner_client_true_all', () => {
  jcmp.ui.CallEvent('airplanebattle_winner_toggleforall', true);
});
jcmp.events.AddRemoteCallable('airplanebattle_winner_client_false_all', () => {
  jcmp.ui.CallEvent('airplanebattle_winner_toggleforall', false);
});

jcmp.events.AddRemoteCallable('airplanebattle_player_death', (data) => {
    data = JSON.parse(data);

    let cache = playersCache[data.player.networkId];
    if (typeof cache !== 'undefined') {
        jcmp.ui.CallEvent('airplanebattle_scoreboard_updateplayer', data.player.networkId, data.player.kills, data.player.deaths);
        cache.stats.kills = data.player.kills;
        cache.stats.deaths = data.player.deaths;
    }

    if (typeof data.killer !== 'undefined') {
        cache = playersCache[data.killer.networkId];
        if (typeof cache !== 'undefined') {
            jcmp.ui.CallEvent('airplanebattle_scoreboard_updateplayer', data.killer.networkId, data.killer.kills, data.killer.deaths);
            cache.stats.kills = data.killer.kills;
            cache.stats.deaths = data.killer.deaths;
        }
    }

});




// end of Basics

//Admin icon start
const admin_icon = new WebUIWindow('airplanebattle_admin_icon', 'package://airplanebattle/ui/icon.html', new Vector2(41, 42));
admin_icon.autoRenderTexture = false;


function RenderNametag(renderer, playerCache, distance,player) {
    if (typeof playerCache !== 'undefined') {
        let distscale = (distance * 2.4);
        // build the name metric if needed
        if (playerCache.nametag.textMetric === null) {
            const metric = renderer.MeasureText(playerCache.name, 100, 'Arial');
            playerCache.nametag.textMetric = metric;
            playerCache.nametag.textPos = new Vector3f(-(metric.x / 2), -400, 0);
            playerCache.nametag.shadowPos = new Vector3f(-(metric.x / 2) + 5, -395, 1);
            playerCache.nametag.iconPos = new Vector3f(-(metric.x / 2) - 100, -363, 0);

        }
        if (distscale >= 350) {
            distscale = 350;
        }
        // adjust position based on distance
        playerCache.nametag.textPos.y = (-400 + distscale);
        playerCache.nametag.shadowPos.y = (-395 + distscale);




        // draw player name
        renderer.DrawText(playerCache.name, playerCache.nametag.textPos, nameTagTextSize, playerCache.colour_rgb, 100, 'Arial');
        renderer.DrawText(playerCache.name, playerCache.nametag.shadowPos, nameTagTextSize, black, 100, 'Arial');
        if(playerCache.isAdmin) {
          renderer.DrawTexture(admin_icon.texture, playerCache.nametag.iconPos);
        }


    }
}




function dist(start, end) {
    return end.sub(start).length;
}

const border = new WebUIWindow("airplanebattle - border area texture", "package://airplanebattle/ui/border.html", new Vector2(1000, 1000));
border.autoRenderTexture = false;
border.autoResize = false;
border.captureMouseInput = false;
border.hidden = true;

var lplayer = {
    ingame: false
};

let center = new Vector3f(0,0,0);
let m = CreateNewBorderMatrix();
let delta = 0;
let diameter = new Vector2f(0,0);
let shrink_border = false;
let shrink_size = 0;
let maxY = 0;

jcmp.events.AddRemoteCallable('airplanebattle_client_gameStart', function(data) {



    data = JSON.parse(data);

    maxY = data.maxY;
    center = new Vector3f(data.center.x, data.center.y, data.center.z);
    diameter = new Vector2f(data.diameter, data.diameter);
    m = CreateNewBorderMatrix();

    // DIAMETER = AREA SIZE

    lplayer.ingame = true;



});


jcmp.events.AddRemoteCallable('airplanebattle_render_setColor', function(color) {
    jcmp.ui.CallEvent('airplanebattle_render_setColor', color);
});

jcmp.events.AddRemoteCallable('airplanebattle_client_gameEnd', function() {
    lplayer.ingame = false;
});


function RenderCircle(renderer, texture, translation, size)
{
    renderer.DrawTexture(texture, translation, size);
}

function CreateNewBorderMatrix()
{
    let m2 = new Matrix().Translate(center);
    m2 = m2.Rotate(Math.PI / 2, new Vector3f(1, 0, 0));
    return m2;
}
let cachedPlayer = null;
jcmp.events.Add('GameUpdateRender', (renderer) => {
    const cam = jcmp.localPlayer.camera.position;

   jcmp.players.forEach(player => {

     const playerCache = playersCache[player.networkId];
     if (typeof playerCache !== 'undefined') {
         let head = player.GetBoneTransform(0xA877D9CC, renderer.dtf);
         const d = dist(head.position, cam);
         let scale = new Vector3f(d, d, d).mul(scaleFactor);
         if (scale.x >= maxScaleGroup.x) {
             scale = maxScaleGroup;
         } else if (scale.x <= minScale.x) {
             scale = minScale;
         }
         const mat = head.LookAt(head.position, cam, up).Scale(scale);
         renderer.SetTransform(mat);
         RenderNametag(renderer, playerCache, d);
         }
      })



    if(!lplayer.ingame) {
        return;
    }

    renderer.SetTransform(m);
    const max_circles = 10;
    const max_delta = maxY;
    for (let i = 1; i <= max_circles; i++)
    {
        let d = delta + (max_delta / max_circles) * i;
        if (d > max_delta)
        {
            d -= max_delta;
        }
        RenderCircle(renderer, border.texture, new Vector3f(-diameter.x / 2, -diameter.x / 2, d), diameter);
    }
    delta += 1 / 2;
    if (delta > max_delta)
    {
        delta = 0;
    }
    if (shrink_border)
    {
        let new_size = (diameter.x > shrink_size) ? diameter.x - 0.75 : shrink_size;
        diameter = new Vector2f(new_size, new_size);
    }



    });

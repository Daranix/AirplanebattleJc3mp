// TODO LIST
// TODO: Disable/change the health regen on the start on the battle boost on wingsuit and grapel
// TODO: Random weather on the arena
// NOTE: Group all the things on the client side UI's etc etc ...

// Loadscreen UI
try {

var loadScreenUI = new WebUIWindow("airplanebattle LoadScreen", "package://airplanebattle/ui/loadscreen.html", new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
loadScreenUI.autoResize = true;
loadScreenUI.captureMouseInput = false;

jcmp.events.Add('GameTeleportCompleted', function() {
    jcmp.ui.CallEvent('airplanebattle_loadscreen_toggle', false);
});

jcmp.events.Add('GameTeleportInitiated', function() {
    jcmp.ui.CallEvent('airplanebattle_loadscreen_toggle', true);
})



// ------------------ INFO TEXT --------------------- //

var infoTextUI = new WebUIWindow("airplanebattle screen text", "package://airplanebattle/ui/inscreenText.html", new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
infoTextUI.autoResize = true;
infoTextUI.captureMouseInput = false;

jcmp.events.AddRemoteCallable('airplanebattle_txt_general', function(text, hideTimeMS) {
    jcmp.ui.CallEvent('airplanebattle_txt_general', text, hideTimeMS);
});

jcmp.events.AddRemoteCallable('airplanebattle_txt_leftplayers_toggle', function(status) {
    jcmp.ui.CallEvent('airplanebattle_txt_leftplayers_toggle', status);
});

jcmp.events.AddRemoteCallable('airplanebattle_txt_timeleft_toggle', function(status) {
    jcmp.ui.CallEvent('airplanebattle_txt_timeleft_toggle', status);

});

jcmp.events.AddRemoteCallable('airplanebattle_txt_timerStart', function(start) {
    jcmp.ui.CallEvent('airplanebattle_txt_timerStart', start);
})

jcmp.events.AddRemoteCallable('airplanebattle_txt_needPlayers', function(need) {
    jcmp.ui.CallEvent('airplanebattle_txt_needPlayers', need);
});

jcmp.events.AddRemoteCallable('airplanebattle_txt_updateTime', function(ms) {
    jcmp.ui.CallEvent('airplanebattle_txt_updateTime', ms);
});

jcmp.ui.AddEvent('airplanebattle_txt_ready', function() {
    jcmp.events.CallRemote('airplanebattle_txt_ready');
});

jcmp.events.Add("airplanebattle_txt_gameleftplayers_setnpstart", function(npstart) {
    jcmp.ui.CallEvent("airplanebattle_txt_gameleftplayers_setnpstart", npstart);
});

jcmp.events.AddRemoteCallable('airplanebattle_txt_gameleftplayers_show', function(nleft) {
    jcmp.ui.CallEvent('airplanebattle_txt_gameleftplayers_show', nleft);
})

// --------------------- DEATH UI ---------------- //

var deathUI = new WebUIWindow("airplanebattle deathui", "package://airplanebattle/ui/deathui.html", new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
deathUI.autoResize = true;
deathUI.captureMouseInput = false;

jcmp.events.AddRemoteCallable('airplanebattle_deathui_show', function(killerName) {
    jcmp.ui.CallEvent('airplanebattle_deathui_show', killerName);
});

jcmp.events.CallRemote('airplanebattle_debug', 'DeathUI LOADED');

//  --------------------- Area circle texture render ----------------- //

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

/*
jcmp.events.Add('airplanebattle_render_circles', function(data) {
    data = JSON.parse(data);

    m = CreateNewBorderMatrix();

    // DIAMETER = AREA SIZE

    center = new Vector3f(data.center.x, data.center.y, data.center.z);
    diameter = new Vector2f(data.diameter, data.diameter);

});*/

jcmp.events.AddRemoteCallable('airplanebattle_client_gameStart', function(data) {

    jcmp.events.CallRemote('airplanebattle_debug', data);



    data = JSON.parse(data);
    jcmp.events.Call('airplanebattle_txt_gameleftplayers_setnpstart', data.npstart);

    maxY = data.maxY;
    center = new Vector3f(data.center.x, data.center.y, data.center.z);
    diameter = new Vector2f(data.diameter, data.diameter);
    m = CreateNewBorderMatrix();

    // DIAMETER = AREA SIZE

    lplayer.ingame = true;

    // Disable lobby static text

    jcmp.ui.CallEvent('airplanebattle_txt_timerStart', false);
    jcmp.ui.CallEvent('airplanebattle_txt_leftplayers_toggle', false);

});

jcmp.events.AddRemoteCallable('airplanebattle_render_setColor', function(color) {
    jcmp.ui.CallEvent('airplanebattle_render_setColor', color);
});

jcmp.events.AddRemoteCallable('airplanebattle_client_gameEnd', function() {
    lplayer.ingame = false;
});


jcmp.events.AddRemoteCallable('airplanebattle_render_updateDiameter', function(newDiameter, newCenter) {
    newCenter = JSON.parse(newCenter);
    center = new Vector3f(newCenter.x, newCenter.y, newCenter.z);
    diameter = new Vector2f(newDiameter, newDiameter);
    m = CreateNewBorderMatrix();
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


jcmp.events.Add("GameUpdateRender", function(renderer) {




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

// ---

// Loadscreen is the first thing to load but always when is visible, should be on the front
loadScreenUI.BringToFront();
} catch(err) {
 jcmp.events.CallRemote('airplanebattle_debug', `CLIENTSIDE ERROR: ${err.message} on line: ${err.lineNumber}`);
}

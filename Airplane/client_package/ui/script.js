(function($, document, window, undefined) {
    $(function() {

        var $window = $(window),
            $initialised = false,
            $deathui = $('#deathui'),
            $spawnprot = $('#spawn');
            $scoreboard = $('#scoreboard'),
            $players_el = $('#scoreboard .players'),
            $players = [],
            $scoreboard_toggle_mouse_key = 79,
            $scoreboard_toggle_key = 80,
            $is_scoreboard_key_down = false,
            $is_scoreboard_mouse_down = false,
            $death_messages = [],


            jcmp.AddEvent('airplanebattle_deathui_toggle', function(toggle) {
          if (toggle) {
              $deathui.addClass('visible');
          } else {
              $deathui.removeClass('visible');
          }
      });

jcmp.AddEvent('airplanebattle_accueil_toggle', (screen_visible) => {
  if(screen_visible) {
      $('#accueil').show();
  } else {
      $('#accueil').hide();

  }
});
jcmp.AddEvent('airplanebattle_winner_toggle', (screen_visible) => {
  if(screen_visible) {
      $('#winner').show();

  } else {
      $('#winner').hide();

  }
});

jcmp.AddEvent('airplanebattle_winner_toggleforall', (screen_visible) => {
  if(screen_visible) {
      $('#isthewinner').show();

  } else {
      $('#isthewinner').hide();

  }
});

jcmp.AddEvent('airplanebattle_win_playername',(playername)=>{
   $("#winnername").text(playername);
 });


      jcmp.AddEvent('outarea_toggle', (screen_visible) => {
        if(screen_visible) {
            $('#area').show();
            $('#timerdiv').show();

        } else {
            $('#area').hide();
            $('#timerdiv').hide();

        }
      });

            jcmp.AddEvent('limitareavisible', (screen_visible) => {
                if(screen_visible) {
                    $('#radiusdiv').show();
                    $('#areadiv').show();
                    $('#numberplayercontainer').show();
                    $('#peoplebeforelanunch').hide();

                } else {
                    $('#radiusdiv').hide();
                    $('#areadiv').hide();
                    $('#numberplayercontainer').hide();
                    $('#peoplebeforelanunch').show();
                }
            });

            jcmp.AddEvent('airplanebattle_outarea_timer_html',(time)=>{
              $("#timer").text(parseInt(time) + " Sec");
            });


            jcmp.AddEvent('airplanebattle_healthbar_update', (num) => {
              let hp = ((1 - num) * 100) + "%";
              let path = "polygon(0 " + hp + ", 100% " + hp + ", 100% 100%, 0 100%)";
              $("div.inside").css({"clip-path": path});
            });

            jcmp.AddEvent('airplanebattle_distance_update',(distance)=>{
               $("#radiusdistance").text(parseInt(distance));
             });


             jcmp.AddEvent('airplanebattle_radius_update',(distance)=>{
                $("#areadistance").text(distance);
              });
              Array.prototype.remove = function(val) {
                var index = this.indexOf(val);
                if(index >= 0) this.splice(index, 1);
                return this;
              }

              let arraydie = [];
              let removename = false;
              jcmp.AddEvent('airplanebattle_die_update',(playedie)=>{
                arraydie.push(playedie);
                if (arraydie.length > 0){
                  $("#playerdie").text(arraydie[0] + " died");
                  setTimeout(() => {   removename = true;   $("#playerdie").text(" ");}, 6000);
                  if (removename){
                    arraydie.remove(arraydie[0]);
                    removename = false;
                  }
                }
               });

               jcmp.AddEvent('airplanebattle_die_list', (screen_visible) => {
                   if(screen_visible) {
                       $('#peopledielist').show();
                   } else {
                       $('#peopledielist').hide();
                   }
               });

               jcmp.AddEvent('airplanebattle_area_reduced', (screen_visible) => {
                   if(screen_visible) {
                       $('#reducearea').show();
                   } else {
                       $('#reducearea').hide();
                   }
               });

            jcmp.CallEvent('airplanebattle_ready'); // Ui Ready

            jcmp.AddEvent('airplanebattle_playerneed_launch',(numberplayerneed)=>{
               $("#intplayerneed").text(numberplayerneed);
             });


                     function addPlayer(player) {
                         if (typeof findPlayer(player.id) !== 'undefined') {
                             return false;
                         }

                         var $el = $('<div class="row" style="color:' + player.colour + ';"> \
                             <div class="column" data-element="networkId">' + player.id + '</div> \
                             <div class="column" data-element="name">' + player.name + '</div> \
                             <div class="column" data-element="kills">' + player.kills + '</div> \
                             <div class="column" data-element="deaths">' + player.deaths + '</div> \
                         </div>');

                         // if they're an admin, add the icon
                         if (player.isAdmin) {
                             $el.find('[data-element="name"]').prepend('<img src="imgs/admin.png" />');
                         }

                         player.isLocalPlayer ? $el.prependTo($players_el) : $el.appendTo($players_el);
                         player.element = $el;
                         $players.push(player);
                         return true;
                     }

                     function destroyPlayer(networkId) {
                         var player = findPlayer(networkId);
                         if (typeof player === 'undefined') {
                             return false;
                         }

                         player.element.remove();
                         $players.splice($players.indexOf(player), 1);
                         return true;
                     }

                     function updatePlayer(networkId, kills, deaths) {
                         var player = findPlayer(networkId);
                         if (typeof player === 'undefined') {
                             return false;
                         }

                         player.kills = kills;
                         player.deaths = deaths;
                         player.element.find('[data-element="kills"]').text(player.kills);
                         player.element.find('[data-element="deaths"]').text(player.deaths);
                     }

                     function findPlayer(networkId) {
                         var result = $.grep($players, function(obj) {
                             return obj.id == networkId;
                         });

                         if (result.length === 0) {
                             return undefined;
                         }

                         return result[0];
                     }

                     function formatPlayerName(name, colour, isKiller) {
                         var format;

                         if (typeof name !== 'undefined') {
                             format = $('<span />', {
                                 text: name,
                                 class: isKiller ? 'killer' : 'victim',
                                 style: 'color: ' + colour
                             });

                             if (name.length > 20) {
                                 format.addClass('small');
                             }
                         }

                         return format;
                     }
                     function addDeathMessage(victimId, killerId, reason) {
           var message = '';
           var found_atleast_one_player = false;

           if (typeof killerId !== 'undefined' && killerId !== victimId) {
               var killer = findPlayer(killerId);
               if (typeof killer !== 'undefined') {
                   var format = formatPlayerName(killer.name, killer.colour, true);
                   message += format[0].outerHTML + ' ';
                   found_atleast_one_player = true;
               }

               message += reason;

               var victim = findPlayer(victimId);
               if (typeof victim !== 'undefined') {
                   var format = formatPlayerName(victim.name, victim.colour, false);
                   message += ' ' + format[0].outerHTML;
                   found_atleast_one_player = true;
               }
           } else {
               var victim = findPlayer(victimId);
               if (typeof victim !== 'undefined') {
                   var format = formatPlayerName(victim.name, victim.colour, false);
                   message += format[0].outerHTML + ' ';
                   found_atleast_one_player = true;
               }

               message += reason;
           }

           // only add the message if we found the player.
           // this fixes issues with empty names in the death list when kills are added before the scoreboard
           // is initialised.
           if (found_atleast_one_player) {
               var message_el = $('<p />').html(message);
               message_el.appendTo($deathlist);
               $deathlist.removeClass('hidden');

               if ($deathlist_timeout) {
                   clearTimeout($deathlist_timeout);
                   $deathlist_timeout = false;
               }

               $death_messages.push(message_el);
               if ($death_messages.length >= 9) {
                   removeDeathMessage($death_messages[0]);
               }

               $deathlist_timeout = setTimeout(function() {
                   $deathlist.addClass('hidden');
                   $deathlist_timeout = false;
               }, 6000);

               return message_el;
           }

           return false;
       }

       function removeDeathMessage(element) {
           element.remove();
           $death_messages.splice($death_messages.indexOf(element), 1);
       }


               jcmp.AddEvent('freeroam_scoreboard_addplayer', function(data) {
                   addPlayer($.parseJSON(data));
               });

               jcmp.AddEvent('freeroam_scoreboard_updateplayer', function(networkId, kills, deaths) {
                   updatePlayer(networkId, kills, deaths);
               });

               jcmp.AddEvent('freeroam_scoreboard_removeplayer', function(networkId) {
                   destroyPlayer(networkId);
               });

               $window.keydown(function(event) {
                        // toggle scoreboard
                        if (event.which === $scoreboard_toggle_key && $initialised && !$chat_input_visible && !$is_scoreboard_key_down && !$deathui.hasClass('visible')) {
                            $scoreboard.addClass('visible');
                            $is_scoreboard_key_down = true;
                        }

                        // toggle scoreboard cursor
                        if (event.which === $scoreboard_toggle_mouse_key && $is_scoreboard_key_down) {
                            $is_scoreboard_mouse_down = !$is_scoreboard_mouse_down;
                            $is_scoreboard_mouse_down ? jcmp.ShowCursor() : jcmp.HideCursor();
                            jcmp.CallEvent('freeroam_toggle_cursor', $is_scoreboard_mouse_down);
                            $scoreboard.toggleClass('scrollable', $is_scoreboard_mouse_down);
                        }
                    });

                    $window.keyup(function(event) {
                        if (event.which === $scoreboard_toggle_key && $initialised && $is_scoreboard_key_down) {
                            $scoreboard.removeClass('visible');
                            $is_scoreboard_key_down = false;

                            // if the scoreboard right mouse button was pressed, hide the cursor now
                            if ($is_scoreboard_mouse_down) {
                                $is_scoreboard_mouse_down = false;
                                jcmp.HideCursor();
                                jcmp.CallEvent('freeroam_toggle_cursor', false);
                                $scoreboard.toggleClass('scrollable', false);
                            }
                        }

                        // hide the help message
                        if (event.which === 88 && !$chat_input_visible && $helpmessage.hasClass('visible')) {
                            $helpmessage.removeClass('visible');
                        }
                    });




    });
})(jQuery, document, window);

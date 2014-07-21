sb = {
  fps: 50,
  default_gravity: 8,
  default_lift: 18,
  default_velocity: 4,
  default_drag: 1,
  frame_count: 0,
  score: 0,
  game_over: false,
  next_frame: function(){
    if(sb.game_over){
      clearInterval(sb._intervalId);
      sb.endGame();
      return;
    }
    sb.frame_count += 1;
    sb.update();
    sb.draw();
  },
  update: function(){
    $("#score").text(sb.score);  

    //collision detection
    $(".surface").each(function(idx, surface){
      if(sb._collision($(sb.player.sprite), $(surface))){
        console.log('worlds collide', sb.player, $(surface));
        sb.game_over = true;
      }
    });

    //update player position
    sb.player.y_pos = sb.player.y_pos - sb.default_gravity + sb.player.lift

    //calculate new upward lift
    if(sb.player.lift > 0) { sb.player.lift -= sb.default_drag }

    //draw another obstacle 
    if(sb.frame_count % 100 === 0){
      sb.drawNewObstacle();
    }
  },
  draw: function(){
    //update sprite position
    $(sb.player.sprite).css('bottom',sb.player.y_pos);
    
    //move ground
    var pos = parseInt($('#ground').css('background-position').split(' ')[0])
    var newpos = pos - sb.default_velocity + 1;
    $('#ground').css('background-position', newpos + " 0");

    //move skybox
    var pos = parseInt($('#world').css('background-position').split(' ')[0])
    var newpos = pos - sb.default_velocity + 2;
    $('#world').css('background-position', newpos + " 0");


    $(".topPipe").each(function(){
      var $pipe = $(this);
      //score pipe
      if(parseInt($pipe.css('left')) <= -55){
        if(!$pipe.data('scored')){
          sb.score += 1;
          $pipe.data('scored', 'true');
        }
      }
    });

    //move pipes
    $(".pipe").each(function(){
      var $pipe = $(this);
      var pipepos = parseInt($pipe.css("left")) - sb.default_velocity;
      $pipe.css('left', pipepos);

      //remove pipe
      if(parseInt($pipe.css('left')) <= -130){
        $pipe.remove();
      }
    });
  },
  endGame: function(){
    $("#splatsound")[0].load();
    $("#splatsound")[0].play();
    $("#score").html("Game Over!<br>Score: " + sb.score);
    $("body").unbind("click");
    $("body").unbind("keypress");
    initGame();
  },
  drawNewObstacle: function(){
    var height = sb._getRandomInt(250, 450);
    var bottomPos = 684 - height + 175;
    $('<div></div>').addClass('surface').addClass('pipe').addClass('bottomPipe').css('left', '500').css('bottom', -1 * height).appendTo('#world');
    $('<div></div>').addClass('surface').addClass('pipe').addClass('topPipe').css('left', '500').css('bottom', bottomPos).appendTo('#world');
  },
    
  /*****************************************
  * Helper methods
  *****************************************/

  // Returns a random integer between min and max
  // Using Math.round() will give you a non-uniform distribution!
  _getRandomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, 

  _bounds_check: function(val, lower, upper){
    if(val >= upper) return upper;
    if(val <= lower) return lower;
    return val;
  },
  _collision: function($div1, $div2) {
    var x1 = $div1.offset().left;
    var y1 = $div1.offset().top;
    var h1 = $div1.outerHeight(true);
    var w1 = $div1.outerWidth(true);
    var b1 = y1 + h1;
    var r1 = x1 + w1;
    var x2 = $div2.offset().left;
    var y2 = $div2.offset().top;
    var h2 = $div2.outerHeight(true);
    var w2 = $div2.outerWidth(true);
    var b2 = y2 + h2;
    var r2 = x2 + w2;
      
    if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
    return true;
  },
  gameStart: function(){
    $('#info').text('');
    sb.player = {
      y_pos: 400,
      lift: 0,
      sprite: "#pc",
      fart: function(){
        sb.player.lift = sb.default_lift;
        $("#fartsound")[0].load();
        $("#fartsound")[0].play();
      }
    }

    console.log('setting up keypress');
    //listen for interaction
    $("body").click(function(e){
      sb.player.fart();
      e.preventDefault();
    });
    $("body").keypress(function(e){
      sb.player.fart();
      e.preventDefault();
    });

    console.log('removing pipes');
    $(".pipe").each(function(){
      var $pipe = $(this);
      $pipe.remove();
    });

    sb.frame_count = 0;
    sb.score = 0;
    sb.game_over = false;

    console.log('starting game loop');
    // Start the game loop
    sb._intervalId = setInterval(sb.next_frame, 1000 / sb.fps);

  }

} //end sb

$(function(){
  initGame();
});

function initGame(){
  $("#info").text("Press any key to fart!");
  $("body").keypress(function(e){
    $("body").unbind("keypress");
    sb.gameStart();
    e.preventDefault();
  });
}




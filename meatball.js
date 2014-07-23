//set up requestAnimationFrame
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

/*********************************************
 * fm - Main game class, holds parameters and methods that control the game,
 * also hold the update and draw methods for the main game loop
 ********************************************/
var fm = {
  default_gravity: 6,
  default_lift: 18,
  default_velocity: 4,
  default_drag: 1,
  frame_count: 0,
  score: 0,
  game_over: false,
  get_high_score: function(){
    var hs = localStorage.getItem('highScore') || 0
    return parseInt(hs, 10);
  },
  set_high_score: function(new_hs){
    var cur_hs = this.get_high_score();
    if(new_hs > cur_hs){
      localStorage.setItem('highScore', new_hs);
    }
  },
  next_frame: function(){
    if(fm.game_over){
      fm.gameEnd();
      return;
    }
    fm.frame_count += 1;
    fm.update();
    fm.draw();
    window.requestAnimationFrame(fm.next_frame);
  },
  update: function(){
    $("#score").text(fm.score);  

    //collision detection
    $(".surface").each(function(idx, surface){
      if(fm._collision($(fm.player.sprite), $(surface))){
        console.log('worlds collide', fm.player, $(surface));
        fm.game_over = true;
      }
    });

    //update player position
    fm.player.y_pos = fm.player.y_pos - fm.default_gravity + fm.player.lift

    //calculate new upward lift
    if(fm.player.lift > 0) { fm.player.lift -= fm.default_drag }

    //draw another obstacle 
    if(fm.frame_count % 100 === 0){
      fm.drawNewObstacle();
    }
  },
  draw: function(){
    //update sprite position
    $(fm.player.sprite).css('bottom',fm.player.y_pos);
    $('#fart').css('bottom',fm.player.y_pos - 55);

    //fade fart sprite
    var opacity = $("#fart").css('opacity');
    var newOpacity = Math.max(opacity - 0.05, 0);
    $("#fart").css('opacity', newOpacity);
    
    //move ground
    var pos = parseInt($('#ground').css('background-position').split(' ')[0])
    var newpos = pos - fm.default_velocity + 1;
    $('#ground').css('background-position', newpos + " 0");

    //move skybox
    var pos = parseInt($('#world').css('background-position').split(' ')[0])
    var newpos = pos - fm.default_velocity + 2;
    $('#world').css('background-position', newpos + " 0");


    $(".topPipe").each(function(){
      var $pipe = $(this);
      //score pipe
      if(parseInt($pipe.css('left')) <= -55){
        if(!$pipe.data('scored')){
          fm.score += 1;
          $pipe.data('scored', 'true');
        }
      }
    });

    //move pipes
    $(".pipe").each(function(){
      var $pipe = $(this);
      var pipepos = parseInt($pipe.css("left")) - fm.default_velocity;
      $pipe.css('left', pipepos);

      //remove pipe
      if(parseInt($pipe.css('left')) <= -130){
        $pipe.remove();
      }
    });
  },
  gameEnd: function(){
    fm.set_high_score(fm.score);
    $("#fart").css('opacity', 0);
    $("#splatsound")[0].load();
    $("#splatsound")[0].play();
    $("#pc-live").hide();
    $("#pc-dead").show();
    $("#score").html("Game Over!<br>Score: " + fm.score + "<br>High Score: " + fm.get_high_score());
    $("body").unbind("click");
    $("body").unbind("keypress");
    setTimeout( initGame, 500);
  },
  drawNewObstacle: function(){
    var height = fm._getRandomInt(250, 450);
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
    fm.player = {
      y_pos: 500,
      lift: 0,
      sprite: "#pc",
      fart: function(){
        fm.player.lift = fm.default_lift;
        $("#fart").css('opacity', 1);
        $("#fartsound")[0].load();
        $("#fartsound")[0].play();
      }
    }

    $("#pc-dead").hide();
    $("#pc-live").show();

    console.log('setting up keypress');
    //listen for interaction
    $("body").click(function(e){
      fm.player.fart();
      e.preventDefault();
    });
    $("body").keypress(function(e){
      fm.player.fart();
      e.preventDefault();
    });

    console.log('removing pipes');
    $(".pipe").each(function(){
      var $pipe = $(this);
      $pipe.remove();
    });

    fm.frame_count = 0;
    fm.score = 0;
    fm.game_over = false;

    console.log('starting game loop');
    // Start the game loop
    requestAnimationFrame(fm.next_frame);

  }

} //end fm

/************************************************
 * initGame()
 * listens for keypress or click and starts a new
 * game. Calls fm.gameStart()
 ***********************************************/
var initGame = function(){
  $("#info").text("Press any key to fart!");

  $("body").keypress(function(e){
    init(e);
  });
  $("body").click(function(e){
    init(e);
  });

  var init = function(e){
    $("body").unbind("keypress");
    $("body").unbind("click");
    fm.gameStart();
    e.preventDefault();
  }

}

//initialize the page
$(function(){
  initGame();
});


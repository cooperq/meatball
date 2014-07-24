//set up requestAnimationFrame
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                               window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

/*********************************************
 * fm - Main game class, holds parameters and methods that control the game,
 * also hold the update and draw methods for the main game loop
 ********************************************/
var fm = {
  default_gravity: 6, //the amount by which the player will be dragged down each frame
  default_lift: 18, //when the fart button is pressed the player will move up by this many pixels
  default_velocity: 4, //the base rate at which the world moves
  default_drag: 1, //the amount by which the lift will be dragged down each frame
  fork_low: 250, //the lowest a fork will go
  fork_high: 450, //the highest a fork will go
  fork_height: 684, //default fork image height
  fork_gap: 175, //gap between top and bottom fork
  score: 0, //the score, which starts at 0. Duh.
  game_over: false, //boolean stating wether the game has ended or not
  default_obstacle_spacing: 1500, //number of milliseconds in between each obstacle.
  obstacle_interval: null, //a placeholder for the setInterval object for drawing obstacles

  /**********************************
   * getHighScore()
   * Gets the high score from local 
   * storage or return 0 if it doesn't exist
   ***********************************/
  getHighScore: function(){
    var hs = localStorage.getItem('highScore') || 0
    return parseInt(hs, 10);
  },

  /**********************************
   * setHighScore()
   * setter for high score
   ********************************/
  setHighScore: function(new_hs){
    var cur_hs = this.getHighScore();
    if(new_hs > cur_hs){
      localStorage.setItem('highScore', new_hs);
    }
  },

  /********************************
   * nextFrame()
   * if the game is over then call game end
   * otherwise call update() and draw() 
   * and then request the next frame
   ********************************/
  nextFrame: function(){
    if(fm.game_over){
      fm.gameEnd();
      return;
    }
    fm.update();
    fm.draw();
    fm.checkCollisions();
    window.requestAnimationFrame(fm.nextFrame);
  },

  /***********************************
   * update()
   * Update all the objects positions, 
   * and anything else
   ***********************************/
  update: function(){
    $("#score").text(fm.score);  

    //update player position
    fm.player.y_pos = fm.player.y_pos - fm.default_gravity + fm.player.lift

    //calculate new upward lift
    if(fm.player.lift > 0) { fm.player.lift -= fm.default_drag }

  },

  /************************************
   * draw sprite and obstacles in their new position
   * move ground and skybox and forks
   *********************************/
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

      //remove pipe if it is off screen
      if(parseInt($pipe.css('left')) <= -130){
        $pipe.remove();
      }
    });
  },

  /*********************************
   * check for collision between player and obstacles
   ********************************/
  checkCollisions: function(){
    //collision detection
    $(".surface").each(function(idx, surface){
      if(fm._collision($(fm.player.sprite), $(surface))){
        console.log('worlds collide', fm.player, $(surface));
        fm.game_over = true;
      }
    });

  },

  /*****************************************
   * draw a new obstacle
   ****************************************/
  drawNewObstacle: function(){
    var height = fm._getRandomInt(fm.fork_low, fm.fork_high);
    var bottomPos = fm.fork_height - height + fm.fork_gap;

    //draw bottom fork
    $('<div></div>').addClass('surface').addClass('pipe').addClass('bottomPipe').css('left', '500').css('bottom', -1 * height).appendTo('#world');
    //draw top fork
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
  
  //check if a val is between lower and upper and return the outer bound if
  //val is outside
  _bounds_check: function(val, lower, upper){
    if(val >= upper) return upper;
    if(val <= lower) return lower;
    return val;
  },

  //detect if two boxes collide
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

  /**********************************
   * Start the game loop
   ********************************/
  gameStart: function(){
    //clear gameover info
    $('#info').text('');

    //initalize new player object
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

    //show pc alive sprite
    $("#pc-dead").hide();
    $("#pc-live").show();

    //listen for interaction
    $("body").click(function(e){
      fm.player.fart();
      e.preventDefault();
    });
    $("body").keypress(function(e){
      fm.player.fart();
      e.preventDefault();
    });

    // remove old pipes
    $(".pipe").each(function(){
      var $pipe = $(this);
      $pipe.remove();
    });

    //reset the score
    fm.score = 0;

    //the game is not over
    fm.game_over = false;

    //start obstacle drawing loop
    fm.obstacle_interval = setInterval(function(){
      fm.drawNewObstacle();
    }, fm.default_obstacle_spacing);

    // Start the game loop
    requestAnimationFrame(fm.nextFrame);

  },
  /**********************************
   * end the game loop, 
   *********************************/
  gameEnd: function(){
    // update the high score
    fm.setHighScore(fm.score);

    //stop drawing new obstacles
    clearInterval(fm.obstacle_interval);

    // hide farts
    $("#fart").css('opacity', 0);

    //play splat
    $("#splatsound")[0].load();
    $("#splatsound")[0].play();

    //show dead pc sprite
    $("#pc-live").hide();
    $("#pc-dead").show();

    //gmae over message
    $("#score").html("Game Over!<br>Score: " + fm.score + "<br>High Score: " + fm.getHighScore());
    
    //don't listen for interaction
    $("body").unbind("click");
    $("body").unbind("keypress");

    //game restart listener
    setTimeout( initGame, 500);
  },



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


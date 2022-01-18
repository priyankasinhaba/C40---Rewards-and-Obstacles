class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

    this.leadeboardTitle = createElement("h2");

    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }
  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();

    car1 = createSprite(width / 2 - 50, height - 100);
    car1.addImage("car1", car1_img);
    car1.scale = 0.07;

    car2 = createSprite(width / 2 + 100, height - 100);
    car2.addImage("car2", car2_img);
    car2.scale = 0.07;

    cars = [car1, car2];

      //create two groups named fuels, powerCoins and obstacles
    fuels = new Group();
    powerCoins = new Group();

   // obstacles = new Group();

    /*We can use the same addSprites() functions to create
multiple obstacles and add them to the group.
However, in doing so, one of the players might get more
obstacles than others. In order to prevent this, we will
pre-define the position of the obstacles in the game.
If you notice in the code, for start(), an array variable is
created to hold positions of obstacles. 
With lots of trials and errors, we have already placed each
obstacle at fixed positions*/


    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 1300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2Image },
      { x: width / 2, y: height - 2800, image: obstacle2Image },
      { x: width / 2 - 180, y: height - 3300, image: obstacle1Image },
      { x: width / 2 + 180, y: height - 3300, image: obstacle2Image },
      { x: width / 2 + 250, y: height - 3800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 4300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 4800, image: obstacle2Image },
      { x: width / 2, y: height - 5300, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 5500, image: obstacle2Image }
    ];

    /* Adding fuel sprite in the game (calling the function addSprites)
        While calling addSprites() in start() we are passing grouname, numberofSprites,
Imagename, scaleofimage.*/

    // Adding fuel sprite in the game
    this.addSprites(fuels, 4, fuelImage, 0.02);

    // Adding coin sprite in the game (calling the function addSprites)
    this.addSprites(powerCoins, 18, powerCoinImage, 0.09);

    /*for obstacles, we also need to pass their
positions as we have already defined their position in an array.*/

    //Adding obstacles sprite in the game
    // this.addSprites(
    //   obstacles,
    //   obstaclesPositions.length,
    //   obstacle1Image,
    //   0.04,
    //   obstaclesPositions
    // );
  }

   /*We will create a common function for creating both kindsof sprites. We will pass parameters 
  like spriteGroupname, number of sprites required, image,size of image(scale) to 
  create Sprites and have them appear randomly while adding them to their respective group.
  We are using a ‘for’ loop to create multiple sprites; each sprite is getting a random x
& y position. We then addImage to sprite and add them in respective groups.*/

  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, positions = []) {
    for (var i = 0; i < numberOfSprites; i++) {
      var x, y;

      //C41 //SA
      /*Check the length of the position and will assign images and add them to the group.
When there is no position, it will execute code for coin & fuel to give a random position.*/

      // if (positions.length > 0) {
      //   x = positions[i].x;
      //   y = positions[i].y;
      //   spriteImage = positions[i].image;
      // } else {
        x = random(width / 2 + 150, width / 2 - 150);
         y = random(-height * 4.5, height - 400);
      // }
      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);

      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    //C39
    this.resetTitle.html("Reset Game");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leadeboardTitle.html("Leaderboard");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();

    Player.getPlayersInfo();

    if (allPlayers !== undefined) {
      image(track, 0, -height * 5, width, height * 6);

      this.showLeaderboard();

      //index of the array
      var index = 0;
      for (var plr in allPlayers) {
        //add 1 to the index for every loop
        index = index + 1;

        //use data form the database to display the cars in x and y direction
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;

        cars[index - 1].position.x = x;
        cars[index - 1].position.y = y;

        if (index === player.index) {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          this.handleFuel(index);
          this.handlePowerCoins(index);

          // Changing camera position in y direction
          camera.position.y = cars[index - 1].position.y;
        }
      }

      // handling keyboard events
      this.handlePlayerControls();

      drawSprites();
    }
  }

  handleResetButton() {
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        players: {}
      });
      window.location.reload();
    });
  }

  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);
    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      // &emsp;    This tag is used for displaying four spaces.
      leader1 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;

      leader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }

    if (players[1].rank === 1) {
      leader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;

      leader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  handlePlayerControls() {
    if (keyIsDown(UP_ARROW)) {
      player.positionY += 10;
      player.update();
    }

    if (keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50) {
      player.positionX -= 5;
      player.update();
    }

    if (keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 300) {
      player.positionX += 5;
      player.update();
    }
  }

  // handleFuel(index) {
  //   // Adding fuel
  //   cars[index - 1].overlap(fuels, function(collector, collected) {
  //     player.fuel = 185;
  //     //collected is the sprite in the group collectibles that triggered
  //     //the event
  //     collected.remove();
  //   });
  // }

//   handlePowerCoins(index) {
//     cars[index - 1].overlap(powerCoins, function(collector, collected) {
//       player.score += 21;
//       player.update();
//       //collected is the sprite in the group collectibles that triggered
//       //the event
//       collected.remove();
//     });
//   }
 }

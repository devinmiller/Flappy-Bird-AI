class Player {

  constructor() {
    this.x = canvas.width / 3;
    this.y = canvas.height / 2;
    this.velY = 0;
    this.velX = panSpeed;
    this.size = 40;
    this.dead = false;
    this.isOnGround = false;
    this.deadOnGroundCount = 0;
    this.fallRotation = -PI / 6;

    //-----------------------------------------------------------------------
    //neat stuff
    this.fitness = 0;
    this.vision = []; //the input array fed into the neuralNet
    this.decision = []; //the out put of the NN
    this.unadjustedFitness;
    this.lifespan = 0; //how long the player lived for this.fitness
    this.bestScore = 0; //stores the this.score achieved used for replay
    this.dead = false;
    this.score = 0;
    this.gen = 0;

    this.genomeInputs = 4;
    this.genomeOutputs = 1;
    this.brain = new Genome(this.genomeInputs, this.genomeOutputs);
  }


  show() {
    push();

    translate(this.x - this.size / 2 - 8 + birdSprite.width / 2, this.y - this.size / 2 + birdSprite.height / 2);
    if (this.velY < 15) {
      rotate(-PI / 6);
      this.fallRotation = -PI / 6;
    } else if (this.velY <= 25) {
      this.fallRotation += PI / 8.0;
      this.fallRotation = constrain(this.fallRotation, -PI / 6, PI / 2);
      rotate(this.fallRotation);
      // rotate(map(this.velY, 10, 25, -PI / 6, PI / 2));
    } else {
      rotate(PI / 2);
    }
    image(birdSprite, -birdSprite.width / 2, -birdSprite.height / 2);
    pop();
  }

  move() {
    this.velY += gravity;
    if (!this.dead) {
      this.velY = constrain(this.velY, -1000, 25);
    } else {
      this.velY = constrain(this.velY, -1000, 40);
    }
    if (!this.isOnGround) {
      this.y += this.velY;
    }

  }

  update(ground, pipes1, pipes2) {
    this.lifespan++;
    this.move();

    if (pipes1.playerPassed(this.x - this.size / 2) || pipes2.playerPassed(this.x - this.size / 2)) {
      this.score++;
    }

    if (this.isOnGround) {
      this.deadOnGroundCount++;
      if (this.deadOnGroundCount > 50) {
        // setup();
      }
    }
    if (!dieOff) {
      this.checkCollisions(ground, pipes1, pipes2);
    }
  }

  checkCollisions(ground, pipes1, pipes2) {
    if (!this.dead) {
      pauseBecauseDead = false;
    }
    if (pipes1.colided(this)) {
      this.dead = true;
      pauseBecauseDead = true;
    }
    if (pipes2.colided(this)) {
      pauseBecauseDead = true;
      this.dead = true;
    }

    if (ground.collided(this)) {
      this.dead = true;
      this.isOnGround = true;
      pauseBecauseDead = true;
    }
    if (this.dead && this.velY < 0) {
      this.velY = 0;
    }


  }

  flap() {
    if (!this.dead && !this.isOnGround) {
      // this.velY = -35;
      this.velY = -25;
    }
  }



  //-------------------------------------------------------------------neat functions
  look(pipes1, pipes2) {
    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    this.vision = [];
    this.vision[0] = map(this.velY, -25, 25, -1, 1); //bird can tell its current y velocity
    var closestPipe = pipes1;
    if (!pipes2.passed && (pipes1.passed || pipes1.bottomPipe.x - pipes2.bottomPipe.x > 0)) {
      closestPipe = pipes2;
    }
    var distanceToClosestPipe = closestPipe.bottomPipe.x - this.x;
    this.vision[1] = map(distanceToClosestPipe, 0, canvas.width - this.x, 1, 0);
    this.vision[2] = map(max(0, closestPipe.bottomPipe.topY - this.y), 0, 700, 0, 1); //height above bottomY
    this.vision[3] = map(max(0, this.y - closestPipe.topPipe.bottomY), 0, 700, 0, 1); //distance below topThing

  }


  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //gets the output of the this.brain then converts them to actions
  think() {

      var max = 0;
      var maxIndex = 0;
      //get the output of the neural network
      this.decision = this.brain.feedForward(this.vision);

      if (this.decision[0] > 0.6) {
        this.flap();
      }
      // for (var i = 0; i < this.decision.length; i++) {
      //   if (this.decision[i] > max) {
      //     max = this.decision[i];
      //     maxIndex = i;
      //   }
      // }



      //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    }
    //---------------------------------------------------------------------------------------------------------------------------------------------------------
    //returns a clone of this player with the same brian
  clone() {
    var clone = new Player();
    clone.brain = this.brain.clone();
    clone.fitness = this.fitness;
    clone.brain.generateNetwork();
    clone.gen = this.gen;
    clone.bestScore = this.score;
    print("cloning done");
    return clone;
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //since there is some randomness in games sometimes when we want to replay the game we need to remove that randomness
  //this fuction does that

  cloneForReplay() {
    var clone = new Player();
    clone.brain = this.brain.clone();
    clone.fitness = this.fitness;
    clone.brain.generateNetwork();
    clone.gen = this.gen;
    clone.bestScore = this.score;

    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    return clone;
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //fot Genetic algorithm
  calculateFitness() {
    this.fitness = 1 + this.score * this.score + this.lifespan / 20.0;
    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  crossover(parent2) {

    var child = new Player();
    child.brain = this.brain.crossover(parent2.brain);
    child.brain.generateNetwork();
    return child;
  }

}

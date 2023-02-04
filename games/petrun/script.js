
var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        function floor(x, height) {
            this.x = x;
            this.width = 700;
            this.height = height;
        }
        if(localStorage.runbest) {
            var highscore = localStorage.runbest;
        }
        else{
            localStorage.runbest = 0;
            var highscore = localStorage.runbest;
        }
        var world = {
            over: false,
            height: 480,
            width: 640,
            gravity: 5,
            highestFloor: 200,
            speed: 5,
            distanceTravelled: 0,
            maxSpeed: 15,
            tilesPassed: 0,
            autoScroll: true,
            floorTiles: [
                new floor(0, 140)
            ],
            stop: function() {
                this.autoScroll = false;
                world.end();
                window.stop();
            },
            end: function() {
                if(world.over) {
                    return;
                }
                document.getElementById("canvas").className = "hidden";
                document.getElementById("end").className = "show";
                document.getElementById("speed").innerHTML = world.speed;
                document.getElementById("score").innerHTML = world.distanceTravelled;
                var bondpoints = world.speed *2;
                if(bondpoints>22) {
                    bondpoints = 22;
                }
                document.getElementById("bondpoints").innerHTML = bondpoints;
                console.log(localStorage.bondpoints);
                localStorage.bondpoints = parseInt(localStorage.bondpoints) + bondpoints;
                console.log(localStorage.bondpoints);
                localStorage.hunger = parseInt(localStorage.hunger) + 2;
                if(highscore < world.distanceTravelled) {
                    document.getElementById("best?").innerHTML = "You beat your highscore of: ";
                    document.getElementById("best").innerHTML = highscore;
                    localStorage.runbest = world.distanceTravelled;
                }
                else {
                    document.getElementById("best?").innerHTML = "Your highcore is: "
                    document.getElementById("best").innerHTML = highscore;
                }
                document.getElementById("menu").className = "menu";
                this.over = true;
                window.stop();
            },
            moveFloor: function() {
                for(index in this.floorTiles) {
                    var tile = this.floorTiles[index];
                    tile.x -= this.speed + 3;
                    this.distanceTravelled += this.speed;
                }
            },
            addFutureTiles: function() {
                if(this.floorTiles.length >= 3) {
                    return;
                }
                var previousTile = this.floorTiles[this.floorTiles.length - 1];
                var biggestJumpableHeight = previousTile.height + player.height;
                if(biggestJumpableHeight > this.highestFloor) {
                    biggestJumpableHeight = this.highestFloor;
                }
                var lowest = player.height + 100;
                var randomHeight = Math.floor(Math.random() * biggestJumpableHeight) + lowest;
                var leftValue = (previousTile.x + previousTile.width);
                var next = new floor(leftValue, randomHeight);
                this.floorTiles.push(next);
            },
            cleanOldTiles: function() {
                for(index in this.floorTiles) {
                    if(this.floorTiles[index].x <= -this.floorTiles[index].width) {
                        this.floorTiles.splice(index, 1);
                        this.tilesPassed++;
                        if(this.tilesPassed % 3 == 0 && this.speed < this.maxSpeed) {
                            this.speed++;
                        }
                    }
                }
            },
            getDistanceToFloor: function(playerX) {
                for(index in this.floorTiles) {
                    var tile = this.floorTiles[index];
                    if(tile.x <= playerX && tile.x + tile.width >= playerX) {
                        return tile.height;
                    }
                }
                return -1;
            },
            tick: function() {
                if(!this.autoScroll) {
                    return;
                }
                if(this.over == true) {
                    return;
                }
                this.cleanOldTiles();
                this.addFutureTiles();
                this.moveFloor();
            },
            draw: function() {
                ctx.fillStyle = "white";
                ctx.fillRect (0, 0, this.width, this.height);
                for(index in this.floorTiles) {
                    var tile = this.floorTiles[index];
                    var y = world.height - tile.height;
                    ctx.fillStyle = "blue";
                    ctx.fillRect(tile.x, y, tile.width, tile.height);
                }
                ctx.fillStyle = "black";
                ctx.font = "20px Arial";
                ctx.fillText("Speed: " + this.speed, 10, 40);
                ctx.fillText("Travelled: " + this.distanceTravelled + "m", 10, 75);
                ctx.fillText("Highscore: " + highscore + "m", 10, 110);
            }
        };
        var player = {
            x: 160,
            y: 340,
            height: 50,
            width: 50,
            downwardForce: world.gravity,
            jumpHeight: 0,
            getDistanceFor: function(x) {
                var platformBelow = world.getDistanceToFloor(x);
                return world.height - this.y - platformBelow;
            },
            applyGravity: function() {
                this.currentDistanceAboveGround = this.getDistanceFor(this.x);
                var rightHandSideDistance = this.getDistanceFor(this.x + this.width);
                if(this.currentDistanceAboveGround < 0 || rightHandSideDistance < 0) {
                    world.stop();
                    return;
                }
            },
            processGravity: function() {
                this.y += this.downwardForce;
                var floorHeight = world.getDistanceToFloor(this.x, this.width);
                var topYofPlatform = world.height - floorHeight;
                if(this.y > topYofPlatform) {
                    this.y = topYofPlatform;
                }
                if(this.downwardForce < 0) {
                    this.jumpHeight += (this.downwardForce * -0.99);
                    if(this.jumpHeight >= player.height * 3.2) {
                        this.downwardForce = world.gravity;
                        this.jumpHeight = 0;
                    }
                }
            },
            keyPress: function(keyInfo) {
                var floorHeight = world.getDistanceToFloor(this.x, this.width);
                var onTheFloor = floorHeight == (world.height - this.y);
                if(onTheFloor) {
                    this.downwardForce = -10;
                }
            },
            tick: function() {
                this.processGravity();
                this.applyGravity();
            },
            draw: function() {
                ctx.drawImage(player_img, player.x, player.y - player.height, this.height, this.width);
            }
        };
        window.addEventListener("keypress", function(keyInfo) { player.keyPress(keyInfo); }, false);
        function tick() {
            player.tick();
            world.tick();
            world.draw();
            player.draw();
            window.setTimeout("tick()", 1000/60);
        }
        function start() {
            new Audio("background.m4a").play();
            document.getElementById("load").innerHTML = "Controls: Tap the screen on the player or press any key.";
            window.setTimeout("start1()", 2000);
        }
        function start1() {
            document.getElementById("load").innerHTML = "Get ready to go!";
            window.setTimeout("start2()", 300);
        }
        function start2() {
            document.getElementById("load").innerHTML = "Rendering game...";
            window.setTimeout("start3()", 300);
        }
        function start3() {
            document.getElementById("load").innerHTML = "Starting...";
            window.setTimeout("start4()", 200);
            var random = Math.floor(Math.random() * 1) + 8;
             if(random == 7) { window.location = "er.html"; }
        }
        function start4() {
            document.getElementById("load").className = "hidden";
            document.getElementById("canvas").className = "showing";
            document.getElementById("canvas").focus();

            tick();
        }
        function load() {
             window.setTimeout("start();", 500);
        }
        if(localStorage.hunger > 7) {
            alert("Your pet is too hungry to play more games!");
            window.location = "/minipets/mypet";
        }
        var player_img = new Image();
        player_img.src = "/minipets/assets/img/pets/"+localStorage.petlook+"/0.png";
        load();

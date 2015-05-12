( function() {

	"use strict";

	window.Snake = function( oCadre ) {

		/*====================================================================
		 * C O N S T A N T E S 
		 ===================================================================*/
		var FREE = 0, // Cases values
			SNAKE = 1, 
			FRUIT = 2,
			TAIL = 3,
			HEAD = 4,

			LEFT = 37, // keyCode and directions
			UP = 38, 
			RIGHT = 39, 
			DOWN = 40,
	 
			SQUARE_WIDTH = 20, // default square width

			SNAKE_COLOR = "#d09548", // default colors
			FREE_COLOR = "transparent", 
			FRUIT_COLOR = "red",
			angle_bg = "yellow",
			angle_hg = "green",
			angle_hd = "blue",
			angle_bd = "LightSalmon",

			START_AT_X = 240, // Default start position
			START_AT_Y = 240,

			oSpriteSheet = null, // Image
			oSpriteSheetSrc = './snake-sprite.png';

		/*====================================================================
		 * G L O B A L S
		 ===================================================================*/
		var iAnimationRequestId = 0, 
			started = false,
			oTime = {
				"start" : null,
				"current": null
			};

		/*====================================================================
		 * G R I D
		 ===================================================================*/

		var Grid = {
			"ctx" : null,
			"width":null,
			"height":null,
			"squares" : [],
			"freeSquares": [], // 

			/**
			 * Init grid with all free square
			 */
			"init" : function( ctx, width, height ) {
				this.ctx = ctx;
				this.width = width - ( width % SQUARE_WIDTH );
				this.height = height - ( height % SQUARE_WIDTH );

				var x, y;

				for( x = 0; x < this.width; x += SQUARE_WIDTH ) { 

					for( y = 0; y < this.width; y += SQUARE_WIDTH ) {
						this.squares.push( [ x, y, FREE, null ] ); // Create grid
					}
				} 
			},

			/**
			 * Set a value for a case
			 */
			"setValue" : function( value, x, y ) {
				this.getSquare( x, y )[ 2 ] = value; 
			},

			/**
			 * Set dir value for a case
			 */
			"setDir" : function( dir, x, y ) {
				this.getSquare( x, y )[ 3 ] = dir; 
			},

			/**
			 * Get value from a case
			 */
			"getValue" : function( x, y ) {
				return this.getSquare( x, y )[ 2 ];
			},

			/**
			 * Set free square on the grid
			 */
			"setFreeSquare": function() {
				this.freeSquares = [];
				this.squares.forEach( 
					function( e ) {
						if( e[ 2 ] == FREE ) { ( this.freeSquares.push( e ) ); }
					}, 
					this
				);
			},

			/**
			 * Get a square
			 */
			"getSquare" : function( x, y ) {
				var element = this.squares.find( function( e ) {
					if( e[ 0 ] == x && e[ 1 ] == y ) {
						return e;
					}
				} );

				( !element ) && ( Game.over( 'hitTheWall' ) );

				return element;
			},

			"drawImg": function( sX, sY, sW, sH, cX, cY, cW, cH ) {
				oCadre.context.drawImage( oSpriteSheet, sX, sY, sW, sH, cX, cY, cW, cH );
			},

			/**
			 * Draw the grid
			 */
			"draw" : function() {
				this.squares.forEach( function( e ) {
					switch( e[ 2 ] ) {
						case SNAKE :
							this.drawImg( 0, 500, 20, 20, e[ 0 ], e[ 1 ], 20, 20 );
							break;
						case FRUIT :
							this.drawImg( 154, 500, 20, 20, e[ 0 ], e[ 1 ], 20, 20 );
							break;
						case TAIL :
							if( e[ 3 ] == UP || e[ 3 ] == null ) {
								this.drawImg( 44, 500, 20, 20, e[ 0 ], e[ 1 ], 20, 20 );
							} else if( e[ 3 ] == DOWN ) {
								this.drawImg( 176, 500, 20, 20, e[ 0 ], e[ 1 ], 20, 20 );
							} else if( e[ 3 ] == LEFT ) {
								this.drawImg( 197, 500, 20, 20, e[ 0 ], e[ 1 ], 20, 20 );
							} else if( e[ 3 ] == RIGHT ) {
								this.drawImg( 218, 500, 20, 20, e[ 0 ], e[ 1 ], 20, 20 );
							} else {
								this.drawImg( 44, 500, 20, 20, e[ 0 ], e[ 1 ], 20, 20 );
							}
							break;
						case HEAD :
							if( e[ 3 ] == UP || e[ 3 ] == null ) {
								this.drawImg( 22, 500, 20, 20, e[ 0 ], e[ 1 ], 20, 20 );
							} else if( e[ 3 ] == DOWN ) {
								this.drawImg( 245, 500, 20, 20, e[ 0 ], e[ 1 ], 20, 20 );
							} else if( e[ 3 ] == LEFT ) {
								this.drawImg( 294, 500, 20, 20, e[ 0 ], e[ 1 ], 20, 20 );
							} else if( e[ 3 ] == RIGHT ) {
								this.drawImg( 272, 500, 20, 20, e[ 0 ], e[ 1 ], 20, 20 );
							}
							break;
						case FREE :
							this.ctx.fillStyle = FREE_COLOR;
							this.ctx.fillRect( e[ 0 ], e[ 1 ], SQUARE_WIDTH, SQUARE_WIDTH );
							break;
						case angle_bg :
							this.drawImg( 88, 500, 20, 20, e[ 0 ], e[ 1 ], 20, 20 );
							break;
						case angle_hg :
							this.drawImg( 66, 500, 20, 20, e[ 0 ], e[ 1 ], 20, 20 );
							break;
						case angle_bd :
							this.drawImg( 132, 500, 20, 20, e[ 0 ], e[ 1 ], 20, 20 );
							break;
						case angle_hd :
							this.drawImg( 110, 500, 20, 20, e[ 0 ], e[ 1 ], 20, 20 );
							break;
					}
				}, Grid );
			}
		}

		/*====================================================================
		 * S N A K E
		 ===================================================================*/

		var Snake = {
			"dir" : null,
			"lastDir": null,
			"tail": [],
			"angle": null,
			"eatFruit": false,

			/**
			 * Init Snake
			 */
			"init": function( x, y ) {
				this.tail.push( Grid.getSquare( x, y ) );
				Grid.setValue( HEAD, x, y );
				Grid.setDir( this.dir, x, y );
			}, 

			/**
			 * Remove last element from tail
			 */
			"removeFromTail": function() {
				Grid.setValue( FREE, this.tail[ 0 ][ 0 ], this.tail[ 0 ][ 1 ] ); 
				this.tail.shift();
			},

			/**
			 * Set angle value
			 */
			"setAngle": function( lastTailElement ) {
				if( (this.lastDir == LEFT && this.dir == UP) || (this.lastDir == DOWN && this.dir == RIGHT) ) {
					Grid.setValue( angle_bg, lastTailElement[ 0 ], lastTailElement[ 1 ] );
				} else if( (this.lastDir == UP && this.dir == RIGHT) || ( this.lastDir == LEFT && this.dir == DOWN) ) {
					Grid.setValue( angle_hg, lastTailElement[ 0 ], lastTailElement[ 1 ] );
				} else if ( (this.lastDir == RIGHT && this.dir == DOWN) || (this.lastDir == UP && this.dir == LEFT) ) {
					Grid.setValue( angle_hd, lastTailElement[ 0 ], lastTailElement[ 1 ] );
				} else if ( (this.lastDir == DOWN && this.dir == LEFT) || (this.lastDir == RIGHT && this.dir == UP) ) {
					Grid.setValue( angle_bd, lastTailElement[ 0 ], lastTailElement[ 1 ] );
				}
			},

			"setSnakeTail": function() {
				var i,
					length = this.tail.length - 2;
				for( i = 0; i <= length; i++ ) {
					if ( this.tail[ i ][ 2 ] == HEAD ) {
						Grid.setValue( SNAKE, this.tail[ i ][ 0 ], this.tail[ i ][ 1 ] );
						Grid.setDir( this.dir, this.tail[ i ][ 0 ], this.tail[ i ][ 1 ] );
					}
				}
				if ( length >= 1 && !this.eatFruit ) {
					Grid.setValue( TAIL, this.tail[ 1 ][ 0 ], this.tail[ 1 ][ 1 ] );
					Grid.setDir( this.tail[ 2 ][ 3 ], this.tail[ 1 ][ 0 ], this.tail[ 1 ][ 1 ] ); // set to the tail the same direction that the square juste after
				}
			},

			/**
			 * Update Snake
			 */
			"update": function() {
				var x, y, value = null, length;
				var lastTailElement = this.tail[ this.tail.length - 1 ];
				
				length = this.tail.length;

				switch( this.dir ) {
					case UP :
						x = lastTailElement[ 0 ];
						y = lastTailElement[ 1 ] - SQUARE_WIDTH;
						break;
					case DOWN :
						x = lastTailElement[ 0 ];
						y = lastTailElement[ 1 ] + SQUARE_WIDTH;
						break;
					case RIGHT :
						x = lastTailElement[ 0 ] + SQUARE_WIDTH;
						y = lastTailElement[ 1 ];
						break;
					case LEFT :
						x = lastTailElement[ 0 ] - SQUARE_WIDTH;
						y = lastTailElement[ 1 ];
						break;
					default:
						x = lastTailElement[ 0 ];
						y = lastTailElement[ 1 ];
				} 

				( started ) && ( value = Grid.getValue( x, y ) );

				if ( value == FREE ) {
					this.eatFruit = false;
					if( length > 2 ) {
						this.setAngle( lastTailElement );
					}
					Grid.setValue( HEAD, x, y );
					Grid.setDir( this.dir, x, y );
					this.tail.push( Grid.getSquare( x, y ) );
					this.setSnakeTail();
					this.lastDir = this.dir;
					Grid.setFreeSquare();
					Snake.removeFromTail();
				} else if ( value == FRUIT ) {
					this.eatFruit = true;
					if( length > 2 ) {
						this.setAngle( lastTailElement );
					}
					Grid.setValue( HEAD, x, y );
					Grid.setDir( this.dir, x, y );
					this.tail.push( Grid.getSquare( x, y ) );
					this.setSnakeTail();
					this.lastDir = this.dir;
					Grid.setFreeSquare();
					Fruit.init();
					Game.score++;
				} else if ( value ){
					Game.over( 'eatYourSelf' );
				}
			}
		};

		/*====================================================================
		 * F R U I T
		 ===================================================================*/

		 var Fruit = {
		 	"init": function() {
		 		var randomFreeSquare = Grid.freeSquares[Math.floor(Math.random()*Grid.freeSquares.length)];
				Grid.setValue( FRUIT, randomFreeSquare[ 0 ], randomFreeSquare[ 1 ] );
				Grid.setFreeSquare();
		 	}
		 }

		/*====================================================================
		 * G A M E
		 ===================================================================*/

		var Game = {
			"score" : 0,
			"color" : "IndianRed",

			"init"	: function() {
				oCadre.context.fillStyle = "LightSalmon";
				oCadre.context.fillRect( 0, 0, oCadre.width, oCadre.height );

				oCadre.context.fillStyle = this.color;
				oCadre.context.font = "bold 16px 'Avenir Next'";
				oCadre.context.textAlign = "center";
				oCadre.context.fillText("PRESS ENTER TO START", oCadre.width / 2, oCadre.height / 2);
			},

			"update" : function() {
				oCadre.context.fillStyle = this.color;
				oCadre.context.font = "12px 'Avenir Next'";
				oCadre.context.fillText('Score : ' + this.score, 30, oCadre.height - 10);
			},

			"background": {
				"render": function() {
					oCadre.context.drawImage(
						oSpriteSheet,
						0,
						0,
						500,
						500,
						0,
						0,
						500,
						500
					);
				}
			},

			"over": function( sWhyYouLoose ) {
				window.cancelAnimationFrame( iAnimationRequestId );

				oCadre.context.clearRect( 0, 0, oCadre.width, oCadre.height );

				oCadre.context.fillStyle = "Crimson";
				oCadre.context.fillRect( 0, 0, oCadre.width, oCadre.height );

				switch( sWhyYouLoose ) {
					case 'eatYourSelf':
						oCadre.context.drawImage( oSpriteSheet, 200, 520, 98, 98, oCadre.width / 2 - 49, oCadre.height / 2 - 90, 98, 98 );
						oCadre.context.fillStyle = "#fff";
						oCadre.context.font = "bold 30px 'Avenir Next'";
						oCadre.context.textAlign = "center";
						oCadre.context.fillText("YOU TRY TO EAT YOURSELF", oCadre.width / 2, oCadre.height / 2 + 80);
						oCadre.context.font = "normal 16px 'Avenir Next'";
						oCadre.context.fillText("Your score : " + Game.score, oCadre.width / 2, oCadre.height / 2 + 110);
						break;
					case 'hitTheWall':
						oCadre.context.drawImage( oSpriteSheet, 0, 520, 196, 103, oCadre.width / 2 - 98, oCadre.height / 2 - 90, 196, 103 );
						oCadre.context.fillStyle = "#fff";
						oCadre.context.font = "bold 30px 'Avenir Next'";
						oCadre.context.textAlign = "center";
						oCadre.context.fillText("YOU CAN'T BREAK THE WALL", oCadre.width / 2, oCadre.height / 2 + 80);
						oCadre.context.font = "normal 16px 'Avenir Next'";
						oCadre.context.fillText("Your score : " + Game.score, oCadre.width / 2, oCadre.height / 2 + 110);
						break;
				}

				oCadre.context.font = "normal 20px 'Avenir Next'";
				oCadre.context.fillText("Press any key to restart", oCadre.width / 2, oCadre.height / 2 + 160);
				window.addEventListener( "keypress", function() {
					return window.location.reload( true );
				} );
			}

		};

		var fStart = function() {
			oCadre.context.clearRect( 0, 0, oCadre.width, oCadre.height );

			// Set start time
			oTime.start = ( new Date() ).getTime();

			// Init Grid
			Grid.init( oCadre.context, oCadre.width, oCadre.height );

			oSpriteSheet = new Image();
			oSpriteSheet.addEventListener( "load", Game.background.render, false );
			oSpriteSheet.src = oSpriteSheetSrc;

			// Init Snake
			Snake.init( START_AT_X, START_AT_Y );

			// Init free square
			Grid.setFreeSquare();

			// Init fruit
			Fruit.init()

			// Draw Grid
			Grid.draw();

			// Loop
			fAnimationLoop();
		}

		var fAnimationLoop = function() {
			oTime.current = ( new Date() ).getTime();

			oCadre.context.clearRect( 0, 0, oCadre.width, oCadre.height );

			iAnimationRequestId = window.requestAnimationFrame( fAnimationLoop );
			
			if( oTime.current - oTime.start > 100 ) {
				oTime.start = ( new Date() ).getTime();
				Snake.update();
			}

			Grid.setFreeSquare();

			Game.background.render();

			Grid.draw();

			Game.update();
		};

		Game.init();

		// Move the snake
		window.addEventListener( "keypress", function( e ) {
			( !started ) && ( ( e.keyCode == 13 ) && ( fStart() ) );

			( e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 ) && ( !started ) && ( started = true );

			( e.keyCode == 38 ) && ( Snake.dir != DOWN ) && ( Snake.dir = UP );
			( e.keyCode == 40 ) && ( Snake.dir != UP ) && ( Snake.dir = DOWN );
			( e.keyCode == 39 ) && ( Snake.dir != LEFT ) && ( Snake.dir = RIGHT );
			( e.keyCode == 37 ) && ( Snake.dir != RIGHT ) && ( Snake.dir = LEFT );
		}, false );

	}
} )();
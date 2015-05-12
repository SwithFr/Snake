( function() {

	"use strict";

	window.Snake = function( oCadre ) {

		/*====================================================================
		 * C O N S T A N T E S 
		 ===================================================================*/
		var FREE = 0, // Cases values
			SNAKE = 1, 
			FRUIT = 2,

			LEFT = 37, // keyCode and directions
			UP = 38, 
			RIGHT = 39, 
			DOWN = 40,
	 
			SQUARE_WIDTH = 20, // default square width

			SNAKE_COLOR = "#000", // default colors
			FREE_COLOR = "#fff", 
			FRUIT_COLOR = "red",
			angle_bg = "yellow",
			angle_hg = "green",
			angle_hd = "blue",
			angle_bd = "LightSalmon",

			START_AT_X = 20, // Default start position
			START_AT_Y = 20;

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
						this.squares.push( [ x, y, FREE ] ); // Create grid
					}

				} 
			},

			/**
			 * Définir une valeur pour une case
			 */
			"setValue" : function( value, x, y ) {
				this.getSquare( x, y )[ 2 ] = value; 
			},

			/**
			 * Récupérer la valeur d'une case
			 */
			"getValue" : function( x, y ) {
				return this.getSquare( x, y )[ 2 ];
			},

			/**
			 * Définit les carrés libres de la grille
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
			 * Récupère une case
			 */
			"getSquare" : function( x, y ) {
				var element = this.squares.find( function( e ) {
					if( e[ 0 ] == x && e[ 1 ] == y ) {
						return e;
					}
				} );

				( !element ) && ( fGameOver() );

				return element;
			},

			/**
			 * Dessine la grille
			 */
			"draw" : function() {
				this.squares.forEach( function( e ) {
					switch( e[ 2 ] ) {
						case SNAKE :
							this.ctx.fillStyle = SNAKE_COLOR;
							this.ctx.fillRect( e[ 0 ], e[ 1 ], SQUARE_WIDTH, SQUARE_WIDTH );
							break;
						case FRUIT :
							this.ctx.fillStyle = FRUIT_COLOR;
							this.ctx.fillRect( e[ 0 ], e[ 1 ], SQUARE_WIDTH, SQUARE_WIDTH );
							break;
						case FREE :
							this.ctx.fillStyle = FREE_COLOR;
							this.ctx.fillRect( e[ 0 ], e[ 1 ], SQUARE_WIDTH, SQUARE_WIDTH );
							break;
						case angle_bg :
							this.ctx.fillStyle = angle_bg;
							this.ctx.fillRect( e[ 0 ], e[ 1 ], SQUARE_WIDTH, SQUARE_WIDTH );
							break;
						case angle_hg :
							this.ctx.fillStyle = angle_hg;
							this.ctx.fillRect( e[ 0 ], e[ 1 ], SQUARE_WIDTH, SQUARE_WIDTH );
							break;
						case angle_bd :
							this.ctx.fillStyle = angle_bd;
							this.ctx.fillRect( e[ 0 ], e[ 1 ], SQUARE_WIDTH, SQUARE_WIDTH );
							break;
						case angle_hd :
							this.ctx.fillStyle = angle_hd;
							this.ctx.fillRect( e[ 0 ], e[ 1 ], SQUARE_WIDTH, SQUARE_WIDTH );
							break;

					}
				}, Grid );
				this.ctx.strokeStyle = "LightSlateGray";
				this.ctx.rect( 0, 0, this.width, this.height );
				this.ctx.stroke();
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

			/**
			 * On initialise le serpent
			 */
			"init": function( x, y ) {
				this.tail.push( Grid.getSquare( x, y ) );
				Grid.setValue( SNAKE, x, y );
			}, 

			"removeFromTail": function() {
				Grid.setValue( FREE, this.tail[ 0 ][ 0 ], this.tail[ 0 ][ 1 ] ); 
				this.tail.shift();
			},

			// "setAngle" : function() {
			// 	( this.lastDir == LEFT && this.dir == UP ) || ( this.lastDir == DOWN && this.dir == RIGHT ) && ( this.angle = angle_bg );
			// 	( this.lastDir == UP && this.dir == RIGHT ) || ( this.lastDir == LEFT && this.dir == DOWN ) && ( this.angle = angle_hg );
			// 	( this.lastDir == RIGHT && this.dir == DOWN ) || ( this.lastDir == UP && this.dir == LEFT ) && ( this.angle = angle_hd );
			// 	( this.lastDir == DOWN && this.dir == LEFT ) || ( this.lastDir == RIGHT && this.dir == UP ) && ( this.angle = angle_bd );
			// },
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

			"update": function() {
				var x, y, value = null, length;
				var lastTailElement = this.tail[ this.tail.length - 1 ];
				
				length = this.tail.length;

				// this.setAngle();

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
					// if( this.angle && length != 1 ) {
					// 	Grid.setValue( this.angle, lastTailElement[ 0 ], lastTailElement[ 1 ] );
					// }
					if( length > 2 ) {
						this.setAngle( lastTailElement );
					}
					Grid.setValue( SNAKE, x, y );
					this.tail.push( Grid.getSquare( x, y ) );
					this.lastDir = this.dir;
					Snake.removeFromTail();
				} else if ( value == FRUIT ) {
					Grid.setValue( SNAKE, x, y );
					if( length > 2 ) {
						this.setAngle( lastTailElement );
					}
					Game.score++;
					this.tail.push( Grid.getSquare( x, y ) );
					Grid.setFreeSquare();
					Fruit.init();
				} else if ( value ){
					fGameOver();
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
			}

		};

		var fInit = function() {
			Game.init();
		};

		var fStart = function() {
			oCadre.context.clearRect( 0, 0, oCadre.width, oCadre.height );

			// Set start time
			oTime.start = ( new Date() ).getTime();

			// Init Grid
			Grid.init( oCadre.context, oCadre.width, oCadre.height );

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

			Grid.draw();

			Game.update();

		};

		// Game over
		var fGameOver = function() {
			window.cancelAnimationFrame( iAnimationRequestId );
			window.confirm("Your score : " + Game.score );
			window.location.reload( true );
		};

		fInit();
		

		// On dirige le serpent
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
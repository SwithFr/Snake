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
			FRUIT_COLOR = "yellow",

			START_AT_X = 20, // Default start position
			START_AT_Y = 20;

		/*====================================================================
		 * G L O B A L S
		 ===================================================================*/
		var iAnimationRequestId = 0, 
			score = 0,
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
				
				this.setFreeSquare();

				Grid.newFruit( );
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

			"setFreeSquare": function() {
				this.squares.forEach( function( e, i, array ) {
					if( e[ 2] == FREE ) {
						this.freeSquares.push( e );
					}
				}, this );
			},

			/**
			 * Récupère une case
			 */
			"getSquare" : function( x, y ) {
				var element = this.squares.find( function( e, i, array ) {
					if( e[ 0 ] == x && e[ 1 ] == y ) {
						return e;
					}
				} );

				if( !element ) {
					fGameOver();
				} else {
					return element;
				}
			},

			"newFruit": function() {
				var randomFreeSquare = this.freeSquares[Math.floor(Math.random()*this.freeSquares.length)];
				Grid.setValue( FRUIT, randomFreeSquare[ 0 ], randomFreeSquare[ 1 ] );
			},

			"update" : function() {
				this.setFreeSquare();
			},

			/**
			 * Dessine la grille
			 */
			"draw" : function() {
				this.squares.forEach( function( e, i, array ) {
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
					}
				}, Grid );
				this.ctx.strokeStyle = "blue";
				this.ctx.rect( 0, 0, this.width, this.height );
				this.ctx.stroke();
			}

		}

		/*====================================================================
		 * S N A K E
		 ===================================================================*/

		var Snake = {
			"dir" : null,
			"tail": [],

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

			"update": function() {
				var x, y;
				var lastTailElement = this.tail[ this.tail.length - 1 ];

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

				var value = Grid.getValue( x, y );

				if( x != START_AT_X || y != START_AT_Y ) {
					if ( value == FREE ) {
						Grid.setValue( SNAKE, x, y );
						this.tail.push( Grid.getSquare( x, y ) );
						Snake.removeFromTail();
					} else if ( value == FRUIT ) {
						score++;
						Grid.setValue( SNAKE, x, y );
						this.tail.push( Grid.getSquare( x, y ) );
						Grid.newFruit();
					} else {
						console.log( x, y );
						fGameOver();
					}
				}
			}
		};

		/*====================================================================
		 * G A M E
		 ===================================================================*/

		var fStart = function() {
			// Init Grid
			Grid.init( oCadre.context, oCadre.width, oCadre.height );

			// Init Snake
			Snake.init( START_AT_X, START_AT_Y );

			// Draw Grid
			Grid.draw();

			// Set start time
			oTime.start = ( new Date() ).getTime();

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

			Grid.update();

			Grid.draw();

		};

		// Game over
		var fGameOver = function() {
			window.cancelAnimationFrame( iAnimationRequestId );
			window.confirm( "You loose ! \n\nYour score : " + score );
			window.location.reload( true );
		};

		fStart();

		// On dirige le serpent
		window.addEventListener( "keypress", function( e ) {
			if ( e.keyCode == 38 ) { Snake.dir = UP };
			if ( e.keyCode == 40 ) { Snake.dir = DOWN };
			if ( e.keyCode == 39 ) { Snake.dir = RIGHT };
			if ( e.keyCode == 37 ) { Snake.dir = LEFT };
		}, false );

	}

} )();
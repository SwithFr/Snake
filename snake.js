( function() {

	"use strict";

	window.Snake = function( oCadre ) {

		// Globals 
		var cFree  = 0, // Constante qui determine la valeur des cases libres
			cSnake = 1, // Constante qui determine la valeur des cases serpent
			cFruit = 2, // Constante qui determine la valeur des cases fruits
			iLength= 7, // Taille par défaut du serpent
			iAnimationRequestId = 0;

		/*====================================================================
		 * GRID
		 ===================================================================*/

		/**
		 * Objet oGrid représentant la grille de jeu
		 * @param  {int} iCadreWidth  largeur du cadre
		 * @param  {int} iCadreHeight hauteur du cadre
		 */
		var Grid = function( iCadreWidth, iCadreHeight ) {
			this.ctx          = oCadre.context;
			this.width        = iCadreWidth;
			this.height       = iCadreHeight;
			this.squareWidth  = 20;
			this.squares = [];
			this.totalXsquare = iCadreWidth / this.squareWidth;
			this.totalYsquare = iCadreHeight / this.squareWidth;
		};

		/**
		 * Génère la grille
		 */
		Grid.prototype.init = function() {
			var x, y;

			this.ctx.strokeStyle = "red";
			this.ctx.lineWidth = .8;
			for ( x = 0; x < this.width; x += this.squareWidth ) {
				for ( y = 0; y < this.height; y += this.squareWidth ) {
					this.squares.push( new Square( x, y, cFree, this.squareWidth, this ) );
					this.ctx.rect( x, y, this.squareWidth, this.squareWidth );
				};
			};
			this.ctx.stroke();
		};

		Grid.prototype.getSquare = function( x, y ) {
			this.squares.find( function( element, index, array ) {
				var square = {};
				if ( element.x == x && element.y == y ) {
					square = element;
					return square;
				} 
			}, this );
		};

		/*====================================================================
		 * SQUARE
		 ===================================================================*/

		/**
		 * Objet oSquare
		 * @param  {int} x     position en x
		 * @param  {int} y     position en y
		 * @param  {int} value valeur du carré 
		 */
		var Square = function( x, y, value, width, oGrid ) {
			this.x     = x;
			this.y     = y;
			this.value = value;
			this.width = width;
			this.grid  = oGrid;
		};

		/**
		 * Met à jour la valeur d'un carré
		 * @param  {int} iNewValue nouvelle valeur
		 */
		Square.prototype.update = function( iNewValue ) {
			this.value = iNewValue;
			if( this.value === cFruit ) {
				this.grid.ctx.fillStyle = "yellow";
				this.grid.ctx.fillRect( this.x, this.y, this.width, this.width );
			}
			if( this.value === cSnake ) {
				this.grid.ctx.fillStyle = "#000";
				this.grid.ctx.fillRect( this.x, this.y, this.width, this.width );
			}
			if( this.value === cFree ) {
				this.grid.ctx.fillStyle = "white";
				this.grid.ctx.fillRect( this.x, this.y, this.width, this.width );
			}
		};

		/*====================================================================
		 * SNAKE
		 ===================================================================*/

		/**
	 	 * Object oSnake représantant le serpant
	 	 * @param  {oGrid} oGrid   la grille
	 	 * @param  {int}   iLength la taille du serpent
	 	 */
	 	var Snake = {
	 		"grid"  : null,
	 		"length": null,
	 		"posY"  : null,
	 		"posX"  : null,
	 		"dir"   : null,
	 		"offset": null,

	 		"init" : function( oGrid, iLength ) {
	 			var that = this;
	 			this.grid   = oGrid;
		 		this.length = iLength;
		 		this.posY   = ( this.grid.height - this.grid.squareWidth ) / 2;
		 		this.posX   = ( ( this.grid.width ) / 2 ) - Math.ceil( ( this.length * this.grid.squareWidth ) / 2 ) ;
		 		console.log( this.posX );
		 		this.dir 	= "right";
		 		this.head 	= null;
		 		this.tail 	= null;
	 		},

	 		/**
		 	 * Génère le serpent
		 	 */
	 		"render" : function() {
		 		this.grid.squares.findIndex( function( element, index, array ) {
		 			var i = 1;

					if ( element.x == this.posX && element.y == this.posY ) {
						this.tail = element;
					} 
		 			for ( i; i <= this.length; i++ ) {
	 					if ( this.dir === 'right' ) {
	 						if ( element.value == cFree ) {
	 							if ( element.x == this.posX + ( i * element.width ) && element.y == this.posY ) {
					 				if ( element.value == cFree ) {
					 					element.update( cSnake );
					 				}
			 						this.head = element;
					 			} 
	 						}
	 					} else if ( this.dir === 'left' ) {
	 						
	 					} else if ( this.dir === 'up' ) {

	 					} else if ( this.dir === 'down' ) {

	 					}
		 				// if ( element.x == this.posX + ( i * element.width ) && element.y == this.posY ) {
			 			// 	if ( element.value == cFree ) {
			 			// 		element.update( cSnake );
			 			// 	}
	 					// 	this.head = element;
			 			// } 
		 			}
	 			}, this );
	 		},

	 		/**
	 		 * Update le serpent
	 		 */
	 		"update" : function() {
	 			switch ( this.dir ) {
		 			case "right":
				        this.tail.posX += this.tail.width;
				        break;
				    case "left":
				    	this.tail.posX -= this.tail.width;
				        break;
			        case "up":
			        	this.head.posY += this.head.width;
				        break;
			        case "down":
			        	this.head.posY -= this.head.width;
				        break;
			        default: 
			        	this.tail.posX += this.tail.width;
		 		}
		 		this.render();
	 		}
	 	};


	 	/*====================================================================
		 * GAME
		 ===================================================================*/

		/**
		 * Fonction qui lance le jeu
		 */
		var fStart = function() {
			// On génère une nouvelle grille
			var grid = new Grid( oCadre.width, oCadre.height, 10 );
			// On initialise les carrés comme étant tous vides
			grid.init();

			// On génère un nouveau serpent
			Snake.init( grid, iLength );
			Snake.render();
			//Snake.update();
			//fAnimationLoop();
		};

		var fAnimationLoop = function() {
			oCadre.context.clearRect( 0, 0, oCadre.width, oCadre.height );

			iAnimationRequestId = window.requestAnimationFrame( fAnimationLoop );

			Snake.update();
		};

		// Game over
		var fGameOver = function() {
			window.cancelAnimationFrame( iAnimationRequestId );
			window.confirm( "You loose !" );
			window.location.reload( true );
		};

		// On lance le jeu !
		fStart();

		// On dirige le serpent
		window.addEventListener( "keypress", function( e ) {
			if ( e.keyCode == 38 ) { Snake.dir = "up" };
			if ( e.keyCode == 40 ) { Snake.dir = "down" };
			if ( e.keyCode == 39 ) { Snake.dir = "right" };
			if ( e.keyCode == 37 ) { Snake.dir = "left" };
		}, false );
	}

	/*====================================================================
	 * LIB
	 ===================================================================*/

 	/**
 	 * Recupère un carré selon ses coordonnées
 	 * @param  {array} array le tableau à parcourir
 	 * @param  {int}   x     position x
 	 * @param  {int}   y     position y
 	 */
 	var getSquare = function( array, x, y ) {
		array.find( function( element, index, array ) {
			if ( element.x == x && element.y == y ) {
				return element;
			} 
		} );
 	};

} )();
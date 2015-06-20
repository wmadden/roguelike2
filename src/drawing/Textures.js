import pixi from 'pixi.js';
import FloorTextures from 'tiles/dawnlike/Floor';
import WallTextures from 'tiles/dawnlike/Wall';
import CharacterTextures from 'tiles/dawnlike/Character';

const Textures = (function() {
  function Textures() {}

  Textures.loadAll = function() {
    var groundTexture, humanoidTexture;
    groundTexture = pixi.Texture.fromImage("images/dawnlike/Objects/Ground0.png");
    this.bloodTexture = new pixi.Texture(groundTexture, new pixi.Rectangle(16 * 0, 16 * 5, 16, 16));
    humanoidTexture = pixi.Texture.fromImage("images/dawnlike/Characters/Humanoid0.png");
    this.playerTexture = new pixi.Texture(humanoidTexture, new pixi.Rectangle(16 * 0, 16 * 7, 16, 16));
    return Promise.all([
      FloorTextures.load(), WallTextures.load('brick/light').then((function(_this) {
        return function(wallTexture) {
          return _this.wallTexture = wallTexture;
        };
      })(this)), CharacterTextures.load('rodent').then((function(_this) {
        return function(rodentTextures) {
          return _this.rodentTextures = rodentTextures;
        };
      })(this))
    ]).then((function(_this) {
      return function() {
        return _this.floorTextureMap = FloorTextures.floorTypes.bricks.grey;
      };
    })(this));
  };

  return Textures;

})();

export default Textures;

var WallTextureVariant, WallTextures,
  slice = [].slice;

import pixi from 'pixi.js';

WallTextures = (function() {
  function WallTextures() {}

  WallTextures.load = function(variant) {
    var loader, result;
    loader = new pixi.JsonLoader("images/dawnlike/Objects/textures/wall/" + variant + ".json");
    result = null;
    return new Promise(function(resolve, reject) {
      var originalLoaderJSONHandler;
      originalLoaderJSONHandler = loader.onJSONLoaded;
      loader.onJSONLoaded = function() {
        originalLoaderJSONHandler.apply(loader);
        return result = new WallTextureVariant(variant);
      };
      loader.once('loaded', function() {
        return resolve(result);
      });
      loader.once('error', function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        console.log.apply(console, args);
        return reject.apply(null, args);
      });
      return loader.load();
    });
  };

  return WallTextures;

})();

WallTextureVariant = (function() {
  function WallTextureVariant(name) {
    var i, len, textureId, textureName, textureNames;
    this.name = name;
    textureNames = ['NESW', 'NE_W', 'N_SW', 'N__W', '_ESW', '_E_W', '____', 'NES_', 'NE__', 'N_S_', 'N___', '_ES_', '__SW'];
    for (i = 0, len = textureNames.length; i < len; i++) {
      textureName = textureNames[i];
      textureId = textureName + ".png";
      this[textureName] = pixi.TextureCache[textureId];
      pixi.Texture.removeTextureFromCache(textureId);
    }
    this.___W = this._E_W;
    this._E__ = this._E_W;
    this.__S_ = this.N_S_;
  }

  return WallTextureVariant;

})();

export default WallTextures;

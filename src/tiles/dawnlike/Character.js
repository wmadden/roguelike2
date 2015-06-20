var TextureVariant,
  slice = [].slice;

import pixi from 'pixi.js';

const CharacterTextures = (function() {
  function CharacterTextures() {}

  CharacterTextures.load = function(variant) {
    var loader, result;
    loader = new pixi.JsonLoader("images/dawnlike/Characters/textures/" + variant + ".json");
    result = null;
    return new Promise(function(resolve, reject) {
      var originalLoaderJSONHandler;
      originalLoaderJSONHandler = loader.onJSONLoaded;
      loader.onJSONLoaded = function() {
        var json;
        originalLoaderJSONHandler.apply(loader);
        json = JSON.parse(loader.ajaxRequest.responseText);
        return result = new TextureVariant(variant, json);
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

  return CharacterTextures;

})();

TextureVariant = (function() {
  function TextureVariant(name, json) {
    var textureId, textureName;
    this.name = name;
    for (textureId in json.frames) {
      textureName = textureId;
      this[textureName] = pixi.TextureCache[textureId];
      pixi.Texture.removeTextureFromCache(textureId);
    }
  }

  return TextureVariant;

})();

export default CharacterTextures;

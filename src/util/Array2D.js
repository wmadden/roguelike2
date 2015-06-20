export function create(width, height) {
  var i, j, ref, tiles;
  tiles = [];
  for (i = j = 0, ref = width; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
    tiles[i] = new Array(height);
  }
  return tiles;
}

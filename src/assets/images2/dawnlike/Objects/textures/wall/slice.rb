#!/usr/bin/env ruby

WALL_SEGMENTS = {
  wall: {             # N---
    wall: {           # NE--
      wall: {         # NES-
        wall: [4, 1], # NESW
        none: [3, 1], # NES_
      },
      none: {         # NE_-
        wall: [4, 2], # NE_W
        none: [0, 2], # NE__
      },
    },
    none: {           # N_--
      wall: {         # N_S-
        wall: [5, 1], # N_SW
        none: [0, 1], # N_S_
      },
      none: {         # N__-
        wall: [2, 2], # N__W
        none: [1, 1], # N___
      }
    }
  },
  none: {
    wall: {           # _E--
      wall: {         # _ES-
        wall: [4, 0], # _ESW
        none: [0, 0], # _ES_
      },
      none: {         # _E_-
        wall: [1, 0], # _E_W
      },
    },
    none: {           # __--
      wall: {         # __S-
        wall: [2, 0], # __SW
      },
      none: {         # ___-
        none: [3, 0], # ____
      }
    }
  }
}

def calculate_wall_segment_names
  result = {}
  values = %i(wall none)
  values.each do |wall|
    north = wall
    values.each do |wall|
      east = wall
      values.each do |wall|
        south = wall
        values.each do |wall|
          west = wall
          coords = WALL_SEGMENTS[north][east][south][west]
          result[segment_name(north, east, south, west)] = coords if coords
        end
      end
    end
  end
  result
end

def segment_name(north, east, south, west)
  "#{north == :wall ? 'N' : '_'}#{east == :wall ? 'E' : '_'}#{south == :wall ? 'S' : '_'}#{west == :wall ? 'W' : '_'}"
end

WALL_SEGMENT_NAMES = calculate_wall_segment_names

def command(*args)
  puts *args
  system(*args) || exit(1)
end

def run(wall_tileset)
  command "mkdir .tmp"
  tileset_name = wall_tileset.split('/').last.split('.').first

  command %(convert #{wall_tileset} +repage -crop 16x16 -set filename:tile "%[fx:page.x/16]_%[fx:page.y/16]" ".tmp/%[filename:tile].png")
  output_dir = tileset_name
  command "mkdir #{output_dir}"

  WALL_SEGMENT_NAMES.each do |name, coords|
    tile_file = "#{coords.join('_')}.png"
    output_file_name = "#{name}.png"
    command "cp .tmp/#{tile_file} #{output_dir}/#{output_file_name}"
  end

  command "rm -rf .tmp"
end

run *ARGV

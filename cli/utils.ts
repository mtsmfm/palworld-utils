import { readFile } from "node:fs/promises";
import { PalworldLevelSav, PalworldLocalSav } from "./types";
import { join } from "node:path";

export const loadPalworldLevelSav = async (path: string) => {
  const data = await readFile(path);
  const json: PalworldLevelSav = JSON.parse(data.toString());

  return json;
};

export const loadPalworldLocalSav = async (path: string) => {
  const data = await readFile(path);
  const json: PalworldLocalSav = JSON.parse(data.toString());

  return json;
};

export const loadLifmunkEffigyLocations = async () => {
  const data = await readFile(join(__dirname, "lifmunk_effigy_locations.json"));
  const json: Array<{
    x: number;
    y: number;
  }> = JSON.parse(data.toString());

  return json;
};

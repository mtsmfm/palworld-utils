import { readFile } from "node:fs/promises";
import { PalworldLevelSav } from "./types";

export const loadPalworldLevelSav = async (path: string) => {
  const data = await readFile(path);
  const json: PalworldLevelSav = JSON.parse(data.toString());

  return json;
};

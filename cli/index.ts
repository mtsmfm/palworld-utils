import { writeFile } from "fs/promises";
import { PalworldLevelSav } from "./types";
import {
  loadDungeonLocations,
  loadLifmunkEffigyLocations,
  loadPalworldLevelSav,
  loadPalworldLocalSav,
} from "./utils";
import yargs from "yargs/yargs";
import {
  fromHumanReadableToInternalData,
  fromInternalDataToHumanReadable,
} from "./location";

const main = async () => {
  await yargs(process.argv.slice(2))
    .command(
      "show-users <path>",
      "show users",
      (yargs) => {
        yargs.positional("path", {
          describe: "path to Level.sav.json",
          type: "string",
        });
      },
      async (argv) => {
        await showUsers(argv.path as string);
      }
    )
    .command(
      "show-guilds <path>",
      "show guilds",
      (yargs) => {
        yargs.positional("path", {
          describe: "path to Level.sav.json",
          type: "string",
        });
      },
      async (argv) => {
        await showGuilds(argv.path as string);
      }
    )
    .command(
      "remove-duplicated-guilds <path> <out>",
      "remove duplicated guilds",
      (yargs) => {
        yargs
          .positional("path", {
            describe: "path to Level.sav.json",
            type: "string",
          })
          .positional("out", {
            describe: "output path to Level.sav.json",
            type: "string",
          });
      },
      async (argv) => {
        await removeDuplicatedGuilds(argv.path as string, argv.out as string);
      }
    )
    .command(
      "show-markers <path>",
      "show markers",
      (yargs) => {
        yargs.positional("path", {
          describe: "path to Level.sav.json",
          type: "string",
        });
      },
      async (argv) => {
        await showMarkers(argv.path as string);
      }
    )
    .command(
      "add-lifmunk-effigy-markers <path> <out>",
      "add lifmunk effigy markers",
      (yargs) => {
        yargs
          .positional("path", {
            describe: "path to LocalData.sav.json",
            type: "string",
          })
          .positional("out", {
            describe: "output to LocalData.sav.json",
            type: "string",
          });
      },
      async (argv) => {
        await addLifmunkEffigyMarkers(argv.path as string, argv.out as string);
      }
    )
    .command(
      "remove-lifmunk-effigy-markers <path> <out>",
      "remove lifmunk effigy markers",
      (yargs) => {
        yargs
          .positional("path", {
            describe: "path to LocalData.sav.json",
            type: "string",
          })
          .positional("out", {
            describe: "output to LocalData.sav.json",
            type: "string",
          });
      },
      async (argv) => {
        await removeLifmunkEffigyMarkers(
          argv.path as string,
          argv.out as string
        );
      }
    )
    .command(
      "add-dungeon-markers <path> <out>",
      "add dungeon markers",
      (yargs) => {
        yargs
          .positional("path", {
            describe: "path to LocalData.sav.json",
            type: "string",
          })
          .positional("out", {
            describe: "output to LocalData.sav.json",
            type: "string",
          })
          .option("min-level", {
            describe: "min dungeon level",
            type: "number",
            default: 40,
          })
          .option("max-level", {
            describe: "max dungeon level",
            type: "number",
            default: 50,
          });
      },
      async (argv) => {
        await addDungeonMarkers(argv.path as string, argv.out as string, {
          min_level: argv.minLevel as number,
          max_level: argv.maxLevel as number,
        });
      }
    )
    .demandCommand()
    .strict()
    .parse();
};

const showUsers = async (path: string) => {
  const json = await loadPalworldLevelSav(path);

  const playersData =
    json.properties.worldSaveData.value.CharacterSaveParameterMap.value.flatMap(
      ({ key, value }) => {
        const { NickName, IsPlayer, Level } =
          value.RawData.value.object.SaveParameter.value;

        if (IsPlayer) {
          return [
            {
              nickname: NickName.value,
              level: Level?.value,
              playerUId: key.PlayerUId.value,
              instanceId: key.InstanceId.value,
            },
          ];
        } else {
          return [];
        }
      }
    );

  console.dir(playersData, { depth: null });
};

const collectGuildSummaries = async (json: PalworldLevelSav) => {
  const guilds =
    json.properties.worldSaveData.value.GroupSaveDataMap.value.flatMap(
      ({ value }) => {
        if (value.RawData.value.group_type === "EPalGroupType::Guild") {
          return [
            {
              group_id: value.RawData.value.group_id,
              base_camp_level: value.RawData.value.base_camp_level,
              players: value.RawData.value.players,
              guild_name: value.RawData.value.guild_name,
            },
          ];
        } else {
          return [];
        }
      }
    );

  return guilds;
};

const showGuilds = async (path: string) => {
  const json = await loadPalworldLevelSav(path);

  const guilds = await collectGuildSummaries(json);

  console.dir(guilds, { depth: null });
};

const removeDuplicatedGuilds = async (path: string, out: string) => {
  const json = await loadPalworldLevelSav(path);

  const guilds = await collectGuildSummaries(json);

  const guildsByUid: {
    [uid: string]: { group_id: string; last_online_real_time: number }[];
  } = {};

  guilds.forEach(({ group_id, players }) => {
    players.forEach(
      ({ player_uid, player_info: { last_online_real_time } }) => {
        guildsByUid[player_uid] ||= [];
        guildsByUid[player_uid].push({ group_id, last_online_real_time });
      }
    );
  });

  const removeTargetGuildIds = Object.entries(guildsByUid).flatMap(
    ([_, guilds]) => {
      if (guilds.length === 1) {
        return [];
      }

      return [
        guilds.sort(
          (a, b) => a.last_online_real_time - b.last_online_real_time
        )[0].group_id,
      ];
    }
  );

  const removeTargetGuilds = guilds.filter(({ group_id }) =>
    removeTargetGuildIds.includes(group_id)
  );

  console.log("These guilds will be removed:");
  console.dir(removeTargetGuilds, { depth: null });

  json.properties.worldSaveData.value.GroupSaveDataMap.value =
    json.properties.worldSaveData.value.GroupSaveDataMap.value.filter(
      ({ value }) =>
        !removeTargetGuildIds.includes(value.RawData.value.group_id)
    );

  await writeFile(out, JSON.stringify(json));
};

const showMarkers = async (path: string) => {
  const json = await loadPalworldLocalSav(path);

  json.properties.SaveData.value.Local_CustomMarkerSaveData.value.values.forEach(
    (v) => {
      console.log(v.IconType.value);
      console.log(fromInternalDataToHumanReadable(v.IconLocation.value));
    }
  );
};

const addLifmunkEffigyMarkers = async (path: string, out: string) => {
  const json = await loadPalworldLocalSav(path);

  const locations = await loadLifmunkEffigyLocations();

  locations.forEach((location) => {
    const internalPos = fromHumanReadableToInternalData(location);

    json.properties.SaveData.value.Local_CustomMarkerSaveData.value.values.push(
      {
        IconLocation: {
          struct_type: "Vector",
          struct_id: "00000000-0000-0000-0000-000000000000",
          id: null,
          value: {
            z: 0.0,
            ...internalPos,
          },
          type: "StructProperty",
        },
        IconType: {
          id: null,
          value: 0,
          type: "IntProperty",
        },
      }
    );
  });

  await writeFile(out, JSON.stringify(json));
};

const removeLifmunkEffigyMarkers = async (path: string, out: string) => {
  const json = await loadPalworldLocalSav(path);

  const locations = await loadLifmunkEffigyLocations();

  const delta = 1;

  const oldValues =
    json.properties.SaveData.value.Local_CustomMarkerSaveData.value.values;

  const newValues =
    json.properties.SaveData.value.Local_CustomMarkerSaveData.value.values.filter(
      (v) => {
        const targetLoc = fromInternalDataToHumanReadable(v.IconLocation.value);

        return !locations.some(
          (loc) =>
            loc.x - delta <= targetLoc.x &&
            targetLoc.x <= loc.x + delta &&
            loc.y - delta <= targetLoc.y &&
            targetLoc.y <= loc.y + delta
        );
      }
    );

  console.log(`${oldValues.length} markers -> ${newValues.length} markers`);

  json.properties.SaveData.value.Local_CustomMarkerSaveData.value.values =
    newValues;

  await writeFile(out, JSON.stringify(json));
};

const addDungeonMarkers = async (
  path: string,
  out: string,
  { min_level, max_level }: { min_level: number; max_level: number }
) => {
  const json = await loadPalworldLocalSav(path);

  const locations = (await loadDungeonLocations()).filter(
    (loc) => min_level <= loc.level && loc.level <= max_level
  );

  locations.forEach((location) => {
    const internalPos = fromHumanReadableToInternalData(location);

    json.properties.SaveData.value.Local_CustomMarkerSaveData.value.values.push(
      {
        IconLocation: {
          struct_type: "Vector",
          struct_id: "00000000-0000-0000-0000-000000000000",
          id: null,
          value: {
            z: 0.0,
            ...internalPos,
          },
          type: "StructProperty",
        },
        IconType: {
          id: null,
          value: 0,
          type: "IntProperty",
        },
      }
    );
  });

  await writeFile(out, JSON.stringify(json));
};

main();

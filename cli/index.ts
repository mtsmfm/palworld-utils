import { writeFile } from "fs/promises";
import { PalworldLevelSav } from "./types";
import { loadPalworldLevelSav } from "./utils";
import yargs from "yargs/yargs";

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

main();

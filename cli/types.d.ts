interface GroupTypeNeutral {
  group_id: string;
  group_type: "EPalGroupType::Neutral";
}

interface GroupTypeOrganization {
  group_id: string;
  group_type: "EPalGroupType::Organization";
}

export interface GroupTypeGuild {
  group_id: string;
  group_type: "EPalGroupType::Guild";
  base_camp_level: number;
  players: {
    player_uid: string;
    player_info: {
      last_online_real_time: number;
      player_name: string;
    };
  }[];
  guild_name: string;
}

export interface PalworldLevelSav {
  properties: {
    worldSaveData: {
      value: {
        GroupSaveDataMap: {
          value: Array<{
            value: {
              RawData: {
                value:
                  | GroupTypeNeutral
                  | GroupTypeOrganization
                  | GroupTypeGuild;
              };
            };
          }>;
        };
        CharacterSaveParameterMap: {
          value: Array<{
            key: {
              PlayerUId: { value: string };
              InstanceId: { value: string };
            };
            value: {
              RawData: {
                value: {
                  object: {
                    SaveParameter: {
                      value: {
                        NickName: { value: string };
                        IsPlayer?: { value: string };
                        Level?: { value: number };
                      };
                    };
                  };
                };
              };
            };
          }>;
        };
      };
    };
  };
}

export interface PalworldLocalSav {
  properties: {
    SaveData: {
      value: {
        Local_CustomMarkerSaveData: {
          value: {
            values: Array<{
              IconLocation: {
                struct_type: "Vector";
                struct_id: "00000000-0000-0000-0000-000000000000";
                id: null;
                value: {
                  x: number;
                  y: number;
                  z: 0.0;
                };
                type: "StructProperty";
              };
              IconType: {
                id: null;
                value: 0 | 1 | 2 | 3 | 4 | 5 | 6;
                type: "IntProperty";
              };
            }>;
          };
        };
      };
    };
  };
}

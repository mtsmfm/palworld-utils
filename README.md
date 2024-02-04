# Palworld utils

## Usage

```
$ docker run --rm --volume $PWD:/data -it ghcr.io/mtsmfm/palworld-utils:latest palworld-save-tools-convert /data/LocalData.sav --output /data/LocalData.sav.json
$ docker run --rm --volume $PWD:/data -it ghcr.io/mtsmfm/palworld-utils:latest palworld-utils-cli show-markers /data/LocalData.sav.json
$ docker run --rm --volume $PWD:/data -it ghcr.io/mtsmfm/palworld-utils:latest palworld-utils-cli add-lifmunk-effigy-markers /data/LocalData.sav.json /data/NewLocalData.sav.json
$ docker run --rm --volume $PWD:/data -it ghcr.io/mtsmfm/palworld-utils:latest palworld-save-tools-convert /data/NewLocalData.sav.json
```

FROM ubuntu

RUN apt-get update && apt-get install curl wget -y && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get update && apt-get install git python3 tar zip xz-utils vim nodejs -y

RUN wget https://github.com/trumank/uesave-rs/releases/download/v0.3.0/uesave-x86_64-unknown-linux-gnu.tar.xz && \
    tar -xf uesave-x86_64-unknown-linux-gnu.tar.xz && \
    mv uesave-x86_64-unknown-linux-gnu/uesave /usr/local/bin/uesave && \
    rm -rf uesave-x86_64-unknown-linux-gnu uesave-x86_64-unknown-linux-gnu.tar.xz

WORKDIR /workdir

RUN git clone https://github.com/xNul/palworld-host-save-fix
RUN git clone https://github.com/cheahjs/palworld-save-tools

COPY docker/palworld-save-tools-convert /usr/local/bin/palworld-save-tools-convert

COPY package.json      /workdir/palworld-utils/package.json
COPY package-lock.json /workdir/palworld-utils/package-lock.json

RUN cd palworld-utils && npm install

COPY cli palworld-utils/cli

COPY docker/palworld-utils-cli /usr/local/bin/palworld-utils-cli

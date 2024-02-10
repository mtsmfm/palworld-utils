FROM ubuntu

RUN apt-get update && apt-get install curl wget -y && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get update && apt-get install git python3 tar zip xz-utils vim nodejs -y

RUN wget https://github.com/trumank/uesave-rs/releases/download/v0.3.0/uesave-x86_64-unknown-linux-gnu.tar.xz && \
    tar -xf uesave-x86_64-unknown-linux-gnu.tar.xz && \
    mv uesave-x86_64-unknown-linux-gnu/uesave /usr/local/bin/uesave && \
    rm -rf uesave-x86_64-unknown-linux-gnu uesave-x86_64-unknown-linux-gnu.tar.xz

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws

WORKDIR /workdir

RUN git clone https://github.com/xNul/palworld-host-save-fix
RUN git clone https://github.com/cheahjs/palworld-save-tools

COPY docker/palworld-save-tools-convert /usr/local/bin/palworld-save-tools-convert

WORKDIR /workdir/palworld-utils

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY cli cli
RUN npx esbuild cli/index.ts --bundle --platform=node --outdir=dist

WORKDIR /workdir

COPY docker/palworld-utils-cli /usr/local/bin/palworld-utils-cli

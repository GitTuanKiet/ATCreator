FROM debian as get

WORKDIR /bun

# Install bun
RUN apt-get update
RUN apt-get install curl unzip -y
RUN curl --fail --location --progress-bar --output "/bun/bun.zip" "https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64.zip"
RUN unzip -d /bun -q -o "/bun/bun.zip"
RUN mv /bun/bun-linux-x64/bun /usr/local/bin/bun
RUN chmod 777 /usr/local/bin/bun

# Install bun packages
FROM debian
COPY --from=get /usr/local/bin/bun /bin/bun
WORKDIR /app/atc
COPY . .

RUN bun install
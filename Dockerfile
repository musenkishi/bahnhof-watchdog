FROM oven/bun:1.2 AS base
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --production

# make node_modules readable for all users
# see https://github.com/oven-sh/bun/issues/10331 why this is needed
RUN chmod -R a+r /temp/prod/node_modules

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production

# copy production dependencies and source code into final image
FROM oven/bun:1.2-distroless AS release
WORKDIR /

COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/src .
COPY --from=prerelease /usr/src/app/package.json .

ENTRYPOINT [ "bun", "run", "app.ts", "--target=node" ]
# ---- Base image ----
FROM hmctsprod.azurecr.io/base/node:20-alpine as base

USER root
RUN corepack enable
USER hmcts

COPY --chown=hmcts:hmcts . .

# ---- Build image with dependencies ----
FROM base as build

RUN yarn install && yarn build:prod && \
    rm -rf webpack/ webpack.config.js

# ---- Runtime image ----
FROM base as runtime

# Install dependencies for yarn start at runtime
RUN yarn install
COPY --from=build $WORKDIR/src/main ./src/main
# TODO: expose the right port for your application
EXPOSE 4000

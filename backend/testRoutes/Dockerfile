# Standalone image for the testRoutes smoke tester. Not wired into
# docker-compose.yml on purpose - this is a manual, opt-in tool.
#
# Build context must be backend/ (one level up from this Dockerfile) so the
# image can also bundle the sample picture used by the liked/message/
# notification tests (backend/database/tests_and_scripts/resources/), e.g.:
#
#   docker build -f backend/testRoutes/Dockerfile -t matcha-test-routes backend
#   docker run --rm -it --network matcha_default \
#     -e TEST_BASE_URL=http://matcha-ruby:1942 \
#     -e TEST_PASSWORD=pass \
#     matcha-test-routes [table]
#
# See README.md in this folder for the full usage (including how to reach a
# non-dockerized backend running directly on the host).
FROM node:22-slim

# Mirrors the backend/ layout (testRoutes/ next to database/) so
# appRoutesTest.js's relative path to the sample picture
# (../database/tests_and_scripts/resources/MALE.jpg) resolves the same way
# it does when run directly from a checkout, without any code changes.
WORKDIR /app

COPY testRoutes/package.json testRoutes/package-lock.json* ./testRoutes/
RUN cd testRoutes && npm install

COPY testRoutes/appRoutesTest.js ./testRoutes/
COPY database/tests_and_scripts/resources ./database/tests_and_scripts/resources

WORKDIR /app/testRoutes
ENTRYPOINT ["node", "appRoutesTest.js"]

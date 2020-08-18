FROM node:10 AS ui-build
WORKDIR /usr/src/myapp
COPY app/ ./app/
RUN cd app && npm install @angular/cli && npm install && npm run build

FROM node:10 AS server-build
WORKDIR /root/
COPY --from=ui-build /usr/src/myapp/app/dist ./app/dist
COPY server/package*.json ./
RUN npm install
COPY server/server.js .
COPY server/dbMethods.js .
COPY server/config.js .

FROM nginx:1.15.8-alpine
COPY --from=builder /usr/src/app/dist/SampleApp/ /usr/share/nginx/html

EXPOSE 3000

CMD ["node", "server.js"]
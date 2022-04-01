FROM golang:1.16-buster AS builder
WORKDIR /app
COPY go.mod .
#COPY go.sum .
RUN go mod download
COPY *.go ./
RUN go build -o proto main.go

FROM node:16-alpine
WORKDIR /usr/src/app
COPY --from=builder /app/proto ./proto
COPY node-app node-app
RUN cd node-app && npm ci && cd ..
CMD ./proto

# go-node-prototype

When a request is received:

1. Go service handles request
2. Writes out a "static" Node service
3. Separate process restarts Node service when it changes
4. Go service proxies request to Node service to respond

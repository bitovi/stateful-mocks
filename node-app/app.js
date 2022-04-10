const express = require('express')
const app = express()
const port = 3001

const routes = require('./routes.json')

routes.forEach(({ method, path, returnValue }) => {
  app[method](path, (req, res) => {
    res.send(`${returnValue}`)
  })
})

app.listen(port, () => {
  console.log(`{ "status": "listening", "port": ${port} }`)
})

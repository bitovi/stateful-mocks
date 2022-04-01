const express = require('express')
const app = express()
const port = 3000

const routes = require('./routes.json')

routes.forEach(({ method, path, returnValue }) => {
  app[method](path, (req, res) => {
    res.send(returnValue)
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

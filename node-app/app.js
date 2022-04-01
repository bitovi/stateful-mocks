const express = require('express')
const app = express()
const port = 3000

let counter = 3

app.get('/', (req, res) => {
  res.send(`count: ${counter}`)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

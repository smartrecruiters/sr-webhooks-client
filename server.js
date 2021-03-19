const express = require('express')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')({promiseLib: require('bluebird')})

const {isAuthenticated} = require('./lib/api/auth/authentication')
const {oauthAuthentication, logout} = require('./lib/auth/oauth')

const app = express()
app.use(bodyParser.json())

const db = pgp({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})
const users = require('./lib/dao/users')(db)

oauthAuthentication(app, users)

const webhooksRouter = require('./lib/api/router/webhooks')()
const usersRouter = require('./lib/api/router/users')(users)

app.use('/api/webhooks', webhooksRouter)
app.use('/api/users', isAuthenticated, usersRouter)

const distDir = `${__dirname}/dist`
app.use(express.static(distDir))

app.get('/', (req, res) => res.sendFile(`${distDir}/index.html`))
app.get('/logout', logout)

app.get('/*', (req, res, next) => req.isAuthenticated() ? next() : res.redirect('/'), (req, res) => res.sendFile(`${distDir}/index.html`))

const server = app.listen(process.env.PORT || 8080, () => {
    console.log('App now running on port', server.address().port)
})

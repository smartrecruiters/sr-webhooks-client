const express = require('express')
const axios = require('axios')
const LinkHeader = require('http-link-header')
const EventEmitter = require('events')

const limitedArray = require('../../utils/limited-array')
const {isAuthenticated} = require('../../api/auth/authentication')
const {isAuthorized} = require('../../api/auth/authorization')

const emitter = new EventEmitter()
const events = {}

const authenticationHeaders = token => ({
    Authorization: 'Bearer ' + token
})

const handshake = (req, res, next) => {
    if (req.headers['x-hook-secret']) {
        res.set('x-hook-secret', req.headers['x-hook-secret'])
        res.status(200).send()
    } else {
        next()
    }
}

const internalEvent = async req => {
    const payload = {
        body: req.body,
        name: req.headers['event-name'],
        version: req.headers['event-version'],
        receivedAt: new Date().toUTCString()
    }
    if (req.headers['link']) {
        const {uri} = LinkHeader.parse(req.headers['link']).refs[0]
        payload.link = uri
    }
    return payload
}

module.exports = () => {
    const router = express.Router()

    router.post('/:id', handshake)
    router.post('/:id', async (req, res) => {
        const event = await internalEvent(req)
        emitter.emit(req.params.id, event)
        res.status(202).send()
    })

    router.get('/:id', [isAuthenticated, isAuthorized], (req, res) => {
        if (!events[req.params.id]) {
            events[req.params.id] = limitedArray(20)
        }
        res.status(200).json(events[req.params.id])
    })

    router.get('/:id/stream', [isAuthenticated, isAuthorized], (req, res) => {
        res.status(200).set({
            'content-type': 'text/event-stream',
            'cache-control': 'no-cache',
            'connection': 'keep-alive'
        })

        sendPing()
        function sendPing() {
            setTimeout(function(){
                res.write('ping\n\n')
                sendPing()
            }, 25000)
        }

        emitter.removeAllListeners(req.params.id)
        emitter.on(req.params.id, async event => {
            const response = await axios.get(event.link, {
                headers: authenticationHeaders(req.user.accessToken)
            })
            Object.assign(event, {entity: response.data})
            events[req.params.id].push(event)
            res.write(`data: ${JSON.stringify(event)}\n\n`)
        })

    })

    router.delete('/:id', [isAuthenticated, isAuthorized], (req, res) => {
        delete events[req.params.id]
        emitter.removeAllListeners(req.params.id)
        res.status(200).send()
    })

    return router
}

const express = require('express')
const request = require('request')
const {omit} = require('lodash')

const {isAuthorized} = require('../../api/auth/authorization')

const webhooksApiUrl = `${process.env.WEBHOOKS_API_URL}/subscriptions`

const authenticationHeader = token => ({
    Authorization: 'Bearer ' + token
})

module.exports = users => {
    const router = express.Router()

    router.get('/me', async (req, res) => {
        const user = await users.findById(req.user.id)
        res.status(200).json(omit(user, 'accessToken'))
    })

    router.post('/:id/subscriptions', isAuthorized, (req, res) => {
        const body = {
            callbackUrl: `${process.env.APP_URL}/api/webhooks/${req.params.id}`,
            events: req.body.events
        }
        request({
            uri: webhooksApiUrl,
            method: 'POST',
            body: JSON.stringify(body),
            headers: {...authenticationHeader(req.user.accessToken),
                ...{'Content-Type': 'application/json'}}
        }).pipe(res)
    })

    router.get('/:id/subscriptions', isAuthorized, (req, res) => {
        request({
            uri: webhooksApiUrl,
            method: 'GET',
            headers: authenticationHeader(req.user.accessToken)
        }).pipe(res)
    })

    router.delete('/:id/subscriptions/:subscriptionId', isAuthorized, (req, res) => {
        request({
            uri: `${webhooksApiUrl}/${req.params.subscriptionId}`,
            method: 'DELETE',
            headers: authenticationHeader(req.user.accessToken)
        }).pipe(res)
    })

    router.put('/:id/subscriptions/:subscriptionId', isAuthorized, (req, res) => {
        request({
            uri: `${webhooksApiUrl}/${req.params.subscriptionId}/activation`,
            method: 'PUT',
            headers: authenticationHeader(req.user.accessToken)
        }).pipe(res)
    })

    return router
}

# SmartRecruiters Webhooks Client

The webhooks client is a demo web application that handle incoming webhooks notifications and allows to manage 
subscriptions. Read more about SmartRecruiters webhooks functionality 
[here](https://dev.smartrecruiters.com/customer-api/webhooks).

The application is up and running at <https://sr-webhooks-client.herokuapp.com>. You are welcomed to log in using your 
SmartRecruiters administrator account and play around with the functionality to get a sense of how SmartRecruiters 
webhooks notifications function.

## About

SmartRecruiters webhooks client is created with Express.js (web framework), Angular (front-end framework)
and the Node.js runtime environment.

The application facilitates an OAuth authentication with SmartRecruiters account. Provides an endpoint for receiving 
webhooks notifications which also supports initial handshake. Presents the notification data and current state of 
entities to the user and enables them to see and change their webhooks subscriptions.

## Webhooks

### Subscription management

The app allows to read, activate and delete webhooks subscription via 
[webhooks subscriptions API](https://dev.smartrecruiters.com/customer-api/live-docs/webhooks-subscriptions-api).


### Subscription activation

In order to receive notification from a newly created subscription, the subscription needs to be activated first. 
To ensure that target server provided by `callbackURL` is ready to consume notifications, 
we require the receiver to implement the initial handshake with temporary secret. The server is expected to respond 
within the time of 20 seconds with HTTP 200 response containing X-Hook-Secret header with same value.

```
const handshake = (req, res, next) => {
   if (req.headers['x-hook-secret']) {
       res.set('x-hook-secret', req.headers['x-hook-secret'])
       res.status(200).send()
   } else {
       next()
   }
}

router.post('/:id', handshake)
```

### Notification

After successful activation the server is going to receive notifications on provided `callbackURL`.

```
router.post('/:id', async (req, res) => {
    const event = await internalEvent(req)
    emitter.emit(req.params.id, event)
    res.status(202).send()
})
```

Every notification contains information about type of event and its version in the headers. The id of changed resource 
is provided in the body. See full documentation of notification 
[here](https://dev.smartrecruiters.com/customer-api/live-docs/webhooks-subscriptions-api/#//onJobCreatedCallback).

```
const internalEvent = req => {
    const {uri} = LinkHeader.parse(req.headers['link']).refs[0]
    return {
        body: req.body,
        link: uri,
        name: req.headers['event-name'],
        version: req.headers['event-version'],
        receivedAt: new Date().toUTCString()
    }
}
```
`Link` header of the notification request provides the exact URL address that can be used to retrieve current state of
affected entity. This application uses provided link just after receiving the webhook notification, obtains the data
and presents the actual state of entity to the user.

## Authentication

The application uses OAuth 2.0 authentication, implemented with [Passport](http://www.passportjs.org/) middleware with 
dedicated [SmartRecruiters passport strategy](https://github.com/smartrecruiters/passport-smartrecruiters).

```
passport.use(new SmartrecruitersStrategy({
            clientID: process.env.SMARTRECRUITERS_CLIENT_ID,
            clientSecret: process.env.SMARTRECRUITERS_CLIENT_SECRET,
            callbackURL: `${process.env.APP_URL}/auth/callback`,
            userProfileURL: 'https://api.smartrecruiters.com/user-api/v201804/users/me'
        }, async (accessToken, refreshToken, profile, done) => {
            const user = await users.findOrCreate({id: profile.id, displayName: profile.displayName, accessToken})
            return done(null, user)
        }
    ))

app.get('/auth',
    passport.authenticate('smartrecruiters', {scope: ['webhooks_manage', 'jobs_read', 'candidates_read', 'user_me_read']}))

app.get('/auth/callback',
    passport.authenticate('smartrecruiters', {failureRedirect: '/'}),
    (req, res) => {
        res.redirect(`/${req.user.id}`)
})
```

During OAuth flow webhooks client requests for `webhooks_manage` scope which allows to read, activate and delete
webhooks subscriptions as well as other scopes, such as `jobs_read` and `candidates_read` that enable the application 
to retrieve current state of the entities from SmartRecruiters API. Read more about OAuth scopes 
[here](https://dev.smartrecruiters.com/customer-api/authentication/access-scopes).

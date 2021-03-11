const passport = require('passport')
const session = require('express-session')
const SmartrecruitersStrategy = require('passport-smartrecruiters').Strategy

module.exports =  {
    oauthAuthentication: (app, users)  => {

        passport.serializeUser((user, done) =>
            done(null, user.id))

        passport.deserializeUser(async (id, done) => {
            const user = await users.findById(id)
            done(null, user || false)
        })

        passport.use(new SmartrecruitersStrategy({
                clientID: process.env.SMARTRECRUITERS_CLIENT_ID,
                clientSecret: process.env.SMARTRECRUITERS_CLIENT_SECRET,
                callbackURL: `${process.env.APP_URL}/auth/callback`,
                userProfileURL: 'https://api.smartrecruiters.com/user-api/v201804/users/me'
            }, async (accessToken, refreshToken, profile, done) => {
                if (profile._json.systemRole.id !== 'ADMINISTRATOR') {
                    return done(null, false)
                }
                const user = await users.findOrCreate({id: profile.id, displayName: profile.displayName, accessToken})
                return done(null, user)
            }
        ))

        app.use(session({
            secret: process.env.SESSION_SECRET,
            cookie: {
                maxAge: 30 * 60 * 1000
            }
        }))
        app.use(passport.initialize())
        app.use(passport.session())

        app.get('/auth',
            passport.authenticate('smartrecruiters', {scope: ['webhooks_manage', 'jobs_read', 'candidates_read', 'user_me_read', 'approvals_read']}))

        app.get('/auth/callback',
            passport.authenticate('smartrecruiters', {failureRedirect: '/'}),
            (req, res) => {
                res.redirect(`/${req.user.id}`)
        })

    },
    logout: (req, res) => {
        req.logout()
        res.redirect('/')
    }
}

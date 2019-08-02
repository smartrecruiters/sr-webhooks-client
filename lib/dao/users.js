const {mapKeys, camelCase, snakeCase} = require('lodash')

const toCamelCase = obj => mapKeys(obj, (value, key) => camelCase(key))
const toQuery = props => Object.keys(props).map(key => `${snakeCase(key)}=$\{${key}}`)

const findOrCreate = async (db, user) => {
    const savedUser = await findById(db, user.id)
    if (savedUser) {
        return db.one(`UPDATE webhooks_user SET ${toQuery(user).join(',')} WHERE id = \${id} RETURNING *`, user)
    } else {
        return db.one(`INSERT INTO webhooks_user (id, access_token, display_name)
                               VALUES (\${id}, \${accessToken}, \${displayName}) RETURNING *`, user)
    }
}

const findById = async (db, id) => {
    const user = await db.oneOrNone('SELECT * FROM webhooks_user WHERE id = $1', id)
    if (user) {
        return toCamelCase(user)
    }
    return user
}

module.exports = db => ({
    findOrCreate: user => findOrCreate(db, user),
    findById: id => findById(db, id)
})

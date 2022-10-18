const fs = require('fs')
const jwt = require('jsonwebtoken')

const privateKey = fs.readFileSync(__dirname + '/../keys/private.key', 'utf8')
const publicKey = fs.readFileSync(__dirname + '/../keys/public.key', 'utf8')

module.exports = {
    async sign(data) {
        return (await jwt.sign(Object.assign(data, {
            pk: publicKey
        }), privateKey, {
            algorithm: 'RS256'
        }))
    },
    async decode(token) {
        return (await jwt.verify(token, publicKey, {
            algorithms: 'RS256'
        }))
    }
}
const fs = require('fs')
const jwt = require('jsonwebtoken')

const privateKey = fs.readFileSync(__dirname + '/src/keys/private.key', 'utf8')
const publicKey = fs.readFileSync(__dirname + '/src/keys/public.key', 'utf8')


const sign = async (data) => {
    return (await jwt.sign(Object.assign(data, {
        pk: publicKey
    }), privateKey, {
        algorithm: 'RS256'
    }))
}
const decode = async (token) => {
    return (await jwt.verify(token, publicKey, {
        algorithms: 'RS256'
    }))
}
sign({
    username: 'admin'
}).then(console.log)
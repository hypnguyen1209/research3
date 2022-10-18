const express = require('express')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const jwt = require('./utils/jwt')
const {
    readFileSync,
    unlinkSync,
    writeFileSync
} = require('fs')
const {
    exec
} = require('child_process')

const db = require('./utils/db')
const app = express()

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(bodyParser.json())
app.use(cookieParser())

db.createUser('admin', require('crypto').randomBytes(64).toString('hex'))

const Base64 = {
    encode(text) {
        return Buffer.from(text).toString('base64')
    },
    decode(text) {
        return Buffer.from(text, 'base64').toString('ascii')
    }
}

const middleware = async (req, res, next) => {
    try {
        if (req.cookies.session === undefined) return res.redirect('/login')
        let auth = await jwt.decode(req.cookies.session)
        req.data = {
            username: auth.username
        }
        next()
    } catch (err) {
        return res.status(500).send('500 Internal Server Error')
    }

}

const indexPage = readFileSync(__dirname + '/public/index.html', {
    encoding: 'utf-8'
})
app.get('/', (req, res) => {
    res.send(indexPage)
})

const loginPage = readFileSync(__dirname + '/public/login.html', {
    encoding: 'utf-8'
})
app.get('/login', (req, res) => {
    res.send(loginPage)
})

app.post('/auth', async (req, res) => {
    try {
        let {
            username,
            password,
        } = req.body
        if (req.body.register !== undefined) {
            if (await db.checkUser(username)) {
                db.createUser(username, password)
                res.json({
                    status: true,
                    msg: 'register successfully'
                })
            } else {
                res.json({
                    status: false,
                    msg: 'username already exists'
                })
            }
        } else {
            if (await db.checkLogin(username, password)) {
                let token = await jwt.sign({
                    username
                })
                res.cookie('session', token, {
                    maxAge: 900000
                })
                res.json({
                    status: true
                })
            } else {
                res.json({
                    status: false,
                    msg: 'invalid username or password'
                })
            }
        }
    } catch (err) {
        res.status(500)
        res.json({
            status: false,
            msg: '500 Internal Server Error'
        })
    }
})

const managerPage = readFileSync(__dirname + '/public/manager.html', {
    encoding: 'utf-8'
})
app.get('/manager', middleware, (req, res) => {
    res.send(managerPage)
})

app.post('/less', middleware, async (req, res) => {
    try {
        let lessData = Base64.decode(req.body.data)
        if (lessData.includes('@plugin') && req.data.username !== 'admin') {
            res.json({
                status: false,
                data: 'Only admin can use plugin of less'
            })
        }
        let rdName = 'tmp/' + (Math.random() + 1).toString(36).substring(7) + '.less'
        writeFileSync(rdName, lessData)
        exec(`lessc ${rdName}`, (err, stdout, _) => {
            unlinkSync(rdName)
            if (err) {
                return res.json({
                    status: false,
                    data: 'compile error'
                })
            }
            return res.json({
                status: true,
                data: Base64.encode(stdout)
            })
        })
    } catch (err) {
        res.status(500)
        res.json({
            status: false,
            data: '500 Internal Server Error'
        })
    }
})

app.listen(process.env.PORT || 1337, () => console.log('Running'))
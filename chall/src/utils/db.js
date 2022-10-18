const sqlite = require('sqlite3')

const db = new sqlite.Database(':memory:', err => {
    if (!!err) throw err;
    console.log('Connected to SQLite3')
    db.exec('CREATE TABLE users (username text NOT NULL, password text NOT NULL)')
})

module.exports = {
    checkUser(username) {
        return new Promise((res, rej) => {
            db.get(`SELECT * FROM users WHERE username = ?`, username, (err, data) => {
                if (err) return rej()
                res(data === undefined)
            })
        })
    },
    createUser(username, password) {
        let query = 'INSERT INTO users(username, password) VALUES(?,?)';
        let stmt = db.prepare(query)
        stmt.run(username, password)
        stmt.finalize()
    },
    checkLogin(username, password) {
        return new Promise((res, rej) => {
            db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, username, password, (err, data) => {
                if (err) return rej()
                res(data !== undefined)
            })
        })
    }
}
const express = require('express')
const app = express()
const port = 3000

const bodyParser = require('body-parser')
const {User} = require("./models/User")


app.use(bodyParser.urlencoded({extended: true})) // application/x-www-form-urlencoded
app.use(bodyParser.json()) //application/json

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://jione:ja546580@jione.2qflm.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(()=>console.log('MogoDB Connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => res.send('난 지원이얌'))


app.post('/register', (req, res) => {

    // 회원 가입 할 때 필요한 정보들을 client에서 가져오면
    // 그것들을 데이터 베이스에 넣어준다.

    const user = new User(req.body) // 유저 정보가 requset.body에 들어있음
    
    user.save((err, userInfo) => { // 정보들이 유저 모델에 저장
        if(err) return res.json({ success: false, err })//저장 실패했을 경우
        return res.status(200).json({
            success: true // 저장 성공했을 경우
        })
    })
})


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
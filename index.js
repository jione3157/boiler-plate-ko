const express = require('express')
const app = express()
const port = 3000

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const {User} = require("./models/User")
const config = require('./config/key')

app.use(bodyParser.urlencoded({extended: true})) // application/x-www-form-urlencoded
app.use(bodyParser.json()) //application/json
app.use(cookieParser())

const mongoose = require('mongoose')
const { json } = require('body-parser')
mongoose.connect(config.mongoURI, {
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

app.post('/login',(req,res) => {

    // 요청된 이메일이 데이터베이스에서 있는지 찾는다.
    User.findOne({ email: req.body.email},(err, user) => {
        if(!user){
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }

        // 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인.
        user.comparePassword(req.body.password, (err,isMatch) => {
            if(!isMatch) // 비밀번호가 같지않음
            return res.json({loginSuccess:false, message: "비밀번호가 틀렸습니다."})
        
            // 비밀번호까지 맞다면 토큰을 생성하기.
        user.generateToken((err,user) => {
            if(err) return res.status(400).send(err) // 에러가 있을 경우

            // 토큰을 저장한다. 어디에 ? 쿠키, 로컬스토리지
                res.cookie("x_auth", user.token)
                .status(200)
                .json({loginSuccess: true, userId: user._id})

             })
             
        })

    })

})


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
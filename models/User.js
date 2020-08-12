const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10  // salt가 몇 글자 인지
const jwt = require('jsonwebtoken')


const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }

})

userSchema.pre('save',function( next ) {
    var user = this // userSchema를 가리킴

    if(user.isModified('password')){
            // 비밀번호가 변경될때만 비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err) // 에러가 발생했을 때
     
            bcrypt.hash(user.password, salt, function (err, hash) {
                if(err) return next(err) // 에러가 발생했을 때
                user.password = hash // 암호화가 성공하면 password를 hash로 교체
                next()
            })
        }) 

    }
    else {
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb) { // 비밀번호 비교 메소드
    // plainPassword 1234567 암호화된 비밀번호 $2b$10$HW5QnqP3SE6Ux85ezceHJeKrSphylPCYB587mmeGeTBgpkP3YWomy
    // plainPassword를 암호화해 비교해야함 복호화할 수 없음
    bcrypt.compare(plainPassword,this.password,function(err,isMatch){
        if(err) return cb(err) // 비밀번호가 같지않음
        cb(null,isMatch) // 비밀번호가 같음
    })
}

userSchema.methods.generateToken = function(cb) {
    
    var user = this

    // jsonwebtoken을 이용해서 token을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    // user._id + 'secretToken' = token
    // ->
    // 'secretToken' -> user._id

    user.token = token
    user.save(function(err,user){ // user DB에 토큰 저장 
        if(err) return cb(err)
        cb(null,user)
    })
    
}


const User = mongoose.model('User', userSchema)

module.exports = {User}
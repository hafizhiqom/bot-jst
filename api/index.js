var express = require('express');
var r = express.Router();

// load pre-trained model
const model = require('./sdk/model.js'); //prediction
const cls_model = require('./sdk/cls_model.js'); //classification

// Bot Setting
const TelegramBot = require('node-telegram-bot-api');
const token = '5068714499:AAGw6SWSL_Rlar7MdW23DRt9KKDTzqqD4fM'
const bot = new TelegramBot(token, {polling: true});

state = 0;
//Main Manu Bot
bot.onText(/\/start/, (msg) => {    
    bot.sendMessage(
        msg.chat.id,
        `Selamat datang ${msg.chat.first_name} di BOT Klasifikasi Tegangan Menggunakan Deep Neural Network.\n
        click /predict`
    ); 
    state = 0;
});


bot.onText(/\/predict/, (msg) => {
    bot.sendMessage(
        msg.chat.id, 
        `Masukan nilai i dan r dengan format i|r contohnya 15|17`
    );
    state = 1;
});

bot.on('message', (msg) => {
    if(state == 1){
        s = msg.text.split("|");  
        model.predict(
            [
                parseFloat(s[0]),
                parseFloat(s[1])
             ]
         ).then((jres1)=>{
            console.log(jres1);
            
            cls_model.classify([parseFloat(s[0]), parseFloat(s[1]), parseFloat(jres1[0]), parseFloat(jres1[1])]).then((jres2)=>{
                bot.sendMessage(
                    msg.chat.id,
                    `nilai v yang diprediksi adalah ${jres1[0]} volt`
                 );
                 bot.sendMessage(
                     msg.chat.id, 
                     `nilai p yang diprediksi adalah ${jres1[1]} watt`   
                 );   
                 bot.sendMessage(
                     msg.chat.id, 
                     `Klasifikasi Tegangan ${jres2}`
                  );
            })
        })
    }else{
        state = 0
    }
})

// routers
r.get('/predict/:i/:r', function(req, res, next) {
    model.predict(
        [
            parseFloat(req.params.i),
            parseFloat(req.params.r)
        ]
     ).then((jres)=>{
        res.json(jres);
     })
});

// routers
r.get('/classify/:i/:r', function(req, res, next) {
    model.predict(
        [
            parseFloat(req.params.i),
            parseFloat(req.params.r)
        ]
     ).then((jres)=>{
        cls_model.classify(
            [
                parseFloat(req.params.i),
                parseFloat(req.params.r),
                parseFloat(jres[0]),
                parseFloat(jres[1])
            ]
      ).then((jres_)=>{
            res.json(jres_)
        })
    })
})

module.exports = r;

var express = require('express');
var app = express();
var router = express.Router();
var Board = require('../models/board');
var User = require('../models/user');
var session = require('express-session');

app.set('trust proxy', 1) 
app.use(session({
  secret: 'tired',
  resave: false,
  saveUninitialized: true,
}));

router.get('/', function(req, res){
    res.render('home.ejs');
})

router.get('/news2',function(req,res){
    Board.find({},function(err,results){
        if(err) throw err;
        res.render('news2.ejs',{boards : results})
    })
})
router.get('/writing',function(req,res){
    res.render('writing.ejs');
})
router.get('/login',function(req,res){
    res.render('login.ejs');
})
router.get('/signup',function(req,res){
    res.render('signup.ejs');
})
router.get("/show/:id",function(req,res){
    Board.findOne({_id: req.params.id}, function(err,boards){
        boards.hits++;
        boards.save();
        res.render("show.ejs",{result: boards})
    })
})
router.get('/about',function(req,res){
    res.render('about.ejs')
})


router.post('/writing', function (req, res) {
    // get과 post의 차이 (body안에 담아서 준다고?)
    var board = new Board({
      title: req.body.title,
      content: req.body.content,
      created_at: new Date(),
    // summit 했을때의 시간인가?
      hits: 0
    });
    board.save(function (err) {
    // function(err) ?
    // 난 스키마를 만들었을뿐인데 함수도 같이 정의됨??
      if (err) return console.error(err);
    });
    res.redirect('/writing');
    // 왜 res.render가 아니고?
  });

  router.post('/signup',function(req,res){
    User.find({id:req.body.id},function(err,user){ //find 
      if(err)throw err;
      if(user.length>0){
        res.redirect('/')
      }else{
        var user=new User({
          id:req.body.id,
          pw:req.body.pw
           })
        user.pw = user.generateHash(user.pw); 
     console.log("2")
        user.save(function(err){ //user 저장 
          if(err)throw err;
          console.log("3")
          res.redirect('/') //중복된 아이디가 없을떄 유저를 새로 정의함 
        })
       }
    })
  })
  
  router.post('/login',function (req,res){
    User.findOne({id:req.body.id},function(err,user){
      if(!user){
        console.log('wrong id!')
        res.redirect('/login')
      }else{
        if(!user.validateHash(req.body.pw)){
          console.log('wrong pw!')
          res.redirect('/login')
        }
      else{
        console.log('success');
        req.session.user=user.id;
        res.redirect('/')
      }
    }
  })
})
router.post("/destroy/:id",function(req,res){
    Board.remove({_id:req.params.id},function(err){
      res.redirect('/')
    })
  })
    module.exports = router;
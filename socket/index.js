/* App Express */
const express = require("express");
const app = express();
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local");

// Models


// DB Actions 
mongoose.set("strictQuery", true);
mongoose.connect("mongodb://localhost/petsitting");

const User = require("./model/User");
const Services = require("./model/Services");

// Session Data 
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
    secret: "Secret One",
    resave: false,
    saveUninitialized: false
}));

// User and Password 
app.use(passport.initialize());
app.use(passport.session());
  
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static('./build'));

// Socket Server Stuffs

const { Server } = require("socket.io");

const io = new Server({
  cors: {
    origin: "http://localhost:3000"
  }
});

function isLoggedIn(req, res, next) {
  console.log(req)
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// App Events 
io.on('connection', (socket) => {
  console.log('a user connected');
  // Login Action
  socket.on('login-action', async (objUser) => {
    try {
      // check if the user exists
      const user = await User.findOne({ username: objUser.username });
      if (user) {
        //check if password matches
        const result = objUser.password === user.password;
        if (result) {
          socket.emit("login_successful", {username: user.username, userType: user.userType, loggedIn: true })
        } else {
          console.log('result erro')
          socket.emit("login_error", {error: true})
        }
      } else {
        console.log('sem user')
        socket.emit("login_error", {error: true})
      }
    } catch (error) {
      socket.emit("login_error", {error: true})
    }
  });
  
  // Register Action
  //
  // Registra ocorrência de novo usuário
  // Garante que usuário não exista no Banco, com exceção disparada caso erro
  // Redireciona o Usuário após criação de usuário
  //
  socket.on('register-action', async (objUser) => {
    await User.createCollection();
    const user = await User.findOne({ username: objUser.username }, 'userType');

    console.log(user)
    // Verificação de existência de usuário
    if(user && user?.userType){
      console.log('tem registro')
      console.log(user)
      socket.emit("register_error", {error: true})
      return;
    } 

    const userCreate = await User.create({
      username: objUser.username,
      password: objUser.password,
      userType: objUser.userType,
    });

    // Usuário criado emite o evento para logar
    if(userCreate._id){
      console.log('criado com sucesso')
      socket.emit("register_success", {error: false})
    }
  })
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


// Start Listen
var port = process.env.PORT || 8000;

io.listen(port, () => {
    console.log('listening on *' + ':' + port);
}) 







/* Models



const User = require("../model/User");

// DB Actions 
mongoose.set("strictQuery", true);
mongoose.connect("mongodb://localhost/27017");

// Session Data 
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
    secret: "Rusty is a dog",
    resave: false,
    saveUninitialized: false
}));

// User and Password 
app.use(passport.initialize());
app.use(passport.session());
  
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes
app.get('/', (req, res) => {
  const app = ReactDOMServer.renderToString(<App />);
  const indexFile = path.resolve('./build/index.html');

  fs.readFile(indexFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Something went wrong:', err);
      return res.status(500).send('Oops, better luck next time!');
    }

    return res.send(
      data.replace('<div id="root"></div>', `<div id="root">${app}</div>`)
    );
  });
});

app.use(express.static('./build'));

// Showing login form 
app.get("/login", function (req, res) {
    res.render("login");
});
  
//Handling user login
app.post("/login", async function(req, res){
    try {
        // check if the user exists
        const user = await User.findOne({ username: req.body.username });
        if (user) {
          //check if password matches
          const result = req.body.password === user.password;
          if (result) {
            res.render("secret");
          } else {
            res.status(400).json({ error: "password doesn't match" });
          }
        } else {
          res.status(400).json({ error: "User doesn't exist" });
        }
      } catch (error) {
        res.status(400).json({ error });
      }
});
  
//Handling user logout 
app.get("/logout", function (req, res) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});
  
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}


// Socket Server Stuffs

const { Server } = require("socket.io");

const io = new Server({
    cors: {
      origin: "http://localhost:3000"
    }
  });


// Events 
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('login-action', (objUser) => {
      console.log('loginName: ' + objUser.nameValue + '; loginPass: ' + objUser.passwordValue);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


// Start Listen
var port = process.env.PORT || 8000;

io.listen(port, () => {
    console.log('listening on *' + ':' + port);
}) */
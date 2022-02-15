const Chance = require("chance");
const chance = new Chance();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const app = express();
const port = 3000;

let uid = 1;
let users = [];

app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const createUser = (idx, gender) => {
  let out = {
    id: uid,
    name: chance.name({gender}),
    gender: gender,
    age: chance.age(),
    profession: chance.profession(),
    contact_no: chance.phone(),
    email: chance.email(),
    twitter: chance.twitter(),
  }

  if (gender == "male") {
    out.image = "https://randomuser.me/api/portraits/men/" + idx + ".jpg"
  } else {
    out.image = "https://randomuser.me/api/portraits/women/" + idx + ".jpg"
  }

  uid++;

  return out
}

const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
    ;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }

  return array
}

for (let i = 0; i <= 99; i++) {
  users.push(createUser(i, 'male'));
}

for (let i = 0; i <= 99; i++) {
  users.push(createUser(i, "female"));
}

users = shuffle(users);

app.get("/users", (req, res) => {
  let page = 1;
  let page_size = 25;
  let total_items = users.length;
  let max_page_size = 25;
  let total_pages = Math.ceil(total_items / page_size); 
  let has_more = 0;
  let x, y, out;
  
  if (req.query.page_size !== undefined) {
    page_size = parseInt(req.query.page_size);

    if (page_size > max_page_size) {
      page_size = max_page_size;
    }
  }

  if (req.query.page !== undefined) {
    page = parseInt(req.query.page);

    if (page > total_pages) {
      page = total_pages;
    }
  }

  if (page < total_pages) {
    has_more = 1;
  }

  x = (page - 1) * page_size;
  y = x + page_size - 1;
  out = {}

  out.page = page;
  out.page_size = page_size;
  out.total_items = total_items;
  out.total_pages = total_pages;
  out.has_more = has_more;
  out.data = [];

  for (let i=x; i<=y; i++) {
    out.data.push(users[i]);    
  }

  res.send(out);
})


app.get("/user/:id", (req, res) => {
  let id = 1;
  let out = null;

  if (req.params.id !== undefined) {
    id = req.params.id;
  }

  for (let i=0; i <=users.length-1; i++) {
    let user = users[i];

    if (user.id == id) {
      out = user;
      break;
    }  
  }

  if (out !== null) {
    res.send(out);
    return;
  }

  res.status(404);
  res.send('user not found!');
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
})

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message + 'x');
})

app.listen(port, () => {
  console.log("Server is listening on port " + port)
})
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const login = require('./login');

app.use(express.static('./public'));
app.use(cookieParser());

const items = {};

/**
 * User login
 */
app.post('/session/:username' , express.json(), (req, res) => {
  const username = req.params.username;
  if (!username || username.trim().length == 0 || username.indexOf(' ') >= 0 || username.indexOf('dog') >= 0) {
    res.status(400).json({ error: 'bad-login' });
    return;
  }
  const uid = login.addUser(username);
  res.cookie('uid', uid);
  res.json(Object.values(items));
});

/**
 * User logout
 */
app.delete('/session', (req, res) => {
  const uid = req.cookies.uid;
  login.removeUser(uid);
  res.clearCookie('uid');
  res.json(Object.values(items));
});

const counter = () => {
  let count = 0;
  return () => {
    count += 1;
    return count;
  };
};

const nextId = counter();

/**
 * Fetch items
 */
app.get('/items/', (req, res) => {
  res.json(Object.values(items));
});

/**
 * Add a new item
 */
app.post('/items/', express.json(), (req, res) => {
   const uid = req.cookies.uid;
   if(!login.users[uid]) {
     res.status(403).send({error: `missing-uid`});
     return;
   }
   const name = req.body.name;
   const quantity = req.body.quantity;
   if(!name) {
      res.status(400).json({ error: 'item-name-required' });
      return;
   } else if(Object.values(items).find(item => item.name == name)) {
      res.status(409).json({error: `duplicate item: ${name}`});
      return;
   } if(isNaN(quantity) || quantity < 0) {
       res.status(400).json({ error: 'invalid-quanity' });
       return;
   }
   const id = nextId();
   const item = {
     id: id,
     name: name,
     quantity: quantity
   }
   items[id] = item;
   res.json(item);
});

/**
 * Update an existing item
 */
app.put('/items/:id', express.json(), (req, res) => {
  const uid = req.cookies.uid;
  const quantity = req.body.quantity;
  const id = req.params.id;
  if (!login.users[uid]) {
    res.status(403).send({error: `missing-uid`});
    return;
  } if (!items[id]) {
    res.status(400).json({ error: 'missing-item-id' });
    return;
  }
  else if (isNaN(quantity) || quantity < 0) {
    res.status(400).json({ error: 'invalid-quanity' });
    return;
  }
  items[id] = req.body;
  res.json(items[id]);
});

 /**
  * Delete an existing item
  */
 app.delete('/items/:id', (req, res) => {
  const uid = req.cookies.uid;
  if(!login.users[uid]) {
    res.status(403).send({error: `missing-uid`});
    return;
  }
  const id = req.params.id;
  if (!items[id]) {
    res.status(400).json({ error: 'missing-item-id' });
    return;
  }
  delete items[id];
  res.json(Object.values(items));
 });


app.listen(3000, () => console.log('http://localhost:3000/'));

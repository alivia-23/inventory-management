const users = {};

function userExists(username) {
  const record = Object.values(users).find(user => user.username === username);
  return record && record.uid;
}

function addUser(username) {
  const oldId = userExists(username);
  const id = oldId || Math.floor(Math.random() * 10000);
  users[id] = { username, active: true, uid: id };
  return id;
}

function removeUser(uid) {
  if(users[uid]) {
   users[uid].active = false;
 }
}

const login = {
   users,
   addUser,
   removeUser
}

module.exports = login;

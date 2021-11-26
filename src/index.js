const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user)=> user.username == username);
  
  if(!user){
    return response.status(404).json({ error: 'User not found'})
  }
  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  if(!username || !name){
    return response.status(400).json({error: 'username and name is required'});
  }

  const UserExist = users.find(user => user.username == username)

  if(UserExist){
    return response.status(400).json({error: 'Username already exists'});
  }
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(newUser)

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  
  const newTodos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodos)

  return response.status(201).json(newTodos)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body
  const { id } = request.params

  const quest = user.todos.find((todo) => todo.id === id)

  if(!quest){
    return response.status(404).json({ error: "Id not exist"})
  }

  quest.title = title
  quest.deadline = new Date(deadline)

  return response.json(quest)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params

  const quest = user.todos.find((todo) => todo.id == id)

  if(!quest){
    return response.status(404).json({ error: "Todo not found"})
  }
  quest.done = true

  return response.json(quest)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const { user } = request

  const questIndex = user.todos.findIndex((todo) => todo.id === id)

  if(questIndex === -1){
    return response.status(404).json({ error: "Todo not found"})
  }

  user.todos.splice(questIndex, 1)

  return response.status(204).json()

});

module.exports = app;
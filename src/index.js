const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(cors());
app.use(express.json());

let users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const foundUser = users.find(u => u.username === username);

  if (!foundUser) {
    return response.status(404).json({error: "We couldn't find this user in our database"})
  } else {
    request.user = foundUser;
    next();
  }
}

app.post('/users', (request, response) => {
  // Complete aqui
  const { name, username } = request.body;
  const isUserInDB = users.some(u => u.username === username);

  if (isUserInDB) {
    return response.status(400).json({error: "User already exists"})
  }

  const newUser = { 
      id: uuidv4(),
      name: name, 
      username: username, 
      todos: []
    }
    users.push(newUser);
    return response.json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const usersTodos = users.find(u => u.username === user.username);
  return response.json(usersTodos.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;

  const addTodoToUser = users.find(u => u.username === user.username);
  const addedTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  addTodoToUser.todos.push(addedTodo);
  return response.status(201).json(addedTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;
  const {id} = request.params;
  const todoToUpdate = user.todos.find(t => t.id === id);

  if (todoToUpdate) {
    todoToUpdate.title = title;
    todoToUpdate.deadline = new Date(deadline);
    return response.json(todoToUpdate);
  } else {
    return response.status(404).json({error: 'Not Found'});
  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const todoToUpdate = user.todos.find(t => t.id === id);
  if (todoToUpdate) {
    todoToUpdate.done = true;
    return response.json(todoToUpdate)
  } 
  return response.status(404).json({error: 'Not Found'});

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todoToDelete = user.todos.findIndex(t => t.id === id);
  if (todoToDelete !== -1) {
    user.todos.splice(todoToDelete, 1);
    return response.status(204).send();
  } else {
    return response.status(404).json({error: 'Not Found'});
  }
});

module.exports = app;
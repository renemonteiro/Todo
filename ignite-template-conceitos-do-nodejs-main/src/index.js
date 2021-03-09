const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const user = users.find((u)=>{
    return u.username === username
  })
  

  if(!user){
    return response.status(400).json({error:"User not found"})
  }


  request.username = user

  return next()
}

function getTaskAlreadyExists(todos, title){
  const verifyTask = todos.some((item)=>{
    return item.title === title
  })

  return verifyTask
}

app.post('/users', (request, response) => {
  const {name, username} = request.body

  const usernameAlreadyExists = users.some((name)=>{
    return username === name.username
  })

  if(usernameAlreadyExists){
    return response.status(400).json({error:"Username already exists"})
  }

  const user = {
    id:uuidv4(),
    name,
    username,
    todos:[]
  }
  
  users.push(user)
  
  return response.status(201).send(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username } = request
  return response.status(200).json(username.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request

  const {title, deadline}= request.body

  const task = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()

  }

  const taskAlreadyExists = getTaskAlreadyExists( username.todos, title)

  if(taskAlreadyExists){
    return response.status(400).json({error:"Title already exists"})
  }

  username.todos.push(task)

  return response.status(201).json(task)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;
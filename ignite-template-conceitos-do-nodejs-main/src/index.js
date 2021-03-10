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
  const {username} = request

  const {id} = request.params

  const idAlreadExist = username.todos.some((item)=>{
    return item.id === id
  })
  
  if(!idAlreadExist){
    return response.status(404).json({error:"id not exists"})
  }
  const {title, deadline} = request.body

  let obj = {}

  const newUsername = username.todos.filter((item)=>{
    if(item.id === id){
      item.title = title
      item.deadline = new Date(deadline)
      obj = item
    }
    return item
  })
  
  username.todos = newUsername
  
  return response.status(201).send(obj)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {

  const {username}= request

  const {id} = request.params

  let idNotExists = false

  let obj = {}

  const newUsername = username.todos.filter((item)=>{
    if(item.id === id){
      idNotExists = true
      item.done = true
      obj = item
      return item
    } 
    return item   
  })

 if(idNotExists === false){
   return response.status(404).json({error:"Id not Exists"})

 }

  username.todos = newUsername

  return response.status(201).json(obj)
  
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params

  const {username} = request

  const getToDelete = username.todos.filter((item) =>{
    if(item.id === id){
      return item
    }    
  })
  
  if(getToDelete.length === 0){
    return response.status(404).json({error:"Id not found"})
  }

  const indexToDelete = getToDelete[0]

  const newUsername = username.todos.filter((item)=>{
    if(item.id !== indexToDelete.id){
      return item
    }
  })

  username.todos = newUsername

  return response.status(204).send(username.todos)

});

module.exports = app;
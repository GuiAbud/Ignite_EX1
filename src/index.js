const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers; // importando o username de headers

  const user = users.find((user) => user.username === username); // Comparando se username já existe em algum da array users

  if (!user) {
    return response.status(400).json({ error: "User not found!" }); // Retornando algo caso não encontre user
  }

  request.user = user; // Para que os outros consigam chamar?

  return next(); // Para continuar o código
}

app.post("/users", (request, response) => {
  const { name, username } = request.body; // Chama o name e username escritos

  const usernameAlreadyExists = users.some(
    (user) => user.username === username // Confere se o username já está em uso
  );

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: "Username already in use!" }); // Se já existir retorna esse erro
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos); // Mostra a lista de todos do username mencionado // Não entendi isso q ta rolando no todos
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body; // Chama o title e deadline escritos
  const { user } = request;

  const addToDos = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }; // Cria essa lista de objetos para ser adicionada array todos

  user.todos.push(addToDos); // De fato adiciona essa lista de objetos ao array todos //Aquele errinho de novo

  return response.status(201).json(addToDos); // Resposta do servidor
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const idLocation = user.todos.find((todo) => todo.id === id);

  if (!idLocation) {
    return response.status(404).json({ error: "ID couldn't be located!" });
  }

  idLocation.title = title;
  idLocation.deadline = deadline;

  return response.json(idLocation);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const idLocation = user.todos.find((todo) => todo.id === id);

  if (!idLocation) {
    return response.status(404).json({ error: "ID could not be located!" });
  }

  idLocation.done = true;

  return response.json(idLocation);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const idLocation = user.todos.find((todo) => todo.id === id);

  if (!idLocation) {
    return response.status(404).json({ error: "ID couldn't be located!" });
  }

  user.todos.splice(idLocation, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;

// app.listen(3333);

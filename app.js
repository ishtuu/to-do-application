const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertToDoApplicationDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    toDo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
  };
};

const hasPriorityAndStatusProperties = (requestQuery) => {
 return (
  requestQuery.priority !== undefined && requestQuery.status !== undefined
 );
};

const hasPriorityProperty = (requestQuery) => {
 return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
 return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
 let data = null;
 let getTodosQuery = "";
 const { search_q = "", priority, status } = request.query;


 switch (true) {
  case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
   getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
   break;
  case hasPriorityProperty(request.query):
   getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
   break;
  case hasStatusProperty(request.query):
   getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
   break;
  default:
   getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
 }

data = await database.all(getTodosQuery);
 response.send(data);
});


app.post("/todos/", async (request, response) => {
  const { id, toDo, priority, status } = request.body;
  const postToDoQuery = `
  INSERT INTO
    todo ( id, todo, priority, status )
  VALUES
    (${id}, '${toDo}', '${priority}', '${status}' );`;
  await database.run(postToDoQuery);
  response.send("Todo Successfully Added");
});


app.put("/todos/:todoId/", async (request, response) =>{

    const { todoId } = request.params; 
    let updatedColumn = "";
    const requestBody = request.body;
    switch (true){
        case requestBody.status !== undefined:
            updatedColumn = "Status";
            break;
        case requestBody.priority !== undefined:
            updatedColumn = "Priority";
            break
        case requestBody.status !== undefined:
            updatedColumn = "Status";
            break    
}
    const previousToDoQuery = `
        SELECT 
            *
        FROM 
            todo
        WHERE 
            id = '${todoId};
`;
    const previousToDo = await database.get(previousToDoQuery)

    const {
        todo = previousTodo.todo,
        status = previousTodo.status,
        priority = previousTodo.priority,
    }  = request.body;

    const updatedToDoQuery = `
        UPDATE 
            todo
        SET
            todo = '${todo}',
            priority = '${priority}',
            status = '${status}'
         WHERE 
            id = ${todoId}
    `
    await database.run(updatedToDoQuery)
    response.send(`${updatedColumn} Updated`)

});
module.exports = app;


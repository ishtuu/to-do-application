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


app.get("/todos/?status=TO%20DO", async (request, response) =>{
    const { status } = request.query;
    const getToDoQuery = `
    SELECT
      *
    FROM
     todo
    WHERE
     status LIKE '%${status}%'
})`
const toDoArray = await db.all(getToDoQuery);
  response.send(toDoArray);
});

app.get("/todos/:todoId/", async (request, response) =>{
    const { todoId } = request.params;
    const getToDosQuery = `
    SELECT
      *
    FROM
     todo
    WHERE
    id = ${todoId};

    
})`
const getArray = await db.get(getToDosQuery);
  response.send(convertToDoApplicationDbObjectToResponseObject(getArray));
});

app.post("/todos/", async (request, response) => {
  const { id, toDo, priority, status } = request.body;
  const postToDoQuery = `
  INSERT INTO
    movie ( id, todo, priority, status )
  VALUES
    (${id}, '${toDo}', '${priority}', '${status}' );`;
  await database.run(postToDoQuery);
  response.send("Todo Successfully Added");
});

module.exports = app;

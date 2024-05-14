const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
// const cors = require("cors");
// app.use(cors);

const dbPath = path.join(__dirname, "user.db");

let db = null;

const initializeBDAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Sever is running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeBDAndServer();

const convertDbObjectToUsersResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    name: dbObject.name,
    emailId: dbObject.email_id,
  };
};

app.get("/users/", async (request, response) => {
  const getUsersQuery = `SELECT * FROM users
  ORDER BY id;`;
  const usersArray = await db.all(getUsersQuery);
  response.send(
    usersArray.map((eachUser) => convertDbObjectToUsersResponseObject(eachUser))
  );
});

app.post("/users/", async (request, response) => {
  const userDetails = request.body;

  const { name, emailId } = userDetails;
  const addUserQuery = `INSERT INTO users (name, email_id)
  VALUES (
    '${name}', ${emailId});`;
  const dbResponse = await db.run(addUserQuery);
  response.send("User Added");
});

app.get("/users/:id/", async (request, response) => {
  const { id } = request.params;
  const getUserQuery = `SELECT * FROM users 
  WHERE id = ${id};`;
  const user = await db.get(getUserQuery);
  response.send(convertDbObjectToUsersResponseObject(user));
});

app.put("/users/:id/", async (request, response) => {
  const { id } = request.params;
  const userDetails = request.body;
  const { name, emailId } = userDetails;
  const updateUserQuery = `UPDATE users 
  SET name = '${name}', email_id = ${emailId}'
  WHERE id = ${id};`;
  await db.run(updateUserQuery);
  response.send("User Details Updated");
});

app.delete("/users/:id", async (request, response) => {
  const { id } = request.params;
  const deleteUserQuery = `DELETE FROM users 
  WHERE id = ${id};`;
  await db.run(deleteUserQuery);
  response.send("User Removed");
});

module.exports = app;

const db = require("../database/db")

const getTodosForUser = async (req, res) => {
    // Get the user id
    const user_id = req.user.id

    // Get the todos for the user
    const todos = await db.query("SELECT * FROM todos WHERE owner_id = $1", [user_id])
    res.status(200).json(todos.rows)
}

const createTodoForCurrentUser = async (req, res) => {
    let {details, completed} = req.body
    if (!details) {
        return res.status(400).json({msg: "No detail provided"})
    }
    if (!completed) {
        completed = false
    }

    // Get the user id
    const user_id = req.user.id

    // Create the todo
    const todo = await db.query("INSERT INTO todos (owner_id, details, completed) VALUES ($1, $2, $3) RETURNING *", [user_id, req.body.details, completed])
    res.status(201).json(todo.rows[0])
}

const updateTodoForCurrentUser = async (req, res) => {
    const {details, completed, id} = req.body
    if (!(typeof(details) === "string") || !(typeof(completed) === "boolean")) {
        return res.status(400).json({msg: "Details are strings and completed is boolean"})
    }
  
    // Check if the todo is owner by the current user
    const todo = await db.query("SELECT * FROM todos WHERE id = $1 AND owner_id = $2", [id, req.user.id])
    if (todo.rowCount === 0) {
        return res.status(404).json({msg: "Todo not found"})
    }

    // Update the todo
    const updatedTodo = await db.query("UPDATE todos SET details = $1, completed = $2 WHERE id = $3 RETURNING *", [details, completed, id])
    res.status(200).json(updatedTodo.rows[0])
    
}

const deleteTodoForCurrentUser = async (req, res) => {
    const {id} = req.body
    if (!(typeof(id) === "string")) {
        return res.status(400).json({msg: "Id is not a string"})
    }

    // Check if the todo is owner by the current user
    const todo = await db.query("SELECT * FROM todos WHERE id = $1 AND owner_id = $2", [id, req.user.id])
    if (todo.rowCount === 0) {
        return res.status(404).json({msg: "Todo not found"})
    }

    // Delete the todo
    const deletedTodo = await db.query("DELETE FROM todos WHERE id = $1 RETURNING *", [id])
    res.status(200).json(deletedTodo.rows[0])
}

module.exports = {getTodosForUser, createTodoForCurrentUser, updateTodoForCurrentUser, deleteTodoForCurrentUser}
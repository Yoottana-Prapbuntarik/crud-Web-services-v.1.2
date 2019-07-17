const express = require('express');
const mySql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const httpStatus = require('http-status-codes');
const app = express();
const port = 4001;
const db = mySql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '48613244',
    database: 'todoapp',
});
db.connect();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('<div style="text-align:center;margin-top:25%;color:#ff0000"> <h1>Hello Welcome to Web Services V.1</h1> </div>')
})


/* Promise Query Database */
function queryDatabasePromise(query, queryValues) {
    return new Promise((resolve, reject) => {
        db.query(query, queryValues, (error, results) => {
            if (error) {
                reject(error, httpStatus.INTERNAL_SERVER_ERROR);

            } else {
                resolve(results)
            }
        })
    })
}


app.get('/todos', (req, res) => {
    let queryAllDataFormTodos = 'SELECT * FROM todos';
    queryDatabasePromise(queryAllDataFormTodos).then((results) => {
        res.json(results);
    })
})

app.get('/todos/:id', (req, res) => {
    let id = req.params.id;
    let queryAllDataFormTodosById = 'SELECT * FROM todos WHERE `id`=?';
    queryDatabasePromise(queryAllDataFormTodosById, id).then((results) => {
        if (results.length == 0) {
            res.send(httpStatus.NOT_FOUND);
        } else {
            res.json(results)
        }
    })
})

app.get('/items', (req, res) => {
    let queryAllDataFormItems = 'SELECT * FROM items ';
    queryDatabasePromise(queryAllDataFormItems).then((results) => {
        res.json(results);
    })
})

app.get('/todos/:id/items', (req, res) => {
    let id = req.params.id;
    let queryAllDataFormItems = 'SELECT * FROM items WHERE `todo_id`=?';
    let queryIdFromTodos = 'SELECT `id` FROM todos WHERE `id` =?';
    queryDatabasePromise(queryIdFromTodos, id).then((results) => {
        if (results.length == 0) {
            res.send(httpStatus.NOT_FOUND);
        } else {
            queryDatabasePromise(queryAllDataFormItems, id).then((results) => {
                res.json(results);
            })
        }
    })
})



app.post('/todos', (req, res) => {
    let postData = req.body;
    let insertDataInTodos = 'INSERT INTO todos SET ?';
    if (postData.text === undefined) {
        res.send(httpStatus.BAD_REQUEST);
    } else {
        queryDatabasePromise(insertDataInTodos, postData).then((results) => {
            res.json(results);
        })
    }
})


app.post('/todos/:id/items/', (req, res) => {
    let id = req.params.id;
    let postData = req.body;
    let queryIdFormTodos = 'SELECT `id` FROM todos WHERE `id` =?';
    let insertDataInItems = 'INSERT INTO items SET ?,`todo_id`=?';
    if (postData.text == undefined) {
        res.send(httpStatus.BAD_REQUEST);
    } else {
        queryDatabasePromise(queryIdFormTodos, id).then((results) => {
            if (results.length == 0) {
                res.send(httpStatus.BAD_REQUEST);
            } else {
                queryDatabasePromise(insertDataInItems, [postData, id]).then((results) => {
                    res.json(results);
                })
            }
        })
    }
})



app.put('/todos/:id', (req, res) => {
    let id = req.params.id;
    let postData = req.body;
    let queryIdFormTodos = 'SELECT  `id` FROM todos WHERE `id`=?';
    let updateDataTodosById = 'UPDATE todos  SET ? WHERE `id`=?';
    if (postData == undefined) {
        res.send(httpStatus.BAD_REQUEST);
    } else {
        queryDatabasePromise(queryIdFormTodos, id).then((results) => {
            if (results.length == 0) {
                res.send(httpStatus.INTERNAL_SERVER_ERROR);
            } else {
                queryDatabasePromise(updateDataTodosById, [postData, id]).then((results) => {
                    res.json(results);
                })
            }
        })
    }
})


// ต้องการอัพ todos id = 1 items = 2    =>   ทดลองกรอก id = 2 items 2 true   => 1. id = todo_id ไหม ?  update : unUpdate    ,    check items id = id input 
app.put('/todos/:id/items/:idItems', (req, res) => {

    let id = req.params.id;
    let idItems = req.params.idItems;
    let postData = req.body;
    let queryIdFromTodos = 'SELECT `id` FROM todos WHERE `id`=?';
    let queryItemByIdTodos = 'SELECT * FROM items WHERE `todo_id`=?';
    let queryIdFromItems = 'SELECT `id` FROM items WHERE `id`=?';
    let updateDataItemsById = 'UPDATE items SET ? WHERE `todo_id`=? AND `id`=?';
    if (postData.text == undefined && postData.archive == undefined) {
        res.send(httpStatus.BAD_REQUEST);
    } else {

        queryDatabasePromise(queryIdFromTodos, id).then((results1) => {
            queryDatabasePromise(queryItemByIdTodos, id).then((results2) => {
                queryDatabasePromise(queryIdFromItems, idItems).then((results3) => {
                    if (results1.length == 0 || results2.length == 0 || results3 == 0) {
                        res.send(httpStatus.NOT_FOUND);
                    } else {
                        queryDatabasePromise(updateDataItemsById, [postData, id, idItems]).then((results) => {
                            res.json(results);
                        })
                    }
                })
            })
        })
    }

})



app.delete('/todos/:id', (req, res) => {
    let id = req.params.id;
    let queryTodosById = 'SELECT `id` FROM todos WHERE `id`=?';
    let deleteTodosById = 'DELETE FROM `todos` WHERE `id`=?';
    let deleteItemByTodoId = 'DELETE FROM `items` WHERE `todo_id`=?';
    queryDatabasePromise(queryTodosById, id).then((results) => {
        if (results == '') {
            res.send(httpStatus.NOT_FOUND);
        } else {
            queryDatabasePromise(deleteItemByTodoId, id).then(() => {
                queryDatabasePromise(deleteTodosById, id).then((results) => {
                    res.json(results);
                })
            })
        }
    })
})

app.delete('/todos/:id/items/:idItems', (req, res) => {
    let id = req.params.id;
    let idItems = req.params.idItems;
    let queryIdTodos = 'SELECT `id` FROM todos WHERE `id`=?';
    let queryIdFromItems = 'SELECT `id` FROM items WHERE `id`=?';
    let queryItemById = 'SELECT * FROM items WHERE `todo_id`=?';
    let deleteItemById = 'DELETE FROM `items` WHERE `todo_id`=? AND `id`=? ';
    queryDatabasePromise(queryIdTodos, id).then((results1) => {
        queryDatabasePromise(queryIdFromItems, idItems).then((results2) => {
            queryDatabasePromise(queryItemById, id).then((results3) => {
                if (results1.length == 0 || results2.length == 0 || results3 == 0) {
                    res.send(httpStatus.NOT_FOUND);
                } else {
                    queryDatabasePromise(deleteItemById, [id, idItems]).then((results) => {
                        res.send(results);
                    })
                }
            })
        })
    })
})
app.listen(port, () => {
    console.log(`app listening in your port ${port}`);
})
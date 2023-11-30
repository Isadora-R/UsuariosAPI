const express = require("express");
const { Client } = require('pg');
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;
var client = new Client(conString);
client.connect(function (err) {
    if (err) {
        return console.error('Não foi possível conectar ao banco.', err);
    }
    client.query('SELECT NOW()', function (err, result) {
        if (err) {
            return console.error('Erro ao executar a query.', err);
        }
        console.log(result.rows[0]);
    });
});

app.get("/", (req, res) => {
    console.log("Response ok.");
    res.send("Rotas: \n" + "/usuarios -> para listar todos os usuários \n" + "/usuarios/:id -> para listar um usuário específico pelo código do id");
});

app.get("/usuarios", (req, res) => {
    try {
        client.query("SELECT * FROM Usuarios", function
            (err, result) {
            if (err) {
                return console.error("Erro ao executar a qry de SELECT", err);
            }
            res.send(result.rows);
            console.log("Chamou get usuarios");
        });
    } catch (error) {
        console.log(error);
    }
});

app.get("/usuarios/:id", (req, res) => {
    try {
        console.log("Chamou /:id " + req.params.id);
        client.query(
            "SELECT * FROM Usuarios WHERE id = $1", [req.params.id],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de SELECT id", err);
                }
                if (result.rows.length > 0) {
                    res.send(result.rows);
                }
                else {
                    res.send("Não há usuários com este código." + req.params.id);
                }
                console.log(result);
            }
        );
    } catch (error) {
        console.log(error);
    }
});

app.delete("/usuarios/:id", (req, res) => {
    try {
        console.log("Chamou delete /:id " + req.params.id);
        const id = req.params.id;
        client.query(
            "DELETE FROM Usuarios WHERE id = $1",
            [id],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de DELETE", err);
                } else {
                    if (result.rowCount == 0) {
                        res.status(404).json({ info: "Registro não encontrado." });
                    } else {
                        res.status(200).json({ info: `Registro excluído. Código: ${id}` });
                    }
                }
                console.log(result);
            }
        );
    } catch (error) {
        console.log(error);
    }
});

app.post("/usuarios", (req, res) => {
    try {
        console.log("Chamou post", req.body);
        const { nome, email, senha, username, endereco, cidade, estado } = req.body;
        client.query(
            "INSERT INTO usuarios (nome, email, senha, username, endereco, cidade, estado) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [nome, email, senha, username, endereco, cidade, estado],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de INSERT", err);
                }
                const { id } = result.rows[0];
                res.setHeader("id", `${id}`);
                res.status(201).json(result.rows[0]);
                console.log(result);
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});

app.put("/usuarios/:id", (req, res) => {
    try {
        console.log("Chamou update", req.body);
        const id = req.params.id;
        const { nome, email, senha, username, endereco, cidade, estado } = req.body;
        client.query(
            'UPDATE usuarios SET nome = $1, email = $2, senha = $3, username = $4, endereco = $5, cidade = $6, estado = $7 WHERE id = $8 RETURNING *', [nome, email, senha, username, endereco, cidade, estado, id],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de UPDATE", err);
                } else {
                    res.setHeader("id", id);
                    res.status(202).json({ "id": id });
                    console.log(result);
                }
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});


app.listen(config.port, () =>
    console.log("Servidor funcionando na porta " + config.port)
);

module.exports = app;
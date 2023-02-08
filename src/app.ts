import express, { Application } from "express"
import { startDatabase } from "./database"
import { createMovie, deleteMovieById, readAllMovies, readMovieById, updateMovieById } from "./logic"
import { checkNullContent, checkMovieById, checkMovieByName, ErrorMovieDontExists, checkWrongPropertyContent, ErrorMovieExists, testeMiddleware } from "./middleware"

const app: Application = express()
app.use(express.json())

app.listen(3333, async () => {
    await startDatabase()
})

app.get("/movies", readAllMovies)
app.get("/movies/:id", checkMovieById, ErrorMovieDontExists, readMovieById)
app.post("/movies", testeMiddleware, checkWrongPropertyContent, checkNullContent, checkMovieByName, ErrorMovieExists, createMovie)
app.delete("/movies/:id", checkMovieById, ErrorMovieDontExists, deleteMovieById)
app.patch("/movies/:id", checkMovieById, ErrorMovieDontExists, checkWrongPropertyContent, updateMovieById)
import { NextFunction, Request, Response } from "express";
import { QueryConfig } from "pg";
import { client } from "./database";

const movieContent = ["name", "description", "duration", "price"]

export function throwError (error: any){
    throw error
}

export async function checkMovieByName (request: Request, response: Response, next: NextFunction): Promise<void>{
    const queryString: string = `
        SELECT 
            *
        FROM
            movies_table
        WHERE
            LOWER(name) = $1
    `

    const queryConfing: QueryConfig = {
        text: queryString,
        values: [request.body.name.toLowerCase()]
    }

    const queryResponse = await client.query(queryConfing)

    if (queryResponse.rows[0]){
        request.movie = queryResponse.rows[0]
    }

    return next()
}

export async function checkMovieById (request: Request, response: Response, next: NextFunction): Promise<void>{
    const queryString: string = `
        SELECT
            *
        FROM
            movies_table
        WHERE
            id = $1
    `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [request.params.id]
    }

    const queryResponse = await client.query(queryConfig)

    if (queryResponse.rows[0]){
        request.movie = queryResponse.rows[0]
    }

    return next()
}

export function checkWrongPropertyContent (request: Request, response: Response, next: NextFunction): Response | void{
    // const movieContent = ["name", "description", "duration", "price"]
    const reviewWrongProperties = Object.keys(request.body).find((bodyProperty: string) => !movieContent.includes(bodyProperty) && true)

    try {
        reviewWrongProperties ? throwError({ message: `Property \'${reviewWrongProperties}\' should not exist.` }) : next()
    }
    catch (err){
        return response.status(400).json(err)
    }
}

export function checkNullContent (request: Request, response: Response, next: NextFunction): Response | void{
    try {
        Object.values(request.body).forEach(value => value !== "description" && !value && throwError({ message: `Properties cannot be empty.` }))
        return next()
    }
    catch (err){
        return response.status(400).json(err)
    }
}

export function ErrorMovieDontExists (request: Request, response: Response, next: NextFunction): Response | void{
    try {
        !request.movie ? throwError({ message: "Movie do not exist." }) : next()
    }
    catch (err){
        return response.status(404).json(err)
    }
}

export function ErrorMovieExists (request: Request, response: Response, next: NextFunction): Response | void{
    try {
        request.movie ? throwError({ message: "Movie is already registered" }) : next()
    }
    catch (err){
        return response.status(409).json(err)
    }
}

export function testeMiddleware (request: Request, response: Response, next: NextFunction): Response | void{

    try {
        console.log(Array.isArray(request.body))
        typeof request.body === "object" && Array.isArray(request.body) && request.body !== null && throwError("Request is not an object.")
        Object.keys(request.body).length === 0 ? throwError({ message: "Request body is empty" }) : next()
    }
    catch (err){
        return response.json(err)
    }
}
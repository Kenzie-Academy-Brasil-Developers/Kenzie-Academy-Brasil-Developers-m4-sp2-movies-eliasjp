import { Request, Response } from "express";
import { Query, QueryConfig } from "pg";
import format from "pg-format";
import { client } from "./database";

export async function readAllMovies (request: Request, response: Response){
    let limit: number = Number(request.query.limit) >= 1 && Number(request.query.limit) <= 5 ? Number(request.query.limit) : 5
    let offset: number = Number(request.query.page) > 1 ? limit * (Number(request.query.page) - 1) : 0
    const sort= !request.query.sort ? "id" : request.query.sort === "price" || "duration" ? request.query.sort : "id"
    const orderType = !request.query.order ? "ASC" : request.query.order === "ASC" || "DESC" ? request.query.order : "ASC"

    const queryString: string = `
        SELECT
            *
        FROM
            movies_table
        ORDER BY
            ${sort} ${orderType}
        OFFSET
            $1
        LIMIT
            $2
    `

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [offset, limit]
    }

    const queryResult = await client.query(queryConfig)

    return response.status(201).json(queryResult.rows)
}

export async function createMovie (request: Request, response: Response){
    const formatString: string = format(`
        INSERT INTO
            movies_table (%I)
        VALUES 
            (%L)
        RETURNING
            *;
    `,
        Object.keys(request.body),
        Object.values(request.body)
    )

    const queryResult = await client.query(formatString)

    return response.status(201).json(queryResult.rows[0])
}

export function readMovieById (request: Request, response: Response): Response{
    return response.status(200).json(request.movie)
}

export async function deleteMovieById (request: Request, response: Response): Promise<Response>{
    const queryString: string = `
        DELETE FROM
            movies_table
        WHERE
            id = $1
    `
    const queryConfig: QueryConfig = {
        text: queryString,
        values: [request.params.id]
    }

    await client.query(queryConfig)

    return response.status(204).json()
}

export async function updateMovieById (request: Request, response: Response): Promise<Response>{
    const queryString: string = format(`
        UPDATE movies_table
        SET
            (%I) = ROW (%L)
        WHERE
            id = $1
        RETURNING
            *
    `,
        Object.keys(request.body),
        Object.values(request.body)
    )

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [request.params.id]
    }

    if (request.body.name.toLowerCase() === request.body.name.toLowerCase()){
        return response.status(409).json({ message: "Another movie has the same name" })
    }

    const queryResponse = await client.query(queryConfig)

    return response.status(201).json(queryResponse.rows[0])
}
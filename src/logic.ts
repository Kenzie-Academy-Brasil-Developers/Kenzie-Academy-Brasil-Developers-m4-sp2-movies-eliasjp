import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "./database";
import { throwError } from "./middleware"

export async function readAllMovies (request: Request, response: Response){
    let perPage: number = Number(request.query.perPage) >= 1 && Number(request.query.perPage) <= 5 ? Number(request.query.perPage) : 5
    let offset: number = Number(request.query.page) > 1 ? perPage * (Number(request.query.page) - 1) : 0
    const sort= !request.query.sort ? "id" : request.query.sort === "price" || "duration" ? request.query.sort : "id"
    const orderType = !request.query.order ? "ASC" : request.query.order === "ASC" || "DESC" ? request.query.order : "ASC"

    const queryString: string = format(`
        SELECT
            *
        FROM
            movies_table mt
        ORDER BY
            %I %s
        OFFSET
            $1
        LIMIT
            $2
    `,
        sort,
        orderType
    )

    const queryConfig: QueryConfig = {
        text: queryString,
        values: [offset, perPage]
    }

    const queryResult = await client.query(queryConfig)
    let urlPreviousPage = "movies?"
    let urlNextPage = "movies?"

    Object.keys(request.query).forEach((key: string, index: number, thisArray) => {
        if (key === "page"){
            urlNextPage += Number(request.query.page) >= 1 ? `page=${Number(request.query[key]) + 1}` : `page=2`
            urlPreviousPage += `page=${Number(request.query[key]) - 1}`
        }
        else{
            urlNextPage += `${key}=${request.query[key]}`
            urlPreviousPage += `${key}=${request.query[key]}`
        }

        if (index < thisArray.length - 1){
            urlNextPage += "&"
            urlPreviousPage += "&"
        }
    })

    const detailedReturn = {
        previusPage: Number(request.query.page) >= 1 ? `http://localhost:3333/${urlPreviousPage}` : null,
        nextPage: queryResult.rowCount ? `http://localhost:3333/${urlNextPage}` : null,
        count: queryResult.rowCount,
        data: queryResult.rows
    }

    return response.status(201).json(detailedReturn)
}

export async function createMovie (request: Request, response: Response){
    if (!request.body.description){
        request.body.description = ""
    }

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

    const queryResponse = await client.query(queryConfig)

    return response.status(201).json(queryResponse.rows[0])
}
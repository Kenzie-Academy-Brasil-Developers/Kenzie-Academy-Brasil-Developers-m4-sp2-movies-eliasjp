import { Client } from "pg"

export const client: Client = new Client({
    user: 'Mooneoff',
    password: '1234',
    host: 'localhost',
    database: 'KenzieMovie',
    port: 5432
})

export async function startDatabase (): Promise<void> {
    try {
        await client.connect()
        console.log(`Server started`)
    }
    catch {
        console.log("Server error")
    }
}
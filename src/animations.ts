import { Position } from './snake'
import { sleep } from './utils'

export async function death_animation(ctx: CanvasRenderingContext2D, SNAKE_SIZE: number){
    if(!ctx) throw '¿Tu navegador no soporta canvas? Yo que tú me compraría una pc xd'
    ctx.fillStyle = '#f00' 
    const start_position = {
        x: 250,
        y: 250,
    }
    ctx.fillRect(start_position.x, start_position.y, SNAKE_SIZE, SNAKE_SIZE)
    await sleep(300)
    let neighbors = draw_neighbors(start_position)
    for(let i = 0; i < 5; i++){
        let new_neighbors: Position[] = []
        neighbors.map(neighbor => {
            new_neighbors.push(...draw_neighbors({
                x: neighbor.x,
                y: neighbor.y,
            }))
        })
        neighbors = [...new_neighbors]
        await sleep(300)
    }

    function draw_neighbors(from: Position){
        if(!ctx) throw '¿Tu navegador no soporta canvas? Yo que tú me compraría una pc xd'
        const neighbors = get_neighbors({
            x: from.x,
            y: from.y,
        })
        neighbors.map(neighbor => {
            ctx.fillStyle = '#f22' 
            ctx.fillRect(neighbor.x, neighbor.y, SNAKE_SIZE, SNAKE_SIZE)
        })
        return neighbors
    }

    function get_neighbors(from: Position): Position[]{
        return [
            {
                x: from.x - SNAKE_SIZE,
                y: from.y,
            },
            {
                x: from.x + SNAKE_SIZE,
                y: from.y,
            },
            {
                x: from.x,
                y: from.y - SNAKE_SIZE,
            },
            {
                x: from.x,
                y: from.y + SNAKE_SIZE
            }
        ]
    }
    console.log('Fin de la animación de muerte')
}
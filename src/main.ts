import { sleep } from './utils'
import Snake from './snake'
import { death_animation } from './animations'

const CANVAS_SIZE = 550
const BORDERS = {
    right: 500,
    left: 0,
    up: 0,
    down: 500,
}
const SNAKE_SIZE = 50
const NEXT_FRAME_WAIT = 1000

const canvas = document.querySelector('#game') as HTMLCanvasElement
canvas.width = CANVAS_SIZE
canvas.height = CANVAS_SIZE

const ctx = canvas.getContext('2d')
if(!ctx) throw '¿Tu navegador no soporta canvas? Yo que tú me compraría una pc xd'
const snake = new Snake({
    size: SNAKE_SIZE,
    start_position: {
        x: 200,
        y: 0,
    },
    start_length: 3,
    borders: BORDERS,
    ctx,
})
let key_press_allowed = true

async function draw_loop(){
    if(!ctx) throw '¿Tu navegador no soporta canvas? Yo que tú me compraría una pc xd'
    //BACKGROUND
    ctx.fillStyle = '#222'
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    draw_snake()

    //DRAW GRID
    for(let i = 0; i < CANVAS_SIZE; i += SNAKE_SIZE){
        for(let j = 0; j < CANVAS_SIZE; j += SNAKE_SIZE){
            ctx.strokeRect(i, j, SNAKE_SIZE, SNAKE_SIZE)
        }
    }
    key_press_allowed = true
    await sleep(NEXT_FRAME_WAIT)
    draw_loop()
}

snake.on('DEATH', () => {
    console.log('muerto')
    death_animation(ctx, SNAKE_SIZE)
})

function draw_snake(){
    if(!ctx) throw '¿Tu navegador no soporta canvas? Yo que tú me compraría una pc xd'
    if(!snake.get_is_alive()) return
    const snake_body = snake.get_body_parts()
    ctx.fillStyle = '#444'
    snake.update()
    snake_body.map(part => {
        ctx.fillRect(part.x, part.y, SNAKE_SIZE, SNAKE_SIZE)
    })
    ctx.fillStyle = '#555'
    ctx.fillRect(snake.get_position().x, snake.get_position().y, SNAKE_SIZE, SNAKE_SIZE)
}

draw_loop()

document.addEventListener('keydown', event => {
    const { key } = event
    if(!key_press_allowed) return
    console.log(key)
    if(key === 'ArrowRight' || key === 'd')
        snake.set_moving_direction('RIGHT')
    if(key === 'ArrowDown' || key === 's')
        snake.set_moving_direction('DOWN')
    if(key === 'ArrowLeft' || key === 'a')
        snake.set_moving_direction('LEFT')
    if(key === 'ArrowUp' || key === 'w')
        snake.set_moving_direction('UP')

    key_press_allowed = false
})
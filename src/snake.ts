import { sleep } from './utils'
import _ from 'lodash'

export type Position = {
    x: number,
    y: number,
}

type UpdatedPosition = {
    add_x?: number,
    add_y?: number,
}

class MovableObject{
    private size
    private position

    constructor(size: number, position: Position){
        this.size = size
        this.position = position
    }

    get_size(){
        return this.size
    }

    get_position(){
        return this.position
    }

    set_position(position: Position){
        this.position = position
    }

    update_position(position: UpdatedPosition){
        if(position.add_x)
            this.position.x += position.add_x
        if(position.add_y)
            this.position.y += position.add_y
    }
}

type Directions = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'STOPPED'

type Borders = Readonly<{
    right: number,
    left: number,
    up: number,
    down: number,
}>

type SnakeProps = Readonly<{
    size: number,
    start_position: Readonly<Position>,
    start_length: number,
    borders: Readonly<Borders>,
}>

type Events = 'DEATH' | 'WIN'

export default class Snake{
    private moved_times_with_current_direction = 1
    private borders
    private moving_direction: Directions = 'STOPPED'
    private is_alive = true
    private body: Position[] = []
    private size
    private start_position
    private start_length

    constructor({ size, start_position, start_length, borders }: SnakeProps){
        this.size = size
        this.borders = borders
        this.start_position = start_position
        this.start_length = start_length
        this.body.push(structuredClone(start_position))
        for(let i = 1; i <= start_length; i++){
            this.body.push({
                x: start_position.x - size * i,
                y: start_position.y,
            })
        }
    }

    get_body_parts(){
        return this.body
    }

    regenerate(){
        this.is_alive = true
        this.moving_direction = 'STOPPED'
        this.moved_times_with_current_direction = 1
        this.body = []
        this.body.push(structuredClone(this.start_position))
        for(let i = 1; i <= this.start_length; i++){
            this.body.push({
                x: this.start_position.x - this.size * i,
                y: this.start_position.y,
            })
        }
    }

    set_moving_direction(direction: Directions){
        if(!this.is_alive) return
        if(direction === 'LEFT' && this.get_moving_direction() === 'STOPPED') return
        if(direction === 'RIGHT' && this.get_moving_direction() === 'LEFT') return
        if(direction === 'LEFT' && this.get_moving_direction() === 'RIGHT') return
        if(direction === 'DOWN' && this.get_moving_direction() === 'UP') return
        if(direction === 'UP' && this.get_moving_direction() === 'DOWN') return
        if(this.moved_times_with_current_direction === 0) return
        this.moving_direction = direction
        this.moved_times_with_current_direction = 0
    }

    get_moving_direction(){
        return this.moving_direction
    }

    get_borders(){
        return this.borders
    }

    get_is_alive(){
        return this.is_alive
    }

    get_size(){
        return this.size
    }

    update_position(index: number, position: UpdatedPosition){
        if(position.add_x)
            this.body[index].x += position.add_x
        if(position.add_y)
            this.body[index].y += position.add_y
    }

    private move(){
        if(this.get_moving_direction() === 'UP')
            this.update_position(0, {
                add_y: -this.size,
            })
        if(this.get_moving_direction() === 'DOWN')
            this.update_position(0, {
                add_y: this.size,
            })
        if(this.get_moving_direction() === 'LEFT')
            this.update_position(0, {
                add_x: -this.size,
            })   
        if(this.get_moving_direction() === 'RIGHT')
            this.update_position(0, {
                add_x: this.size,
            })  
        this.moved_times_with_current_direction += 1
        this.check_collisions()
    }

    private move_body_parts(){
        if(this.get_moving_direction() === 'STOPPED') return
        for(let i = this.body.length - 1; i > 0; i--){
            this.body[i] = structuredClone(this.body[i - 1])
        }

    }

    private check_collisions(){
        this.body.map(part => {
            if(part.x > this.get_borders().right) 
                this.kill()
            if(part.x < this.get_borders().left)
                this.kill()
            if(part.y > this.get_borders().down)
                this.kill()
            if(part.y < this.get_borders().up)
                this.kill()
        })
        for(let i = 0; i < this.body.length; i++){
            for(let j = 0; j < this.body.length; j++){
                if(i === j) continue
                const part_one = this.body[i]
                const part_two = this.body[j]
                if(_.isEqual(part_one, part_two)){
                    this.kill()
                    return
                }
            }
        }
    }

    private kill(){
        this.is_alive = false
        this.set_moving_direction('STOPPED')   
    }

    /**
     * Calls this event when the snake ate an apple
     */
    ate_apple(){
        this.body.push(structuredClone(this.body.at(-1)))
    }

    async on(event_type: Events, callback: () => void){
        if(event_type !== 'DEATH') return
        while(this.is_alive)
            await sleep(10)
        callback()
    }

    /**
     * Calls to this function will update the state of the snake
     */
    update(){
        this.move_body_parts()
        this.move()
    }
}

export class Apple extends MovableObject{
    private snake

    constructor(size: number, snake: Snake){
        const position = {
            x: -10000,
            y: -10000,
        }
        super(size, position)
        this.snake = snake
        this.set_apple_position()
    }

    private set_apple_position(){
        function get_random_number(min: number, max: number) {
            return Math.random() * (max - min) + min
        }

        do{
            const rows = this.snake.get_borders().right / this.snake.get_size()
            const new_x = Math.floor(get_random_number(0, rows)) * this.snake.get_size()
            const columns = this.snake.get_borders().down / this.snake.get_size()
            const new_y = Math.floor(get_random_number(0, columns)) * this.snake.get_size()
            this.set_position({
                x: new_x,
                y: new_y
            })
        }while(this.is_apple_inside_snake())
    }

    regenerate(){
        this.set_apple_position()
    }

    private is_apple_inside_snake(){
        return this.snake.get_body_parts().some(part => _.isEqual(part, this.get_position()))
    }

    check_eaten(){
        if(!this.is_apple_inside_snake()) return false
        console.log('F por la manzanita')
        this.regenerate()
        this.snake.ate_apple()
        return true
    }

    /**
     * Call this when the apple is eaten
     */
    async eat(){
        
    }
}
import { sleep } from './utils'

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
    private ctx

    constructor(size: number, position: Position, ctx: CanvasRenderingContext2D){
        this.size = size
        this.position = position
        this.ctx = ctx
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

type Borders = {
    right: number,
    left: number,
    up: number,
    down: number,
}

type SnakeProps = {
    size: number,
    start_position: Position,
    start_length: number,
    borders: Borders,
    ctx: CanvasRenderingContext2D,
}

type Events = 'DEATH' | 'WIN'

export default class Snake extends MovableObject{
    private borders
    private moving_direction: Directions = 'STOPPED'
    private is_alive = true
    private body_parts: Position[] = []
    private length

    constructor({ size, start_position, start_length, borders, ctx }: SnakeProps){
        super(size, start_position, ctx)
        this.borders = borders
        this.length = start_length
        for(let i = 1; i <= this.length; i++){
            this.body_parts.push({
                x: start_position.x - size * i,
                y: start_position.y,
            })
        }
    }

    get_body_parts(){
        return this.body_parts
    }

    set_moving_direction(direction: Directions){
        if(!this.is_alive) return
        if(direction === 'RIGHT' && this.get_moving_direction() === 'LEFT') return
        if(direction === 'LEFT' && this.get_moving_direction() === 'RIGHT') return
        if(direction === 'DOWN' && this.get_moving_direction() === 'UP') return
        if(direction === 'UP' && this.get_moving_direction() === 'DOWN') return
        this.moving_direction = direction
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

    private move(){
        if(this.get_moving_direction() === 'UP')
            this.update_position({
                add_y: -50,
            })
        if(this.get_moving_direction() === 'DOWN')
            this.update_position({
                add_y: 50,
            })
        if(this.get_moving_direction() === 'LEFT')
            this.update_position({
                add_x: -50,
            })   
        if(this.get_moving_direction() === 'RIGHT')
            this.update_position({
                add_x: 50,
            })  
        this.check_collisions()
    }

    private move_body_parts(){
        if(this.get_moving_direction() === 'STOPPED') return
        this.body_parts[1] = this.body_parts[0] 
        this.body_parts[0] = this.get_position()
        
    }

    private check_collisions(){
        if(this.get_position().x > this.get_borders().right) 
            this.kill()
        if(this.get_position().x < this.get_borders().left)
            this.kill()
        if(this.get_position().y > this.get_borders().down)
            this.kill()
        if(this.get_position().y < this.get_borders().up)
            this.kill()
    }

    private kill(){
        this.is_alive = false
        this.set_moving_direction('STOPPED')   
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

class Apple extends MovableObject{
    private should_draw = true

    constructor(size: number, position: Position, ctx: CanvasRenderingContext2D){
        super(size, position, ctx)
    }

    /**
     * Call this when the apple is eaten
     */
    on_eat(){
        this.should_draw = false
    }
}
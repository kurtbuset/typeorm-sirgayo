import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    firstName!: string

    @Column()
    lastName!: string

    @Column()
    title!: string

    @Column()
    email!: string

    @Column()
    role!: string

    @Column()
    hashedPassword!: string

    @CreateDateColumn()
    createdAt!: Date;  

    @UpdateDateColumn()
    updatedAt!: Date;
}   

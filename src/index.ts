import http from 'http'
import express from 'express'
import * as bodyParser from 'body-parser'

import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from './db'
import ProgramRouter from './routes/programs'
import ExerciseRouter from './routes/exercises'
import authRouter from './routes/auth'
import passport from './config/passportConfig'

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(passport.initialize())
app.use('/programs', ProgramRouter())
app.use('/exercises', ExerciseRouter())
app.use('/auth', authRouter)


const httpServer = http.createServer(app)

sequelize.sync()

console.log('Sync database', 'postgresql://localhost:5432/fitness_app')

httpServer.listen(8000).on('listening', () => console.log(`Server started at port ${8000}`))

export default httpServer

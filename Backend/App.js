import dotenv from 'dotenv'
dotenv.config({
    path: new URL('./.env', import.meta.url).pathname
});

import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}))

app.use(
    '/api/v1/payment/webhook',
    express.raw({ type: 'application/json' })
    // CHANGED: Razorpay signature verification REQUIRES raw body (Buffer)
    // If express.json() runs first, signature WILL FAIL
);

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(express.static('public'))
app.use(cookieParser());

import userRouter from './Routes/auth.route.js'

app.use('/api/v1/users', userRouter)

import chatRouter from './Routes/chat.route.js'

app.use('/api/v1/chats', chatRouter)

import messageRouter from './Routes/message.route.js'

app.use('/api/v1/messages', messageRouter)

import paymentRouter from './Routes/payment.route.js'

app.use('/api/v1/payment', paymentRouter)

export { app }
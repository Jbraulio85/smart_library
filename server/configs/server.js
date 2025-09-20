"use strict"

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';


import { dbConnection } from './mongo.js'
import apiLimiter from '../src/middlewares/request-limit.js'
import { deleteFileOnError } from '../src/middlewares/delete-file-on-error.js';
import adminUser from "../src/auth/auth.controller.js"

import authRoutes from "../src/auth/auth.routes.js"
import userRoutes from "../src/user/user.routes.js"
import degreeRoutes from "../src/degree/degree.routes.js" 
import createCourse from "../src/course/course.routes.js"
import createDegrees from "../src/degree/degree.controller.js"
import documentRoutes from "../src/document/document.routes.js"
import chatRoutes from "../src/chat/chat.routes.js"

import { swaggerDocs, swaggerUi } from "./swagger.js";

const middlewares = (app) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
        frameguard: false,
    }));
    app.use(morgan("dev"))
    app.use(apiLimiter)
}

const routes = (app) => {
    app.use("/virtualLibrary/v1/auth", authRoutes)
    app.use("/virtualLibrary/v1/user", userRoutes)
    app.use("/virtualLibrary/v1/course", createCourse)
    app.use("/virtualLibrary/v1/degree", degreeRoutes);
    app.use("/virtualLibrary/v1/document", documentRoutes);
    app.use("/virtualLibrary/v1/chat", chatRoutes)
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs))
}

const conectarDB = async () => {
    try{
        await dbConnection()
    }catch(err){
        console.log(`Database connection failed: ${err}`)
    }
}

export const initServer = () => {
    const app = express()
    try{
        conectarDB()
        adminUser()
        createDegrees()

        middlewares(app)
        routes(app)
        app.use(deleteFileOnError)

        app.listen(process.env.PORT)
        console.log(`Server running on port: ${process.env.PORT}`)
    }catch(err){
        console.log(`Server init failed: ${err}`)
    }
}
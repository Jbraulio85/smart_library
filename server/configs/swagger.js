import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options ={
    swaggerDefinition:{
        openapi:"3.0.0",
        info:{
            title: "Virtual Library",
            version: "1.0.0",
            description: "API for the management of the virtual library",
            contact:{
                name: "WichosCode",
                email: "wichoscode@gmail.com"
            }
        },
        servers:[
            {
                url: "http://127.0.0.1:3000/virtualLibrary/v1"
            }
        ]
    },
    apis:[
        "./src/auth/auth.routes.js",
        "./src/chat/chat.routes.js",
        "./src/course/course.routes.js",
        "./src/degree/degree.routes.js",
        "./src/document/document.routes.js",
        "./src/user/user.routes.js"
    ]
}

const swaggerDocs = swaggerJSDoc(options)

export { swaggerDocs, swaggerUi}
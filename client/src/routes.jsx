import { Content } from "./components/dashboard/Content";
import { VisitorPage } from "./pages/visitor/visitorPage";
import { AuthPage } from "./pages/auth/AuthPage";
import { VerifyEmail } from "./components/auth/VerifyEmail";
import { LoginMicrosoft } from "./components/auth/LoginMicrosoft";
import { UserMenu } from "./components/user/UserMenu";
import { Settings } from "./components/Settings";
import { UsersList } from "./components/user/UsersList";
import { CoursesList } from "./components/courses/CoursesList";
import { CoursesAdd } from "./components/courses/CoursesAdd";
import { CoursesStudent } from "./components/courses/CoursesStudent";
import { CoursesByDegreeList } from "./components/courses/CoursesByDegreeList";
import { CourseDocuments } from "./components/courses/CourseDocuments";
import { CourseDocumentUpload } from "./components/courses/CourseDocumentUpload";
import { CourseTeacherPage } from "./components/courses/CourseTeacherPage"; 

export const routes = [
    { path: "/kinal.library/acceso", element: <AuthPage /> },
    { path: "/kinal.library/acceso/verificación", element: <VerifyEmail /> },
    { path: "/kinal.library/acceso.microsoft", element: <LoginMicrosoft /> },
    {
        path: "/kinal.library",
        element: <Content />,
        children: [
            { path: "perfil", element: <UserMenu /> },
            { path: 'ajustes', element: <Settings /> },
            { path: "usuarios", element: <UsersList /> },
            { path: "cursos", element: <CoursesList /> },
            { path: "cursos/agregar", element: <CoursesAdd /> },
            { path: "cursos/estudiante", element: <CoursesStudent /> },
            { path: "cursos/maestro", element: <CourseTeacherPage /> },
            { path: "cursos/grados", element: <CoursesByDegreeList /> },
            { path: "cursos/:cid/documentos", element: <CourseDocuments /> },
            { path: "cursos/:cid/subir-documento", element: <CourseDocumentUpload /> },
        ],
    },
    { path: "/", element: <VisitorPage /> },
];
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://biblioteca-inteligente.onrender.com/virtualLibrary/v1",
  timeout: 10000,
  httpsAgent: false,
});

apiClient.interceptors.request.use(
  (config) => {
    const userDetails = localStorage.getItem("user");
    if (userDetails && userDetails !== "undefined") {
      try {
        const token = JSON.parse(userDetails).token;
        config.headers.Authorization = `Bearer ${token}`;
      } catch {
        localStorage.removeItem("user");
      }
    }
    return config;
  },
  (e) => {
    return Promise.reject(e);
  }
);

// ---------- AUTH ----------

export const register = async (data) => {
  try {
    return await apiClient.post("/auth/register", data);
  } catch (e) {
    return { error: true, e };
  }
};

export const verifyEmail = async (code) => {
  try {
    return await apiClient.get(`/auth/verify/${code}`);
  } catch (e) {
    return { error: true, e };
  }
};

export const login = async (data) => {
  try {
    return await apiClient.post("/auth/login", data);
  } catch (e) {
    return { error: true, e };
  }
};

// ---------- USER ----------

export const getUsers = async () => {
  try {
    return await apiClient.get("/user/getUsers");
  } catch (e) {
    return { error: true, e };
  }
};

export const updateProfile = async (data) => {
  try {
    return await apiClient.put("/user/updateProfile", data);
  } catch (e) {
    return { error: true, e };
  }
};

export const updatePassword = async (data) => {
  try {
    return await apiClient.patch("/user/updatePassword", data);
  } catch (e) {
    return { error: true, e };
  }
};

export const updateProfilePicture = async (formData) => {
  try {
    return await apiClient.patch("/user/updateProfilePicture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (e) {
    return { error: true, e };
  }
};

export const deleteUser = async (password) => {
  try {
    return await apiClient.delete(`/user/deleteAccount`, {
      data: { password }
    });
  } catch (e) {
    return { error: true, e };
  }
};

export const deleteUserAccount = async (uid) => {
  try {
    return await apiClient.delete(`/user/deleteUser/${uid}`);
  } catch (e) {
    return { error: true, e };
  }
};

export const deleteProfilePicture = async () => {
  try {
    return await apiClient.delete("/user/deleteProfilePicture");
  } catch (e) {
    return { error: true, e };
  }
};

// ---------- DEGREES ----------

export const getDegrees = () => apiClient.get("/degree");

// ---------- COURSES ----------

export const getCourses = async (params = {}) => {
  try {
    return await apiClient.get("/course/getCourses", { params });
  } catch (e) {
    return { error: true, e };
  }
};

export const addCourse = async (data) => {
  const formData = new FormData();
  formData.append("name", data.name || "");
  formData.append("description", data.description || "");
  formData.append("password", data.password || "");
  formData.append("teacher", data.teacher || "");
  formData.append("degree", data.degree || "");
  if (data.image) {
    formData.append("image", data.image);
  }
  return await apiClient.post("/course/addCourse", formData);
};

export const updateCoursePicture = async (cid, formData) => {
  try {
    return await apiClient.patch(`/course/updateCoursePicture/${cid}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (e) {
    return { error: true, e };
  }
};

export const updateCoursePassword = async (cid, data) => {
  try {
    return await apiClient.patch(`/course/updateCoursePassword/${cid}`, data);
  } catch (e) {
    return { error: true, e };
  }
};

export const deleteCourse = async (cid) => {
  try {
    return await apiClient.delete(`/course/deleteCourse/${cid}`);
  } catch (e) {
    return { error: true, e };
  }
};

export const updateCourse = async (cid, data) => {
  try {
    return await apiClient.put(`/course/updateCourse/${cid}`, data);
  } catch (e) {
    return { error: true, e };
  }
};

export const getMyCourses = async () => {
  try {
    return await apiClient.get("/course/getMyCourses");
  } catch (e) {
    return { error: true, e };
  }
};

export const getMyCoursesById = async () => {
  try {
    return await apiClient.get("/course/getCourseById");
  } catch (e) {
    return { error: true, e };
  }
};

export const assignCourse = async (cid, data) => {
  try {
    return await apiClient.patch(`/course/assignCourse/${cid}`, data);
  } catch (e) {
    return { error: true, e };
  }
};

export const getCoursePassword = async (cid) => {
  try {
    return await apiClient.get(`/course/getCoursePassword/${cid}`);
  } catch (e) {
    return { error: true, e };
  }
};

export const uploadDocumentToCourse = async (cid, formData) => {
  try {
    return await apiClient.post(`/course/uploadDocument/${cid}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } catch (e) {
    return { error: true, e };
  }
};

export const getCourseById = async (cid) => {
  try {
    const response = await apiClient.get(`/course/getCourseId/${cid}`);
    return response.data;
  } catch (e) {
    return { error: true, e };
  }
};

export const filterCoursesStudent = async (data) => {
  try {
    return await apiClient.post("/course/courseFilterStudent", data);
  } catch (e) {
    return { error: true, e };
  }
};

export const getCoursesByTeacher = async () => {
  try {
    return await apiClient.get("/course/getCoursesByTeacher");
  } catch (e) {
    return { error: true, e };
  }
};

export const getCourseId = async (cid) => {
  try {
    return await apiClient.get(`/course/getCourseId/${cid}`);
  } catch (e) {
    return { error: true, e };
  }
};

export const getDocumentsByBimester = async (cid, data) => {
  try {
    return await apiClient.post(`/course/getDocumentsByBimester/${cid}`, data);
  } catch (e) {
    return { error: true, e };
  }
};

export const deleteDocumentFromCourse = async (cid, did) => {
  try {
    return await apiClient.patch(`/course/${cid}/document/${did}`);
  } catch (e) {
    return { error: true, e };
  }
};

// ---------- IA / CHAT ----------

export const consultDocumentIA = async ({ url, question }) => {
  try {
    const { data } = await apiClient.post(
      "/chat/chatConsult",
      { url, question },
      { timeout: 25000 }
    );
    return data;
  } catch (e) {
    return { error: true, message: e.response?.data?.message || e.message };
  }
};

export const historyIA = async ({ url }) => {
  try {
    const { data } = await apiClient.get("/chat/history", {
      params: { docUrl: url },
      timeout: 120000,
    });
    return data;
  } catch (e) {
    return { error: true, message: e.response?.data?.message || e.message };
  }
};

export const cleanHistoryIA = async ({ url }) => {
  try {
    const { data } = await apiClient.delete("/chat/cleanHistory", {
      params: { docUrl: url },
    });
    return data;
  } catch (e) {
    return { error: true, message: e.response?.data?.message || e.message };
  }
};

export const getTrivia = async (cid) => {
  try {
    return await apiClient.get(`/chat/generateTrivia/${cid}`, { timeout: 25000 });
  } catch (e) {
    return { error: true, e };
  }
}

export const answerTrivia = async (triviaId, data) => {
  try {
    return await apiClient.post(`/chat/checkAnswer/${triviaId}`, data);
  } catch (e) {
    return { error: true, e };
  }
}
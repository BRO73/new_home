import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8082/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); 
    if (token) {
        config.headers.Authorization = `Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1X3JvbGVzIjpbIlJPTEVfQURNSU4iXSwidV9pZCI6MiwidV9zdG9yZV9uYW1lIjoiTmjDoCBow6BuZyBBIC0gUXXhuq1uIDEiLCJ0b2tlbl90eXBlIjoiYWNjZXNzX3Rva2VuIiwic3ViIjoiY29ubG9uYmVvMSIsImlhdCI6MTc2MDY2MjE0MCwiZXhwIjoxNzYwNjY1NzQwfQ.kLFDLdNti15S3Q2n_A_XbI9o5JtIVGAIxAIIw0mrzX0`;  
    }
    return config;
});

export default api;
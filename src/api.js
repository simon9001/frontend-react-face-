import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api"; // ✅ Ensure correct backend URL

// ✅ Get CSRF Token before login
export const getCSRFToken = async () => {
    await axios.get(`${API_URL}/csrf/`, { withCredentials: true });
};

// ✅ Login API
export const login = async (username, password) => {
    await getCSRFToken(); // Fetch CSRF token first

    return axios.post(`${API_URL}/login/`, { username, password }, { withCredentials: true });
};

export const fetchUsers = async () => {
    return axios.get(`${API_URL}/users/`, {
        headers: { "Content-Type": "application/json" }, 
    });
};


// ✅ Add user (Fixed endpoint)
export const addUser = async (name, role, image) => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("role", role);
    formData.append("image", image);

    return axios.post(`${API_URL}/users/add/`, formData, { // 🔥 FIXED ENDPOINT
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
    });
};

// ✅ Edit user (Fixed endpoint)
export const editUser = async (userId, updatedData) => {
    const formData = new FormData();
    formData.append("name", updatedData.name);
    formData.append("role", updatedData.role);
    if (updatedData.image) {
        formData.append("image", updatedData.image);
    }

    return axios.put(`${API_URL}/users/update/${userId}/`, formData, { // 🔥 FIXED ENDPOINT
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
    });
};

// ✅ Delete user (Fixed endpoint)
export const deleteUser = async (userId) => {
    return axios.delete(`${API_URL}/users/delete/${userId}/`, { withCredentials: true }); // 🔥 FIXED ENDPOINT
};

// ✅ Add Camera API

export const addCamera = async (cameraData) => {
    await getCSRFToken();  // Ensure CSRF token is fetched

    try {
        const response = await axios.post(`${API_URL}/cameras/`, cameraData, {
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie('csrftoken'),  // CSRF token header
            },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error adding camera:", error.response?.data || error.message);
        throw error;
    }
};


//export const fetchCameras = async () => {
  //  return axios.get(`${API_URL}/cameraslst/`, {
    //    headers: { "Content-Type": "application/json" }, 
    //});
//};
export const fetchCameras = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/cameraslst/`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`,  // ✅ Include Authentication Token
                "X-CSRFToken": getCookie("csrftoken"), // ✅ Include CSRF Token
            },
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching cameras:", error.response?.data || error.message);
        throw error;
    }
};

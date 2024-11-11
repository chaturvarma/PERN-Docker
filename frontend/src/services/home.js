import axios from "axios";

const mainData = async () => {
  try {
    const response = await axios.get("/api/");
    console.log(response.data);
  } catch (error) {
    console.error("Error fetching data from /api/:", error);
  }
};

export default mainData;
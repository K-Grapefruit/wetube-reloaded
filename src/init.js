import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import app from "./server";

app.listen(4000, () => console.log("Server listening on port 4000"));

// db playground
import { ignition } from "../../app/initenv.mjs";
import { connectDB } from "../../app/db.mjs";

ignition(import.meta.dirname + "/../../");
await connectDB();
console.log('here');
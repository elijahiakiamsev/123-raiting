import { ignition } from "../initenv.mjs";
import { testDB, endDB } from "../../database/db.mjs";

await ignition();

console.log(process.env);

if (await testDB()) {
    console.log('👌 Sucsess: Database is working.');
} else {
    console.log('🚩 FAIL: Database is _not_ working.');
};
await endDB();


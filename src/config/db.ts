import mongoose from "mongoose";

export const connectWithDb = async () => {
    const dbUrl: string | undefined = process.env.MONGODB_URI;
    if (dbUrl) {
        await mongoose.connect(dbUrl)
            .then(() => {
                console.log("Database connected successfuly: ");
            })
            .catch((err) => {
                console.error(err);
                console.log("Db Connection Failed: ")
                process.exit(1);
            })
    }
    else {
        console.log("Database Url is not defined: ");
    }
}
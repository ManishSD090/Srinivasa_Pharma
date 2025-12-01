import bcrypt from "bcrypt";

const hashPassword = async () => {
    const hash = await bcrypt.hash("admin123", 10);
    console.log(hash);
};

hashPassword();

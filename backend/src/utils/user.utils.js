export const safeUser = (user) => {
    if (!user) return null;
    const obj = user.toObject();
    delete obj.password;
    return obj;
};

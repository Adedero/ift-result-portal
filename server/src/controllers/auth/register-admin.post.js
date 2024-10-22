const bcrypt = require('bcrypt');
const db = require('../../database/db')
module.exports = {
    fn: async (req, res) => {
        const { firstName, lastName, username, password, sex } = req.body;
        const role = "ADMIN"

        const hpassword = await bcrypt.hash(password, 10)
        const user = {
            firstName,
            lastName,
            username,
            sex,
            role,
            password: hpassword
        }

        const newUser = await db.User.create(user);
        return res.status(200).json(newUser);
    }
}
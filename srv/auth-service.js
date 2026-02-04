const cds = require("@sap/cds");

module.exports = cds.service.impl(async function () {

  const { Users } = cds.entities("ecommerce");

  this.on("login", async (req) => {
    const { email, password } = req.data;

    const user = await SELECT.one.from(Users).where({ email });

    if (!user) {
      req.reject(401, "User not found");
    }

    if (user.password !== password) {
      req.reject(401, "Invalid credentials");
    }

    return {
      id: user.ID,
      role: user.role,
      name: user.name
    };
  });

});

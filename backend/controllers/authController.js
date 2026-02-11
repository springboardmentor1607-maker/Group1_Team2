const { users } = require("../config/db");

exports.register = (req, res) => {
  users.push(req.body);
  res.json({ message: "Registered" });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (u) => u.email === email && u.password === password
  );

  if (user) res.json({ message: "Success", user });
  else res.json({ message: "Invalid" });
};

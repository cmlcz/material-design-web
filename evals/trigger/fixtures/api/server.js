const express = require("express"); const app = express();
app.post("/users", (req, res) => { const { name } = req.body; res.json({ id: Date.now(), name }); });
app.listen(3000);

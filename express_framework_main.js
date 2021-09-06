const express = require('express');
const app = express()
const port = 3000

app.use(express.static(__dirname))

app.get("/", function(a,b){return b.send('<script>location = "main.html"</script>')})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
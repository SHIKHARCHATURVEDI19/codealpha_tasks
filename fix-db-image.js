const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('database_v2.sqlite');
db.run("UPDATE Products SET image_url = 'assets/keyboard_2K.jpeg' WHERE image_url LIKE '%Portable%'");
db.close();

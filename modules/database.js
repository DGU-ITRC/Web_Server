const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Connect to the SQLite database located in the root directory
const db = new sqlite3.Database(path.resolve(__dirname, '../db.sqlite'), (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create the tables
db.serialize(() => {
    // Create the 'news' table
    db.run(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thumb TEXT,
      title TEXT,
      content TEXT,
      count INTEGER DEFAULT 0,
      created REAL,
      url TEXT,
      media TEXT
    )
  `);

    // Create the 'communication' table
    db.run(`
    CREATE TABLE IF NOT EXISTS communication (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      method TEXT,
      origin INTEGER,
      title TEXT,
      content TEXT,
      author TEXT,
      created REAL
    )
  `);

    // Create the 'server' table
    db.run(`
    CREATE TABLE IF NOT EXISTS server (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      nickname TEXT
    )
  `);

    // Create the 'log' table
    db.run(`
    CREATE TABLE IF NOT EXISTS log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      state TEXT,
      created REAL
    )
  `);
});


// Export the functions for use in other parts of the application
module.exports = db;
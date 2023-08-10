const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// MySQL configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root123',
  database: 'candidate_status',
});

// Connect to MySQL database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Middleware
app.use(bodyParser.json());

// POST API endpoint to get candidate status count for a given user
app.post('/get-candidate-status', (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: 'Uid is required in the request body.' });
  }

  // Query to get candidate status count for the given user
  const query = `
    SELECT 
      U.id AS Uid,
      COUNT(C.id) AS TotalCandidates,
      SUM(CASE WHEN CS.status = 'joined' THEN 1 ELSE 0 END) AS Joined,
      SUM(CASE WHEN CS.status = 'interview' THEN 1 ELSE 0 END) AS Interview
    FROM 
      User U
    LEFT JOIN 
      Candidate C ON U.id = C.Uid
    LEFT JOIN 
      CandidateStatus CS ON C.id = CS.cid
    WHERE 
      U.id = ?
    GROUP BY 
      U.id
  `;

  connection.query(query, [uid], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Failed to fetch candidate status count.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const candidateStatus = results[0];
    res.json(candidateStatus);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});

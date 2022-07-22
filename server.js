const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('./helpers/uuid'); 

const PORT = 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));//connect to static folder

app.get('/', (req, res) => {
  console.info(`${req.method} request received to get HTML.`);
  res.sendFile(path.join(__dirname, '/public/index.html'))//connect to HTML
});

app.get('/notes', (req, res) => {
  console.info(`${req.method} request received to get notes`);
  res.sendFile(path.join(__dirname, '/public/notes.html')); //connect to notes
});

app.get('/api/notes', (req, res) => {
  let response = fs.readFileSync('./db/db.json');
  response = JSON.parse(response);
  res.json(response);
  console.log(response);
});

app.post('/api/notes', (req, res) => {
  console.info(`${req.method} request received`);
  const { title, text } = req.body;

  if (title && text) {
    const newNote = {
      title,
      text,
      id: uuid()
    };
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const parsedNotes = JSON.parse(data); // Convert string to JSON  
        parsedNotes.push(newNote);// Add a new review

        fs.writeFile( // Write updated reviews back to the file
          './db/db.json',
          JSON.stringify(parsedNotes, null, 2),
          (throwError) =>
            throwError ? console.error(throwError) : console.info('Posted Note!'));
      }
    });

    const response = {
      status: 'success',
      body: newNote,
    };
    console.log(response);
  res.status(201).json(response);
  } else {
    res.status(500).json('Notes must include content');
  };  
});

app.delete(`/api/notes/:id`, (req, res) => {
  let notes = fs.readFileSync('./db/db.json');
  notes = JSON.parse(notes);  
  const { id } = req.params;
  notes = notes.filter(note => note.id !== id)
  
  fs.writeFile('./db/db.json', JSON.stringify(notes), (error) => error ? console.error(error) : console.info('Note deleted'));
  res.json(notes);
});


app.get('*', (req, res) => {
    console.info(`${req.method} request redirected...`)  
    res.sendFile(path.join(__dirname, '/public/index.html')) //redirect to correct port
});


app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT} 🚀`)
);

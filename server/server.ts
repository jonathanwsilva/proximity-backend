import express from 'express';
import path from 'path';
import { config } from 'dotenv'
import {getJobs} from './gateway';

const app = express();
// TODO: Only do this in development.
config(); 


// Make these folders publically available
["/web_modules", "/client"].forEach(relpath => {
  app.use(relpath, express.static(path.join(__dirname, '..', relpath), {
    immutable: true,
    etag: true,
    index: false,
    maxAge: "1d"
  }));
});

app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
  
  getJobs('junior software', 'boston, MA')
  .then(jobs => res.render('jobs', {jobs, token: process.env.MAPBOX_TOKEN}))
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
  console.log(":)")
});
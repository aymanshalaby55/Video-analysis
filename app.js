require('dotenv').config({ path: '.env' });
const cookieParser = require('cookie-parser');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// routers
const videoRouts = require('./routers/videoRouts');
const userRoutes = require('./routers/userRoutes');

// error hendler
const GlobalError = require('./controllers/errorController');
const AppErorr = require('./utils/appError');

const app = express();
app.use('/uploads', express.static('uploads'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000', 'https://new.csb.app/'],
  }),
);

const PORT = process.env.PORT || 4040;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.log('Error connecting to MongoDB:', err);
  });

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/videos', videoRouts);


app.listen(PORT, () => {
  console.log('listening on port', PORT);
});

//! if we are able to reach this point then there is no rout to handle the request
// all : for all http requests
// * :for any rout url
app.all('*', (req, res, next) => {
  // if next has argument express automaticly will skip all middlewares and go to our error handler middlerware
  next(new AppErorr(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(GlobalError);

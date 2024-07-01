import app from './src/app.js';
import config from './src/config/config.js';
import mongoose from 'mongoose';

mongoose.connect(config.MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
  app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

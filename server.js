const express = require('express')
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDoc = YAML.load('./swagger.yaml')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const colors = require('colors')
const morgan = require('morgan')
const cron = require('node-cron');
const ShareRide = require('./models/ShareRide');

const app = express();

app.use(morgan('dev'));

app.use(express.json());
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc))

app.get('/health', (_req, res) => {
    res.status(200).json({
        health: 'Ok'
    })
})

// Use dotenv files
dotenv.config({
  path: './config/config.env'
});

connectDB()

// Scheduling a Cron job to run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Run a task every hour to delete past trips');
  const now = new Date();
  
  try {
      const rides = await ShareRide.find();
      
      for (const ride of rides) {
          const rideDateTime = new Date(`${ride.date}T${ride.time}`);
          if (rideDateTime < now) {
              await ShareRide.deleteOne({ _id: ride._id });
              console.log(`Removed past ride scheduled for ${ride.date} o ${ride.time}`);
          }
      }
  } catch (error) {
      console.error('Error when deleting past rides:', error);
  }
});

app.use('/api/RS/auth', require('./routes/user'));
app.use('/api/RS/shareride', require('./routes/shareride'));
const sharerideRoutes = require('./routes/shareride');
app.use('/api/RS/shareride', sharerideRoutes);
const driverRouter = require('./routes/driver');
const passengerRouter = require('./routes/passenger');
const userRoleRoutes = require('./routes/userrole');
app.use('/api/RS/driver', driverRouter);
app.use('/api/RS/passenger', passengerRouter);
app.use('/api/RS/userrole', userRoleRoutes); 

const PORT = process.env.PORT || 4000;
app.listen(PORT,
    console.log(`Server running on port: ${PORT}`.red.underline.bold)
    
    );
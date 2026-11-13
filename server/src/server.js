import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const port = Number(process.env.PORT || 5000);

if (process.env.MONGODB_URI) {
  try {
    await connectDB(process.env.MONGODB_URI);
  } catch (error) {
    console.error('Không kết nối được MongoDB:', error.name);
    process.exit(1);
  }
}

app.listen(port, '0.0.0.0', () => {
  console.log(`UniJob API: http://localhost:${port}`);
});
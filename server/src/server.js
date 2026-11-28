import 'dotenv/config';

import app from './app.js';
import { connectDB } from './config/db.js';
import User from './models/User.js';

const port = Number(process.env.PORT || 5000);

if (
  !process.env.MONGODB_URI
  || (process.env.JWT_SECRET?.length ?? 0) < 32
) {
  console.error(
    'Cần MONGODB_URI và JWT_SECRET hợp lệ trong server/.env.',
  );
  process.exit(1);
}

try {
  await connectDB(process.env.MONGODB_URI);
  await User.init();

  app.listen(port, '0.0.0.0', () => {
    console.log(`UniJob API: http://localhost:${port}`);
  });
} catch (error) {
  console.error('Không khởi động được backend:', error.name);
  process.exit(1);
}
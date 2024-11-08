import cluster from 'cluster';
import os from 'os';
import { createServer } from 'http';  // For handling server creation
import app from './app.js'

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);
  
  // Fork workers based on the number of CPUs
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // If a worker dies, spawn a new one
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died, spawning a new worker...`);
    cluster.fork();
  });

} else {
  // Workers can share any TCP connection, in this case, an HTTP server
  createServer(app).listen(8082, () => {
    console.log(`Worker ${process.pid} started`);
  });
}

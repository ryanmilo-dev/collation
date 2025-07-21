const express = require('express');
const { Kafka } = require('kafkajs');
const http = require('http');
const socketIo = require('socket.io');
const { Client: PgClient } = require('pg');
const mongoose = require('mongoose');
const Redis = require('redis');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// ENV VARS (set via .env or Docker Compose)
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';
const POSTGRES_URL = process.env.POSTGRES_URL;
const MONGO_URL = process.env.MONGO_URL;
const REDIS_URL = process.env.REDIS_URL;
const JWT_SECRET = process.env.JWT_SECRET;
/*
if (!POSTGRES_URL || !MONGO_URL || !REDIS_URL || !JWT_SECRET || !KAFKA_BROKER) {
  console.error('❌ One or more required environment variables are missing.');
  process.exit(1);
}
  */
const missingVars = [];

if (!POSTGRES_URL) missingVars.push('POSTGRES_URL');
if (!MONGO_URL) missingVars.push('MONGO_URL');
if (!REDIS_URL) missingVars.push('REDIS_URL');
if (!JWT_SECRET) missingVars.push('JWT_SECRET');
if (!KAFKA_BROKER) missingVars.push('KAFKA_BROKER');

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variable(s): ${missingVars.join(', ')}`);
  process.exit(1);
}

// --- Kafka setup ---
const kafka = new Kafka({ clientId: 'my-app', brokers: [KAFKA_BROKER] });
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'test-group' });

let kafkaReady = false;

// --- Postgres ---
let postgresReady = false;
async function checkPostgres() {
  try {
    const client = new PgClient({ connectionString: POSTGRES_URL });
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    postgresReady = true;
    console.log('✅ Postgres connection established');
  } catch (err) {
    postgresReady = false;
    console.error('❌ Postgres not available:', err.message);
  }
}

// --- MongoDB ---
let mongoReady = false;
async function checkMongo() {
  try {
    // Avoid multiple connects in dev hot reloads
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    }
    mongoReady = true;
    console.log('✅ MongoDB connection established');
  } catch (err) {
    mongoReady = false;
    console.error('❌ MongoDB not available:', err.message);
  }
}

// --- Redis ---
let redisReady = false;
let redisClient = null;
async function checkRedis() {
  try {
    if (!redisClient) {
      redisClient = Redis.createClient({ url: REDIS_URL });
      redisClient.on('error', (err) => {
        redisReady = false;
        console.error('❌ Redis error:', err.message);
      });
      await redisClient.connect();
    }
    await redisClient.ping();
    redisReady = true;
    console.log('✅ Redis connection established');
  } catch (err) {
    redisReady = false;
    console.error('❌ Redis not available:', err.message);
  }
}

// --- Kafka Connect and Consumer ---
async function checkKafkaConnection() {
  try {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });
    kafkaReady = true;
    console.log('✅ Kafka connection established');
  } catch (error) {
    kafkaReady = false;
    console.error('❌ Failed to connect to Kafka:', error.message);
    process.exit(1);
  }
}

function runKafkaConsumer() {
  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const msg = message.value.toString();
      console.log(`Received: ${msg}`);
      io.emit('kafka-message', msg);
    },
  });
}

// --- Health Endpoint ---
app.get('/health', async (req, res) => {
  // These checks are fast (just pings), but could be optimized/cached if needed
  //await checkPostgres();
  //await checkMongo();
  //await checkRedis();

  //const allOk = kafkaReady && postgresReady && mongoReady && redisReady;
  const allOk = kafkaReady; //&& postgresReady && mongoReady && redisReady;
  res.status(allOk ? 200 : 500).json({
    status: allOk ? 'ok' : 'error',
    kafka: kafkaReady ? 'connected' : 'not connected'//,
    //postgres: postgresReady ? 'connected' : 'not connected',
    //mongo: mongoReady ? 'connected' : 'not connected',
    //redis: redisReady ? 'connected' : 'not connected',
  });
});

// --- Example endpoint to produce a Kafka message ---
app.get('/send/:msg', async (req, res) => {
  try {
    if (!kafkaReady) throw new Error('Kafka not connected');
    const msg = req.params.msg;
    await producer.send({
      topic: 'test-topic',
      messages: [{ value: msg }],
    });
    res.send(`Message "${msg}" sent to Kafka!`);
  } catch (err) {
    res.status(500).send(`Failed to send message: ${err.message}`);
  }
});

// Serve static frontend (if built)
app.use(express.static('build'));

// --- Startup logic ---
(async () => {
  try {
    await Promise.all([
      //checkPostgres(),
      //checkMongo(),
      //checkRedis(),
      checkKafkaConnection(),
    ]);
    runKafkaConsumer();

    server.listen(3001, () =>
      console.log('🚀 Server started on http://localhost:3001')
    );
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
})();

process.on('SIGINT', async () => {
  // Clean shutdown
  try {
    //if (redisClient) await redisClient.quit();
    await producer.disconnect();
    await consumer.disconnect();
    //await mongoose.disconnect();
    console.log('Clean shutdown.');
    process.exit(0);
  } catch (e) {
    process.exit(1);
  }
});

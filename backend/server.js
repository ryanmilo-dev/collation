const express = require('express');
const { Kafka } = require('kafkajs');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Kafka config
const kafka = new Kafka({ clientId: 'my-app', brokers: ['localhost:9092'] });
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'test-group' });

async function runKafka() {
  // Producer connects
  await producer.connect();
  // Consumer connects
  await consumer.connect();
  await consumer.subscribe({ topic: 'test-topic', fromBeginning: true });

  // Consume messages from Kafka, send to frontend via Socket.IO
  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const msg = message.value.toString();
      console.log(`Received: ${msg}`);
      io.emit('kafka-message', msg);
    },
  });
}

runKafka().catch(console.error);

// Example endpoint to produce a Kafka message
app.get('/send/:msg', async (req, res) => {
  const msg = req.params.msg;
  await producer.send({
    topic: 'test-topic',
    messages: [{ value: msg }],
  });
  res.send(`Message "${msg}" sent to Kafka!`);
});

// Serve static frontend (if built)
app.use(express.static('build'));

// Start server
server.listen(3001, () => console.log('Server started on http://localhost:3001'));

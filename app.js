const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express()
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uadalh8.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        const appointmentCollection = client.db('doctor-portal').collection('appointment')
        const bookingCollection = client.db('doctor-portal').collection('bookings')

        app.get('/appointment', async(req, res) => {
            // let date = req.query.date
            const query = {}
            // const  bookingQuery = { appointmentDate : date }
            // const alreadyBooked = await bookingCollection.find(bookingQuery).toArray()
            
            const result = await appointmentCollection.find(query).toArray()
            res.send(result)
        })


        // app.get('/bookings', async(req, res) => {
        //     // const email = req.body.email
        //     const query = {}
        //     const bookings = await bookingCollection.find(query).toArray();
        //     res.send(bookings)
        // })

        
        app.post('/bookings', async(req, res) => {
            const booking = req.body
            // const query = {}
            const result = await bookingCollection.insertOne(booking);
            res.send(result)
        })




        app.get('/bookings', async (req, res) => {
            // find out email 
            let query = {}
            if (req.query.email) {
              query = {
                email: req.query.email
              }
            }
            const booking = await bookingCollection.find(query).toArray()
            res.send(booking)
          })
    }
    finally{}

}

run()

app.get('/',async(req,res)=> {
    res.send('doctor portal server is running')
})

app.listen(port, ()=> console.log('server is running', port))


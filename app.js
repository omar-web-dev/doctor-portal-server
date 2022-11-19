// require('crypto').randomBytes(64).toString('hex')
const jwt = require('jsonwebtoken')
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
        const usersCollection = client.db('doctor-portal').collection('user')

        // app.get('/appointment', async(req, res) => {
        //     const query = {}
        //     const result = await appointmentCollection.find(query).toArray()
        //     res.send(result)
        // })

        app.get('/appointment', async(req, res) => {
            let date = req.query.date
            // console.log(date)
            const query = {}
            const options = await appointmentCollection.find(query).toArray()
            // console.log(options , 'options')
            const  bookingQuery = { appointmentDate : date }
            // console.log(bookingQuery, 'bookingQuery')
            const alreadyBooked = await bookingCollection.find(bookingQuery).toArray()
            // console.log(alreadyBooked, 'alreadyBooked')
            options.forEach(option =>{
                const optionBooked = alreadyBooked.filter(booked => booked.treatment === option.title)
                const bookedSlots = optionBooked.map(book => book.slot)
                const bookedTreatment = optionBooked.map(book => book.treatment)
                const remainingSlots =  option.slots.filter(sl => !bookedSlots.includes(sl))
                // console.log(remainingSlots) 
            })


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

        //   app.post('/users', async (req, res) => {
        //     const user = req.query.body;
        //     console.log(user)
        //     const result = await usersCollection.insertOne(user)
        //     res.send(result)
        //   })

        app.get('/jwt', async(req,res) => {
            const email = req.query.email
            const query = {email}
            const user = await usersCollection.findOne(query)
            console.log(user)
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn : '23h'})
                res.send({accessToken : token})
            }
            res.status(403).send({assesToken: ''})
        })

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });
    }
    finally{}

}
// require('crypto').randomBytes(64).toString('hex')
run()

app.get('/',async(req,res)=> {
    res.send('doctor portal server is running')
})

app.listen(port, ()=> console.log('server is running', port))


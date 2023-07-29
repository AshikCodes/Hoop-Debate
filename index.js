require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const { Client } = require('pg')
const nodemailer = require('nodemailer')

app.use(express.json())
const corsOpts = {
    origin: '*',
    allowedHeaders: [
      'Content-Type',
    ],
  };
  
app.use(cors(corsOpts))
app.use(express.static('build'))

// const client = new Client({
//     host:'localhost',
//     user:'postgres',
//     port: 5432,
//     password: process.env.DATABASE_PASS,
//     database: process.env.DATABASE
// }) 
const client = new Client({
    host:'dpg-cj2f4s5iuie55pnmk7hg-a',
    user:'hoopdebate_user',
    port: 5432,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE
}) 


const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
})

const sendIdeaEmail = (name, idea) => {
    try {
        transporter.sendMail({
            from: process.env.EMAIL,
            to: process.env.PERSONAL_EMAIL,
            subject: `New Idea from HoopDebate - ${name}`,
            html: `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5;">
                    <p>Hello Ashik!</p>
                    <p>You got a new idea from HoopDebate! Check it out.</p>
                    <p>Idea: "${idea}"</p>
                    <p>From: ${name}</p>
                    <p>Best regards,</p>
                    <p>Hoop Debate</p>
                  </div>`
        })
    }
    catch(err){
        console.log(`Error sending email: ${err}`)
    }
}

console.log('connecting to postgreSQL database...')
client.connect()
    .then(() => {
        console.log('Connected to DB!')
    })
    .catch((err) => {
        console.log(`Error connecting to DB: ${err}`)
    })

app.get('/', (req,res) => {
    res.send('SUCCESS YESSIR')
})

app.get('/get_wyr', async (req, res) => {
    let result = await client.query(`SELECT wyr.wyr_id, wyr.wyr_question, wyr.wyr_option1, wyr.wyr_option2, stats.wyr_option1_clicks, stats.wyr_option2_clicks 
                                     FROM wyr
                                     FULL JOIN stats
                                     ON wyr.wyr_id = stats.wyr_id
                                     ORDER BY random()`)
    res.json(result.rows)     
})

app.post(`/add_click`, async (req,res) => {
    const { wyr_id, wyr_option1_clicks, wyr_option2_clicks } = req.body

    try {
        let result = await client.query(`INSERT INTO stats(wyr_id, wyr_option1_clicks, wyr_option2_clicks)
                                         VALUES($1, $2, $3)`, [wyr_id, wyr_option1_clicks, wyr_option2_clicks])
        res.json('Added click')
    }
    catch(err) {
        console.log(`Error here is ${err}`)
        res.json({Error: err})
    }
})

app.put('/add_click', async (req,res) => {
    const { wyr_id, wyr_option1_clicks, wyr_option2_clicks } = req.body

    try {
        let result = await client.query(`UPDATE stats
                                         SET wyr_option1_clicks = $1,
                                             wyr_option2_clicks = $2
                                         WHERE wyr_id = $3`, [wyr_option1_clicks, wyr_option2_clicks, wyr_id])
        res.json('Successfully updated click count')
    }
    catch(err) {
        console.log(`Error updating clicks`)
        res.json({Error: err})
    }
})

app.post('/new_idea', async (req, res) => {
    const {name, idea} = req.body
    try {
        await client.query(`INSERT INTO ideas(sendername, senderidea)
                            VALUES($1, $2)`, [name, idea])
        sendIdeaEmail(name, idea)
        res.json('Successully added idea to db!')
    }
    catch(err){
        console.log(`Error adding idea to db/email`)
        res.json({Error: err})
    }
})

const PORT = process.env | 3001
app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`)
})
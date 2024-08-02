require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const { Client } = require('pg')
const nodemailer = require('nodemailer')


const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

app.use(express.json())
const corsOpts = {
    origin: '*',
    allowedHeaders: [
      'Content-Type',
    ],
  };
  
app.use(cors(corsOpts))
// app.use(express.static('build'))

// const client = new Client({
//     host:'localhost',
//     user:'postgres',
//     port: 5432,
//     password: 'InYourFace',
//     database: 'HoopDebate'
// }) 

// const client = new Client({
//     host: process.env.DATABASE_HOST,
//     user: process.env.DATABASE_USER,
//     port: 5432,
//     password: process.env.NEON_PASS,
//     database: 'neondb',
//     ssl: {
//         rejectUnauthorized: false, // Set this to false for self-signed certificates or when using SSL with invalid certificates. Do not use in production.
//     }
// })
// const client = new Client({
//     host: process.env.ELEPHANT_HOST,
//     user: process.env.ELEPHANT_USER,
//     // port: 5432,
//     password: process.env.ELEPHANT_PASS,
//     database: process.env.ELEPHANT_DB,
// })



const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    },
  });

const sendIdeaEmail = (name, idea) => {
    try {
        transporter.sendMail({
            from: process.env.EMAIL,
            to: process.env.PERSONAL_EMAIL,
            subject: `New Idea from HoopDebate - ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333;">
                    <div style="background-color: #f7f7f7; padding: 20px; border-radius: 10px; border: 1px solid #ddd;">
                        <h2 style="color: #4CAF50;">Hello Ashik!</h2>
                        <p>You got a new idea from HoopDebate! Check it out.</p>
                        <div style="background-color: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; margin: 10px 0;">
                            <p style="font-style: italic;">"${idea}"</p>
                        </div>
                        <p><strong>From:</strong> ${name}</p>
                        <p>Best regards,</p>
                        <p style="font-weight: bold;">Hoop Debate</p>
                    </div>
                </div>`
        });
        // console.log(`sent email!`);
    } catch (err) {
        console.log(`Error sending email: ${err}`);
    }
}


// console.log('connecting to postgreSQL database...')
// client.connect()
//     .then(() => {
        
//         console.log('Connected to DB!')
//     })
//     .catch((err) => {
//         console.log('ELEPHANT_HOST:', process.env.ELEPHANT_HOST);
//         console.log('ELEPHANT_USER:', process.env.ELEPHANT_USER);
//         console.log('ELEPHANT_PASS:', process.env.ELEPHANT_PASS);
//         console.log('ELEPHANT_DB:', process.env.ELEPHANT_DB);
//         console.log(`Error connecting to DB: ${err}`)
//     })

console.log('connecting to Supabase...')

async function testConnection() {
    try {
        let { data, error } = await supabase
            .from('wyr') // Replace 'your_table_name' with an actual table name in your database
            .select('wyr_id') // Select a simple column to test the connection

        if (error) throw error

        console.log('Connected to Supabase!')
    } catch (err) {
        console.log('SUPABASE_URL:', process.env.SUPABASE_URL)
        console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY)
        console.log(`Error connecting to Supabase: ${err.message}`)
    }
}

testConnection()

app.get('/', (req,res) => {
    res.send('SUCCESS YESSIR')
})

// app.get('/get_wyr', async (req, res) => {
    // try {
    //     let result = await client.query(`SELECT wyr.wyr_id, wyr.wyr_question, wyr.wyr_option1, wyr.wyr_option2, stats.wyr_option1_clicks, stats.wyr_option2_clicks 
    //     FROM wyr
    //     FULL JOIN stats
    //     ON wyr.wyr_id = stats.wyr_id
    //     ORDER BY random()`)
    //     res.json(result.rows)   
    // }
//     catch(err){
//         res.write('<html><head></head><body>');
//         res.write('<p>Write your HTML content here</p>');
//         res.end('</body></html>');
//     }
      
// })
app.get('/get_wyr', async (req, res) => {
    try {
        // Select data from wyr and stats tables
        let { data, error } = await supabase
            .from('wyr')
            .select(`
                wyr_id,
                wyr_question,
                wyr_option1,
                wyr_option2,
                stats (
                    wyr_id,
                    wyr_option1_clicks,
                    wyr_option2_clicks
                )
            `)
            .order('wyr_id', { ascending: true })
        
            if (error) {
                console.error('Error fetching data:', error);
            } else {
                // console.log('Fetched data:', JSON.stringify(data, null, 2));
            }

        data = data.sort(() => Math.random() - 0.5)

        const transformedData = data.map((item) => {
            const stats = item.stats[0]; 
            return {
                wyr_question: item.wyr_question,
                wyr_option1: item.wyr_option1,
                wyr_option2: item.wyr_option2,
                wyr_option1_clicks: stats.wyr_option1_clicks,
                wyr_option2_clicks: stats.wyr_option2_clicks,
                wyr_id: stats.wyr_id
            };
        })
        console.log('got data')
        res.json(transformedData)
    } catch (err) {
        console.log(`Error here is ${err.message}`)
        res.write('<html><head></head><body>')
        res.write('<p>Something went wrong :(</p>')
        res.end('</body></html>')
    }
})

// app.post(`/add_click`, async (req,res) => {
//     const { wyr_id, wyr_option1_clicks, wyr_option2_clicks } = req.body

//     try {
//         let result = await client.query(`INSERT INTO stats(wyr_id, wyr_option1_clicks, wyr_option2_clicks)
//                                          VALUES($1, $2, $3)`, [wyr_id, wyr_option1_clicks, wyr_option2_clicks])
//         res.json('Added click')
//     }
//     catch(err) {
//         console.log(`Error here is ${err}`)
//         res.json({Error: err})
//     }
// })

// app.post(`/add_question`, async (req,res) => {
//     const { wyr_question, wyr_option1, wyr_option2 } = req.body

//     try {
//         let result = await client.query(
//             `INSERT INTO wyr (wyr_question, wyr_option1, wyr_option2)
//              VALUES ($1, $2, $3)
//              RETURNING *`,
//             [wyr_question, wyr_option1, wyr_option2]
//         );

//         let wyr_id = result.rows[0].wyr_id

//         let result2 = await client.query(`INSERT INTO stats(wyr_id, wyr_option1_clicks, wyr_option2_clicks)
//                                           VALUES($1, $2, $3)`, [wyr_id, 1, 1])
        
//         res.json('Added new question')
//     }
//     catch(err) {
//         console.log(`Error here is ${err}`)
//         res.json({Error: err})
//     }
// })


app.post(`/add_question`, async (req, res) => {
    const { wyr_question, wyr_option1, wyr_option2 } = req.body

    try {
        // Insert into wyr table
        let { data: wyrData, error: wyrError } = await supabase
            .from('wyr')
            .insert([
                { wyr_question, wyr_option1, wyr_option2 }
            ])
            .single()

        if (wyrError) throw wyrError

        let wyr_id = wyrData.wyr_id

        // Insert into stats table
        let { data: statsData, error: statsError } = await supabase
            .from('stats')
            .insert([
                { wyr_id, wyr_option1_clicks: 1, wyr_option2_clicks: 1 }
            ])

        if (statsError) throw statsError

        res.json('Added new question')
    } catch (err) {
        console.log(`Error here is ${err}`)
        res.json({ Error: err.message })
    }
})

// app.put('/add_click', async (req,res) => {
//     const { wyr_id, wyr_option1_clicks, wyr_option2_clicks } = req.body

//     try {
//         let result = await client.query(`UPDATE stats
//                                          SET wyr_option1_clicks = $1,
//                                              wyr_option2_clicks = $2
//                                          WHERE wyr_id = $3`, [wyr_option1_clicks, wyr_option2_clicks, wyr_id])
//         res.json('Successfully updated click count')
//     }
//     catch(err) {
//         console.log(`Error updating clicks`)
//         res.json({Error: err})
//     }
// })
app.put('/add_click', async (req, res) => {
    const { wyr_id, wyr_option1_clicks, wyr_option2_clicks } = req.body
    // console.log(`wyr_id: ${wyr_id}, wyr_option1_clicks: ${wyr_option1_clicks}, wyr_option2_clicks: ${wyr_option2_clicks}`)

    try {
        // Update the stats table
        let { data, error } = await supabase
            .from('stats')
            .update({ wyr_option1_clicks, wyr_option2_clicks })
            .eq('wyr_id', wyr_id)

        if (error) throw error
        console.log(`updated clicks`)
        res.json('Successfully updated click count')
    } catch (err) {
        console.log(`Error updating clicks: ${err.message}`)
        res.json({ Error: err.message })
    }
})

// app.post('/new_idea', async (req, res) => {
//     const {name, idea} = req.body
//     try {
//         // await client.query(`INSERT INTO ideas(sendername, senderidea)
//         //                     VALUES($1, $2)`, [name, idea])
//         sendIdeaEmail(name, idea)
//         console.log(`got here bruh`)
//         res.json('Successully added idea to db!')
//     }
//     catch(err){
//         console.log(`Error adding idea to db/email`)
//         res.json({Error: err})
//     }
// })

app.post('/new_idea', async (req, res) => {
    const { name, idea } = req.body
    try {
        // Send idea email
        sendIdeaEmail(name, idea)
        // console.log(`got here bruh`)
        res.json('Successfully added idea to db!')
    } catch (err) {
        console.log(`Error sending email: ${err.message}`)
        res.json({ Error: err.message })
    }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`)
})
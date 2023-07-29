const bodyParser = require("body-parser")
const express=require("express")
const app=express()
const https=require("https")
var http = require('http');
const { Configuration, OpenAIApi } = require("openai");
const axios = require('axios');
const port = process.env.PORT || 3001;
require('dotenv').config()
module.exports={
    API_KEY:process.env.WEATHER_API_KEY
}

app.use(bodyParser.urlencoded({extended:true}))
app.get("/",function(req,res){
    res.sendFile(__dirname+"/index.html")


 })

app.get("/prediction",function(req,res){
    res.sendFile(__dirname+"/prediction.html")
})
app.get("/weather",function(req,res){
    res.sendFile(__dirname+"/weather.html")
})

app.get("/chatbot",function(req,res){
    res.sendFile(__dirname+"/chatbot.html")
    

})
app.post("/chatbot",function(req,res){

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function runCompletion() {
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: req.body.query,
    });
    var resp = completion.data.choices[0].text;
    res.write("BOT:" + resp + "\n" + "\n");
    res.write("(characters are limited because additional token length requires premium API's)");
    res.send();
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Something went wrong.");
  }
}

runCompletion();

 
})

app.post("/prediction",function(req,res){
    var cityname=req.body.cityname;
    const inputData = {
        user_input: cityname
      };
      
      axios.post('https://01a2-49-205-122-13.ngrok-free.app/display',inputData , {
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then((response) => {
          res.send(response.data.message+"\n"+"\n .........results might not be accurate because only some historical data is available for free API's");
        })
        .catch((error) => {
          res.send("city not found . you can search for any city/state/country please try again");
        });
      ;


 
})  



app.post("/weather",function(req,res){
    var cname=(req.body.cityname);  
    const url="https://api.openweathermap.org/data/2.5/weather?q="+cname +"&appid="+process.env.WEATHER_API_KEY+"&units=metric"
    
    https.get(url,function(resp){
        resp.on("data",function(data){
            const wdata=JSON.parse(data)
            console.log(wdata)
            const tempp=wdata?.main?.temp
            res.write("<h1>temp is "+tempp+" degree celsius</h1>")
           
            res.send()

            
        })
        
    })



})




app.listen(port, () => console.log(`Example app listening on port ${port}!`));

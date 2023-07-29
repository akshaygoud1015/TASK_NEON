from flask import Flask, request, jsonify
from flask import Flask, jsonify, request
from flask_restful import Resource, Api
import requests
import pandas as pd
import numpy as np
import datetime
from sklearn.ensemble import RandomForestRegressor

app = Flask(__name__)
@app.route('/display', methods=['POST'])
def display():
    data = request.get_json()
    cname = data.get('user_input')
    city='http://api.openweathermap.org/geo/1.0/direct?'
    pams={'q':cname,'limit':'1','appid':'b5a1dbb3775fb14f3732d17381fd0ef1'} #for some reason apikey was not being extracted from environment variables.
    resp=requests.get(city,params=pams)
    latlong=resp.json()
    lat = latlong[0]['lat']
    lon = latlong[0]['lon'] # After receiving lat and long of users city calling api for historical data for that particular location.
    proxyDict = { 
          'http'  : "add http proxy", 
          'https' : "add https proxy"
        }
    api_url = 'https://history.openweathermap.org/data/2.5/history/city?'
    params = {'lat': lat,'lon': lon,'type': 'hour','start': '1659372998','end':'1690390598','appid': 'b5a1dbb3775fb14f3732d17381fd0ef1','units':'metric'}
    response = requests.get(api_url, params=params)
    data = response.json()
    def extract_date_temp(json_data):  #preprocessing the data
            data = []
            for entry in json_data["list"]:
                unix_timestamp = entry["dt"]
                date_time = datetime.datetime.fromtimestamp(unix_timestamp)
                date = date_time.strftime('%Y-%m-%d')
                temperature = entry["main"]["temp"]
                data.append({"Date": date, "Temperature": temperature})
            return data
    datas = extract_date_temp(data)
    df = pd.DataFrame(datas)

    df['Date'] = pd.to_datetime(df['Date'])

    # Converting  date to a numerical format using timestamp representation
    df['NumericDate'] = df['Date'].values.astype(np.int64) // 10**9

    # Creating  the Random Forest Regressor model and fit it to the data
    model = RandomForestRegressor()
    model.fit(df[['NumericDate']], df['Temperature'])

    # Predict the temperature for a new date in the upcoming month (2023-08-03)
    new_date = pd.to_datetime('2023-08-03')
    new_numeric_date = new_date.timestamp()
    temperature_prediction = model.predict([[new_numeric_date]])[0]


    return jsonify({"message": f"The temperature predicted is : {temperature_prediction}"})
if __name__ == '__main__':
    app.run(debug=True)

"use client"
import Image from "next/image";
import { useEffect, useState } from "react";
import { OutlinedInput, InputAdornment } from '@mui/material';
import { LocationOnOutlined, AirOutlined, WaterDropOutlined, FilterDramaOutlined, CompareArrowsOutlined } from '@mui/icons-material';

type DateTime = {
  year: number;
  month: string;
  day: string;
  hours: string;
  minutes: string;
  seconds: string;
}

type CurrentWeather = {
  name: string;
  weather: Weather[];
  main: Main;
  clouds: Clouds;
  wind: Wind;
}

type ForecastWeather = {
  list: ListForecastWeather[]
}

type ListForecastWeather = {
  dt: number;
  main: Main;
}

type Weather = {
  icon: string;
}
type Main = {
  temp: string;
  humidity: string;
  pressure: string;
}
type Wind = {
  speed: string;
  deg: string;
}
type Clouds = {
  all: string;
}

function getCurrentDateTime(offsetSeconds: number) {
  const systemOffsetSeconds = new Date().getTimezoneOffset() * -60;
  //console.log(systemOffsetSeconds);
  if (offsetSeconds == systemOffsetSeconds) {
    const currentDate = new Date();
    //console.log(currentDate);
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    return {
      year,
      month,
      day,
      hours,
      minutes,
      seconds
    }
  }
  else{
    const timezoneOffsetMinutes = offsetSeconds / 60;
    const currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + timezoneOffsetMinutes);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    return {
      year,
      month,
      day,
      hours,
      minutes,
      seconds
    }
  }
}

function formatTimestampToHourMinute(timestamp: number) {
  const milliseconds = timestamp * 1000;
  const date = new Date(milliseconds);
  const hour = date.getHours();
  const minute = date.getMinutes();
  const formattedHour = String(hour).padStart(2, '0');
  const formattedMinute = String(minute).padStart(2, '0');
  const formattedTime = `${formattedHour}:${formattedMinute}`;
  return formattedTime;
}

export default function Home() {
  const [timeData, setTimeDate] = useState<DateTime | null>(null);
  const [weatherData, setWeatherData] = useState<CurrentWeather | null>(null);
  const [forecastData, setForecastData] = useState<ForecastWeather | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchDataByCityName(cityName: string) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/weather?address=${cityName}`);
      const jsonData = (await res.json()).data;
      if(jsonData.cod == 200) {
        const timeData = getCurrentDateTime(jsonData.timezone);
        setTimeDate(timeData);
        setWeatherData(jsonData);
        setLoading(false);
      }else{
        setLoading(true);
      }
      
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchDataByCoordinates(latitude: number, longitude: number) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/weather?lat=${latitude}&lon=${longitude}`);
      const jsonData = (await res.json()).data;
      const time = getCurrentDateTime(jsonData.timezone);
      setTimeDate(time);
      setWeatherData(jsonData);
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchHourlyDataByCityName(cityName: string){
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/forecast?address=${cityName}`);
      const jsonData = (await res.json()).data;
      if(jsonData.cod == 200) {
        setForecastData(jsonData);
        setLoading(false);
      }else {
        setLoading(true);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchHourlyDataByCoordinates(latitude: number, longitude: number){
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/forecast?lat=${latitude}&lon=${longitude}`);
      const jsonData = (await res.json()).data;
      setForecastData(jsonData);
    } catch (err) {
      console.log(err);
    }
  }

  async function searchLocation(cityName: string){
    await fetchDataByCityName(cityName);
    await fetchHourlyDataByCityName(cityName);
  }

  useEffect(() => {
    if("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchDataByCoordinates(latitude, longitude);
          fetchHourlyDataByCoordinates(latitude, longitude);
        }, (err) => {
          console.log(err)
        }
      )
    }
  }, []);

  return (
    <main className="max-h-full p-5">
      <div className="bg-white/90 shadow-xl w-full rounded-lg flex flex-col container h-fit ml-auto mr-auto">
        <div className="flex justify-between items-center p-4">
          <div className="flex justify-center items-center">
            <Image src="/img/logo.png" alt="Weather App" width={40} height={40} className="mr-4" />
            <h1 className="text-zinc-950 font-semibold">Open Weather App</h1>
          </div>
          <div className="w-1/4">
            <OutlinedInput className="w-full" startAdornment={
              <InputAdornment position="start">
                <LocationOnOutlined />
              </InputAdornment>
            } 
            placeholder="Search Location Here..."
            onChange={(e) => { 
              searchLocation(e.target.value)
            }}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 container ml-auto mr-auto my-10">
        {weatherData && !loading ? (
          <div>
              <h1 className="text-white text-xl font-bold mt-2">{weatherData.name}</h1>
              <h2 className="text-white text-lg font-light mt-2">
                {timeData?.month} {timeData?.day}, {timeData?.year}
              </h2>
              <h3 className="text-white text-3xl font-medium mt-4">
                {timeData?.hours}:{timeData?.minutes}
              </h3>
              <div className="flex justify-between items-center my-6">
                <h4 className="text-white text-7xl font-semibold">
                  {weatherData.main.temp}&deg;c
                </h4>
                <img src={`http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`} alt="Weather App" width={150} height={150} className="" />            
              </div>
              <div className="grid grid-cols-4 gap-2 mt-10">
                <div className="bg-white/80 shadow-xl rounded p-4 flex flex-col items-center">
                  <AirOutlined className="text-slate-600" />
                  <label className="font-light text-xs mt-2">Wind</label>
                  <label>{weatherData.wind.speed} m/sec</label>
                </div>
                <div className="bg-white/80 shadow-xl rounded p-4 flex flex-col items-center">
                  <WaterDropOutlined className="text-slate-600" />
                  <label className="font-light text-sm mt-2">Humidity</label>
                  <label>{weatherData.main.humidity}%</label>
                </div>
                <div className="bg-white/80 shadow-xl rounded p-4 flex flex-col items-center">
                  <FilterDramaOutlined className="text-slate-600" />
                  <label className="font-light text-sm mt-2">Clouds</label>
                  <label>{weatherData.clouds.all}%</label>
                </div>
                <div className="bg-white/80 shadow-xl rounded p-4 flex flex-col items-center">
                  <CompareArrowsOutlined className="text-slate-600" />
                  <label className="font-light text-sm mt-2">Pressure</label>
                  <label>{weatherData.main.pressure} hPa</label>
                </div>
              </div>
          </div>
        ):(
          <p>No city name available</p>
        )
        }
        <div className="grid grid-cols-10 col-span-2">
          {forecastData && !loading ? (
            // <p>{forecastData.list.length}</p>
            forecastData.list.length > 0 && forecastData.list.map((item, index) => (
              <div key={index} className="bg-white/80 shadow-xl rounded col-span-2 m-2 p-2">
                <p className="text-center font-light">{formatTimestampToHourMinute(item.dt)}</p>
                <p className="text-center font-semibold text-lg">{item.main.temp}&deg;c</p>
              </div>
            )) 
          ):(
            <p></p>
          )
          }
        </div>
      </div>
    </main>
  );
}

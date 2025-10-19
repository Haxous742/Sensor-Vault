import React, { useEffect } from 'react'

import { io } from "socket.io-client";

const socket = io("/");

const LandingPage = () => {

    useEffect(() => {

        fetch('/api/health')
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error fetching data:', error));

    }, []);

     useEffect(() => {
    socket.on("new_message", (data) => {
      console.log("📡 Received message:", data);
    });

    return () => socket.off("new_message");
  }, []);

  return <h1>Hellooooooo Sensor Ki MKC</h1>;

 
}

export default LandingPage
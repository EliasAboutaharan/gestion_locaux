// src/app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCalendar, faUsers, faLevelUpAlt, faEquals, faSun, faMoon, faUser } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [events, setEvents] = useState<any[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [theme, setTheme] = useState<string>("light");

  // Function to update the time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval); // Clear the interval
  }, []);

  // Function to get today's date
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setDate(formattedDate);
  }, []);

  // Function to fetch events from Google Calendar
  const fetchAllEvents = async (calendarUrl: string, events: any[] = [], pageToken: string | null = null) => {
    let url = calendarUrl;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.items) {
      events.push(...data.items);
    }

    if (data.nextPageToken) {
      return fetchAllEvents(calendarUrl, events, data.nextPageToken);
    } else {
      return events;
    }
  };

  const fetchEvents = useCallback(async () => {
    const calendarUrls = [
      'https://www.googleapis.com/calendar/v3/calendars/c_89c1797376034a97614827488ac416c0d4c6b6fec7dbc25592c042c20ba2b81c@group.calendar.google.com/events?key=AIzaSyAuX6fWWkRevFoOYtCBhjVWVkJWqKvKT8M',
      'https://www.googleapis.com/calendar/v3/calendars/molengeek.com_eoapom365k1t97efimhrtrmqdc@group.calendar.google.com/events?key=AIzaSyAuX6fWWkRevFoOYtCBhjVWVkJWqKvKT8M',
    ];

    const today = new Date().toISOString().split('T')[0];

    const allEvents = await Promise.all(calendarUrls.map(async (url) => {
      const events = await fetchAllEvents(url);
      return events.filter((event: any) => {
        const eventStart = event.start.dateTime || event.start.date;
        const eventEnd = event.end.dateTime || event.end.date;
        return (eventStart.startsWith(today) || (eventStart <= today && eventEnd >= today));
      });
    }));

    const todayEvents = allEvents.flat();
    setEvents(todayEvents);

    // Get all rooms from events
    const allRooms = todayEvents.map((event: any) => event.location).filter((location: any) => location);
    setRooms(allRooms);
  }, []);


  useEffect(() => {
    fetchEvents();

    // Refresh the page every minute to check for new events
    const refreshInterval = setInterval(fetchEvents, 60000);

    return () => clearInterval(refreshInterval);
  }, [fetchEvents]);

  // Function to toggle theme
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const renderEvents = (floor: string, gradientClass: string) => {
    const filteredEvents = events.filter(event => event.location && event.location.includes(floor) && !event.location.includes("Star Wars")).sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime());
    return filteredEvents.length > 0 ? (
      filteredEvents.map((event, index) => (
        <div key={index} className={`${event.location.includes('Star Wars') ? "bg-purple-gradient" : gradientClass} text-white p-4 rounded-md shadow-md`}>
          <h3 className="text-2xl font-semibold mb-2"><FontAwesomeIcon icon={faCalendar} /> {event.summary}</h3>
          <p className="text-xl"><FontAwesomeIcon icon={faUsers} /> Salle: {event.location.replace(floor, "").replace("-", "").replace(/\(\d+\)/, "")}</p>
          {event.location.includes('Star Wars') && (
            <p className="text-lg"><FontAwesomeIcon icon={faClock} /> De {new Date(event.start.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} à {new Date(event.end.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
          )}
        </div>
      ))
    ) : (
      <div className="bg-gray-200 text-black p-4 rounded-md shadow-md">
        <h3 className="text-2xl font-semibold mb-2"><FontAwesomeIcon icon={faCalendar} /> Pas de formation prévue</h3>
        <p className="text-xl">Cet étage est actuellement vide.</p>
      </div>
    );
  };

  return (
    <div className={`app-container relative w-full h-full p-8 ${theme === "light" ? "bg-beige text-black" : "bg-black text-white"}`}>
      <div className="cover"></div>
      <h1 className="text-4xl font-bold mb-8"><FontAwesomeIcon icon={faCalendar} /> Aujourd'hui, {date}</h1>

      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <h2 className="text-3xl font-semibold mb-2 mt-4"><FontAwesomeIcon icon={faEquals} /> Rez-de-chaussée</h2>
          <div className="grid grid-cols-1 gap-4">
            {renderEvents("MolenGeek-0", "bg-purple-gradient")}
          </div>
        </div>

        <div className="col-span-1">
          <h2 className="text-3xl font-semibold mb-2 mt-4"><FontAwesomeIcon icon={faLevelUpAlt} /> Premier étage</h2>
          <div className="grid grid-cols-1 gap-4">
            {renderEvents("MolenGeek-1", "bg-blue-gradient")}
          </div>
        </div>

        <div className="col-span-1">
          <h2 className="text-3xl font-semibold mb-2 mt-4"><FontAwesomeIcon icon={faLevelUpAlt} /> Deuxième étage</h2>
          <div className="grid grid-cols-1 gap-4">
            {renderEvents("MolenGeek-2", "bg-blue-gradient")}
          </div>
        </div>

        <div className="col-span-1">
          <h2 className="text-3xl font-semibold mb-2 mt-4"><FontAwesomeIcon icon={faUsers} /> Réunions</h2>
          <div className="grid grid-cols-1 gap-4">
            {events.filter(event => event.location && event.location.includes("Star Wars")).sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()).length > 0 ? (
              events.filter(event => event.location && event.location.includes("Star Wars")).sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()).map((event, index) => (
                <div key={index} className="bg-purple-gradient text-white p-4 rounded-md shadow-md">
                  <h3 className="text-2xl font-semibold mb-2"><FontAwesomeIcon icon={faCalendar} /> {event.summary}</h3>
                  <p className="text-xl"><FontAwesomeIcon icon={faUsers} /> Salle: {event.location.replace("MolenGeek-1", "").replace("-", "").replace(/\(\d+\)/, "")}</p>
                  <p className="text-lg"><FontAwesomeIcon icon={faClock} /> De {new Date(event.start.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} à {new Date(event.end.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ))
            ) : (
              <div className="bg-gray-200 text-black p-4 rounded-md shadow-md">
                <h3 className="text-2xl font-semibold mb-2"><FontAwesomeIcon icon={faCalendar} /> Pas de réunions</h3>
                <p className="text-xl">Cette colonne est actuellement vide.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Container for the clock, scrolling text, and events */}
      <div className="absolute bottom-24 right-4 flex items-start space-x-4 w-full pl-8">

        {/* QRCode */}
      </div>
      <div className="absolute bottom-4 right-4 flex items-center space-x-4 w-full pl-8">
        {/* <div className="bg-purple-gradient text-white text-2xl p-4 rounded-md shadow-lg flex flex-col">
          <img src="/images/qrcode.png" alt="QR Code" className="w-40 h-40 mx-auto pt-2" />
          <p className='text-center text-hackathon'>Inscrit toi aux 20km</p>
        </div> */}
        {/* Scrolling text */}
        {/* <div className="bg-purple-gradient text-white text-2xl p-4 rounded-md shadow-lg flex-grow overflow-hidden">
          <div className="marquee">
            <p>
              Hackathon Halloween le 26 octobre 2024 à MolenGeek, inscris-toi dès maintenant !
            </p>
          </div>
        </div> */}
        <div className="text-white text-2xl p-4 rounded-md flex-grow overflow-hidden bg-transparent">
          <div className="marquee">

          </div>
        </div>

        {/* Digital clock */}
        <div className="bg-purple-gradient text-white text-2xl p-4 font-mono rounded-md shadow-lg">
          <FontAwesomeIcon icon={faClock} /> {time}
        </div>
      </div>

      {/* Container for theme toggle and user login */}
      <div className="absolute top-4 right-4 flex items-center space-x-4 w-full pl-8">
        <div className="bg-purple-gradient text-white text-2xl p-3 rounded-md shadow-lg flex-grow overflow-hidden">
          <h1 className="text-4xl font-bold"><FontAwesomeIcon icon={faCalendar} /> Aujourd'hui, {date}</h1>
        </div>
        {/* Theme toggle */}
        <div className="bg-purple-gradient text-white text-2xl font-mono p-4 rounded-md shadow-lg flex">
          <div className='pointer' onClick={toggleTheme}>
            <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} className='mx-3' />
          </div>
          <div>
            <FontAwesomeIcon icon={faUser} className='mx-3' />
          </div>
        </div>
      </div>
    </div>
  );
}
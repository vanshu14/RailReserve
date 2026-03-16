DROP TABLE IF EXISTS bookings;

CREATE TABLE bookings (

id INTEGER PRIMARY KEY AUTOINCREMENT,

pnr_number TEXT,

passenger_name TEXT,

age INTEGER,

gender TEXT,

train_name TEXT,

train_number INTEGER,

coach TEXT,

seat_number INTEGER,

journey_date TEXT,

booking_date TEXT

);
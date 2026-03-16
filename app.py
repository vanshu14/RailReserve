from flask import Flask, render_template, request, redirect, url_for
import pandas as pd
import sqlite3
import random
from datetime import datetime

app = Flask(__name__)

DATABASE = "railway.db"

# Load train dataset
df = pd.read_csv("data/trains.csv")
df["Train_No"] = df["Train_No"].astype(int)


def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


# ---------------- HOME ----------------

@app.route("/")
def home():
    return render_template("home.html")


# ---------------- SEARCH TRAINS ----------------

@app.route("/search", methods=["POST"])
def search():

    from_station = request.form.get("from")
    to_station = request.form.get("to")
    travel_date = request.form.get("date")

    filtered_trains = df[
        (df["Source_Station_Name"].str.lower().str.contains(from_station.lower())) &
        (df["Destination_Station_Name"].str.lower().str.contains(to_station.lower()))
    ]

    trains = filtered_trains.to_dict(orient="records")

    conn = get_db_connection()

    for train in trains:

        train_no = int(train["Train_No"])

        booked = conn.execute(
            """
            SELECT COUNT(*) as total
            FROM bookings
            WHERE train_number=? AND journey_date=?
            """,
            (train_no, travel_date)
        ).fetchone()

        booked_count = booked["total"]

        available = 72 - booked_count
        if available < 0:
            available = 0

        train["available_seats"] = available

    conn.close()

    return render_template(
        "search_results.html",
        trains=trains,
        from_station=from_station,
        to_station=to_station,
        date=travel_date
    )


# ---------------- COACH SELECTION ----------------

@app.route("/coach/<int:train_no>")
def coach_selection(train_no):

    travel_date = request.args.get("date")

    train_row = df[df["Train_No"] == train_no]

    if train_row.empty:
        return "Train not found"

    train = train_row.iloc[0]

    return render_template(
        "coach_selection.html",
        train=train,
        train_no=train_no,
        travel_date=travel_date
    )


# ---------------- SEAT SELECTION ----------------

@app.route("/seat/<int:train_no>")
def seat_selection(train_no):

    travel_date = request.args.get("date")
    coach = request.args.get("coach")

    train_row = df[df["Train_No"] == train_no]

    if train_row.empty:
        return "Train not found"

    train = train_row.iloc[0]

    conn = get_db_connection()

    booked = conn.execute(
        """
        SELECT seat_number
        FROM bookings
        WHERE train_number=? AND journey_date=? AND coach=?
        """,
        (train_no, travel_date, coach)
    ).fetchall()

    conn.close()

    booked_seats = [int(row["seat_number"]) for row in booked]

    return render_template(
        "seat_selection.html",
        train=train,
        train_no=train_no,
        travel_date=travel_date,
        coach=coach,
        booked_seats=booked_seats
    )


# ---------------- PASSENGER DETAILS ----------------

@app.route("/passenger/<int:train_no>", methods=["POST"])
def passenger_details(train_no):

    selected_seats = request.form.get("selected_seats")
    travel_date = request.form.get("date")
    coach = request.form.get("coach")

    if not selected_seats:
        return "No seats selected"

    seats = selected_seats.split(",")

    train_row = df[df["Train_No"] == train_no]

    if train_row.empty:
        return "Train not found"

    train = train_row.iloc[0]

    return render_template(
        "passenger_details.html",
        train=train,
        seats=seats,
        travel_date=travel_date,
        coach=coach
    )


# ---------------- CONFIRM BOOKING ----------------

@app.route("/confirm", methods=["POST"])
def confirm():

    names = request.form.getlist("name")
    ages = request.form.getlist("age")
    genders = request.form.getlist("gender")
    seats = request.form.getlist("seat")

    coach = request.form.get("coach")

    train_name = request.form.get("train")
    train_number = int(request.form.get("train_number"))
    journey_date = request.form.get("date")

    booking_date = datetime.now().strftime("%Y-%m-%d")

    # Generate PNR
    pnr_number = str(random.randint(1000000000, 9999999999))

    conn = get_db_connection()

    tickets = []

    for i in range(len(seats)):

        # CHECK IF SEAT ALREADY BOOKED
        existing = conn.execute(
            """
            SELECT *
            FROM bookings
            WHERE train_number=? AND coach=? AND seat_number=? AND journey_date=?
            """,
            (train_number, coach, seats[i], journey_date)
        ).fetchone()

        if existing:
            conn.close()
            return f"Seat {seats[i]} is already booked."

        # INSERT BOOKING
        conn.execute(
            """
            INSERT INTO bookings
            (pnr_number, passenger_name, age, gender,
             train_name, train_number, coach,
             seat_number, journey_date, booking_date)

            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                pnr_number,
                names[i],
                ages[i],
                genders[i],
                train_name,
                train_number,
                coach,
                seats[i],
                journey_date,
                booking_date
            )
        )

        tickets.append({
            "name": names[i],
            "age": ages[i],
            "gender": genders[i],
            "seat": seats[i],
            "coach": coach
        })

    conn.commit()
    conn.close()

    return render_template(
        "confirmation.html",
        tickets=tickets,
        pnr=pnr_number,
        train={"Train_Name": train_name, "Train_No": train_number},
        coach=coach,
        travel_date=journey_date
    )


# ---------------- BOOKING HISTORY ----------------

@app.route("/history")
def history():

    conn = get_db_connection()

    bookings = conn.execute("""
        SELECT *
        FROM bookings
        ORDER BY journey_date ASC
    """).fetchall()

    conn.close()

    return render_template(
        "history.html",
        history=bookings
    )


# ---------------- CANCEL TICKET ----------------

@app.route("/cancel/<int:id>", methods=["POST"])
def cancel_ticket(id):

    conn = get_db_connection()

    conn.execute(
        "DELETE FROM bookings WHERE id=?",
        (id,)
    )

    conn.commit()
    conn.close()

    return redirect(url_for("history"))


# ---------------- RUN APP ----------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)

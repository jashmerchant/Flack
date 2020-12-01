import os

from flask import Flask, redirect, render_template, request, session, url_for
from flask_session import Session
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

@app.route("/", methods=["GET", "POST"])
def index():
    if "username" in session:
        username = session["username"]
        return redirect(url_for("chatroom"))
    else: 
        if request.method == "POST":
            username = request.form["username"]
            session["username"] = username
            return redirect(url_for("chatroom"))
        else: 
            return render_template("index.html")

@app.route("/chatroom")
def chatroom():
    if "username" in session:
        username = session["username"]
        return render_template("chatroom.html", username=username)
    else:
        return redirect(url_for("index"))

@socketio.on("plus clicked")
def plusclicked(data):
    newchannel = data["newchannel"]
    emit("addnewchannel", {"newchannel": newchannel}, broadcast=True)

@socketio.on("message sent")
def messagesent(data):
    newmessage = data["newmessage"]
    username = data["username"]
    channel = data["channel"]
    emit("addnewmessage", {"newmessage": newmessage, "username": username, "channel": channel}, broadcast=True)

@app.route("/logout")
def logout():
    session.pop("username", None)
    return redirect(url_for("index"))

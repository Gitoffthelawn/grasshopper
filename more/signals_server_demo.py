import subprocess
from flask import Flask, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


player = ["playerctl", "-p", "audacious"]


def music(what):
    subprocess.run([*player, what])


def metadata(what):
    return subprocess.run([*player, "metadata", "--format", what], capture_output=True)


@app.route("/music-play", methods=["POST"])
def music_play():
    music("play-pause")
    return "ok"


@app.route("/music-next", methods=["POST"])
def music_next():
    music("next")
    return "ok"


@app.route("/music-prev", methods=["POST"])
def music_prev():
    music("previous")
    return "ok"


@app.route("/music-np", methods=["GET"])
def music_np():
    np = metadata("{{artist}} - {{title}}")
    return np.stdout.decode("utf-8")


@app.route("/post-test", methods=["POST"])
def post_test():
    num = request.json.get("num")
    return f"You sent {num}"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
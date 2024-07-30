from flask import Flask

app = Flask(__name__)

@app.route("/speech")
def speech():
    return {"output": "Hello World"}

if __name__ == "__main__":
    app.run(debug=True)
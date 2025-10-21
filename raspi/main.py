import RPi.GPIO as GPIO
import time
import json

MOTOR_Left_IN1 = 23
MOTOR_Left_IN2 = 24
MOTOR_Right_IN1 = 27
MOTOR_Right_IN2 = 22

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

GPIO.setup(MOTOR_Left_IN1, GPIO.OUT)
GPIO.setup(MOTOR_Left_IN2, GPIO.OUT)
GPIO.setup(MOTOR_Right_IN1, GPIO.OUT)
GPIO.setup(MOTOR_Right_IN2, GPIO.OUT)

sensors = [
    {"trig": 12, "echo": 16},
    {"trig": 5,  "echo": 6},
    {"trig": 19, "echo": 26}
]

for sensor in sensors:
    GPIO.setup(sensor["trig"], GPIO.OUT)
    GPIO.setup(sensor["echo"], GPIO.IN)
    GPIO.output(sensor["trig"], False)

class Level:
    def __init__(self, input_count, output_count):
        self.inputs = [0.0] * input_count
        self.outputs = [0.0] * output_count
        self.weights = [[0.0] * output_count for _ in range(input_count)]
        self.biases = [0.0] * output_count

    @staticmethod
    def feed_forward(inputs, level):
        level.inputs = inputs[:]
        outputs = []

        for i in range(len(level.biases)):
            summation = 0.0
            for j in range(len(inputs)):
                summation += inputs[j] * level.weights[j][i]
            outputs.append(1.0 if summation > level.biases[i] else 0.0)
        level.outputs = outputs
        return outputs

class NeuralNetwork:
    def __init__(self, neurons):
        self.levels = []
        for i in range(len(neurons) - 1):
            self.levels.append(Level(neurons[i], neurons[i + 1]))

    def load_from_json(self, json_data):
        for i, level_data in enumerate(json_data["levels"]):
            weights = level_data["weights"]
            self.levels[i].weights = [
                [weights[j][i] for i in range(len(weights[0]))]
                for j in range(len(weights))
            ]
            self.levels[i].biases = level_data["biases"]

    def feed_forward(self, inputs):
        output = Level.feed_forward(inputs, self.levels[0])
        for i in range(1, len(self.levels)):
            output = Level.feed_forward(output, self.levels[i])
        return [bool(o) for o in output]

def measure_distance(trig, echo):
    GPIO.output(trig, False)
    time.sleep(0.05)

    GPIO.output(trig, True)
    time.sleep(0.00001)
    GPIO.output(trig, False)

    start_time = time.time()
    timeout = start_time + 0.04

    while GPIO.input(echo) == 0 and time.time() < timeout:
        start_time = time.time()

    while GPIO.input(echo) == 1 and time.time() < timeout:
        end_time = time.time()

    duration = end_time - start_time
    distance = (duration * 34300) / 2
    return min(max(distance, 0.0), 200.0)

def update_motors(output):
    left_forward = output[0] and not output[1]
    left_reverse = output[1] and not output[0]

    right_forward = output[2] and not output[3]
    right_reverse = output[3] and not output[2]

    GPIO.output(MOTOR_Left_IN1, left_forward)
    GPIO.output(MOTOR_Left_IN2, left_reverse)
    GPIO.output(MOTOR_Right_IN1, right_forward)
    GPIO.output(MOTOR_Right_IN2, right_reverse)

with open("bestBrain-three-sensor.json") as f:
    model_data = json.load(f)

net = NeuralNetwork([7, 16, 8, 4])
net.load_from_json(model_data)

try:
    last_outputs = [0.0, 0.0, 0.0, 0.0]

    while True:
        sensor_distances = [
            min(measure_distance(s["trig"], s["echo"]) / 200.0, 1.0)
            for s in sensors
        ]

        nn_input = sensor_distances + last_outputs
        output = net.feed_forward(nn_input)
        last_outputs = [1.0 if o else 0.0 for o in output[:4]]
        print("AI Command:", last_outputs)

        move_start = time.time()
        while time.time() - move_start < 1.0:
            update_motors(output)
            time.sleep(0.02)

finally:
    GPIO.cleanup()

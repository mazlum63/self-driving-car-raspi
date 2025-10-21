# raspi_ai_car.py
# Python 3.x — Raspberry Pi (RPi.GPIO)
# Goal: Behave like the TypeScript simulation using the same JSON brain.
# Key alignments with TS:
# - Input direction: closer obstacle -> higher input (1 - d/max)
# - JSON weights/biases: assign directly (NO transpose)
# - Outputs: [L_fw, L_rev, R_fw, R_rev] booleans, same logic

import RPi.GPIO as GPIO
import time
import json

# -------------------- Hardware pins --------------------
# H-bridge inputs (adjust if your wiring is different)
MOTOR_Left_IN1  = 23
MOTOR_Left_IN2  = 24
MOTOR_Right_IN1 = 27
MOTOR_Right_IN2 = 22

# Ultrasonic sensors in the SAME left->center->right order as in the sim
sensors = [
    {"trig": 12, "echo": 16},  # Left
    {"trig": 5,  "echo": 6 },  # Center
    {"trig": 19, "echo": 26},  # Right
]

# -------------------- GPIO setup --------------------
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

GPIO.setup(MOTOR_Left_IN1,  GPIO.OUT)
GPIO.setup(MOTOR_Left_IN2,  GPIO.OUT)
GPIO.setup(MOTOR_Right_IN1, GPIO.OUT)
GPIO.setup(MOTOR_Right_IN2, GPIO.OUT)

for s in sensors:
    GPIO.setup(s["trig"], GPIO.OUT)
    GPIO.setup(s["echo"], GPIO.IN)
    GPIO.output(s["trig"], False)

# -------------------- Neural Network --------------------
class Level:
    def __init__(self, input_count, output_count):
        self.inputs  = [0.0] * input_count
        self.outputs = [0.0] * output_count
        # weights shape: [input_count][output_count]
        self.weights = [[0.0] * output_count for _ in range(input_count)]
        self.biases  = [0.0] * output_count

    @staticmethod
    def feed_forward(inputs, level):
        # inputs -> outputs: sum(inputs[j] * weights[j][i]) > biases[i] ? 1 : 0
        level.inputs = inputs[:]
        out = []
        for i in range(len(level.biases)):
            s = 0.0
            for j in range(len(level.inputs)):
                s += level.inputs[j] * level.weights[j][i]
            out.append(1.0 if s > level.biases[i] else 0.0)
        level.outputs = out
        return out

class NeuralNetwork:
    def __init__(self, neurons):
        # e.g. [7, 16, 8, 4]
        self.levels = []
        for i in range(len(neurons) - 1):
            self.levels.append(Level(neurons[i], neurons[i + 1]))

    def load_from_json(self, json_data):
        # IMPORTANT: assign weights and biases directly (NO transpose)
        for li, level_data in enumerate(json_data["levels"]):
            self.levels[li].weights = level_data["weights"]  # shape: [in][out]
            self.levels[li].biases  = level_data["biases"]

    def feed_forward(self, inputs):
        out = Level.feed_forward(inputs, self.levels[0])
        for i in range(1, len(self.levels)):
            out = Level.feed_forward(out, self.levels[i])
        # Return booleans like TS does
        return [bool(x) for x in out]

# -------------------- Ultrasonic helpers --------------------
def pulse_in(pin, level, timeout=0.04):
    """
    Arduino-like pulseIn: measure the duration the pin stays at 'level'.
    Returns None on timeout.
    """
    # Wait for the pin to reach the desired level
    t_start = time.time()
    while GPIO.input(pin) != level:
        if time.time() - t_start > timeout:
            return None

    t0 = time.time()
    while GPIO.input(pin) == level:
        if time.time() - t0 > timeout:
            return None
    t1 = time.time()
    return t1 - t0

def measure_distance(trig, echo, samples=3):
    """
    Measure HC-SR04 distance in cm.
    Uses multiple samples and returns the median for robustness.
    If all samples fail, returns 200 cm (far).
    """
    readings = []
    for _ in range(samples):
        GPIO.output(trig, False)
        time.sleep(0.002)

        # 10 µs trigger pulse
        GPIO.output(trig, True)
        time.sleep(0.00001)
        GPIO.output(trig, False)

        dur = pulse_in(echo, 1, timeout=0.04)
        if dur is None:
            continue

        # Speed of sound ~34300 cm/s, round trip -> /2
        dist = (dur * 34300.0) / 2.0
        # Clamp to 0..200 cm
        dist = max(0.0, min(dist, 200.0))
        readings.append(dist)

        time.sleep(0.003)

    if not readings:
        return 200.0  # treat as far

    readings.sort()
    return readings[len(readings)//2]  # median

def normalize_distance_for_nn(distance_cm, max_cm=200.0):
    """
    Match TS input direction:
    - Near obstacle (small distance) => large input (~1)
    - Far obstacle (large distance)  => small input (~0)
    """
    d = max(0.0, min(distance_cm, max_cm))
    return 1.0 - (d / max_cm)

# -------------------- Motor control --------------------
def update_motors(outputs_bool):
    """
    outputs_bool: [L_fw, L_rev, R_fw, R_rev] as booleans.
    If both fw and rev are true (or both false), treat as neutral for that wheel.
    """
    l_fw, l_rev, r_fw, r_rev = outputs_bool

    left_forward  =  l_fw and not l_rev
    left_reverse  =  l_rev and not l_fw
    right_forward =  r_fw and not r_rev
    right_reverse =  r_rev and not r_fw

    # Left wheel
    GPIO.output(MOTOR_Left_IN1, left_forward)
    GPIO.output(MOTOR_Left_IN2, left_reverse)

    # Right wheel
    GPIO.output(MOTOR_Right_IN1, right_forward)
    GPIO.output(MOTOR_Right_IN2, right_reverse)

# -------------------- Main loop --------------------
def main():
    # Load trained brain (same JSON the TS sim uses)
    with open("bestBrain-three-sensor.json", "r") as f:
        model_data = json.load(f)

    net = NeuralNetwork([7, 16, 8, 4])
    net.load_from_json(model_data)

    # Last outputs (feedback like in TS: last layer's four outputs)
    last_outputs = [0.0, 0.0, 0.0, 0.0]

    print("Started. Press CTRL+C to exit.")
    loop_dt = 0.02  # 20 ms control cycle

    try:
        while True:
            # Read sensors in left->center->right order
            distances_cm = [measure_distance(s["trig"], s["echo"]) for s in sensors]

            # Convert to NN inputs matching the sim's direction
            sensor_inputs = [normalize_distance_for_nn(d) for d in distances_cm]

            # NN inputs: [3 sensors, 4 last outputs] = 7
            nn_input = sensor_inputs + last_outputs

            # Forward pass
            outputs_bool = net.feed_forward(nn_input)

            # Save last outputs as 0/1 floats (TS uses numeric outputs internally)
            last_outputs = [1.0 if b else 0.0 for b in outputs_bool[:4]]

            # Drive motors
            update_motors(outputs_bool)

            # Optional telemetry
            print(
                f"Sensors(cm) L:{distances_cm[0]:5.1f} C:{distances_cm[1]:5.1f} R:{distances_cm[2]:5.1f} | "
                f"Inputs:{[round(x,2) for x in sensor_inputs]} | Out:{last_outputs}"
            )

            time.sleep(loop_dt)

    except KeyboardInterrupt:
        print("\nExiting...")
    finally:
        GPIO.cleanup()

if __name__ == "__main__":
    main()

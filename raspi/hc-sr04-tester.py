import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

sensors = [
    {"name": "Sensor 1", "trig": 5,  "echo": 6},
    {"name": "Sensor 2", "trig": 12, "echo": 16},
    {"name": "Sensor 3", "trig": 19, "echo": 26}
]

for sensor in sensors:
    GPIO.setup(sensor["trig"], GPIO.OUT)
    GPIO.setup(sensor["echo"], GPIO.IN)
    GPIO.output(sensor["trig"], False)

# distance function
def measure_distance(trig_pin, echo_pin):
    GPIO.output(trig_pin, False)
    time.sleep(0.0005)

    GPIO.output(trig_pin, True)
    time.sleep(0.00001)
    GPIO.output(trig_pin, False)

    start_time = time.time()
    timeout = start_time + 0.04  # max 40 ms

    while GPIO.input(echo_pin) == 0 and time.time() < timeout:
        start_time = time.time()

    while GPIO.input(echo_pin) == 1 and time.time() < timeout:
        end_time = time.time()

    duration = end_time - start_time

    distance = duration * 17150  # (34300 cm/s ÷ 2)

    if 2 <= distance <= 200:
        return round(distance, 2)
    else:
        return None

try:
    while True:
        print("-" * 40)
        for sensor in sensors:
            dist = measure_distance(sensor["trig"], sensor["echo"])
            if dist is not None:
                print(f"{sensor['name']}: {dist} cm")
            else:
                print(f"{sensor['name']}: Error")
            time.sleep(0.03)
        time.sleep(0.2)

except KeyboardInterrupt:
    print("\nStoped")

finally:
    GPIO.cleanup()

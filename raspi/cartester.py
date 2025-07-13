import RPi.GPIO as GPIO
import time

MOTOR1_IN1 = 23  # left motor
MOTOR1_IN2 = 24

MOTOR2_IN1 = 27  # right motor
MOTOR2_IN2 = 22


GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)


GPIO.setup(MOTOR1_IN1, GPIO.OUT)
GPIO.setup(MOTOR1_IN2, GPIO.OUT)
GPIO.setup(MOTOR2_IN1, GPIO.OUT)
GPIO.setup(MOTOR2_IN2, GPIO.OUT)

try:
    print("forward")
    GPIO.output(MOTOR1_IN1, GPIO.HIGH)
    GPIO.output(MOTOR1_IN2, GPIO.LOW)

    GPIO.output(MOTOR2_IN1, GPIO.HIGH)
    GPIO.output(MOTOR2_IN2, GPIO.LOW)

    time.sleep(3)

    print("reverse")
    GPIO.output(MOTOR1_IN1, GPIO.LOW)
    GPIO.output(MOTOR1_IN2, GPIO.HIGH)

    GPIO.output(MOTOR2_IN1, GPIO.LOW)
    GPIO.output(MOTOR2_IN2, GPIO.HIGH)

    time.sleep(3)

finally:

    GPIO.output(MOTOR1_IN1, GPIO.LOW)
    GPIO.output(MOTOR1_IN2, GPIO.LOW)
    GPIO.output(MOTOR2_IN1, GPIO.LOW)
    GPIO.output(MOTOR2_IN2, GPIO.LOW)
    GPIO.cleanup()
    print("GPIO temizlendicleared")

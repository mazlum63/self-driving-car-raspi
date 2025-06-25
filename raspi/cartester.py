import RPi.GPIO as GPIO
import time

# GPIO pin tanımlamaları
MOTOR1_IN1 = 23  # sol motor
MOTOR1_IN2 = 24

MOTOR2_IN1 = 27  # sağ motor
MOTOR2_IN2 = 22

# GPIO ayarları
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# Pinleri çıkış olarak ayarla
GPIO.setup(MOTOR1_IN1, GPIO.OUT)
GPIO.setup(MOTOR1_IN2, GPIO.OUT)
GPIO.setup(MOTOR2_IN1, GPIO.OUT)
GPIO.setup(MOTOR2_IN2, GPIO.OUT)

try:
    print("İleri hareket")
    # İleri yönde sür
    GPIO.output(MOTOR1_IN1, GPIO.HIGH)
    GPIO.output(MOTOR1_IN2, GPIO.LOW)

    GPIO.output(MOTOR2_IN1, GPIO.HIGH)
    GPIO.output(MOTOR2_IN2, GPIO.LOW)

    time.sleep(3)

    print("Geri hareket")
    # Geri yönde sür
    GPIO.output(MOTOR1_IN1, GPIO.LOW)
    GPIO.output(MOTOR1_IN2, GPIO.HIGH)

    GPIO.output(MOTOR2_IN1, GPIO.LOW)
    GPIO.output(MOTOR2_IN2, GPIO.HIGH)

    time.sleep(3)

finally:
    # Tüm pinleri kapat
    GPIO.output(MOTOR1_IN1, GPIO.LOW)
    GPIO.output(MOTOR1_IN2, GPIO.LOW)
    GPIO.output(MOTOR2_IN1, GPIO.LOW)
    GPIO.output(MOTOR2_IN2, GPIO.LOW)
    GPIO.cleanup()
    print("GPIO temizlendi")

class Level:
    def __init__(self, input_count, output_count):
        self.inputs = [0] * input_count
        self.outputs = [0] * output_count
        self.weights = []
        self.biases = []

    @staticmethod
    def feed_forward(inputs, level):
        level.inputs = inputs[:]

        for i in range(len(level.outputs)):
            total = 0
            for j in range(len(level.inputs)):
                total += level.inputs[j] * level.weights[j][i]
            level.outputs[i] = 1 if total > level.biases[i] else 0

        return level.outputs


class NeuralNetwork:
    def __init__(self, neurons):
        self.levels = []
        for i in range(len(neurons) - 1):
            self.levels.append(Level(neurons[i], neurons[i + 1]))

    def load_from_json(self, json_data):
        for i, level_data in enumerate(json_data["levels"]):
            self.levels[i].weights = level_data["weights"]
            self.levels[i].biases = level_data["biases"]

    def feed_forward(self, inputs):
        output = Level.feed_forward(inputs, self.levels[0])
        for i in range(1, len(self.levels)):
            output = Level.feed_forward(output, self.levels[i])
        return [o == 1 for o in output]

import json

with open("bestBrain-three-sensor.json") as f:
    data = json.load(f)

net = NeuralNetwork([9, 16, 8, 4])
net.load_from_json(data)

inputs = [0, 0, 0.22, 1, 0, 0, 1, 0, 0]

output = net.feed_forward(inputs)

forward=output[0]
left=output[1]
right=output[2]
reverse=output[3]
print(output)
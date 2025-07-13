import random
from typing import List


class Level:
    def __init__(self, input_count: int, output_count: int):
        self.inputs: List[float] = [0.0] * input_count
        self.outputs: List[float] = [0.0] * output_count
        self.biases: List[float] = [0.0] * output_count
        self.weights: List[List[float]] = [
            [0.0 for _ in range(output_count)] for _ in range(input_count)
        ]

        Level.randomize(self)

    @staticmethod
    def randomize(level: "Level"):
        for i in range(len(level.weights)):
            for j in range(len(level.weights[i])):
                level.weights[i][j] = random.uniform(-1, 1)

        for i in range(len(level.biases)):
            level.biases[i] = random.uniform(-1, 1)

    @staticmethod
    def feed_forward(inputs: List[float], level: "Level") -> List[float]:
        for i in range(len(level.inputs)):
            level.inputs[i] = inputs[i]

        for i in range(len(level.outputs)):
            total = 0.0
            for j in range(len(level.inputs)):
                total += level.inputs[j] * level.weights[j][i]
            level.outputs[i] = 1 if total > level.biases[i] else 0

        return level.outputs


class NeuralNetwork:
    def __init__(self):
        self.neurons: List[int] = [11, 16, 8, 4]
        self.levels: List[Level] = []
        for i in range(len(self.neurons) - 1):
            self.levels.append(Level(self.neurons[i], self.neurons[i + 1]))

    @staticmethod
    def feed_forward(inputs: List[float], network: "NeuralNetwork") -> List[bool]:
        output = Level.feed_forward(inputs, network.levels[0])
        for i in range(1, len(network.levels)):
            output = Level.feed_forward(output, network.levels[i])
        return [o == 1 for o in output]

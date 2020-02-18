import matplotlib.pyplot as plt

import json

# Reading the data from the connections.json-file
# read file
with open('connections.json', 'r') as myfile:
    data = myfile.read()
# parse file
connections = json.loads(data)

print(connections)

for key in connections:
    for connected_point in connections[key]:
        plt.plot([float(key[0]), float(connected_point[0])], [float(key[-1]), float(connected_point[1])], 'ro-')

plt.show()

from colorsys import rgb_to_hls
from copy import deepcopy

k = 1000 # max number of iterations
shiftStep = 5
sizeStep = 10
maxL = 90
minL = 5
maxS = 100
minS = 10


def hexToRGB(h): # tuple (R,G,B)
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

inputlist = []
# open file and read the content in a list
with open('result.txt', 'r') as filehandle:
    for line in filehandle:
        # remove linebreak which is the last character of the string
        currentPlace = line[:-1]

        # add item to the list
        inputlist.append(currentPlace)

inputcolor = []

# open file and read the content in a list
with open('keys.txt', 'r') as filehandle:
    for line in filehandle:
        # remove linebreak which is the last character of the string
        currentPlace = line[:-1]

        # add item to the list
        inputcolor.append(currentPlace)

# sanitize inputs and convert to hls
values = []
for i in range(len(inputlist)):
    rgb = hexToRGB(inputlist[i])
    hls = rgb_to_hls(rgb[0]/255,rgb[1]/255,rgb[2]/255)
    hls = (hls[0]*360, hls[1]*100, hls[2]*100)
    if hls[2] < maxS and hls[2] > minS and hls[1] < maxL and hls[1] > minL:
        values.append((inputcolor[i], hls))

# start values
tresh = {"#ff0000": [330, 30],\
        "#ffff00": [30, 90],\
        "#00ff00": [90, 150],\
        "#00ffff": [150, 210],\
        "#0000ff": [210, 270],\
        "#ff00ff": [270, 330]}

# weight inputs
weight = {"#ff0000": 0,\
        "#ffff00": 0,\
        "#00ff00": 0,\
        "#00ffff": 0,\
        "#0000ff": 0,\
        "#ff00ff": 0}
for val in values:
    weight[val[0]] += 1
colors = ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff"]

# this shouldn't be this complicated. Just return 0 if it is in the range, 1 if
# it is bigger and 2 if it is smaller (pick closest distance)
def inRange(h, range):
    if range[0] <= range[1]:
        if h >= range[0] and h < range[1]:
            return 0
        avr = (range[0] + range[1])/2
    else:
        if h >= range[0] or h < range[1]:
            return 0
        avr = ((range[0] + range[1] + 360)/2)%360
    diff = (h - avr + 360)%360
    if diff > 180:
        return 2
    else:
        return 1


print(weight)
prevCnts = None # for determening if (local) minimum has been found
while (0 < k):
    # count of correct values
    # fist is in range, 2nd if bigger and 3th if smaller
    cnts = {"#ff0000": [0, 0, 0],\
            "#ffff00": [0, 0, 0],\
            "#00ff00": [0, 0, 0],\
            "#00ffff": [0, 0, 0],\
            "#0000ff": [0, 0, 0],\
            "#ff00ff": [0, 0, 0]}
    for val in values:
         res = inRange(val[1][0], tresh[val[0]])
         cnts[val[0]][res] += 1

    # weighting values
    for col in colors:
        for i in range(len(cnts[col])):
            cnts[col][i] /= weight[col]
    print(cnts)
    # updating treshods
    for i in range(len(colors)):
        next = (i + 1)%len(colors)
        if k%2 == 0:
            diff = (cnts[colors[next]][2] - cnts[colors[i]][1])*shiftStep
        else:
            diff = (cnts[colors[i]][0] - cnts[colors[next]][0])*sizeStep
        newBound = (tresh[colors[i]][1] - diff + 360)%360
        tresh[colors[i]][1] = newBound
        tresh[colors[next]][0] = newBound

    print('cnts', cnts)
    print('tresh', tresh)
    k -= 1
print(cnts)
print(tresh)

import plotly.express as px
import pandas as pd
import math
from colorsys import rgb_to_hsv
from colorsys import rgb_to_hls
import plotly.figure_factory as ff
import numpy as np
import plotly.graph_objects as go


def hexToRGB(h): # tuple (R,G,B)
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def rgbToHex(r, g, b):
    return "#{0:02x}{1:02x}{2:02x}".format(int(r), int(g), int(b))

r = []
g = []
b = []
h1 = []
s1 = []
v1 = []
h2 = []
s2 = []
l2 = []

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
print(len(inputlist))
print(len(inputcolor))



N= int(len(inputlist)/18)
print(N)
"""
### Gegevens orderen
d = {}
for i in range(len(inputcolor)):
    if not inputcolor[i] in d:
        d[inputcolor[i]] = [inputlist[i]]
    else:
        d[inputcolor[i]].append(inputlist[i])

### comparator
def compare(x, y):
    rgb1 = hexToRGB(x)
    rgb2 = hexToRGB(y)
    hsl1 = rgb_to_hls(rgb1[0]/255,rgb1[1]/255,rgb1[2]/255)
    hsl2 = rgb_to_hls(rgb2[0]/255,rgb2[1]/255,rgb2[2]/255)
    if hsl1[0]*360< hsl2[0]*360:
        return -1
    elif hsl1[0]*360> hsl2[0]*360:
        return 1
    else:
        return 0

### for i in sorted(d,key = hexToRGB) :
from functools import cmp_to_key
inputcolor_sorted = sorted(d, key=cmp_to_key(compare))
print(inputcolor_sorted)
inputcolor = []
inputlist = []
for i in inputcolor_sorted :
    for j in range(N):
        inputcolor.append(i)
    inputlist.extend(d[i])
"""
for i in inputlist :
    rgb = hexToRGB(i)
    r.append(rgb[0])
    g.append(rgb[1])
    b.append(rgb[2])
    hsv = rgb_to_hsv(rgb[0]/255,rgb[1]/255,rgb[2]/255)
    h1.append(hsv[0]*360)
    s1.append(hsv[1])
    v1.append(hsv[2])
    hsl = rgb_to_hls(rgb[0]/255,rgb[1]/255,rgb[2]/255)
    h2.append(hsl[0]*360)
    s2.append(hsl[2])
    l2.append(hsl[1])
"""
### !!!!!!! Gegevens aanpassen !!!!!!!!!
for i in range(len(inputcolor)) :
   if inputcolor[i] == "#" and h2[i]>180:
       h2[i] = h2[i] - 360
   if inputcolor[i] == "#ff0055" and h2[i]<180:
       h2[i] = h2[i] + 360
   if inputcolor[i] == "#ffaa00" and h2[i]>180:
       h2[i] = h2[i] - 360
##for i in sorted(d,key = hexToRGB) :
"""
"""
df = pd.DataFrame(dict(Hue=h2,Lightness=l2, Saturation=s2))
figHS = px.scatter(df, x="Hue", y="Saturation", marginal_y="box",
           marginal_x="box",color=inputcolor)
figHS.show()

figHL = px.scatter(df, x="Hue", y="Lightness", marginal_y="box",
           marginal_x="box",color=inputcolor)
#figHL.show()

figLS = px.scatter(df, x="Lightness", y="Saturation", marginal_y="box",
           marginal_x="box",color=inputcolor)
#figLS.show()

figALL = px.scatter_matrix(df, dimensions=["Hue", "Lightness", "Saturation"],color=inputcolor)
#figALL.show()

figtest = px.histogram(df, x="Hue",color=inputcolor)
#figtest.show()
"""
#plot for All colors to see peaks in Hue range
hist = {}
for i in range(len(inputcolor)) :
   if not inputcolor[i] in hist:
       hist[inputcolor[i]] = [h2[i]]
   else:
       hist[inputcolor[i]].append(h2[i])

hist_data = []
group_labels = []
for i in hist:
    group_labels.append(str(i))
    hist_data.append(np.asarray(hist[i]))

colors = []
for i in range(len(inputcolor)):
    if inputcolor[i] != inputcolor[i-1]:
        colors.append(inputcolor[i])
# Create distplot with custom bin_size
fig = ff.create_distplot(hist_data, group_labels, bin_size=5,show_rug=False,show_hist=False,) #colors=colors,
fig.update_layout(title='Effect van reflectie op een groen scherm')
fig.update({'layout': {'xaxis': {'range': [0,1]}}})
fig.show()

"""
>>> fig.update({'layout': {'xaxis': {'color': 'pink'}}}) # doctest: +ELLIPSIS
Figure(...)
>>> fig.to_plotly_json() # doctest: +SKIP
    {'data': [],
     'layout': {'xaxis':
                {'color': 'pink',
                 'range': [0, 1]}}}
"""


    # Number of boxes

# generate an array of rainbow colors by fixing the saturation and lightness of the HSL
# representation of colour and marching around the hue.
# Plotly accepts any CSS color format, see e.g. http://www.w3schools.com/cssref/css_colors_legal.asp.

# Each box is represented by a dict that contains the data, the type, and the colour.
# Use list comprehension to describe N boxes, each with a different colour and with different randomly generated data:
"""
fig = go.Figure(data=[go.Box(
    x=inputcolor,
    y=h2,
    marker_color=colors[i]
    ) for i in range(int(N))])

fig = go.Figure()
"""
"""
fig = go.Figure()
for i in range(len(colors)):
    fig.add_trace(go.Box(
        y=h2[(i*N):(i*N+N)],
        name= colors[i],
        marker_color = colors[i]
    ))

# format the layout
fig.update_layout(
    xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
    yaxis=dict(zeroline=False, gridcolor='gray',dtick=20,autorange=True),
    paper_bgcolor='rgb(255,255,255)',
    plot_bgcolor='rgb(255,255,255)',
)

fig.show()
"""

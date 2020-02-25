import plotly.express as px
import pandas as pd 
import math
from colorsys import rgb_to_hsv
from colorsys import rgb_to_hls


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
inputlist = ['#3a2f4f', '#443854', '#3d334a', '#352d4c', '#453957', '#5a6dfe', '#596cfd', '#5062f5', '#5468fb', '#5769fc', '#00199a', '#001790', '#3d4386', '#3c55bb', '#0029a5', '#5b62c3', '#595abc', '#4e53b6', '#5358be', '#5962c4', '#6288fe', '#6c86fc', '#8a8df6', '#9591f6', '#8a92fd', '#4360cd', '#455ecc', '#4458c5', '#4b4ba9', '#4e4dab', '#645ab4', '#6668cc', '#6069d1', '#615bba', '#615ab5', '#a9ade7', '#9ca0e1', '#c5c4ee', '#a3a7e1', '#bcc0f1', '#413567', '#423561', '#3b315c', '#3e3469', '#5d4f79', '#5d509a', '#50458e', '#443981', '#4a3f88', '#5a4d9b', '#5e55ab', '#4d4598', '#483983', '#5147a1', '#6259af', '#5958b6', '#4c46a5', '#494096', '#4e3f93', '#4f4eac', '#525ebc', '#4852b0', '#4749a1', '#4e59bb', '#5761bf', '#565ec3', '#4e52b8', '#4f4aa5', '#544aa4', '#565bbe', '#4c59c1', '#4852b7', '#4949a7', '#4c48a1', '#5257ba', '#4f5ec5', '#4350b8', '#4949a7', '#4e4dab', '#4f58ba', '#4057c4', '#3f4cb4', '#4444a2', '#4b4ba9', '#4654be']

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

df = pd.DataFrame(dict(Hue=h2,Lightness=l2, Saturation=s2))
figHS = px.scatter(df, x="Hue", y="Saturation", marginal_y="box",
           marginal_x="box")
figHS.show()

figHL = px.scatter(df, x="Hue", y="Lightness", marginal_y="box",
           marginal_x="box")
figHL.show()

figLS = px.scatter(df, x="Lightness", y="Saturation", marginal_y="box",
           marginal_x="box")
figLS.show()

figALL = px.scatter_matrix(df, dimensions=["Hue", "Lightness", "Saturation"])
figALL.show()

figtest = px.histogram(df, x="Hue", y="Saturation")
figtest.show()
figtest2 = px.histogram(df, x="Hue", y="Lightness")
figtest2.show()
figtest3 = px.histogram(df, x="Lightness", y="Saturation")
figtest3.show()
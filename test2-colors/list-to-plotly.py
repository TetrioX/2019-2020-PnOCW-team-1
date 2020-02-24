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
inputlist = ['#615456','#ff7800', '#ff7800', '#ff7800', '#ff7a01', '#ff7802', '#03c836', '#04c437', '#01c231', '#00b82c', '#00c230', '#ece20c', '#ebe209', '#eae108', '#ebe10b', '#e7de04', '#5668fb', '#5268fd', '#5866fa', '#6569f7', '#5167fc', '#f586d0', '#e87dc6', '#e579c5', '#e373c1', '#ed80cc', '#d4d3cf', '#ced0d1', '#d4d6d0', '#d3d2ce', '#d5d5d5', '#23c0bc', '#26bdba', '#25b7b3', '#15b6b4', '#24c6c1']

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
print("This is 'wide' data, unsuitable as-is for Plotly Express:")
## scatter_3d(data_frame=None, x=None, y=None, z=None, color=None, symbol=None, size=None, text=None, hover_name=None, hover_data=None, custom_data=None, error_x=None, error_x_minus=None, error_y=None, error_y_minus=None, error_z=None, error_z_minus=None, animation_frame=None, animation_group=None, category_orders={}, labels={}, size_max=None, color_discrete_sequence=None, color_discrete_map={}, color_continuous_scale=None, range_color=None, color_continuous_midpoint=None, symbol_sequence=None, symbol_map={}, opacity=None, log_x=False, log_y=False, log_z=False, range_x=None, range_y=None, range_z=None, title=None, template=None, width=None, height=None
dfRGB = pd.DataFrame(dict(Red=r, Green=g, Blue=b))
figRGB = px.scatter_3d(dfRGB, x='Red', y='Green', z='Blue', 
        range_x = [0,255], range_y = [0,255], range_z = [0,255])
figRGB.show()

dfHSV = pd.DataFrame(dict(Hue=h1, Saturation=s1, Value=v1))
figHSV = px.scatter_3d(dfHSV, x='Hue', y='Saturation', z='Value', 
        range_x = [0,360], range_y = [0,1], range_z = [0,1])
figHSV.show()

dfHSL = pd.DataFrame(dict(Hue=h2, Saturation=s2, Lightness=l2))
figHSL = px.scatter_3d(dfHSL, x='Hue', y='Saturation', z='Lightness', 
        range_x = [0,360], range_y = [0,1], range_z = [0,1])
figHSL.show()
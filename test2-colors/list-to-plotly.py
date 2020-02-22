import plotly.express as px
import pandas as pd 
import math

def hexToRGB(h): # tuple (R,G,B)
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

r = []
g = []
b = []
inputlist = ['#615456','#ff7800', '#ff7800', '#ff7800', '#ff7a01', '#ff7802', '#03c836', '#04c437', '#01c231', '#00b82c', '#00c230', '#ece20c', '#ebe209', '#eae108', '#ebe10b', '#e7de04', '#5668fb', '#5268fd', '#5866fa', '#6569f7', '#5167fc', '#f586d0', '#e87dc6', '#e579c5', '#e373c1', '#ed80cc', '#d4d3cf', '#ced0d1', '#d4d6d0', '#d3d2ce', '#d5d5d5', '#23c0bc', '#26bdba', '#25b7b3', '#15b6b4', '#24c6c1']

for i in inputlist :
    rgb = hexToRGB(i)
    r.append(rgb[0])
    g.append(rgb[1])
    b.append(rgb[2])
print("This is 'wide' data, unsuitable as-is for Plotly Express:")
df = pd.DataFrame(dict(Red=r, Green=g, Blue=b))
fig = px.scatter_3d(df, x='Red', y='Green', z='Blue', 
        range_x = [0,255], range_y = [0,255], range_z = [0,255])
## scatter_3d(data_frame=None, x=None, y=None, z=None, color=None, symbol=None, size=None, text=None, hover_name=None, hover_data=None, custom_data=None, error_x=None, error_x_minus=None, error_y=None, error_y_minus=None, error_z=None, error_z_minus=None, animation_frame=None, animation_group=None, category_orders={}, labels={}, size_max=None, color_discrete_sequence=None, color_discrete_map={}, color_continuous_scale=None, range_color=None, color_continuous_midpoint=None, symbol_sequence=None, symbol_map={}, opacity=None, log_x=False, log_y=False, log_z=False, range_x=None, range_y=None, range_z=None, title=None, template=None, width=None, height=None
fig.show()

def rgbToHex(r, g, b):
    return "#{0:02x}{1:02x}{2:02x}".format(int(r), int(g), int(b))
# https://gist.github.com/mathebox/e0805f72e7db3269ec22

def rgb_to_hsv(r, g, b):
    r = float(r)
    g = float(g)
    b = float(b)
    high = max(r, g, b)
    low = min(r, g, b)
    h, s, v = high, high, high

    d = high - low
    s = 0 if high == 0 else d/high

    if high == low:
        h = 0.0
    else:
        h = {
            r: (g - b) / d + (6 if g < b else 0),
            g: (b - r) / d + 2,
            b: (r - g) / d + 4,
        }[high]
        h /= 6

    return h, s, v

def rgb_to_hsl(r, g, b):
    r = float(r)
    g = float(g)
    b = float(b)
    high = max(r, g, b)
    low = min(r, g, b)
    h, s, v = ((high + low) / 2,)*3

    if high == low:
        h = 0.0
        s = 0.0
    else:
        d = high - low
        s = d / (2 - high - low) if l > 0.5 else d / (high + low)
        h = {
            r: (g - b) / d + (6 if g < b else 0),
            g: (b - r) / d + 2,
            b: (r - g) / d + 4,
        }[high]
        h /= 6

    return h, s, v
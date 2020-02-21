# Dependency: openpyxl, pillow, opencv-python

from os import walk
import cv2
from openpyxl import Workbook
import time

### Config
# number of picks for each color
global nbp
nbp = 5

global ws
wb = Workbook()
ws = wb.active

# header
ws["A1"] = "group"
ws["B1"] = "brigthness"
ws["C1"] = "pictureDevice"
ws["D1"] = "ratioScreenPicture"
ws["E1"] = "distance"
ws["F1"] = "nbOfColros"
ws["G1"] = "incidence"
ws["H1"] = "reflection"
ws["I1"] = "screenDevice"
ws["J1"] = "imageID"
ws["K1"] = "origHexCol"
ws["L1"] = "picHexCol"



image = 2 # current row

def writeBlock(col, row, val, nb):
    if nb != 1:
        ws.merge_cells(col+str(row)+":"+col+str(int(row)+int(nb-1)))
    ws[col+str(row)] = val

def pickColor(file, row):
    global pressedkey, nbp, cnbp
    cv2.destroyAllWindows()
    image = cv2.imread(file)
    name = file.split("/")[-1]
    cv2.namedWindow(name, cv2.WND_PROP_FULLSCREEN)
    cv2.setWindowProperty(name,cv2.WND_PROP_FULLSCREEN,cv2.WINDOW_FULLSCREEN)
    cv2.imshow(name, image)
    cv2.setMouseCallback(name, getColor, (image, row))
    cnbp = 0
    while (cnbp < nbp):
        pressedkey = False
        while pressedkey == False:
            cv2.waitKey(10)
            time.sleep(0.010)
        cnbp += 1

def getColor(event,x,y,flags,param):
    global pressedkey, ws, cnbp
    if event == cv2.EVENT_LBUTTONDOWN:
        ws["L"+str(param[1] + cnbp)] = rgbToHex(param[0][y, x][0], param[0][y, x][1], param[0][y, x][2])
        pressedkey = True
    if event == cv2.EVENT_RBUTTONDOWN:
        quit()

def rgbToHex(r, g, b):
    return "#{0:02x}{1:02x}{2:02x}".format(int(r), int(g), int(b))

for group in walk("./"):
    if (group[0] == "./"):
        continue
    print(group)
    for pic in group[2]:
        pictureName = pic.split("_")
        print(pictureName)
        nbc = int(pictureName[4])
        blocksize = nbp*nbc
        writeBlock("A", image, group[0][2:], blocksize)
        writeBlock("B", image, pictureName[0], blocksize)
        writeBlock("C", image, pictureName[1], blocksize)
        writeBlock("D", image, pictureName[2], blocksize)
        writeBlock("E", image, pictureName[3], blocksize)
        writeBlock("F", image, pictureName[4], blocksize)
        writeBlock("G", image, pictureName[int(pictureName[4])*3 + 5], blocksize)
        writeBlock("H", image, pictureName[int(pictureName[4])*3 + 6], blocksize)
        writeBlock("I", image, pictureName[int(pictureName[4])*3 + 7], blocksize)
        writeBlock("J", image, pictureName[int(pictureName[4])*3 + 8], blocksize)
        for i in range(nbc):
            writeBlock("K", image + i, \
                rgbToHex(pictureName[5 + i * 3], pictureName[6 + i * 3], pictureName[7 + i * 3]), nbp)
            pickColor(group[0]+'/'+pic, image + i*nbp)
        image += blocksize

wb.save('result.xlsx')

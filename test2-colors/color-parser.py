# Dependency: openpyxl, pillow, opencv-python

from os import walk, path
import cv2
from openpyxl import Workbook, load_workbook, cell as xlcell
import time


### Config
# number of picks for each color
global nbp
nbp = 20

global ws
if (path.isfile("./result.xlsx")) and input("An existing result.xlsx file has been found. \
Do you want to use this file? (Y/n)\n").lower() != "n":
    print("==> reading result.xlsx (this can take several minutes)...", flush=True)
    wb = load_workbook(filename = './result.xlsx')
else:
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
    cv2.destroyAllWindows()

def getColor(event,x,y,flags,param):
    global pressedkey, ws, cnbp
    if event == cv2.EVENT_LBUTTONDOWN:
        ws["L"+str(param[1] + cnbp)] = rgbToHex(param[0][y, x][2], param[0][y, x][1], param[0][y, x][0])
        pressedkey = True
    if event == cv2.EVENT_RBUTTONDOWN:
        if input("Do you want to save the file? (Y/n)\n") != "n":
            wb.save('result.xlsx')
        quit()

def rgbToHex(r, g, b):
    return "#{0:02x}{1:02x}{2:02x}".format(int(r), int(g), int(b))


# source: https://stackoverflow.com/questions/23562366/how-to-get-value-present-in-a-merged-cell
def within_range(bounds: tuple, cell: xlcell) -> bool:
    column_start, row_start, column_end, row_end = bounds
    row = cell.row
    if row >= row_start and row <= row_end:
        column = cell.column
        if column >= column_start and column <= column_end:
            return True
    return False
def get_value_merged(sheet, cell) -> any:
    for merged in sheet.merged_cells:
        if within_range(merged.bounds, cell):
            return sheet.cell(merged.min_row, merged.min_col).value
    return cell.value

def get_hash(groupName, fileName):
    return groupName + "/" + fileName

# look for old colors
print("==> looking for old picks...", flush=True)
pickedList = set()
while ws["L"+str(image)].value is not None:
    group = ws["A"+str(image)].value
    file = ws["J"+str(image)].value
    if group is not None and file is not None:
        pickedList.add(get_hash(group, file))
    image += 1
oldMax = image

# pick new colors
print("==> picking new colors...", flush=True)
for group in walk("./"):
    if (group[0] == "./"):
        continue
    for pic in group[2]:
        groupName = group[0].split("/")[-1]
        fileName = pic.split(".")[0]
        pictureName = fileName.split("_")
        if len(pictureName) < 12 or (len(pictureName) - 9)%3 != 0 or (len(pictureName) - 9)//3 < int(pictureName[4]):
            print(group[0] + "/" + pic + " is poorly formatted")
            continue
        if get_hash(groupName, fileName) in pickedList:
            print(group[0] + "/" + pic + " has already been picked")
            pickedList.remove(hash)
            continue
        nbc = int(pictureName[4])
        blocksize = nbp*nbc
        writeBlock("A", image, groupName, blocksize)
        writeBlock("B", image, pictureName[0], blocksize)
        writeBlock("C", image, pictureName[1], blocksize)
        writeBlock("D", image, pictureName[2], blocksize)
        writeBlock("E", image, pictureName[3], blocksize)
        writeBlock("F", image, pictureName[4], blocksize)
        writeBlock("G", image, pictureName[-4], blocksize)
        writeBlock("H", image, pictureName[-3], blocksize)
        writeBlock("I", image, pictureName[-2], blocksize)
        writeBlock("J", image, fileName, blocksize)
        for i in range(nbc):
            writeBlock("K", image + i*nbp, \
                rgbToHex(pictureName[5 + i * 3], pictureName[6 + i * 3], pictureName[7 + i * 3]), nbp)
            pickColor(group[0]+'/'+pic, image + i*nbp)
        print(group[0] + "/" + pic + " has been added")
        image += blocksize

if len(pickedList) != 0:
    print("The following files were already in excel but were not find in the actual data set. They might have been renamed/removed:\n ")
    for hash in pickedList:
        print(hash)
    if input("Do you want to remove these files? (y/N)\n") = "y":
        print("==> deleting old entries...", flush=True)
        image = 2
        while len(pickedList) > 0:
            group = ws["A"+str(image)].value
            file = ws["J"+str(image)].value
            if group is not None and file is not None and get_hash(groupName, fileName) in pickedList:
                ws.delete_rows(image)
            else:
                image += 1
            if image > oldMax:
                if input("ERROR: Couldn't remove all old entries. This is most likely a bug. Do you still want to save?(Y/n)\n") = "n":
                    quit()
                break


print("==> saving excel file")
wb.save('result.xlsx')
